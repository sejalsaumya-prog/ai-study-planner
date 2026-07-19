import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit3, Calendar, BookOpen, X, Check } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

const defaultForm = {
  name: '', examDate: '', difficulty: 'medium',
  totalTopics: 10, priority: 'medium', color: '#6366f1', notes: ''
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/subjects');
      setSubjects(res.data);
    } catch (error) { console.error('Failed to fetch subjects'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`/api/subjects/${editId}`, form);
      } else {
        await axios.post('/api/subjects', form);
      }
      setShowForm(false);
      setForm(defaultForm);
      setEditId(null);
      fetchSubjects();
    } catch (error) {
      console.error('Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setForm({
      name: subject.name,
      examDate: subject.examDate.split('T')[0],
      difficulty: subject.difficulty,
      totalTopics: subject.totalTopics,
      priority: subject.priority,
      color: subject.color,
      notes: subject.notes || ''
    });
    setEditId(subject._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await axios.delete(`/api/subjects/${id}`);
      fetchSubjects();
    } catch (error) { console.error('Failed to delete'); }
  };

  const updateProgress = async (id, completedTopics) => {
    try {
      await axios.patch(`/api/subjects/${id}/progress`, { completedTopics });
      fetchSubjects();
    } catch (error) { console.error('Failed to update progress'); }
  };

  const difficultyColor = { easy: 'text-emerald-400', medium: 'text-yellow-400', hard: 'text-red-400' };
  const priorityBg = { low: 'bg-gray-700', medium: 'bg-yellow-900/50 text-yellow-400', high: 'bg-red-900/50 text-red-400' };

  return (
    <div className="max-w-5xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Subjects</h1>
          <p className="text-gray-400 mt-1">Manage your subjects and exam dates</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(defaultForm); setEditId(null); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
<div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                {editId ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Subject Name *</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Data Structures"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Exam Date *</label>
                <input
                  type="date" required
                  value={form.examDate}
                  onChange={e => setForm({ ...form, examDate: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Total Topics: {form.totalTopics}</label>
                <input type="range" min="1" max="50"
                  value={form.totalTopics}
                  onChange={e => setForm({ ...form, totalTopics: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: c, outline: form.color === c ? `2px solid white` : 'none', outlineOffset: '2px' }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                  rows="2" placeholder="Any notes about this subject..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg transition-colors">
                  {loading ? 'Saving...' : (editId ? 'Update' : 'Add Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Cards */}
      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 border-dashed rounded-2xl">
          <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg">No subjects yet</h3>
          <p className="text-gray-400 mt-2">Add your first subject to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map(subject => (
            <div key={subject._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: subject.color + '30' }}>
                    <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{subject.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${difficultyColor[subject.difficulty]} capitalize`}>
                        {subject.difficulty}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${priorityBg[subject.priority]}`}>
                        {subject.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(subject)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(subject._id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exam Date */}
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <Calendar className="w-4 h-4" />
                <span>Exam: {new Date(subject.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="ml-auto text-xs" style={{ color: subject.daysUntilExam <= 7 ? '#ef4444' : '#6b7280' }}>
                  {subject.daysUntilExam > 0 ? `${subject.daysUntilExam} days left` : 'Past'}
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Topics completed</span>
                  <span className="text-white font-medium">
                    {subject.completedTopics}/{subject.totalTopics}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                  <div className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${subject.completionPercent}%`, backgroundColor: subject.color }}
                  />
                </div>
                {/* Progress controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => subject.completedTopics > 0 && updateProgress(subject._id, subject.completedTopics - 1)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-1.5 rounded-lg text-sm transition-colors"
                    disabled={subject.completedTopics === 0}
                  >
                    − Topic
                  </button>
                  <button
                    onClick={() => subject.completedTopics < subject.totalTopics && updateProgress(subject._id, subject.completedTopics + 1)}
                    className="flex-1 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-400 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                    disabled={subject.completedTopics === subject.totalTopics}
                  >
                    <Check className="w-3 h-3" /> Topic Done
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

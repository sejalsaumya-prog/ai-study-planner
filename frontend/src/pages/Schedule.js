import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Calendar, Clock, CheckCircle, Circle, RefreshCw, Lightbulb } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

export default function Schedule() {
  const [schedule, setSchedule] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchSchedule(); }, []);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('/api/schedule');
      setSchedule(res.data);
    } catch (error) {
      console.error('Failed to fetch schedule');
    } finally {
      setFetching(false);
    }
  };

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/schedule/generate');
      setSchedule(res.data.schedule);
      setTips(res.data.tips || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate schedule. Please add subjects first.');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (itemId) => {
    try {
      const res = await axios.patch(`/api/schedule/complete/${itemId}`);
      setSchedule(res.data);
    } catch (error) {
      console.error('Failed to toggle');
    }
  };

  // Group schedule items by date
  const groupedItems = schedule?.items?.reduce((groups, item) => {
    const date = new Date(item.date).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {}) || {};

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Study Schedule</h1>
          <p className="text-gray-400 mt-1">AI-generated 7-day study plan</p>
        </div>
        <button
          onClick={generateSchedule}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> {schedule ? 'Regenerate' : 'Generate Plan'}</>
          )}
        </button>
      </div>

      {/* AI Summary */}
      {schedule?.aiSummary && (
        <div className="bg-indigo-900/30 border border-indigo-800 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-indigo-200 text-sm leading-relaxed">{schedule.aiSummary}</p>
          </div>
        </div>
      )}

      {/* AI Tips */}
      {tips.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="text-yellow-400 font-semibold text-sm">AI Study Tips</h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-yellow-200/80 text-sm">
                <span className="text-yellow-500 font-bold flex-shrink-0">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Schedule Empty State */}
      {!schedule || Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 border-dashed rounded-2xl">
          <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg">No schedule yet</h3>
          <p className="text-gray-400 mt-2 mb-6">
            Add your subjects first, then generate an AI study plan
          </p>
          <button onClick={generateSchedule} disabled={loading}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([dateStr, items]) => {
              const completedCount = items.filter(i => i.completed).length;
              const totalMinutes = items.reduce((sum, i) => sum + i.duration, 0);

              return (
                <div key={dateStr} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  {/* Day Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                        ${isToday(new Date(dateStr)) ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                        {format(new Date(dateStr), 'd')}
                      </div>
                      <div>
                        <p className={`font-semibold ${isToday(new Date(dateStr)) ? 'text-indigo-400' : 'text-white'}`}>
                          {getDateLabel(dateStr)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">{completedCount}/{items.length}</p>
                      <p className="text-gray-500 text-xs">completed</p>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="divide-y divide-gray-800">
                    {items.map((item) => (
                      <div key={item._id}
                        className={`flex items-start gap-4 px-5 py-4 transition-colors
                          ${item.completed ? 'bg-gray-900/50' : 'hover:bg-gray-800/30'}`}
                      >
                        <button onClick={() => toggleComplete(item._id)} className="mt-0.5 flex-shrink-0">
                          {item.completed
                            ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                            : <Circle className="w-5 h-5 text-gray-600 hover:text-gray-400" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-sm ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {item.subjectName}
                            </span>
                          </div>
                          {item.topic && (
                            <p className={`text-sm ${item.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                              {item.topic}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-sm flex-shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.duration}m</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Day Progress Bar */}
                  <div className="px-5 py-3 bg-gray-800/30">
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(completedCount / items.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

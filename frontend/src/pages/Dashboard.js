import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, Calendar, BookOpen, Clock,
  ChevronRight, Zap, Target, Award
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/progress/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
    </div>
  );

  const statCards = [
    {
      label: 'Overall Progress',
      value: `${stats?.overallProgress || 0}%`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-900/30',
      border: 'border-indigo-800'
    },
    {
      label: 'Topics Completed',
      value: `${stats?.completedTopics || 0}/${stats?.totalTopics || 0}`,
      icon: Target,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/30',
      border: 'border-emerald-800'
    },
    {
      label: 'Sessions Today',
      value: stats?.sessionsToday || 0,
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-800'
    },
    {
      label: 'Hours Studied Today',
      value: `${stats?.hoursStudiedToday || 0}h`,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'bg-purple-900/30',
      border: 'border-purple-800'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {greeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's your study overview for today</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.bg} border ${card.border} rounded-2xl p-5`}>
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-gray-400 text-sm">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color} mt-1`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Subject Progress */}
      {stats?.subjectProgress?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Subject Progress</h2>
            <Link to="/subjects" className="text-indigo-400 text-sm flex items-center gap-1 hover:text-indigo-300">
              Manage <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {stats.subjectProgress.map((subject) => (
              <div key={subject.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                    <span className="text-white text-sm font-medium">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">
                      {subject.daysUntilExam > 0 ? `${subject.daysUntilExam}d left` : 'Exam passed'}
                    </span>
                    <span className="text-white text-sm font-bold">{subject.completionPercent}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${subject.completionPercent}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/subjects', icon: BookOpen, title: 'Add Subject', desc: 'Add a new subject and exam date', color: 'indigo' },
          { to: '/schedule', icon: Calendar, title: 'Generate Schedule', desc: 'Create AI-powered study plan', color: 'purple' },
          { to: '/progress', icon: Award, title: 'View Progress', desc: 'Track your study achievements', color: 'emerald' }
        ].map(({ to, icon: Icon, title, desc, color }) => (
          <Link key={to} to={to}
            className={`bg-gray-900 border border-gray-800 hover:border-${color}-700 rounded-2xl p-5 transition-all group`}
          >
            <div className={`w-10 h-10 bg-${color}-900/50 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{desc}</p>
            <ChevronRight className={`w-5 h-5 text-${color}-400 mt-3 group-hover:translate-x-1 transition-transform`} />
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {(!stats?.subjectProgress || stats.subjectProgress.length === 0) && (
        <div className="mt-8 text-center py-12 bg-gray-900 border border-gray-800 border-dashed rounded-2xl">
          <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg">No subjects yet</h3>
          <p className="text-gray-400 mt-2 mb-6">Add your subjects to get started with AI planning</p>
          <Link to="/subjects"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Add First Subject
          </Link>
        </div>
      )}
    </div>
  );
}

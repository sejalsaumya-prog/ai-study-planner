import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { Target, Zap, TrendingUp, Calendar } from 'lucide-react';

export default function Progress() {
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
    </div>
  );

  const overallData = [{ name: 'Progress', value: stats?.overallProgress || 0, fill: '#6366f1' }];

  const subjectChartData = stats?.subjectProgress?.map(s => ({
    name: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
    progress: s.completionPercent,
    color: s.color
  })) || [];

  const statCards = [
    { label: 'Overall Progress', value: `${stats?.overallProgress || 0}%`, icon: TrendingUp, color: 'indigo' },
    { label: 'Topics Done', value: `${stats?.completedTopics || 0}/${stats?.totalTopics || 0}`, icon: Target, color: 'emerald' },
    { label: 'Sessions Completed', value: stats?.totalSessionsCompleted || 0, icon: Zap, color: 'yellow' },
    { label: 'Upcoming Exams', value: stats?.upcomingExams || 0, icon: Calendar, color: 'red' },
  ];

  return (
    <div className="max-w-5xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Progress</h1>
        <p className="text-gray-400 mt-1">Track your study achievements</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-${card.color}-900/20 border border-${card.color}-800/50 rounded-2xl p-5`}>
            <card.icon className={`w-6 h-6 text-${card.color}-400 mb-3`} />
            <p className="text-gray-400 text-sm">{card.label}</p>
            <p className={`text-2xl font-bold text-${card.color}-400 mt-1`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overall Progress Ring */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Overall Completion</h2>
          <div className="flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="90%"
                  data={overallData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#1f2937' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{stats?.overallProgress || 0}%</span>
                <span className="text-gray-400 text-sm">Complete</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats?.completedTopics || 0}</p>
              <p className="text-gray-400 text-xs">Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {(stats?.totalTopics || 0) - (stats?.completedTopics || 0)}
              </p>
              <p className="text-gray-400 text-xs">Remaining</p>
            </div>
          </div>
        </div>

        {/* Subject Progress Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">By Subject</h2>
          {subjectChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectChartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Progress']}
                />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                  {subjectChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-600">
              <p>No subject data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Subject Detail Cards */}
      {stats?.subjectProgress?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Subject Details</h2>
          <div className="space-y-4">
            {stats.subjectProgress.map((subject) => (
              <div key={subject.id} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium truncate">{subject.name}</span>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-gray-400 text-xs">
                        {subject.daysUntilExam > 0
                          ? `${subject.daysUntilExam} days left`
                          : 'Exam passed'}
                      </span>
                      <span className="text-white text-sm font-bold w-10 text-right">
                        {subject.completionPercent}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${subject.completionPercent}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement badges */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: 'First Step', desc: 'Added first subject', earned: (stats?.totalTopics || 0) > 0, icon: '🎯' },
            { title: 'On Track', desc: '25% topics done', earned: (stats?.overallProgress || 0) >= 25, icon: '🚀' },
            { title: 'Halfway', desc: '50% topics done', earned: (stats?.overallProgress || 0) >= 50, icon: '⭐' },
            { title: 'Almost There', desc: '75% topics done', earned: (stats?.overallProgress || 0) >= 75, icon: '🏆' },
          ].map((badge, i) => (
            <div key={i} className={`p-4 rounded-xl border text-center transition-all
              ${badge.earned
                ? 'bg-indigo-900/30 border-indigo-700'
                : 'bg-gray-800/50 border-gray-700 opacity-40'}`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className={`text-sm font-semibold ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
                {badge.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

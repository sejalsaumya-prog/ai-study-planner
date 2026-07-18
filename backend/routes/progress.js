const express = require('express');
const Subject = require('../models/Subject');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

const router = express.Router();

// Get overall progress stats
router.get('/stats', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id });
    const schedule = await Schedule.findOne({ user: req.user._id });

    // Overall completion
    const totalTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
    const completedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
    const overallProgress = totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

    // Sessions completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let sessionsToday = 0;
    let hoursStudiedToday = 0;
    let totalSessionsCompleted = 0;

    if (schedule) {
      const todaySessions = schedule.items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= today && itemDate < tomorrow;
      });
      sessionsToday = todaySessions.filter(s => s.completed).length;
      hoursStudiedToday = todaySessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.duration, 0) / 60;

      totalSessionsCompleted = schedule.items.filter(s => s.completed).length;
    }

    // Upcoming exams (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingExams = subjects.filter(s => {
      const examDate = new Date(s.examDate);
      return examDate >= new Date() && examDate <= nextWeek;
    });

    res.json({
      overallProgress,
      totalTopics,
      completedTopics,
      sessionsToday,
      hoursStudiedToday: Math.round(hoursStudiedToday * 10) / 10,
      totalSessionsCompleted,
      upcomingExams: upcomingExams.length,
      subjectProgress: subjects.map(s => ({
        id: s._id,
        name: s.name,
        color: s.color,
        completionPercent: s.completionPercent,
        daysUntilExam: s.daysUntilExam,
        examDate: s.examDate
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

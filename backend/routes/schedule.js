const express = require('express');
const Groq = require('groq-sdk');
const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate AI schedule
router.post('/generate', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id });

    if (subjects.length === 0) {
      return res.status(400).json({ message: 'Please add subjects first' });
    }

    const user = req.user;
    const today = new Date();

    // Build prompt for Groq
    const subjectList = subjects.map(s => ({
      name: s.name,
      examDate: s.examDate.toISOString().split('T')[0],
      difficulty: s.difficulty,
      priority: s.priority,
      daysUntilExam: Math.ceil((new Date(s.examDate) - today) / (1000 * 60 * 60 * 24)),
      completionPercent: s.completionPercent,
      remainingTopics: s.totalTopics - s.completedTopics
    }));

    const prompt = `You are an expert academic study planner. Create a detailed 7-day study schedule.

Student Info:
- Available study hours per day: ${user.studyHoursPerDay} hours
- Today's date: ${today.toISOString().split('T')[0]}

Subjects and Exams:
${JSON.stringify(subjectList, null, 2)}

Create a study schedule for the next 7 days. Return ONLY valid JSON in this exact format:
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "subjectName": "Subject Name",
          "duration": 60,
          "topic": "Specific topic to study",
          "priority": "high/medium/low"
        }
      ]
    }
  ],
  "summary": "Brief 2-3 sentence motivational summary of the study plan",
  "tips": ["tip1", "tip2", "tip3"]
}

Rules:
- Prioritize subjects with earlier exam dates and higher difficulty
- Don't exceed ${user.studyHoursPerDay * 60} minutes total per day
- Include breaks (don't schedule more than 90 minutes per subject per day)
- Focus more on subjects with lower completion percentage
- Return ONLY the JSON, no other text`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = completion.choices[0]?.message?.content;

    // Parse AI response
    let parsedSchedule;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      parsedSchedule = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(500).json({ message: 'AI response parsing failed, please try again' });
    }

    // Build schedule items
    const scheduleItems = [];
    for (const day of parsedSchedule.schedule) {
      for (const session of day.sessions) {
        const subject = subjects.find(s =>
          s.name.toLowerCase() === session.subjectName.toLowerCase()
        );
        if (subject) {
          scheduleItems.push({
            subject: subject._id,
            subjectName: session.subjectName,
            date: new Date(day.date),
            duration: session.duration,
            topic: session.topic,
            completed: false
          });
        }
      }
    }

    // Delete old schedule and save new one
    await Schedule.deleteOne({ user: req.user._id });
    const schedule = new Schedule({
      user: req.user._id,
      items: scheduleItems,
      aiSummary: parsedSchedule.summary
    });
    await schedule.save();

    res.json({
      schedule,
      tips: parsedSchedule.tips,
      summary: parsedSchedule.summary
    });
  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({ message: 'Failed to generate schedule', error: error.message });
  }
});

// Get current schedule
router.get('/', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ user: req.user._id })
      .populate('items.subject', 'name color');
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark session as complete
router.patch('/complete/:itemId', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ user: req.user._id });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const item = schedule.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Session not found' });

    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date() : null;
    await schedule.save();

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get AI study tips for a specific subject
router.post('/tips', auth, async (req, res) => {
  try {
    const { subjectName, difficulty, daysLeft } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: `Give 5 specific, actionable study tips for a student studying ${subjectName} 
        (difficulty: ${difficulty}) with ${daysLeft} days until the exam. 
        Be concise and practical. Format as a JSON array of strings.`
      }],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    const tipsMatch = response.match(/\[[\s\S]*\]/);
    const tips = JSON.parse(tipsMatch[0]);

    res.json({ tips });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get tips', error: error.message });
  }
});

module.exports = router;

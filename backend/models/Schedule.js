const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subjectName: String,
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  topic: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [scheduleItemSchema],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  aiSummary: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  examDate: {
    type: Date,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  totalTopics: {
    type: Number,
    default: 10
  },
  completedTopics: {
    type: Number,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for days until exam
subjectSchema.virtual('daysUntilExam').get(function() {
  const today = new Date();
  const exam = new Date(this.examDate);
  const diff = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
  return diff;
});

// Virtual for completion percentage
subjectSchema.virtual('completionPercent').get(function() {
  if (this.totalTopics === 0) return 0;
  return Math.round((this.completedTopics / this.totalTopics) * 100);
});

subjectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Subject', subjectSchema);

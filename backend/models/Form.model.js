const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['text', 'multipleChoice', 'rating'],
    default: 'text'
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String,
    trim: true
  }],
  placeholder: {
    type: String,
    trim: true
  },
  maxRating: {
    type: Number,
    default: 5,
    min: 2,
    max: 10
  }
});

const FormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  questions: [QuestionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  responseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Form', FormSchema);
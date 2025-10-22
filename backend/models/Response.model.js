const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const ResponseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  answers: [AnswerSchema],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', ResponseSchema);
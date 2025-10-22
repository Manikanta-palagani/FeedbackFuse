const express = require('express');
const Form = require('../models/Form.model');
const Response = require('../models/Response.model');
const router = express.Router();

// Submit response
router.post('/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!form.isActive) {
      return res.status(400).json({ message: 'Form is not accepting responses' });
    }

    // Validate required questions
    const requiredQuestions = form.questions.filter(q => q.required);
    for (const question of requiredQuestions) {
      const answer = answers.find(a => a.questionId === question._id.toString());
      if (!answer || !answer.answer) {
        return res.status(400).json({ 
          message: `Required question "${question.questionText}" not answered` 
        });
      }
    }

    // Create response
    const response = new Response({
      formId,
      answers
    });

    await response.save();

    // Update form response count
    await Form.findByIdAndUpdate(formId, {
      $inc: { responseCount: 1 }
    });

    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ message: 'Server error while submitting response' });
  }
});

// Get responses for a form
router.get('/form/:formId', async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const responses = await Response.find({ formId: req.params.formId });
    res.json(responses);
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Server error while fetching responses' });
  }
});

module.exports = router;
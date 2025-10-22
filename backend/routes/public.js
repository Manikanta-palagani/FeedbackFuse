const express = require('express');
const Form = require('../models/Form.model');
const router = express.Router();

// Get public form
router.get('/form/:formId', async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!form.isActive) {
      return res.status(403).json({ message: 'This form is not active' });
    }

    // Return public form data (without sensitive info)
    res.status(200).json({
      message: 'Form retrieved successfully',
      form: {
        _id: form._id,
        title: form.title,
        description: form.description,
        questions: form.questions,
        createdAt: form.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving form',
      error: error.message 
    });
  }
});

module.exports = router;
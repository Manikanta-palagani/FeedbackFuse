const express = require('express');
const auth = require('../middleware/auth');
const Form = require('../models/Form.model');
const Response = require('../models/Response.model');
const router = express.Router();

// Get all forms for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const forms = await Form.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ message: 'Server error while fetching forms' });
  }
});

// Get form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid form ID' });
    }
    console.error('Get form error:', error);
    res.status(500).json({ message: 'Server error while fetching form' });
  }
});

// Create form
router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Title and questions are required' });
    }

    const formData = {
      title,
      description: description || '',
      questions,
      createdBy: req.user.id
    };

    const form = new Form(formData);
    await form.save();

    res.status(201).json({
      message: 'Form created successfully',
      form
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ message: 'Server error while creating form' });
  }
});

// Update form
router.put('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Form updated successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ message: 'Server error while updating form' });
  }
});

// Delete form
router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Also delete all responses for this form
    await Response.deleteMany({ formId: req.params.id });
    await Form.findByIdAndDelete(req.params.id);

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ message: 'Server error while deleting form' });
  }
});

// Get dashboard stats
router.get('/user/:userId/stats', auth, async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const formsCount = await Form.countDocuments({ createdBy: req.user.id });
    
    const forms = await Form.find({ createdBy: req.user.id });
    const totalResponses = forms.reduce((sum, form) => sum + (form.responseCount || 0), 0);
    
    res.json({ 
      forms: formsCount, 
      responses: totalResponses 
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

module.exports = router;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Layout/LoadingSpinner';

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    questionType: 'text',
    required: false,
    options: [''],
    placeholder: '',
    maxRating: 5
  });

  useEffect(() => {
    if (formId) {
      fetchForm();
    } else {
      setForm({
        title: '',
        description: '',
        questions: [],
        createdBy: user.id
      });
      setLoading(false);
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await formsAPI.getForm(formId);
      setForm(response.data);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (formId) {
        await formsAPI.updateForm(formId, form);
      } else {
        const response = await formsAPI.createForm(form);
        navigate(`/form-builder/${response.data.form._id}`);
      }
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.questionText.trim()) return;

    setForm({
      ...form,
      questions: [...form.questions, { ...newQuestion }]
    });

    setNewQuestion({
      questionText: '',
      questionType: 'text',
      required: false,
      options: [''],
      placeholder: '',
      maxRating: 5
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[index][field] = value;
    setForm({ ...form, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = form.questions.filter((_, i) => i !== index);
    setForm({ ...form, questions: updatedQuestions });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[questionIndex].options.push('');
    setForm({ ...form, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setForm({ ...form, questions: updatedQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setForm({ ...form, questions: updatedQuestions });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'white' }}>{formId ? 'Edit Form' : 'Create New Form'}</h1>
        <div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Form'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/dashboard')}
            style={{ marginLeft: '10px' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '30px' }}>
        <h3>Form Details</h3>
        <div className="form-group">
          <label>Form Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter form title"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Enter form description"
            rows="3"
            style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '5px' }}
          />
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '30px' }}>
        <h3>Add New Question</h3>
        <div className="form-group">
          <label>Question Text</label>
          <input
            type="text"
            value={newQuestion.questionText}
            onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
            placeholder="Enter your question"
          />
        </div>
        
        <div className="form-group">
          <label>Question Type</label>
          <select
            value={newQuestion.questionType}
            onChange={(e) => setNewQuestion({ ...newQuestion, questionType: e.target.value })}
          >
            <option value="text">Text Answer</option>
            <option value="multipleChoice">Multiple Choice</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {newQuestion.questionType === 'multipleChoice' && (
          <div className="form-group">
            <label>Options</label>
            {newQuestion.options.map((option, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: '5px' }}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                  placeholder={`Option ${index + 1}`}
                  style={{ marginRight: '5px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = newQuestion.options.filter((_, i) => i !== index);
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] })}
              className="btn btn-secondary btn-sm"
            >
              Add Option
            </button>
          </div>
        )}

        {newQuestion.questionType === 'rating' && (
          <div className="form-group">
            <label>Maximum Rating</label>
            <input
              type="number"
              min="2"
              max="10"
              value={newQuestion.maxRating}
              onChange={(e) => setNewQuestion({ ...newQuestion, maxRating: parseInt(e.target.value) })}
            />
          </div>
        )}

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={newQuestion.required}
              onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
            />
            Required Question
          </label>
        </div>

        <button className="btn btn-primary" onClick={addQuestion}>
          Add Question
        </button>
      </div>

      <div className="form-card">
        <h3>Form Questions ({form.questions.length})</h3>
        {form.questions.length === 0 ? (
          <p>No questions added yet. Add questions above.</p>
        ) : (
          form.questions.map((question, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{question.questionText} {question.required && <span style={{ color: 'red' }}>*</span>}</h4>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeQuestion(index)}
                >
                  Remove
                </button>
              </div>
              <p>Type: {question.questionType}</p>
              
              {question.questionType === 'multipleChoice' && (
                <div>
                  <strong>Options:</strong>
                  <ul>
                    {question.options.map((option, optIndex) => (
                      <li key={optIndex}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}

              {question.questionType === 'rating' && (
                <p><strong>Max Rating:</strong> {question.maxRating}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
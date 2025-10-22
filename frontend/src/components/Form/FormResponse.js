import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formsAPI, responsesAPI } from '../../services/api';
import LoadingSpinner from '../Layout/LoadingSpinner';

const FormResponse = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await formsAPI.getForm(formId);
      setForm(response.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach((question, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers({
      ...answers,
      [questionIndex]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([index, answer]) => ({
        questionId: form.questions[index]._id,
        questionText: form.questions[index].questionText,
        questionType: form.questions[index].questionType,
        answer: answer
      }));

      await responsesAPI.submitResponse(formId, {
        answers: formattedAnswers,
        duration: 0 // You can calculate this if needed
      });

      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting response:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!form) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'white' }}>
        <h2>Form not found</h2>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'white' }}>
        <h2>Thank You!</h2>
        <p>Your response has been recorded successfully.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="form-card">
        <h2>{form.title}</h2>
        {form.description && <p>{form.description}</p>}
        
        <form onSubmit={handleSubmit}>
          {form.questions.map((question, index) => (
            <div key={index} className="form-group" style={{ marginBottom: '30px' }}>
              <label>
                {question.questionText}
                {question.required && <span style={{ color: 'red' }}> *</span>}
              </label>
              
              {question.questionType === 'text' && (
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={question.placeholder || 'Enter your answer'}
                  required={question.required}
                />
              )}

              {question.questionType === 'multipleChoice' && (
                <div>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} style={{ marginBottom: '10px' }}>
                      <label>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => handleAnswerChange(index, option)}
                          required={question.required}
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {question.questionType === 'rating' && (
                <div>
                  <select
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    required={question.required}
                  >
                    <option value="">Select rating</option>
                    {Array.from({ length: question.maxRating }, (_, i) => i + 1).map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                  <span style={{ marginLeft: '10px' }}>(1 - {question.maxRating})</span>
                </div>
              )}
            </div>
          ))}

          {submitStatus === 'error' && (
            <div className="alert alert-error">
              There was an error submitting your response. Please try again.
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormResponse;
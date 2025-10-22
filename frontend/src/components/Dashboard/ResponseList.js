import React, { useState, useEffect } from 'react';
import { responsesAPI } from '../../services/api';
import LoadingSpinner from '../Layout/LoadingSpinner';

const ResponseList = ({ formId, formTitle, onClose }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchResponses();
  }, [formId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await responsesAPI.getFormResponses(formId);
      setResponses(response.data);
    } catch (error) {
      setError('Failed to fetch responses');
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm('Are you sure you want to delete this response?')) return;

    setDeleting(responseId);
    try {
      await responsesAPI.deleteResponse(responseId);
      // Remove the deleted response from the list
      setResponses(responses.filter(response => response._id !== responseId));
      alert('Response deleted successfully!');
    } catch (error) {
      setError('Failed to delete response');
      console.error('Error deleting response:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await responsesAPI.exportResponses(formId, format);
      
      if (format === 'csv') {
        // Create a download link for CSV
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `responses-${formId}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        // For JSON, show download dialog
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `responses-${formId}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      setError('Failed to export responses');
      console.error('Error exporting responses:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="response-list">
      <div className="modal-header">
        <h3>Responses for: {formTitle}</h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="response-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => handleExport('json')}
        >
          Export JSON
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => handleExport('csv')}
        >
          Export CSV
        </button>
      </div>

      <p>Total responses: {responses.length}</p>
      
      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <div className="responses-container">
          {responses.map((response, index) => (
            <div key={response._id} className="response-card">
              <div className="response-header">
                <h4>Response #{index + 1}</h4>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteResponse(response._id)}
                  disabled={deleting === response._id}
                >
                  {deleting === response._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <p>Submitted on: {new Date(response.submittedAt).toLocaleString()}</p>
              
              <div className="answers-list">
                {response.answers.map((answer, ansIndex) => (
                  <div key={ansIndex} className="answer-item">
                    <strong>{answer.questionText}</strong>
                    <p>{answer.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponseList;
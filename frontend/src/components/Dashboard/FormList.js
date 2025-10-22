import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ResponseList from './ResponseList'; // Import the ResponseList component

const FormList = ({ forms, onFormUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', description: '' });
  const [selectedForm, setSelectedForm] = useState(null);
  const [viewingResponses, setViewingResponses] = useState(false);

  const handleDelete = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    setLoading(true);
    try {
      await formsAPI.deleteForm(formId);
      onFormUpdate();
    } catch (error) {
      console.error('Error deleting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await formsAPI.createForm({
        ...newForm,
        questions: [] // Start with empty questions
      });
      setNewForm({ title: '', description: '' });
      setShowCreateForm(false);
      onFormUpdate();
    } catch (error) {
      console.error('Error creating form:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (formId, currentStatus) => {
    setLoading(true);
    try {
      await formsAPI.updateForm(formId, { isActive: !currentStatus });
      onFormUpdate();
    } catch (error) {
      console.error('Error updating form:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (formId) => {
    const shareLink = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const handleViewResponses = (form) => {
    setSelectedForm(form);
    setViewingResponses(true);
  };

  if (forms.length === 0 && !showCreateForm) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'white' }}>Your Forms</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create First Form
          </button>
        </div>
        
        <div className="form-card">
          <h3>No forms yet</h3>
          <p>Create your first form to start collecting feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'white' }}>Your Forms</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          Create New Form
        </button>
      </div>

      {showCreateForm && (
        <div className="form-card" style={{ marginBottom: '20px' }}>
          <h3>Create New Form</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Form Title</label>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                required
                placeholder="Enter form title"
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                value={newForm.description}
                onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                placeholder="Enter form description"
                rows="3"
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Form'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="forms-grid">
        {forms.map((form) => (
          <div key={form._id} className="form-card">
            <h3>{form.title}</h3>
            <p>{form.description || 'No description'}</p>
            <p><strong>Responses:</strong> {form.responseCount || 0}</p>
            <p>
              <strong>Status:</strong> 
              <span style={{ color: form.isActive ? 'green' : 'red', marginLeft: '5px' }}>
                {form.isActive ? 'Published' : 'Draft'}
              </span>
            </p>
            
            <div className="form-actions">
              <Link to={`/form-builder/${form._id}`} className="btn btn-primary btn-sm">
                Edit
              </Link>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => togglePublish(form._id, form.isActive)}
                disabled={loading}
              >
                {form.isActive ? 'Unpublish' : 'Publish'}
              </button>
              <button 
                className="btn btn-sm"
                onClick={() => handleViewResponses(form)}
                style={{ background: '#4299e1', color: 'white' }}
              >
                View Responses
              </button>
              <button 
                className="btn btn-sm"
                onClick={() => copyShareLink(form._id)}
                style={{ background: '#48bb78', color: 'white' }}
              >
                Share
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(form._id)}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Response Viewing Modal */}
      {viewingResponses && selectedForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Responses for: {selectedForm.title}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setViewingResponses(false);
                  setSelectedForm(null);
                }}
              >
                &times;
              </button>
            </div>
            <ResponseList formId={selectedForm._id} formTitle={selectedForm.title} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormList;
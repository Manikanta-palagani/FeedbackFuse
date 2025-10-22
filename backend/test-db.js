const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simple working API
app.post('/api/auth/register', (req, res) => {
  res.json({ 
    token: 'mock-token', 
    user: { id: '1', username: req.body.username, email: req.body.email } 
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    token: 'mock-token', 
    user: { id: '1', username: 'testuser', email: req.body.email } 
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'mock' });
});

app.listen(5000, () => {
  console.log('🚀 Simple server running on port 5000');
});
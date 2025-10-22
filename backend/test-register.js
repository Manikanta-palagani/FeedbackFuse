const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('🧪 Testing registration endpoint...\n');
    
    const testUser = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };
    
    console.log('📤 Sending registration request with:');
    console.log(JSON.stringify(testUser, null, 2));
    console.log('');
    
    const response = await axios.post('http://localhost:5001/api/auth/register', testUser);
    
    console.log('✅ Registration successful!');
    console.log('📥 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Registration failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Is the server running on port 5001?');
    } else {
      console.error('Error:', error.message);
    }
  }
};

testRegistration();

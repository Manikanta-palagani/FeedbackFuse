const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    console.log('📋 Database: feedbackfuse');

    // Connection options for MongoDB Atlas (updated for newer Mongoose)
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout for Atlas
      connectTimeoutMS: 30000, // 30 seconds connection timeout
      // Remove bufferMaxEntries as it's not supported in newer Mongoose versions
    };

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🏢 Host: ${conn.connection.host}`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    // Provide specific error messages for common Atlas issues
    if (error.message.includes('bad auth')) {
      console.error('🔐 Authentication failed. Please check your username and password');
      console.error('💡 Tip: Make sure your Atlas user has the correct permissions');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('🌐 Network error. Please check:');
      console.error('   - Your internet connection');
      console.error('   - If your IP is whitelisted in Atlas');
      console.error('   - If the cluster URL is correct');
    } else if (error.message.includes('timed out')) {
      console.error('⏰ Connection timeout. This might be due to:');
      console.error('   - Slow internet connection');
      console.error('   - Firewall blocking the connection');
      console.error('   - Atlas cluster issues');
    } else if (error.message.includes('MONGODB_URI')) {
      console.error('🔧 Please check your .env file and make sure MONGODB_URI is defined');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📈 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Close connection on app termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
const mongoose = require('mongoose');

const connectDB = async() => {
  try{
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`connected to mongodb database : ${conn.connection.host}`)
  }catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

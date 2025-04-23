const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sensor', SensorSchema);

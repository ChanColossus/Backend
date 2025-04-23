const Sensor = require('../models/sensor');

const saveSensorData = async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    const sensor = new Sensor({ temperature, humidity });
    await sensor.save();
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving data', error });
  }
};

module.exports = { saveSensorData };

const express = require('express');
const router = express.Router();
const { saveSensorData } = require('../controllers/SensorController');

router.post('/data', saveSensorData);

module.exports = router;

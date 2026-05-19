const express = require('express');
const {
  createSensor,
  getSensors,
  deleteSensor,
  exportSensors,
} = require('../controllers/sensorController');
const { createSensorLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/export', exportSensors);
router.get('/', getSensors);
router.post('/', createSensorLimiter, createSensor);
router.delete('/:id', deleteSensor);

module.exports = router;

const express = require('express');
const {
  createSensor,
  getSensors,
  deleteSensor,
  exportSensors,
} = require('../controllers/sensorController');

const router = express.Router();

router.get('/export', exportSensors);
router.get('/', getSensors);
router.post('/', createSensor);
router.delete('/:id', deleteSensor);

module.exports = router;

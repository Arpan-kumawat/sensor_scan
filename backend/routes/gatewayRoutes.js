const express = require('express');
const {
  createGateway,
  getGateways,
  updateGateway,
  deleteGateway,
  exportGateways,
} = require('../controllers/gatewayController');
const { createGatewayLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/export', exportGateways);
router.get('/', getGateways);
router.post('/', createGatewayLimiter, createGateway);
router.patch('/:id', updateGateway);
router.delete('/:id', deleteGateway);

module.exports = router;

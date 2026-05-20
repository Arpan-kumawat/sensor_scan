const express = require('express');
const {
  createGateway,
  getGateways,
  deleteGateway,
  exportGateways,
} = require('../controllers/gatewayController');
const { createGatewayLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/export', exportGateways);
router.get('/', getGateways);
router.post('/', createGatewayLimiter, createGateway);
router.delete('/:id', deleteGateway);

module.exports = router;

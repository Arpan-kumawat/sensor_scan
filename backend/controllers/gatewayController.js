const Gateway = require('../models/Gateway');
const { buildGatewayWorkbook } = require('../utils/excelExport');

const DUPLICATE_MESSAGE = 'Gateway already scanned';

const createGateway = async (req, res, next) => {
  try {
    const { serialNumber, manufacturer } = req.body;

    if (!serialNumber) {
      return res.status(400).json({
        success: false,
        message: 'Gateway serial number is required',
      });
    }

    const existing = await Gateway.findOne({ serialNumber: serialNumber.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: DUPLICATE_MESSAGE,
        data: existing,
      });
    }

    const gateway = await Gateway.create({
      serialNumber: serialNumber.trim(),
      manufacturer: manufacturer?.trim() || '',
      scannedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Gateway saved successfully',
      data: gateway,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: DUPLICATE_MESSAGE,
      });
    }
    next(error);
  }
};

const getGateways = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ serialNumber: regex }, { manufacturer: regex }, { comments: regex }];
    }

    const skip = (page - 1) * limit;

    const [gateways, total, totalAll] = await Promise.all([
      Gateway.find(filter).sort({ scannedAt: -1 }).skip(skip).limit(limit),
      Gateway.countDocuments(filter),
      Gateway.countDocuments(),
    ]);

    res.json({
      success: true,
      data: gateways,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      totalCount: totalAll,
    });
  } catch (error) {
    next(error);
  }
};

const updateGateway = async (req, res, next) => {
  try {
    if (!('comments' in req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Comments field is required',
      });
    }

    const comments = typeof req.body.comments === 'string' ? req.body.comments.trim() : '';

    const gateway = await Gateway.findByIdAndUpdate(
      req.params.id,
      { comments },
      { new: true, runValidators: true }
    );

    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: 'Gateway not found',
      });
    }

    res.json({
      success: true,
      message: 'Gateway updated successfully',
      data: gateway,
    });
  } catch (error) {
    next(error);
  }
};

const deleteGateway = async (req, res, next) => {
  try {
    const gateway = await Gateway.findByIdAndDelete(req.params.id);

    if (!gateway) {
      return res.status(404).json({
        success: false,
        message: 'Gateway not found',
      });
    }

    res.json({
      success: true,
      message: 'Gateway deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const exportGateways = async (req, res, next) => {
  try {
    const gateways = await Gateway.find().sort({ scannedAt: -1 });
    const buffer = await buildGatewayWorkbook(gateways);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=gateway-inventory-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGateway,
  getGateways,
  updateGateway,
  deleteGateway,
  exportGateways,
};

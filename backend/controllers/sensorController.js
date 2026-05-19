const Sensor = require('../models/Sensor');
const { buildSensorWorkbook } = require('../utils/excelExport');

const DUPLICATE_MESSAGE = 'Sensor already scanned';

const createSensor = async (req, res, next) => {
  try {
    const { sensorType, serialNumber, manufacturer } = req.body;

    if (!sensorType || !serialNumber) {
      return res.status(400).json({
        success: false,
        message: 'Sensor type and serial number are required',
      });
    }

    const existing = await Sensor.findOne({ serialNumber: serialNumber.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: DUPLICATE_MESSAGE,
        data: existing,
      });
    }

    const sensor = await Sensor.create({
      sensorType: sensorType.trim(),
      serialNumber: serialNumber.trim(),
      manufacturer: manufacturer?.trim() || '',
      scannedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Sensor saved successfully',
      data: sensor,
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

const getSensors = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ sensorType: regex }, { serialNumber: regex }, { manufacturer: regex }];
    }

    const skip = (page - 1) * limit;

    const [sensors, total, totalAll] = await Promise.all([
      Sensor.find(filter).sort({ scannedAt: -1 }).skip(skip).limit(limit),
      Sensor.countDocuments(filter),
      Sensor.countDocuments(),
    ]);

    res.json({
      success: true,
      data: sensors,
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

const deleteSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found',
      });
    }

    res.json({
      success: true,
      message: 'Sensor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const exportSensors = async (req, res, next) => {
  try {
    const sensors = await Sensor.find().sort({ scannedAt: -1 });
    const buffer = await buildSensorWorkbook(sensors);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sensor-inventory-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSensor,
  getSensors,
  deleteSensor,
  exportSensors,
};

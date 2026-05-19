const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    sensorType: {
      type: String,
      required: [true, 'Sensor type is required'],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

sensorSchema.index({ sensorType: 1 });

module.exports = mongoose.model('Sensor', sensorSchema);

const mongoose = require('mongoose');

const gatewaySchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: [true, 'Gateway serial number is required'],
      unique: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    comments: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Comments cannot exceed 500 characters'],
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

module.exports = mongoose.model('Gateway', gatewaySchema);

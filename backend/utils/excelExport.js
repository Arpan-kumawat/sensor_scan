const ExcelJS = require('exceljs');

const buildSensorWorkbook = async (sensors) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sensor Inventory');

  sheet.columns = [
    { header: 'Sensor Type', key: 'sensorType', width: 18 },
    { header: 'Serial Number', key: 'serialNumber', width: 18 },
    { header: 'Manufacturer', key: 'manufacturer', width: 22 },
    { header: 'Comments', key: 'comments', width: 32 },
    { header: 'Scanned At', key: 'scannedAt', width: 24 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  sensors.forEach((sensor) => {
    sheet.addRow({
      sensorType: sensor.sensorType,
      serialNumber: sensor.serialNumber,
      manufacturer: sensor.manufacturer || '',
      comments: sensor.comments || '',
      scannedAt: sensor.scannedAt
        ? new Date(sensor.scannedAt).toLocaleString()
        : '',
    });
  });

  return workbook.xlsx.writeBuffer();
};

const buildGatewayWorkbook = async (gateways) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Gateway Inventory');

  sheet.columns = [
    { header: 'Gateway Serial Number', key: 'serialNumber', width: 22 },
    { header: 'Manufacturer', key: 'manufacturer', width: 22 },
    { header: 'Comments', key: 'comments', width: 32 },
    { header: 'Scanned At', key: 'scannedAt', width: 24 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  gateways.forEach((gateway) => {
    sheet.addRow({
      serialNumber: gateway.serialNumber,
      manufacturer: gateway.manufacturer || '',
      comments: gateway.comments || '',
      scannedAt: gateway.scannedAt
        ? new Date(gateway.scannedAt).toLocaleString()
        : '',
    });
  });

  return workbook.xlsx.writeBuffer();
};

module.exports = { buildSensorWorkbook, buildGatewayWorkbook };

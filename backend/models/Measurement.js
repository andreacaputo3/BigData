const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
    location_id: String,
    location_name: String,
    parameter: String,
    value: String,
    unit: String,
    datetimeUtc: Date,
    datetimeLocal: Date,
    timezone: String,
    latitude: String,
    longitude: String,
    country_iso: { type: String, default: '' },
    isMobile: { type: String, default: '' },
    isMonitor: { type: String, default: '' },
    owner_name: String,
    provider: String
});

module.exports = mongoose.model('Measurement', measurementSchema, 'measurements');

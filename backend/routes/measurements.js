const express = require('express');
const Measurement = require('../models/Measurement');
const router = express.Router();

// tutte le misurazioni
router.get('/', async (req, res) => {
    try {
        const measurements = await Measurement.find();
        res.json(measurements);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/:pollutant/daily-average', async (req, res) => {
    try {
        const pollutant = req.params.pollutant;
        const { city } = req.query;

        if (!pollutant || !city) {
            return res.status(400).json({
                error: 'I parametri pollutant e city sono obbligatori.'
            });
        }

        console.info(`Richiesta per media giornaliera - parametro: ${pollutant}, città: ${city}`);

        const dailyGranularityPipeline = [
            {
                $match: {
                    parameter: pollutant,
                    location_name: { $regex: new RegExp(`^${city}$`, 'i') },
                    value: { $ne: null }
                }
            },
            {
                $addFields: {
                    value: { $toDouble: "$value" },
                    dateOnly: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeUtc" } }
                }
            },
            {
                $group: {
                    _id: "$dateOnly",
                    average_value: { $avg: "$value" },
                    max_value: { $max: "$value" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const results = await Measurement.aggregate(dailyGranularityPipeline).exec();

        if (results.length === 0) {
            return res.status(200).json({
                message: 'Nessun dato trovato per i parametri forniti.',
                data: []
            });
        }

        res.status(200).json(results.map(result => ({
            _id: result._id,
            average_value: result.average_value,
            max_value: result.max_value !== undefined ? result.max_value : null
        })));
    } catch (error) {
        console.error("Errore durante l'esecuzione della pipeline:", error);
        res.status(500).json({ error: 'Errore durante l\'esecuzione della pipeline.' });
    }
});


// dati temporali
router.get('/:pollutant/trend', async (req, res) => {
    try {
        const pollutant = req.params.pollutant;
        const { startDate, endDate, granularity, city } = req.query;

        if (!pollutant || !startDate || !endDate || !granularity || !city) {
            return res.status(400).json({
                error: 'I parametri pollutant, startDate, endDate, granularity e city sono obbligatori.'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Le date fornite non sono valide.' });
        }

        if (start > end) {
            return res.status(400).json({ error: 'La data di inizio non può essere successiva alla data di fine.' });
        }

        const normalizedGranularity = granularity.trim().toLowerCase();
        const granularities = {
            daily: [
                { $addFields: { value: { $toDouble: "$value" }, datetimeUtc: { $toDate: "$datetimeUtc" } } },
                { $match: {
                        parameter: pollutant,
                        location_name: city,
                        value: { $ne: null },
                        datetimeUtc: { $gte: start, $lte: end }
                    }},
                { $project: {
                        value: 1,
                        datetimeUtc: 1,
                        parameter: 1
                    }},
                { $addFields: { dateOnly: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeUtc" } } } },
                { $group: {
                        _id: "$dateOnly",
                        average_value: { $avg: "$value" },
                        max_value: { $max: "$value" },
                        count: { $sum: 1 }
                    }},
                { $sort: { _id: 1 } }
            ],
            weekly: [
                { $addFields: { value: { $toDouble: "$value" }, datetimeUtc: { $toDate: "$datetimeUtc" } } },
                { $match: {
                        parameter: pollutant,
                        location_name: city,
                        value: { $ne: null },
                        datetimeUtc: { $gte: start, $lte: end }
                    }},
                { $addFields: { dayOfWeek: { $isoDayOfWeek: "$datetimeUtc" } } },
                { $addFields: { weekStart: { $subtract: [
                                "$datetimeUtc",
                                { $multiply: [{ $subtract: ["$dayOfWeek", 1] }, 86400000] }
                            ]}} },
                { $addFields: { weekStartDate: {
                            $dateToString: { format: "%Y-%m-%d", date: "$weekStart" }
                        }}} ,
                { $group: {
                        _id: "$weekStartDate",
                        average_value: { $avg: "$value" },
                        max_value: { $max: "$value" }
                    }},
                { $sort: { "_id": 1 } }
            ],
            monthly: [
                { $addFields: { value: { $toDouble: "$value" }, datetimeUtc: { $toDate: "$datetimeUtc" } } },
                { $match: {
                        parameter: pollutant,
                        location_name: city,
                        value: { $ne: null },
                        datetimeUtc: { $gte: start, $lte: end }
                    }},
                { $addFields: { monthYear: { $dateToString: { format: "%Y-%m", date: "$datetimeUtc" } } } },
                { $group: {
                        _id: "$monthYear",
                        average_value: { $avg: "$value" },
                        max_value: { $max: "$value" }
                    }},
                { $sort: { _id: 1 } }
            ],
            yearly: [
                { $addFields: { value: { $toDouble: "$value" }, datetimeUtc: { $toDate: "$datetimeUtc" } } },
                { $match: {
                        parameter: pollutant,
                        location_name: city,
                        value: { $ne: null },
                        datetimeUtc: { $gte: start, $lte: end }
                    }},
                { $addFields: { year: { $dateToString: { format: "%Y", date: "$datetimeUtc" } } } },
                { $group: {
                        _id: "$year",
                        average_value: { $avg: "$value" },
                        max_value: { $max: "$value" }
                    }},
                { $sort: { _id: 1 } }
            ],
            hourly: [
                { $addFields: { value: { $toDouble: "$value" }, datetimeUtc: { $toDate: "$datetimeUtc" } } },
                { $match: {
                        parameter: pollutant,
                        location_name: city,
                        value: { $ne: null },
                        datetimeUtc: { $gte: start, $lte: end }
                    }},
                { $project: {
                        value: 1,
                        datetimeUtc: 1,
                        parameter: 1
                    }},
                { $addFields: { hourOnly: { $dateToString: { format: "%Y-%m-%d %H", date: "$datetimeUtc" } } } },
                { $group: {
                        _id: "$hourOnly",
                        average_value: { $avg: "$value" },
                        max_value: { $max: "$value" }
                    }},
                { $sort: { _id: 1 } }
            ]
        };

        if (!granularities[normalizedGranularity]) {
            return res.status(400).json({
                error: `Granularità '${normalizedGranularity}' non supportata. Usa una tra: daily, weekly, monthly, yearly, hourly.`
            });
        }

        console.info(`Trend request - pollutant: ${pollutant}, start: ${start}, end: ${end}, granularity: ${normalizedGranularity}, city: ${city}`);

        const pipeline = granularities[normalizedGranularity];
        const results = await Measurement.aggregate(pipeline).exec();

        if (results.length === 0) {
            return res.status(200).json({
                message: 'Nessun dato trovato per i parametri forniti.',
                data: []
            });
        }

        res.status(200).json(results.map(result => ({
            _id: result._id,
            average_value: result.average_value,
            max_value: result.max_value !== undefined ? result.max_value : null
        })));
    } catch (error) {
        console.error("Errore durante l'esecuzione della pipeline:", error);
        res.status(500).json({ error: 'Errore durante l\'esecuzione della pipeline.' });
    }
});


router.get('/:pollutant/measurements', async (req, res) => {
    try {
        const pollutant = req.params.pollutant;
        const { startDate, endDate, city } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date ed end date sono obbligatori' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Le date fornite non sono valide' });
        }

        const matchFilter = {
            parameter: pollutant,
            value: { $ne: null },
            datetimeUtc: { $gte: start, $lte: end }
        };

        if (city) {
            matchFilter.location_name = city;
        }

        const baseQuery = [
            { $match: matchFilter },
            {
                $project: {
                    datetimeUtc: 1,
                    value: { $toDouble: "$value" }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeUtc" } },
                    max_value: { $max: "$value" }
                }
            },
            { $sort: { "_id": 1 } }
        ];

        const results = await Measurement.aggregate(baseQuery).exec();

        const formattedResults = results.map(result => ({
            date: result._id,
            max_value: parseFloat(result.max_value.toFixed(2))
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error("Errore durante l'esecuzione della pipeline:", error);
        res.status(500).json({ error: 'Errore durante l\'esecuzione della pipeline' });
    }
});


const thresholdsDaily = {
    'pm25': 15,
    'pm10': 45
};

router.get('/:pollutant/anomalies', async (req, res) => {
    try {
        const pollutant = req.params.pollutant;
        const { startDate, endDate, city } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: "Parametri 'startDate' e 'endDate' sono richiesti."
            });
        }

        const threshold = thresholdsDaily[pollutant];
        if (!threshold) {
            return res.status(400).json({
                error: `Inquinante '${pollutant}' non supportato. Supportati: ${Object.keys(thresholdsDaily).join(', ')}.`
            });
        }

        console.log(`Threshold usata per ${pollutant}: ${threshold}`);
        console.log(`Filtrato per: ${pollutant}, da ${startDate} a ${endDate}`);

        const matchFilter = {
            parameter: pollutant,
            datetimeUtc: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (city) {
            matchFilter.location_name = city;
        }

        const anomalies = await Measurement.aggregate([
            { $match: matchFilter },
            {
                $addFields: {
                    numericValue: { $toDouble: "$value" },
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$datetimeUtc" } }
                }
            },
            {
                $match: {
                    numericValue: { $gt: threshold }
                }
            },
            {
                $group: {
                    _id: "$date",
                    anomalies: {
                        $push: {
                            value: "$numericValue",
                            datetimeUtc: "$datetimeUtc",
                            location_name: "$location_name"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    anomalies: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        console.log(`Anomalie trovate: ${anomalies.length}`);
        res.status(200).json(anomalies);
    } catch (error) {
        console.error("Errore durante il filtro delle anomalie:", error);
        res.status(500).json({ error: "Errore durante il filtro delle anomalie." });
    }
});

const aqiBreakpoints = {
    pm25: [
        { low: 0, high: 9, aqiLow: 0, aqiHigh: 50 },
        { low: 9.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
        { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
        { low: 55.5, high: 125.4, aqiLow: 151, aqiHigh: 200 },
        { low: 125.5, high: 225.4, aqiLow: 201, aqiHigh: 300 },
        { low: 225.5, high: 500.4, aqiLow: 301, aqiHigh: 500 }
    ],
    pm10: [
        { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
        { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
        { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
        { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
        { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
        { low: 425, high: 604, aqiLow: 301, aqiHigh: 500 }
    ],
    no2: [
        { low: 0, high: 53, aqiLow: 0, aqiHigh: 50 },
        { low: 54, high: 100, aqiLow: 51, aqiHigh: 100 },
        { low: 101, high: 360, aqiLow: 101, aqiHigh: 150 },
        { low: 361, high: 649, aqiLow: 151, aqiHigh: 200 },
        { low: 650, high: 1249, aqiLow: 201, aqiHigh: 300 },
        { low: 1250, high: 2049, aqiLow: 301, aqiHigh: 500 }
    ],
    o3: [
        { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
        { low: 55, high: 104, aqiLow: 51, aqiHigh: 100 },
        { low: 105, high: 204, aqiLow: 101, aqiHigh: 150 },
        { low: 205, high: 404, aqiLow: 151, aqiHigh: 200 },
        { low: 405, high: 604, aqiLow: 201, aqiHigh: 300 },
        { low: 605, high: 804, aqiLow: 301, aqiHigh: 500 }
    ]
};

function calculateAQI(value, breakpoints) {
    for (let i = 0; i < breakpoints.length; i++) {
        const { low, high, aqiLow, aqiHigh } = breakpoints[i];
        if (value >= low && value <= high) {
            return ((aqiHigh - aqiLow) / (high - low)) * (value - low) + aqiLow;
        }
    }
    return null;
}

router.get('/aqi', async (req, res) => {
    try {
        const { startDate, endDate, city } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date ed end date sono obbligatori' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Le date fornite non sono valide' });
        }

        if (!city) {
            return res.status(400).json({ error: 'La città è obbligatoria' });
        }

        const measurements = await Measurement.find({
            datetimeUtc: { $gte: start, $lte: end },
            parameter: { $in: Object.keys(aqiBreakpoints) },
            location_name: city
        }).exec();

        const aqiData = measurements.map(measurement => {
            const { parameter, value, datetimeUtc } = measurement;
            const aqi = calculateAQI(value, aqiBreakpoints[parameter]);
            return {
                parameter,
                value,
                datetimeUtc,
                aqi
            };
        });

        const groupedData = aqiData.reduce((acc, data) => {
            const day = data.datetimeUtc.toISOString().split('T')[0];
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(data);
            return acc;
        }, {});

        const dailyAQI = Object.keys(groupedData).map(day => {
            const dailyData = groupedData[day];
            const maxAqi = Math.max(...dailyData.map(data => data.aqi || 0));
            return {
                date: day,
                overallAQI: maxAqi,
            };
        });

        res.status(200).json({ aqiData: dailyAQI });

    } catch (error) {
        console.error('Errore durante il calcolo dell\'AQI:', error);
        res.status(500).json({ error: 'Errore durante il calcolo dell\'AQI.' });
    }
});

module.exports = router;

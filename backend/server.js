const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const measurementsRoutes = require('./routes/measurements');

const app = express();
const PORT = 5000;

connectDB();

app.use(express.json());

app.use(cors());

app.use('/api/measurements', measurementsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

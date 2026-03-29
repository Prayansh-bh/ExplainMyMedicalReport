import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import analyzeRoute from './routes/analyze.js';
import paymentRoute from './routes/payment.js';
import contactRoute from './routes/contact.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('ExplainMyMedicalReport API is up and running! 🚀');
});

app.use('/api/analyze', analyzeRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/contact', contactRoute);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Server Error:", err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

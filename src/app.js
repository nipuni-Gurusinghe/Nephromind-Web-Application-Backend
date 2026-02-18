
const express = require('express');
const cors = require('cors');
const { firebaseAdmin } = require('./config'); 
const mainRouter = require('./routes'); 

const app = express();
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); 
app.use(express.json({ limit: '10kb' })); 
app.use('/api', mainRouter);
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'NephroMind Admin Backend is operational.' });
});
module.exports = app;
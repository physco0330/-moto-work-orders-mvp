const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://benevolent-salamander-423f7a.netlify.app'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'API en funcionamiento' });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

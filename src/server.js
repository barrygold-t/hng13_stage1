const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/strings', routes);

// root health
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'string-analyzer' });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = app;

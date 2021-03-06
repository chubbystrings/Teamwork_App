const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/users');
const articleRoutes = require('./routes/article');
const gifRoutes = require('./routes/gif');
const feedRoutes = require('./routes/feed');


app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization header');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/gifs', gifRoutes);
app.use('/api/v1/feed', feedRoutes);


module.exports = app;

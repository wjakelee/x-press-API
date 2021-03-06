const bodyParser = require('body-parser');
const express = require('express');
const errorhandler = require('errorhandler');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

const apiRouter = require('./api/api');         //import api router from api directory

const app = express();                    //instance of express module
const PORT = process.env.PORT || 4000;    //specifices port number

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/api', apiRouter);        //all routes that start with /api will be sent to apiRouter

app.use(errorHandler());

app.listen(PORT, () => {                    //opens PORT
  console.log(`listening on PORT ${PORT}`);
})

module.exports = app;                       //export app
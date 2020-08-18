const express = require('express');
const apiRouter = express.Router()    //instance of an express router
const artistRouter = require('./artists.js');  //import artists router

apiRouter.use('/artists', artistRouter);        //all routes that start with /artists will be sent to artistRouter


module.exports = apiRouter;           //export router
const express = require('express');
const apiRouter = express.Router()    //instance of an express router
const artistRouter = require('./artists.js');  //import artists router
const seriesRouter = require('./series.js');  //import artists router

apiRouter.use('/artists', artistRouter);        //all routes that have endpoint /artists will be sent to artistRouter

apiRouter.use('/series', seriesRouter);        //all routes that have endpoint /series will be sent to seriesRouter


module.exports = apiRouter;           //export api router
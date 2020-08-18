const express = require('express');
const seriesRouter = express.Router();   //create series express router
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

/*for any route that has a /:seriesId parameter, this handler will be executed first
to make sure the seriesId exists in the database and add it to the requested object*/
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get('SELECT * FROM Series WHERE id = $seriesId', { $seriesID: seriesId },
    (error, series) => {
      if (error){
        next(error);
      } else if (series) {
        req.series = series;           //add requested series to requested object
        next();
      } else {
        res.sendStatus(404);        //bad request (series does not exist)
      }
    }
  );
});


//GET handler retrieves all series currently in the Series database
seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (error, rows) => {
    if (error){
      next(error);
    } else {
      res.status(200).json({ series: rows });       //send all series as json
    }
  })
});


module.exports = seriesRouter;     //export series router
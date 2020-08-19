const express = require('express');
const seriesRouter = express.Router();   //create series express router

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const issuesRouter = require('./issues.js');    //import issues router


/*for any route that has a /:seriesId parameter, this handler will be executed first
to make sure the seriesId exists in the database and add it to the requested object*/
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get('SELECT * FROM Series WHERE id = $seriesId', { $seriesId: seriesId },
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


//all routes that have endpoint /series/:seriesId/issues will be sent to issuesRouter
seriesRouter.use('/:seriesId/issues', issuesRouter);


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


//GET handler used to retrieve specifc series data from the Series database using seriesId
seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({ series: req.series });
});


//POST handler adds a series to the Series database if all required parameters exist
seriesRouter.post('/', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description){
    return res.sendStatus(400);               // bad request (incorrect parameters)
  }

  //insert new series into database
  db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`,
            {
              $name: name,
              $description: description
            },
            function(error) {
              if (error){
                next(error);
              } else {
                db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`,    //retrieve last added series
                  (error, series) => {    
                    if (error){
                      next(error);
                    }
                    res.status(201).json({ series: series });       //send last added series repsonse
                  })
              }
            }
    );
});


//PUT handler updates series info in the Series database
seriesRouter.put('/:seriesId', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description){
    return res.sendStatus(400);               // bad request (incorrect parameters)
  }

  //update series info in database
  db.run(`UPDATE Series SET name = $name, description = $description WHERE id = $seriesId`,
            {
              $name: name,
              $description: description,
              $seriesId: req.params.seriesId
            },
            function(error) {
              if (error){
                next(error);
              } else {
                db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`,    //retrieve last added series
                  (error, series) => {    
                    if (error){
                      next(error);
                    }
                    res.status(200).json({ series: series });       //send last added series repsonse
                  })
              }
            }
    );
});




module.exports = seriesRouter;     //export series router
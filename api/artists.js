const express = require('express');
const artistsRouter = express.Router();    //create artists express router
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

/*for any route that has an /:artistId parameter, this path will be executed first
to make sure the artistId exists in the database*/
artistsRouter.param('artistId', (req, res, next, aritstId) => {
  db.get('SELECT * FROM Artist WHERE id = $artistId', { $artistId = aritstId },
    (error, artist) => {
      if (error){
        next(error);                  //passes error to errorhandler middleware
      } else if (artist){
        req.artist = artist;          //attach found artist to request object
        next();
      } else {
        res.sendStatus(404);          //artist not found
      }
    });
});

//GET route used to retrieve all currently employed artist data from the Artist database
artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE is_currently_employed = 1',
    (error, rows) => {
      if (error){
        next(error);                  //passes error to errorhandler middleware
      } else {
      res.status(200).json({ artists: rows });      //send found artists as json
    }
  });
});



module.exports = artistsRouter;       //export artists Router
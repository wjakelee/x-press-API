const express = require('express');
const artistsRouter = express.Router();    //create artists express router
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

/*for any route that has an /:artistId parameter, this handler will be executed first
to make sure the artistId exists in the database*/
artistsRouter.param('artistId', (req, res, next, aritstId) => {
  db.get('SELECT * FROM Artist WHERE id = $artistId', { $artistId: aritstId },
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

//GET handler used to retrieve all currently employed artist data from the Artist database
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

//GET handler used to retrieve specifc artist data from the Artist database using aristId
artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({ artist: req.artist });
});

//POST handler adds an artist to the Artist database if all required parameters exist
artistsRouter.post('/', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography){
    return res.sendStatus(400);               // bad request (incorrect parameters)
  }
  
  //insert new artist into database
  db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
            VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`,
            {
              $name: name,
              $dateOfBirth: dateOfBirth,
              $biography: biography,
              $isCurrentlyEmployed: isCurrentlyEmployed
            },
            function(error) {
              if (error){
                next(error);
              } else {
                db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (error, artist) => {     //retrieve last added artist
                  if (error){
                    next(error);
                  }
                  res.status(201).json({ artist: artist });       //send last added artist with repsonse
                })
              }
            }
    );
});






module.exports = artistsRouter;       //export artists Router
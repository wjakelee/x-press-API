const express = require('express');
const artistsRouter = express.Router();    //create artists express router
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, rows) => {
    if (error){
      next(error);
    } else {
    res.status(200).json({ artists: rows });
    }
  })
})



module.exports = artistsRouter;
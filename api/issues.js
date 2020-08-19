const express = require('express');
const issuesRouter = express.Router({mergeParams: true});    //instance of an express router merges params with series router

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


//parameter handler to check if requested issue exists
issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get('SELECT * FROM Issue WHERE id = $issueId', { $issueId: issueId },
    (error, issue) => {
      if (error){
        next(error);
      } else if (issue) {
        next();
      } else {
        res.sendStatus(404);        //bad request (issue does not exist)
      }
    }
  );
})


//GET handler retrieves all issues existing in the specified series from the issues database
issuesRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
  const values = {$seriesId: req.params.seriesId};
  db.all(sql, values, (error, issues) => {
    if (error){
      next(error);
    } else {
      res.status(200).json({ issues: issues });       //send all issues as json
    }
  })
});


//POST handler adds a issue to the Issues database if all required parameters exist
issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;

  db.run('SELECT * FROM Artist WHERE id = $artistId', { $artistId: artistId },    //retrieves artist information using req artistId
    (error, artist) => {
      if (error){
        next(error);
      } else {
        if (!name || !issueNumber || !publicationDate || !artist) {
          return res.sendStatus(400);                                   // bad request (incorrect parameters)
        }
        
        db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)
                VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`,
                {
                  $name: name,
                  $issueNumber: issueNumber,
                  $publicationDate: publicationDate,
                  $artistId: artistId,
                  $seriesId: req.params.seriesId
                },
                function(error){
                  if (error){
                    next(error);
                  } else {
                    db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`,
                    (error, issue) => {
                      res.status(201).json({ issue: issue })
                    })
                  }
                }
          )

      }
    }
  );
});
  


issuesRouter.put('/:issueId', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;

  if (!name || !issueNumber || !publicationDate || !artistId) {
    return res.sendStatus(400);                                   // bad request (incorrect parameters)
  }

  db.run('SELECT * FROM Artist WHERE id = $artistId', { $artistId: artistId },    //retrieves artist information using req artistId
    (error, artist) => {
      if (error){
        next(error);
      } else {
        if (!artist) {
          return res.sendStatus(400);                                   // bad request (incorrect parameters)
        }

        db.run(`UPDATE Issue SET name = $name, issue_number= $issue_number, publication_date = $publication_date,
                artist_id = $artist_id, series_id = $series_id WHERE issueId = $issueId`,
                {
                  $name: name,
                  $issueNumber: issueNumber,
                  $publicationDate: publicationDate,
                  $artistId: artistId,
                  $seriesId: req.params.seriesId,
                  $issueId: req.params.issueId
                },
                function(error){
                  if (error){
                    next(error);
                  } else {
                    db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`,
                    (error, issue) => {
                      res.status(200).json({ issue: issue })
                    })
                  }
                }
          );

      }
    }
  );
});



module.exports = issuesRouter;      //export issues router
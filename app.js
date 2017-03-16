var express = require('express');
var mysql = require('./dbcon.js');


var app = express();
var handlebars = require('express-handlebars').create({
    default: 'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
//Allows me to use stylesheets in handlebars.
app.use(express.static('public'));



/************************************************************/
/*                   INSERTS INTO Workout Table             */
/*                                                          */
/* Inserts Into all the parameters needed to add workouts   */
/* name, reps, weight, date, lbs,                           */
/************************************************************/
app.get('/', function (req, res) {

    var context = {};
    context.sentData = req.query;


   //QUERY TO INSERT INTO WORKOUT TABLE
   if(context.sentData.name && context.sentData.reps && context.sentData.weight && context.sentData.date && context.sentData.lbs){
        mysql.pool.query("insert into workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?,?,?,?,?)", [context.sentData.name, context.sentData.reps, context.sentData.weight, context.sentData.date, context.sentData.lbs],function(err, result){
      if(err){
        console.log("error:" + err);
        next(err);
        return;
      }
    });
  }

  //DISPLAYS THE TABLE DATA IS PASSED AS AN ARRAY
  mysql.pool.query('Select id, name, reps, weight, date, lbs from workouts',function(err, rows, fields){
       if(err){
           next(err);
           console.log("error:" + err);
           return;
       }

        context.results = JSON.stringify(rows);

        var workouts = [];

        for (var i = 0, len = rows.length; i < len; i++) {

            workouts.push(rows[i]);

        }
        
        context.results = workouts;
      
        res.render('home', context);

      
      });
    

});


/************************************************************/
/*                   Deletes Row Clicked                    */
/*                                                          */
/* Each Row has a delete button if pressed it deletes the   */
/* Row from the user's view and the database                */
/************************************************************/
app.get('/delete', function (req, res) {
    
    var context = {};
    context.sentData = req.query;
    
    console.log("ID :" + req.query);
    console.log("Hey :" + context.sentData);    
    if(context.sentData.id){
        mysql.pool.query("delete from workouts where id = ?", [context.sentData.id],function(err, result){
      if(err){
        console.log("error:" + err);
        next(err);
        return;
      }
            
    });
  }

    mysql.pool.query('Select id, name, reps, weight, date, lbs from workouts',function(err, rows, fields){
       if(err){
           next(err);
           console.log("error:" + err);
           return;
       }

        context.results = JSON.stringify(rows);

        var workouts = [];

        for (var i = 0, len = rows.length; i < len; i++) {

            workouts.push(rows[i]);

        }
        
        context.results = workouts;
      
        res.render('home', context);

      
      });
    
});


/************************************************************/
/*           Sets the Values to Default in form             */
/*                                                          */
/* Each Input label carries the value from the last inserted*/
/* Row and passed on to the update form as a default value  */
/************************************************************/

app.get('/updateForm', function(req, res, next) {
    var context = {};
    mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.query.id], function(err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;

        console.log("Current update object: " + JSON.stringify(context.results));
        res.render('edit', context);
    });
});

/************************************************************/
/*      Calls the UPDATE QUERY with updated form values     */
/*                                                          */
/* Passes the new form values to the update query any input */
/* that are not updated will pass the default value it holds*/
/************************************************************/
app.get('/update', function(req, res, next) {
    
    var context = {};
    context.sentData = req.query;
    
    console.log("NRAHHHHH: " + context.sentData.name);
    
            console.log("HERE");

        
    
    mysql.pool.query('UPDATE workouts SET name=?, reps=?, weight=?, lbs=? WHERE id=?', [context.sentData.name, context.sentData.reps, context.sentData.weight, context.sentData.lbs, context.sentData.id],
                function(err, result) {
        
                    if (err) {
                        console.log("error:" + err);
                        return;
                    }
            
                    res.redirect('/');

        });
     
});


//NOT FOUND
app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

//SERVER ERROR
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

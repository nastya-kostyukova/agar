/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/* global User */
/* global PointsOfCanvas  */

const Meals = require('../lib/Meals.js');
const canvasWidth = 1000;
const canvasHeight = 800;

module.exports = {
  register(req, res) {
    const userData = req.param('userData');
    User.create(userData)
    .then((created) => {
      req.session.userId = created.id;
      res.cookie('userId', created.id);
      res.json(created);
    })
  },

  login (req, res) {
    User.find({
      nickname: req.param('nickname'),
      password: req.param('password'),
    })
    .then((result) => {
      if (result && result.length) {
        req.session.userId = result[0].id;
        res.cookie('userId', result[0].id);
        return res.json({
          status: 'ok',
          userName: result[0].nickname,
        })
      }

      return res.json({
        status: 'error',
      });

    })
  },

	sometest(req, res) {
     const userId = req.param('id');

     User.find({id: userId})
     .then((user) => {
       return res.json({
         data: user,
         message: 'hello',
         smth: User.getSomething()
       });
     })
  },

  /*get data from one user*/
  ws(req, res) {
    if (req.param("occupation") == "loading") {
      this.wsLoadingInitialDots();
    } else {
      console.log(req.cookies);
      const userId = req.cookies.userId;
      const x = req.param('x');
      const y = req.param('y');
      const radius = req.param('radius');

      console.log(`userId: ${userId}`);
      var test = 'asdasd';
      var occupation = req.param('occupation');

      User.update({id: userId}, {x, y, radius}).exec(function afterwards(err, updated) {

        if (err) {
          sails.log("server error");
          return;
        }

        console.log('Updated user to have name ' + updated[0].id);
      });

      console.log(occupation, 'x ' + req.param('x') + ' y ' + req.param('y') + ' radius ' + req.param('radius'));

      this.wsblast(req, res);
    }
  },

  /*send data */
  wsblast(req, res) {
    const countOfUsers = 1;
    const x = req.param('x');
    const y = req.param('y');
    const radius = req.param('radius');

    var i = 0;
    var j = 0;
    var points = [];
    var removingPoints = [];

    PointsOfCanvas.find()
      .then(function (points) {
       // var msg = "";

       // console.log('Length before delete '+ points.length);

        //check if user eat some points
        while (i < points.length) {
          if (Math.pow((x - points[i].x), 2) + Math.pow((y - points[i].y), 2) <= Math.pow(radius, 2)) {
            PointsOfCanvas.destroy({x: points[i].x, y: points[i].y}).exec(function (err) {
              if (err) {
      //          sails.log("Can't eat meal");
              }
       //       sails.log("Meal is eaten.");
            });
            /*remove point, but circle is of these points*/
            removingPoints.push(points[i]);
            points.splice(i, 1);
          } else {
            i++;
       //     console.log("Meal is't eaten");
          }
        }
       // console.log('Length after delete '+ points.length);
        var newPoints = [];
        if (!removingPoints.length) {

          i = 0;
          //generate new points if this is necessary
          while (countOfUsers * 35 > points.length) {
            //  msg = "create new points";
            // console.log('!!Length after delete '+ points.length);

            var point = Meals.generateMeal(canvasWidth, canvasHeight);
            newPoints[i] = point;
            points[i + points.length] = point;
            PointsOfCanvas.create({x: point['x'], y: point['y']}).exec(function createCB(err, created) {
              //  console.log('Created point ' + created.x, + ' ' + created.y);
            });
            i++;
          }
        }
        //if (!msg) newPoints = points;
        sails.sockets.blast('move_of_user', {newPoints: newPoints, removePoints: removingPoints});
      })
  },

  wsLoadingInitialDots(req, res) {
    const countOfUsers = 1;
    var points = [];
    var i = 0;
    var msg = "";

    PointsOfCanvas.find()
      .then(function (points) {
        //loading points from db
        while (countOfUsers * 100 > points.length) {
          msg = "create new points";
          var point = Meals.generateMeal(canvasWidth, canvasHeight);
          points[i] = point;
          PointsOfCanvas.create( {x : point['x'], y : point['y']}).exec(function createCB(err, created){
            //console.log('Created point ' + created.x, + ' ' + created.y);
          });
          i++;
        }

        sails.sockets.blast('load', { msg, points: points});
      })

  }
};


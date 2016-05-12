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

var users = [];
var meals = [];
module.exports = {
  register(req, res) {
    const userData = req.param('userData');
    var user = {
      id : 0,
      x: 50,
      y:50,
      radius: 20,
    };

    var meal = {
      x : 0,
      y: 0,
    };

    var i;
    if (!users) {
      id = 0;
    } else id = users[users.length-1].id + 1;
    user.id = id;
    req.session.userId = id;
    res.cookie('userId', id)
    res.json(user);

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

        users.push(result[0]);

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

  /*get data from one user*/
  ws(req, res) {
    if (req.param("occupation") == "loading") {
      this.wsLoadingInitialDots();
    } else {
      //console.log(req.cookies);
      const userId = req.cookies.userId;
      const x = req.param('x');
      const y = req.param('y');
      const radius = req.param('radius');

      //console.log(`userId: ${userId}`);
      var test = 'asdasd';
      var occupation = req.param('occupation');

      User.update({id: userId}, {x, y, radius})
        .exec((err, updated) => {

          if (err) {
            sails.log("server error");
            return;
          }

          this.wsblast(req, res);
        //console.log('Updated user to have name ' + updated[0].id);
      });

      //console.log(occupation, 'x ' + req.param('x') + ' y ' + req.param('y') + ' radius ' + req.param('radius'));

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
    var removingPoints = [];

      while (i < meals.length) {
        if (Math.pow((x - meals[i].x), 2) + Math.pow((y - meals[i].y), 2) <= Math.pow(radius, 2)) {
          return PointsOfCanvas.destroy({x: meals[i].x, y: meals[i].y}).exec(function (err) {
            if (err) {
              sails.log("Can't eat meal");
              return;
            }
            return sails.sockets.blast('move_of_user', {points: meals});
          });

          removingPoints.push(meals[i]);
          meals.splice(i, 1);
        } else {
          i++;
        }
      }

        var newPoints = [];
        if (!removingPoints.length) {

          i = 0;
          //generate new points if this is necessary
          while (countOfUsers * 35 > meals.length) {
            var point = Meals.generateMeal(canvasWidth, canvasHeight);
            newPoints[i] = point;
            meals[i + meals.length] = point;
            i++;
          }
        }
  },

  wsLoadingInitialDots(req, res) {
    const countOfUsers = 1;
    var i = 0;
    var msg = "";

        while (countOfUsers * 100 > meals.length) {
          msg = "create new points";
          var point = Meals.generateMeal(canvasWidth, canvasHeight);
          meals[i] = point;
          i++;
        }

        sails.sockets.blast('load', { msg, points: meals});
  },

};


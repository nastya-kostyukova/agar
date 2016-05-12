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
var userIndex = {};
module.exports = {
  register(req, res) {
    const userData = req.param('userData');
    var user = {
      id : 0,
      x: 50,
      y:50,
      score: 20,
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

      const userId = req.cookies.userId;
      const x = req.param('x');
      const y = req.param('y');
      const score = req.param('score');

      var occupation = req.param('occupation');
      var self = this;
      users.forEach(function(user, i) {
        if (user.id == userId) {
          userIndex = i;
          user.x = x;
          user.y = y;
          user.score = score;

          self.wsblast(req, res);
        }
      })

    }
  },

  /*send data */
  wsblast(req, res) {
    const countOfUsers = 1;
    const x = req.param('x');
    const y = req.param('y');
    const score = req.param('score');
    const radius = score / 100;

    var i = 0;
    var j = 0;
    var removingPoints = [];
    var newPoints = [];


    while (i < meals.length) {

      if (Math.pow((x - meals[i].x), 2) + Math.pow((y - meals[i].y), 2) <= Math.pow(radius, 2)) {
        removingPoints.push(meals[i]);
        meals.splice(i, 1);
        score++;
        users[userIndex].score = score;
        return sails.sockets.blast('move_of_user', {newPoints, removingPoints, score});

      } else {
        i++;
      }
    }

    var newPoints = [];
    i = 0;
    if (!removingPoints.length) {
      //generate new points if this is necessary
      while (countOfUsers * 35 > meals.length) {
        var point = Meals.generateMeal(canvasWidth, canvasHeight);
        newPoints[i] = point;
        meals[i + meals.length] = point;
        i++;
        return sails.sockets.blast('move_of_user', {newPoints: newPoints, removingPoints: removingPoints});
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


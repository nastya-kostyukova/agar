
io.sails.url = '/';

var mainCanvas = $("#mainCanvas");
var mealCanvas = $("#mealCanvas");
var meals;

$( document ).ready(function() {
  io.socket.put('/api/ws', { occupation: 'loading', x: 0, y: 0, radius: 50 }, function (resData, jwr) {
    //console.log(resData.test); // => 200
  });
  io.socket.on('load', function onServerSentEvent (msg) {
    drawDots(msg.points);
  });
});

$('#register').submit(function(event) {
  event.preventDefault();
  $.ajax({
    url : "/user/login",
    method: 'POST',
    data: {
      nickname: $(this).find('#name').val(),
      password: $(this).find('#password').val()
    },
    success: function(response) {
      console.log('Login result:', response);
      if (response.status === 'ok') {
        localStorage.setItem('login', response.userName);
        window.location.href = '/game';
      }
    },
    error: function(error) {
      console.log('Error:' + error);
    }
  })
});

mealCanvas.drawRect({
  layer: true,
  fillStyle: '#f5f5f5',
  x: 300, y: 200,
  width: 2000, height: 1800,
});

var circle = mainCanvas.drawArc({
  draggable: true,
  fillStyle: "green",
  x: 100, y: 100,
  radius: 50,
  name: 'myDot'
});

var timer = -1;


function moveToXY(x, y) {
  if (timer > 0) {
    clearInterval(timer);
    timer = -1;
  }
  var fps = 1000 // 50 кадров в секунду
  var canvas = document.getElementById('mainCanvas');
  var myDot = mainCanvas.getLayer('myDot');
  var dist = Math.sqrt((Math.pow(x- myDot.x, 2)) + Math.pow(y- myDot.y, 2));
  var stepX = (x- myDot.x) / dist;
  var stepY = (y- myDot.y) / dist;
  var radius = myDot.radius;

  timer = setInterval(function() {
    var myDot = mainCanvas.getLayer('myDot');
    var newDist = Math.sqrt((Math.pow(x - myDot.x, 2)) + Math.pow(y - myDot.y, 2));
    if (newDist < 2) {
      clearInterval(timer);
      dist = 0;
      stepX = 0;
      stepY = 0;
    } else {

      io.socket.put('/api/ws', { occupation: 'psychic', x: myDot.x, y: myDot.y, radius: 50 }, function (resData, jwr) {
        console.log(resData.test); // => 200
      });

      io.socket.on('move_of_user', function (msg) {
        drawDots(msg.newPoints);
        clearPoints(msg.removingPoints);

        //redrawMeals(msg.points);
        //radius += msg.removePoints.length /( radius * 2)
      });

      mainCanvas.setLayer('myDot', {
        x: '+='+stepX,
        y: '+='+stepY,
        radius: 50
      })
      .drawLayers();
    };
  }, 1000 / fps)
}

mainCanvas.click(function(event) {
  var x = event.offsetX;
  var y = event.offsetY;


  /* TO DO: По клику получаем список точек, кладем в переменную meals. В функции moveToXY проверяем попадаем ли на какую-нибудь точку и удаляем эту точку на клиенте из массива meals */
  /* При удалении вызвать io.socket.put с текущим массивом точек meals, он должен вызвать на бэкенде blast, который разошлет новый список точек */


  moveToXY(x, y);
});

var canvas = document.getElementById('mealCanvas');

function redrawMeals(meals) {
  if (!meals || !meals.length) return;

  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  mealCanvas.drawRect({
    layer: true,
    fillStyle: '#f5f5f5',
    x: 300, y: 200,
    width: 2000, height: 1800,
  });

  for(var i = 0; i < meals.length; i++) {
    context.beginPath();
    context.arc(meals[i].x, meals[i].y, 5, 0, 2 * Math.PI, false);
    context.fillStyle = meals[i].color;
    context.fill();
  }

}
function drawDots(points) {
  if (!points || !points.length) return;
  var context = canvas.getContext('2d');

  for(var i = 0; i < points.length; i++) {
    context.beginPath();
    context.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI, false);
    context.fillStyle = points[i].color;
    context.fill();
  }

}

function clearPoints(points){
  if (!points || !points.length) return;
  var context = canvas.getContext('2d');

  for(var i = 0; i < points.length; i++) {
    //console.log('clearPoints');
    context.beginPath();
    context.arc(points[i].x, points[i].y, 7, 0, 2 * Math.PI, false);
    context.fillStyle = '#f5f5f5';
    context.fill();
  }
}



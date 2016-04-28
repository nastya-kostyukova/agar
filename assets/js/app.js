
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

function detectCircle() {
  var myDot = mainCanvas.getLayer('myDot');
  console.log(myDot);
  return { x: myDot.x, y: myDot.y}
}

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

  timer = setInterval(function() {
    var myDot = mainCanvas.getLayer('myDot');
    var newDist = Math.sqrt((Math.pow(x - myDot.x, 2)) + Math.pow(y - myDot.y, 2));
    if (newDist < 2) {
      clearInterval(timer);
      dist = 0;
      stepX = 0;
      stepY = 0;
    } else {
      clearPoints(meals);
      mainCanvas.setLayer('myDot', {
        x: '+='+stepX,
        y: '+='+stepY
      })
      .drawLayers();
    };
  }, 1000 / fps)
}

mainCanvas.click(function(event) {
  var x = event.offsetX;
  var y = event.offsetY;

  io.socket.put('/api/ws', { occupation: 'psychic', x: x, y: y, radius: 50 }, function (resData, jwr) {
    console.log(resData.test); // => 200
  });

  /* TO DO: По клику получаем список точек, кладем в переменную meals. В функции moveToXY проверяем попадаем ли на какую-нибудь точку и удаляем эту точку на клиенте из массива meals */
  /* При удалении вызвать io.socket.put с текущим массивом точек meals, он должен вызвать на бэкенде blast, который разошлет новый список точек */

  io.socket.on('move_of_user', function onServerSentEvent (msg) {
    console.log(msg.msg);
    meals = msg.removingPints;
    //drawDots(msg.points);
    //clearPoints(msg.removingPints)
  });


  moveToXY(x, y);
});

var dot;
function drawDots(points) {
  points.forEach( function(element, index) {
    dot = mealCanvas.drawArc({
      draggable: false,
      name: 'meal'+element.x+element.y,
      fillStyle: getRandomColor(),
      x: element.x, y: element.y,
      radius: 5,
    });
  });
}

function clearPoints(points){
  points.forEach( function(element, index) {
    dot = mealCanvas.drawArc({
      draggable: false,
      name: 'meal'+element.x+element.y,
      fillStyle: '#f5f5f5',
      x: element.x, y: element.y,
      radius: 7,
    });
  });
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


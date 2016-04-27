
io.sails.url = '/';

var mainCanvas = $("#mainCanvas");
var mealCanvas = $("#mealCanvas");

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
  name: 'myDot',
  mouseover: function(layer) {
    $(this).animateLayer(layer, {
      fillStyle: '#c33'
    }, 500);
  },
  mouseout: function(layer) {
    $(this).animateLayer(layer, {
      fillStyle: '#fff'
    }, 500);
  }
});

mainCanvas.click(function(event) {
  var x = event.offsetX;
  var y = event.offsetY;

  io.socket.put('/api/ws', { occupation: 'psychic', x: x, y: y, radius: 50 }, function (resData, jwr) {
    console.log(resData.test); // => 200
  });

  mainCanvas.stopLayer('myDot');
  mainCanvas.animateLayer('myDot', {
      fillStyle: '#36b',
      rotate: 30,
      x: x,
      y: y
    }, 1000)
    .drawLayers()

  io.socket.on('move_of_user', function onServerSentEvent (msg) {
    console.log(msg.msg);
    drawDots(msg.points);
    clearPoints(msg.removingPints)
  });
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


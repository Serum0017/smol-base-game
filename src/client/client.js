let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);
ws.binaryType = "arraybuffer"

var players = {};
var enemies = {};
var obstacles = {};

// interpolation
let lastUpdate = {lastPlayers: {}, lastEnemies: {}, lastObstacles: {}};
let lastTime = Date.now();
let dt = 0;

let displayCoords = false;

var renderPosX = canvas.width/2;
var renderPosY = canvas.height/2;

let selfId = "";
let map = {width: canvas.width, height: canvas.height};

const tileSize = 50;

ws.addEventListener("message", function (data) {
    let message = msgpack.decode(new Uint8Array(data.data));
    // Recieving Messages from the server and updating the client side constructor correspondingly
    if (message.pi) {
      for (let i in message.pi) {
        players[message.pi[i].id] = new Player(message.pi[i]);
      }
    }
    if (message.pu) {
      lastUpdate.lastPlayers = players;
      for (let a in message.pu) {
        if (players[message.pu[a].id]) {
          players[message.pu[a].id].updatePack(message.pu[a]);
        }
      }
    }

    // Updating Enemies
    if (message.ei) {
      for (let i in message.ei) {
        enemies[message.ei[i].id] = new Enemy(message.ei[i]);
      }
    }
    if (message.eu) {
      lastUpdate.lastEnemies = enemies;
      for (let a in message.eu) {
        if (enemies[message.eu[a].id]) {
          enemies[message.eu[a].id].updatePack(message.eu[a]);
        }
      }
    }
    // Updating Obstacles
    if (message.oi) {
      for (let i in message.oi) {
        obstacles[message.oi[i].id] = new Obstacle(message.oi[i]);
      }
    }
    if (message.ou) {
      //lastUpdate.lastObstacles = obstacles;
      for (let a in message.ou) {
        if (obstacles[message.ou[a].id]) {
          obstacles[message.ou[a].id].updatePack(message.ou[a]);
        }
      }
    }
    if (message.er){
      enemies = {};
    }

    // Players leaving
    if (message.l) {
      delete players[message.l];
    }

    if (message.dimensions) {
      map.width = message.dimensions.width;
      map.height = message.dimensions.height;
    }

    // Player canvas resizing (caused by changing window size)
    if (message.si) {
      Resize();
      requestAnimationFrame(renderGame);
      selfId = message.si;
    }
    requestAnimationFrame(renderGame)
});
setInterval(() => requestAnimationFrame(renderGame), 1000/60);
/*
bgColor: '#1f2229',
tileColor: '#323645',
*/
let camera = {x: 0, y: 0};
function renderGame() {
  dt = Date.now() - lastTime;
  lastTime = Date.now();
  //bg
  ctx.fillStyle = "#1f2229";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#323645";
  let interpX = 0;
  let interpY = 0;
  for(let i in players){
    if(players[i].id == selfId){
      interpX = camera.x - interpolateObject(players[i],lastUpdate.lastPlayers[i],dt).x;
      interpY = camera.y - interpolateObject(players[i],lastUpdate.lastPlayers[i],dt).y;
    }
  }
  ctx.fillRect(offset({x:interpX,y:interpY}).x,offset({x:interpX,y:interpY}).y,map.width, map.height);

  // tiles
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;
  for(let x = 0; x <= canvas.width/tileSize+1; x++){
    ctx.beginPath();
    ctx.moveTo(x*tileSize+interpX-camera.x%tileSize-tileSize/4+2.5,0);
    ctx.lineTo(x*tileSize+interpX-camera.x%tileSize-tileSize/4+2.5,canvas.height);
    ctx.stroke();
    ctx.closePath();
  }
  for(let y = 0; y <= canvas.height/tileSize+1; y++){
    ctx.beginPath();
    ctx.moveTo(0,y*tileSize+interpY-camera.y%tileSize+tileSize/4-2.5);
    ctx.lineTo(canvas.width,y*tileSize+interpY-camera.y%tileSize+tileSize/4-2.5);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;

  for(let i in obstacles){
    let obstacle = obstacles[i];
    // interpolating between last player and the current player
    if(lastUpdate.lastObstacles[i]){
      obstacle = interpolateObject(obstacles[i],lastUpdate.lastObstacles[i],lastUpdate.lastObstacles);
    }
    ctx.beginPath();
    if(obstacle.type.includes('bounce')){
      ctx.fillStyle = 'green';
    } else if(obstacle.type.includes('lava')){
      ctx.fillStyle = 'red';
    } else if(obstacle.type.includes('safe')){
      ctx.fillStyle = 'grey';
      ctx.globalAlpha = 0.2;
    } else {
      ctx.fillStyle = '#1f2229';
    }
    if(obstacle.type.includes('rotate')){
      ctx.translate(offset(obstacle).x, offset(obstacle).y);
      ctx.rotate(obstacle.angle*Math.PI/180);
      ctx.fillRect(-obstacle.w / 2, -obstacle.h / 2, obstacle.w, obstacle.h);
      ctx.rotate(-obstacle.angle*Math.PI/180);
      ctx.translate(-offset(obstacle).x, -offset(obstacle).y);
    } else { 
      ctx.fillRect(offset(obstacle).x,offset(obstacle).y,obstacle.w,obstacle.h);
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
  }

  for (let e in enemies) {
    let enemy = enemies[e];
    // interpolating between last player and the current player
    if(lastUpdate.lastEnemies[e]){
      enemy = interpolateObject(enemies[e],lastUpdate.lastEnemies[e],dt);
    }
    ctx.beginPath();
    ctx.fillStyle = 'rgba(120,120,120,0.9)';
    ctx.arc(offset(enemy).x, offset(enemy).y, enemy.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  for (let i in players) {
    ctx.beginPath();
    if (players[i].id == selfId) {
      let player = players[i];
      if(lastUpdate.lastPlayers[i]){
        player = interpolateObject(players[i],lastUpdate.lastPlayers[i],dt);
      }
      if(players[i].d == true){
        ctx.textAlign = 'center';
        ctx.font = "28px Arial";
        ctx.fontWeight = "bold";
        ctx.fillStyle = 'white';
        ctx.fillText('Press r to respawn', canvas.width/2, canvas.height-50);
        ctx.fillStyle = "red";
      } else {
        ctx.fillStyle = 'black';
      }
      ctx.arc(canvas.width/2, canvas.height/2, 24.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      // camera tweening
      /*if(lastUpdate.lastPlayers[i]){
        camera.x = interpolateObject(players[i],lastUpdate.lastPlayers[i],dt).x;
        camera.y = interpolateObject(players[i],lastUpdate.lastPlayers[i],dt).y;
      } else {*/
        camera.x = player.x;
        camera.y = player.y;
      //}
    }
  }

  if(displayCoords){
    ctx.textAlign = 'center';
    ctx.font = "18px Arial";
    ctx.fontWeight = "bold";
    ctx.fillStyle = 'white';
    ctx.fillText('( '+ camera.x + ' ' + camera.y + ' )', canvas.width/2, canvas.height/2+48);
  }

  for (let i in players) {
    if (players[i].id != selfId) {
      let player = players[i];
      // interpolating between last player and the current player
      if(lastUpdate.lastPlayers[i]){
        player = interpolateObject(players[i],lastUpdate.lastPlayers[i],dt);
      }
      ctx.beginPath();
      // filling with a different color if player is dead
      if(players[i].d == true){
        ctx.fillStyle = "red";
      } else {
        ctx.fillStyle = 'black';
      }
      ctx.arc(offset(player).x, offset(player).y, 24.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }
}

function Resize() {
  let scale = window.innerWidth / canvas.width;
  if (window.innerHeight / canvas.height < window.innerWidth / canvas.width) {
    scale = window.innerHeight / canvas.height;
  }
  canvas.style.transform = "scale(" + scale + ")";
  canvas.style.left = 1 / 2 * (window.innerWidth - canvas.width) + "px";
  canvas.style.top = 1 / 2 * (window.innerHeight - canvas.height) + "px";
}
Resize();

window.addEventListener('resize', function () {
  Resize();
});

function getCursorPosition(canvas, event) {
	var rect = canvas.getBoundingClientRect(),
	  scaleX = canvas.width / rect.width,
	  scaleY = canvas.height / rect.height;
  
	mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
	mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
	ws.send(msgpack.encode({ mp: [mouseX, mouseY] }));
}
window.addEventListener('mousedown', function (e) {
  ws.send(msgpack.encode({ cs: true }));
})
window.addEventListener('mousemove', function (e) {
  getCursorPosition(canvas, e);
})

document.onkeydown = function (e) {
  ws.send(msgpack.encode({ kD: e.key.toLowerCase() }));
}

document.onkeyup = function (e) {
  if(e.key == 'u'){
    displayCoords = !displayCoords;
  } else {
    ws.send(msgpack.encode({ kU: e.key.toLowerCase() }));
  }
}

function offset(obj){
  return {x: obj.x - camera.x + canvas.width/2, y: obj.y - camera.y + canvas.height/2};
}

function interpolateObject(object1, object2, ratio) {
  if (!object2) {
    return object1;
  }

  const interpolated = {};
  Object.keys(object1).forEach(key => {
    interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
  });
  return interpolated;
}
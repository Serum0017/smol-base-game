let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);
ws.binaryType = "arraybuffer"

var players = {};
var enemies = {};

var renderPosX = canvas.width/2;
var renderPosY = canvas.height/2;

let selfId = "";

ws.addEventListener("message", function (data) {
    let message = msgpack.decode(new Uint8Array(data.data));
    // Recieving Messages from the server and updating the client side constructor correspondingly
    if (message.pi) {
      for (let i in message.pi) {
        players[message.pi[i].id] = new Player(message.pi[i]);
      }
    }
    if (message.pu) {
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
      for (let a in message.eu) {
        if (enemies[message.eu[a].id]) {
          enemies[message.eu[a].id].updatePack(message.eu[a]);
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

    // Player canvas resizing (caused by changing window size)
    if (message.si) {
      Resize();
      requestAnimationFrame(renderGame);
      selfId = message.si;
    }
    requestAnimationFrame(renderGame);
});
// homing, blue dasher, switcher, blue aura, slower red aura

let me = {x: 0, y: 0};
function renderGame() {
  //bg
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i in players) {
    const player = players[i];
    ctx.beginPath();
    if (players[i].id == selfId) {
      if(players[i].d == true){
        ctx.fillStyle = "#9e0d00";
      } else {
        ctx.fillStyle = '#1b37c2';
      }
      me.x = player.x;
      me.y = player.y;
      ctx.arc(canvas.width/2, canvas.height/2, 17.14, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = 'green';
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = 'black';
    }
  }

  for (let i in players) {
    const player = players[i];
    if (players[i].id != selfId) {
      ctx.beginPath();
      // filling with a different color if player is dead
      if(players[i].d == true){
        ctx.fillStyle = "#691d16";
      } else {
        ctx.fillStyle = '#2b3670';
      }
      ctx.arc(player.x-me.x+canvas.width/2, player.y-me.y+canvas.height/2, 17.14, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = 'green';
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = 'black';
    }
  }

  for (let e in enemies) {
    const enemy = enemies[e];
    ctx.beginPath();
    ctx.fillStyle = 'rgba(120,120,120,0.9)';
    ctx.arc(enemy.x-me.x+canvas.width/2, enemy.y-me.y+canvas.height/2, enemy.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.strokeRect(-me.x+canvas.width/2,-me.y+canvas.height/2,canvas.width, canvas.height);
  console.log(me.x + ' ' + me.y);
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
window.addEventListener('mousemove', function (e) {
  getCursorPosition(canvas, e);
})

function offset(obj){
  return {x: obj.x - me.x - canvas.width, y: obj.y - me.y - canvas.height};
}
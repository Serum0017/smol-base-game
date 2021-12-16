let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var HOST = location.origin.replace(/^http/, 'ws')
const ws = new WebSocket(HOST);
ws.binaryType = "arraybuffer"

var players = {};

var renderPosX = canvas.width/2;
var renderPosY = canvas.height/2;

let selfId = "";

ws.addEventListener("message", function (data) {
    let message = msgpack.decode(new Uint8Array(data.data));
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
    if (message.si) {
      Resize();
      requestAnimationFrame(renderGame);
      selfId = message.si;
    }
    requestAnimationFrame(renderGame);
});

function renderGame() {
  //bg
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (let i in players) {
    const player = players[i];
    //players[i].interp(delt);
    if (players[i].id == selfId) {
      ctx.fillStyle = '#1b37c2';
      ctx.arc(player.x, player.y, 17.14, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }

  for (let i in players) {
    const player = players[i];
    if (players[i].id != selfId) {
      ctx.beginPath();
      ctx.fillStyle = '#2b3670';
      ctx.arc(player.x, player.y, 17.14, 0, 2 * Math.PI);
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
window.addEventListener('mousemove', function (e) {
  getCursorPosition(canvas, e);
})
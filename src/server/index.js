const express = require('express');
const WebSocket = require('ws');
const uuid = require("uuid");
const path = require("path");
const msgpack = require("msgpack-lite");
const app = express();
const wss = new WebSocket.Server({ noServer: true });

app.use(express.static("src/client"));

let players = {};
let enemies = [];

const nano = function () {
	const hrtime = process.hrtime();
	return +hrtime[0] * 1e9 + +hrtime[1];
};
const ms = () => nano() * (1 / 1e9) * 1000;

app.get("/", function (req, res) {
	res.sendFile("index.html");
});
let id = 1;
let enemyId = 0;
let obstacleId = 0;

const { Player } = require("./player");
const { Enemy } = require("./enemy");
const { runCollision } = require('./physics.js');
let defaultMap = require("./maps/hub.js");
//let activeMaps = [];
let enemy = [];
let obstacle = [];

wss.on("connection", ws => {
	ws.binaryType = "arraybuffer"

	//Setting clientId to id
	const clientId = id;
  
	//Updating id for next player join
    id++;
    if(id > 9999){
        id = 0;
    }

	//Create new player
	const player = new Player(clientId, ws);
	players[clientId] = player;

	players[clientId].client.send(msgpack.encode({ si: clientId }));

	let playerInitPack = [];
	//Get all player init pack and push to player init array
	for (let i in players) {
		playerInitPack.push(players[i].getInitPack());
	}

	//Send player array to all players
	let newPlayerPack = [];
	newPlayerPack.push(players[clientId].getInitPack());

	for (let i in players) {
		//player init
		if (players[i].id != clientId) {
			players[i].client.send(msgpack.encode({ pi: newPlayerPack }));
		}
	}

	players[clientId].client.send(msgpack.encode({ pi: playerInitPack }));

	players[clientId].client.send(msgpack.encode({ ei: enemyInitPack }));

	players[clientId].client.send(msgpack.encode({ oi: packArea(defaultMap, 0) }));

	ws.on('close', () => {
		//Send all clients the id of the player leaving
		for (let i of Object.keys(players)) {
			players[i].client.send(msgpack.encode({ l: clientId }))
		}

		//Delete player from players list
		delete players[clientId];
	})

	ws.on('message', data => {
		let d = msgpack.decode(new Uint8Array(data));
		if (d.mp) {
			player.mousePos.x = d.mp[0];
			player.mousePos.y = d.mp[1];
		}
		if (d.cs) {
			if(player.inputType == 'mouse'){
				player.inputType = 'keyboard';
			} else {
				player.inputType = 'mouse';
			}
		}
		if (d.kD) {
			if(d.kD == 'w' || d.kD == 'arrowup'){
				player.inputs.up = true;
			}
			if(d.kD == 'a' || d.kD == 'arrowleft'){
				player.inputs.left = true;
			}
			if(d.kD == 'd' || d.kD == 'arrowright'){
				player.inputs.right = true;
			}
			if(d.kD == 's' || d.kD == 'arrowdown'){
				player.inputs.down = true;
			}
		}
		if (d.kU) {
			if(d.kU == 'w' || d.kU == 'arrowup'){
				player.inputs.up = false;
			}
			if(d.kU == 'a' || d.kU == 'arrowleft'){
				player.inputs.left = false;
			}
			if(d.kU == 'd' || d.kU == 'arrowright'){
				player.inputs.right = false;
			}
			if(d.kU == 's' || d.kU == 'arrowdown'){
				player.inputs.down = false;
			}
			if(d.kU == 'r'){
				player.dead = false;
				player.deadChanged = true;
				player.x = 25;// map spawn
				player.y = 25;
				player.xChanged = true;
				player.yChanged = true;
			}
		}
	})
})

//Connection to server:
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT);

server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, socket => {
		wss.emit('connection', socket, request);
	});
});

// simulate map is in physics

let lastTime = Date.now();
let playerPack = [];
let enemyInitPack = [];
let obstacleInitPack = [];
let timer = 10000;

//Get all player init pack and push to player init array
for (let i in players) {
	playerInitPack.push(players[i].getInitPack());
}

function mainLoop() {
	/*for(let i in players){
		for(let j in map.areas[area].obstacles){
			boundCircleRect(players[i], map.areas[area].obstacles[j]);// not done yet
		}
	}*/
	let time = Date.now();
	let delta = time - lastTime;
	lastTime = time;
		/*let newEnemy = new Enemy({ type: 'normal', radius: Math.random()*20+10, speed: Math.random()*10+5, id: enemyId });
		//Push to client
		enemies.push(newEnemy);
		enemyInitPack.push(newEnemy.getInitPack());
		for (let j in players){
			players[j].enemyInitPack.push(newEnemy.getInitPack());
		}
		enemyId++;*/

	// resetting enemies if there's no clients
	if(Object.keys(players).length == 0){
		enemies = [];
		enemyInitPack = [];
		timer = 0;
	}

    for (let i in players) {
		//Update player position
		players[i].move(delta);

		// Collision with enemies
		for (let e in enemies){
			if(Math.sqrt((enemies[e].x - players[i].x) ** 2 + (enemies[e].y - players[i].y) ** 2) < 24.5 /*Player's radius isn't supported*/ + enemies[e].radius){
				players[i].dead = true;
				players[i].deadChanged = true;
			}
		}

		// Players saving other dead players
		for (let e in players){
			if(players[e].id != players[i].id){
				if(Math.sqrt((players[e].x - players[i].x) ** 2 + (players[e].y - players[i].y) ** 2) < 24.5*2){
					players[i].dead = false;
					players[i].deadChanged = true;
				}
			}
		}
	}

	simulateArea(defaultMap, 0, delta);
	runCollision(players, defaultMap.areas[0].obstacles, {width: defaultMap.default.width, height: defaultMap.default.height})

	for (let i in enemies) {
		enemies[i].move(delta, players, enemies);
	}

	for (let i in players) {
		for(let j in players) {
			if(players[j].id != players[i].id){
				playerPack.push(players[j].getUpdatePack());
			}
		}
		for (let e in enemies) {
			players[i].enemyUpdatePack.push(enemies[e]);
		}
		playerPack.push(players[i].getUpdatePack());
	}

	for (let i in players){
		players[i].playerPack = [];
		if(playerPack.length > 0){
			players[i].client.send(msgpack.encode({ pu: playerPack }));
		}

		//Send enemy init pack to client
		if (players[i].enemyInitPack.length > 0) {
			players[i].client.send(msgpack.encode({ ei: players[i].enemyInitPack }));
			players[i].enemyInitPack = [];
		}

		//Send enemy update pack to client
		if (players[i].enemyUpdatePack.length > 0) {
			players[i].client.send(msgpack.encode({ eu: players[i].enemyUpdatePack }));
			players[i].enemyUpdatePack = [];
		}

		//Send enemy init pack to client
		if (players[i].obstacleInitPack.length > 0) {
			players[i].client.send(msgpack.encode({ oi: players[i].obstacleInitPack }));
			players[i].obstacleInitPack = [];
		}

		//Send obstacle update pack to client
		if (players[i].obstacleUpdatePack.length > 0) {
			players[i].client.send(msgpack.encode({ ou: players[i].obstacleUpdatePack }));
			players[i].obstacleUpdatePack = [];
		}
	}

	//Reset player pack array
	playerPack = [];
}

function packArea(map, area){
	for(let i in map.areas[area].obstacles){
		let obstacle = map.areas[area].obstacles[i]; 
		//console.log(obstacle);
		obstacleInitPack.push(obstacle.getInitPack(obstacleId));
		for (let j in players){
			players[j].obstacleInitPack.push(obstacle.getInitPack(obstacleId));
		}
		obstacleId++;
	}
	for(let j in players){
		players[j].client.send(msgpack.encode({ dimensions: {width: map.default.width, height: map.default.height}}));
	}
}

function simulateArea(map, area, dt){
	for(let i in map.areas[area].obstacles){
		let obstacle = map.areas[area].obstacles[i];
		obstacle.update(dt);
		for (let j in players){
			players[j].obstacleUpdatePack.push(obstacle.getUpdatePack());
		}
	}
}

setInterval(() => {
	let time = ms();
	mainLoop();
	let timeTaken = ms() - time;
	if (timeTaken > 250) {
		console.log("An update took " + timeTaken + "ms");
	}
}, 1000 / 60);

console.log("App listening to Server " + PORT);
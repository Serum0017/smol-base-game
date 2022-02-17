let canvas = { width: 1280, height: 720 };

class Player {
	constructor(id, client) {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.radius = 17.14; // currently not circulated in updatepack or initpack
        this.xChanged = false;
        this.yChanged = false;
        this.id = id;
        this.client = client;
        this.mousePos = { x: 0, y: 0 };
        this.vel = { x: 0, y: 0 };
        this.dead = false;
        this.deadChanged = false;
        this.enemyInitPack = [];
        this.enemyUpdatePack = [];
        this.speed = 17*4/100;
    }

    getUpdatePack() {
        let sendId = false;
        let pack = {};
        if(this.xChanged){
            pack.x = Math.round(this.x);
            this.xChanged = false;
            sendId = true;
        }
        if(this.yChanged){
            pack.y = Math.round(this.y);
            this.yChanged = false;
            sendId = true;
        }
        if(this.deadChanged){
            pack.d = this.dead;
            this.deadChanged = false;
            sendId = true;
        }
        if(this.mousePos != undefined){
            pack.msp = this.mousePos;
            sendId = true;
        }
        if(sendId){
            pack.id = this.id;
        }
        return pack;
    }

    getInitPack() {
        let pack = {
            x: Math.round(this.x),
            y: Math.round(this.y),
            id: this.id,
            d: this.dead,
            msp: this.mousePos,
        };
        return pack;
    }

    move(delta) {
        if(!this.dead){
            this.vel.x = 0;
            this.vel.y = 0;
            let dx = canvas.width / 2 - this.mousePos.x;
			let dy = canvas.height / 2 - this.mousePos.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            distance /= 300;
            let angle = Math.atan2(dy, dx);
            if (distance > this.speed) {
				distance = this.speed;
			}
            this.vel.x = -Math.cos(angle) * distance;
            this.vel.y = -Math.sin(angle) * distance;
            this.x += this.vel.x * delta;
            this.y += this.vel.y * delta;
        }

        // Making sure this isn't out of level bounds (assuming 1280 by 720 canvas)
        if (this.x - this.radius < 0) {
            this.x = this.radius;
        } else if (this.x + this.radius > 1280) {
            this.x = 1280 - this.radius;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
        } else if (this.y + this.radius > 720) {
            this.y = 720 - this.radius;
        }

        this.xChanged = true;
        this.yChanged = true;
    }
}

module.exports = {
	Player
}
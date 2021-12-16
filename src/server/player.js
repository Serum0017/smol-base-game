let canvas = { width: 1280, height: 720 };

class Player {
	constructor(id, client) {
        this.x = 640;
        this.y = 360;
        this.xChanged = false;
        this.yChanged = false;
        this.id = id;
        this.client = client;
        this.mousePos = { x: 0, y: 0 };
        this.vel = { x: 0, y: 0 };
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
            msp: this.mousePos,
        };
        return pack;
    }

    move(delta) {
        this.vel.x = 0;
        this.vel.y = 0;
        let dx = this.x - this.mousePos.x;
        let dy = this.y - this.mousePos.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        distance /= 1000;
        let angle = Math.atan2(dy, dx);
        console.log(angle);
        this.vel.x = Math.cos(angle) * distance * -1;
        this.vel.y = Math.sin(angle) * distance * -1;
        this.x += this.vel.x * delta;
        this.y += this.vel.y * delta;
        this.xChanged = true;
        this.yChanged = true;
    }
}

module.exports = {
	Player
}
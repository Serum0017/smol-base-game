let canvas = { width: 1280, height: 720 };

class Player {
	constructor(id, client) {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.radius = 24.5; // currently not circulated in updatepack or initpack
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
        this.obstacleInitPack = [];
        this.obstacleUpdatePack = [];
        this.speed = 0.3;
        this.inputs = {up: false, down: false, right: false, left: false};
        this.inputType = "keyboard";
        this.area = 1;
        this.world = 'hub';
        //this.grav = -1;
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
            radius: this.radius,
        };
        return pack;
    }

    move(delta) {
        if(!this.dead){
            this.vel.x = 0;
            this.vel.y = 0;
            if(this.inputType == "mouse"){
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
                this.xChanged = true;
                this.yChanged = true;
            } else if(this.inputType == "keyboard"){
                //Keyboard movement
                if (this.inputs.right) {
                    this.vel.x = this.speed;
                    this.xChanged = true;
                } else if (this.inputs.left) {
                    this.vel.x = -this.speed;
                    this.xChanged = true;
                }
                if (this.inputs.up) {
                    this.vel.y = -this.speed;
                    this.yChanged = true;
                } else if (this.inputs.down) {
                    this.vel.y = this.speed;
                    this.yChanged = true;
                }
            }
            this.x += this.vel.x * delta;
            this.y += this.vel.y * delta;
            /*if(this.y > 0){
                this.y += this.grav * delta;
            } else {
                this.y = 0;
            }*/
        }
    }
}

module.exports = {
	Player
}
let canvas = { width: 1280, height: 720 };

class Enemy {
	constructor(options) {
		Object.assign(this, options);
        this.x = canvas.width*Math.random();
        this.y = canvas.height*Math.random();
        this.vx = 0;
        this.vy = 0;
        this.radius = 30;
        this.angle = Math.random()*Math.PI*2;
    }

    getUpdatePack() {
		let pack = { id: this.id };
        if(this.xChanged){
            pack.x = Math.round(this.x);
        }
        if(this.yChanged){
            pack.y = Math.round(this.y);
        }
		return pack;
	}
	getInitPack() {
		let pack = {
            id: this.id,
			x: Math.round(this.x),
			y: Math.round(this.y),
		};
		this.toInit = false;
		return pack;
	}
	move(delta, players, enemies) {
        this.vx = Math.cos(this.angle);
        this.vy = Math.sin(this.angle);

        // Wall Bouncing
        if (this.x - this.radius < 0) {
            this.vx = Math.abs(this.vx);
            this.x = this.radius;
            this.turnDir = -this.turnDir;
        } else if (this.x + this.radius > 1280) {
            this.vx = -Math.abs(this.vx);
            this.x = 1280 - this.radius;
            this.turnDir = -this.turnDir;
        }
        if (this.y - this.radius < 0) {
            this.vy = Math.abs(this.vy);
            this.y = this.radius;
            this.turnDir = -this.turnDir;
        } else if (this.y + this.radius > 720) {
            this.vy = -Math.abs(this.vy);
            this.y = 720 - this.radius;
            this.turnDir = -this.turnDir;
        }

        // Movement
        this.angle = Math.atan2(this.vy, this.vx);
        this.x += this.vx * this.speed * delta;
        this.y += this.vy * this.speed * delta;
    }
}

module.exports = {
    Enemy
}
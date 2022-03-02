class Obstacle {
    constructor(params){
        Object.assign(this, params);
        if(!Array.isArray(this.type)){
            this.type = [this.type];
        }
        if(this.type.includes('move')){
            this.x = this.points[params.startPoint][0];
            this.y = this.points[params.startPoint][1];
            this.currentPoint = params.startPoint;
        }
        if(this.type.includes('rotate')){
            this.angle = params.startAngle;
            this.pivotX = params.pivotX ?? params.x + params.w/2;
            this.pivotY = params.pivotY ?? params.y + params.h/2;
            this.distToPivot = params.distToPivot ?? Math.sqrt(Math.pow(this.pivotX - (params.x + params.w/2), 2) + Math.pow(this.pivotY - (params.y + params.h/2), 2));
            this.x = Math.cos(this.angle * Math.PI/180) * this.distToPivot + this.pivotX;
            this.y = Math.sin(this.angle * Math.PI/180) * this.distToPivot + this.pivotY;
        }
    }
    update(dt){
        if(this.type.includes('move')){
            let nextPointIndex = this.currentPoint + 1;
            if (nextPointIndex >= this.points.length) {
                nextPointIndex = 0;
            }
            let nextPoint = this.points[nextPointIndex];
            let currentPoint = this.points[this.currentPoint];
            this.pointTo = { x: nextPoint[0], y: nextPoint[1] };
            this.pointOn = { x: currentPoint[0], y: currentPoint[1] };
            let angle = Math.atan2(this.pointTo.y - this.pointOn.y, this.pointTo.x - this.pointOn.x);
            let xv = Math.cos(angle) * this.speed;
            let yv = Math.sin(angle) * this.speed;
            this.x += xv * dt;
            this.y += yv * dt;
            let timeRemain = 0;
            let over = false;
            if (Math.abs(yv) > Math.abs(xv)) {
                if (this.pointTo.y > this.pointOn.y) {
                    if (this.y > this.pointTo.y) {
                        over = true;
                    }
                }
                else {
                    if (this.y < this.pointTo.y) {
                        over = true;
                    }
                }
            }
            else {
                if (this.pointTo.x > this.pointOn.x) {
                    if (this.x > this.pointTo.x) {
                        over = true;
                    }
                }
                else {
                    if (this.x < this.pointTo.x) {
                        over = true;
                    }
                }
            }
            if (over == true) {
                this.currentPoint++;
                if (this.currentPoint > this.points.length - 1) {
                    this.currentPoint = 0;
                }
                timeRemain = Math.sqrt(Math.pow(this.y - this.pointTo.y, 2) + Math.pow(this.x - this.pointTo.x, 2));
                this.x = this.pointTo.x;
                this.y = this.pointTo.y;
                timeRemain /= this.speed;
                this.pointOn = this.points[this.state];

                this.update(timeRemain);
            }
        }
        if(this.type.includes('rotate')){
            this.angle += this.rotateSpeed * dt;
            this.x = Math.cos(this.angle * Math.PI/180) * this.distToPivot + this.pivotX;
            this.y = Math.sin(this.angle * Math.PI/180) * this.distToPivot + this.pivotY;
        }
    }
    getInitPack(id){
        this.id = id;
        let pack = {id: id, type: this.type};
        if(this.type.includes('normal') || this.type.includes('bounce') || this.type.includes('move') || this.type.includes('lava') || this.type.includes('safe')){
            Object.assign(pack, {
                x: this.x,
                y: this.y,
                w: this.w,
                h: this.h
            })
        }
        if(this.type.includes('bounce')){
            Object.assign(pack, {
                effect: this.effect,
            })
        }
        return pack;
    }
    getUpdatePack(){
        return this;
    }
}

module.exports = {
    Obstacle
}
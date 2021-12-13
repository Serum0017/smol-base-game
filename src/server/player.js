let canvas = { width: 1280, height: 720 };

class Player {
	constructor(id, client) {
        this.x = 640;
        this.y = 360;
        this.id = id;
        this.client = client;
        this.mousePos = { x: 0, y: 0 };
        this.playerUpdatePack = [];
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
        this.x = this.mousePos.x;
        this.y = this.mousePos.y;
        //console.log(this.x + ' ' + this.y);
    }
}

module.exports = {
	Player
}
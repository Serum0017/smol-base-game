class Enemy{
    constructor(initPack){
      this.x = initPack.x;
      this.y = initPack.y;
      this.radius = initPack.radius; // not supported yet in circulation
    }
    
    updatePack(updatePack){
        if(updatePack.x != undefined){
            this.x = updatePack.x;
        }
        if(updatePack.y != undefined){
            this.y = updatePack.y;
        }
    }
}
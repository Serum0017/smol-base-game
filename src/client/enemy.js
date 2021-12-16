class Enemy{
    constructor(initPack){
      this.x = initPack.x;
      this.y = initPack.y;
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
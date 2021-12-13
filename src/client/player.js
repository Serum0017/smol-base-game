class Player{
  constructor(initPack){
      this.x = initPack.x;
      this.y = initPack.y;
      this.id = initPack.id;
      this.mousePos = initPack.msp;
      this.renderX = this.x;
      this.renderY = this.y;
      this.playerUpdatePack = [];
  }
  updatePack(updatePack){
      if (updatePack.x != undefined){
          this.x = updatePack.x;
      }
      if (updatePack.y != undefined){
          this.y = updatePack.y;
      }
      if (updatePack.msp != undefined){
          this.mousePos = updatePack.msp;
      }
  }
  /*interp(delta){
      this.renderX = lerp(this.renderX, this.x, delta);
      this.renderY = lerp(this.renderY, this.y, delta);
  }*/
}
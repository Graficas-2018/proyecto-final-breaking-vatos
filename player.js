module.exports = class Player {
  constructor(socketId, name,continua) {
    // Array of players
    this.name = name;
    this.socketId = socketId;
    this.jugadorPuedeContinuar = continua;
  }

  setTiles(tiles) {
    this.tiles = tiles;
  }
  addTile(t){
    this.tiles.push(t);
  }

  getTiles(){
    return this.tiles;
  }

  tileDelivered(move){

    var index = this.tiles.map(function(item){ return item.id;}).indexOf(move.tile.id);
    if (index > -1) {
      this.tiles.splice(index, 1);
    }
  }

  canContinue(move){
    var count = 0;
    for (var i = 0; i < this.tiles.length; i++) {
      if(this.tiles[i].l1 == move.numberLeft || this.tiles[i].l1 == move.numberRight || this.tiles[i].l2 == move.numberLeft || this.tiles[i].l2 == move.numberRight){
        count++;
      }
    }
    if(count > 0){
      this.jugadorPuedeContinuar = true;
      //return this.jugadorPuedeContinuar;
    }
    else{
      this.jugadorPuedeContinuar = false;
      //return this.jugadorPuedeContinuar;
    }
  }

  countPoints(){
    var points = 0;
    for (tile of this.tiles) {
      points += tile.l1 + tile.l2;
    }
    return points;
  }

};

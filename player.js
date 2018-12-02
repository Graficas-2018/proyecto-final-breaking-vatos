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

  getTiles(){
    return this.tiles;
  }

  tileDelivered(move){

    var index = this.tiles.map(function(item){ return item.id;}).indexOf(move.tile.id);
    if (index > -1) {
      this.tiles.splice(index, 1);
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

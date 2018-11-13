module.exports = class Player {
  constructor(socketId, name) {
    // Array of players
    this.name = name;
    this.socketId = socketId;
  }

  setTiles(tiles) {
    this.tiles = tiles;
  }

  countPoints(){
    var points = 0;
    for (tile of this.tiles) {
      points += tile.l1 + tile.l2;
    }
    return points;
  }

};

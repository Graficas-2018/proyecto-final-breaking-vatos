var HashMap = require('hashmap');
var Player = require('./player.js');

// assigning to exports will not modify module, must use module.exports
module.exports = class Game {
  constructor() {
    // Array of players
    this.players = new HashMap();
    this.tiles = [];
    this.tiles.push({l1: 0, l2: 0});
    this.tiles.push({l1: 0, l2: 1});
    this.tiles.push({l1: 0, l2: 2});
    this.tiles.push({l1: 0, l2: 3});
    this.tiles.push({l1: 0, l2: 4});
    this.tiles.push({l1: 0, l2: 5});
    this.tiles.push({l1: 0, l2: 6});
    this.tiles.push({l1: 1, l2: 1});
    this.tiles.push({l1: 1, l2: 2});
    this.tiles.push({l1: 1, l2: 3});
    this.tiles.push({l1: 1, l2: 4});
    this.tiles.push({l1: 1, l2: 5});
    this.tiles.push({l1: 1, l2: 6});
    this.tiles.push({l1: 2, l2: 2});
    this.tiles.push({l1: 2, l2: 3});
    this.tiles.push({l1: 2, l2: 4});
    this.tiles.push({l1: 2, l2: 5});
    this.tiles.push({l1: 2, l2: 6});
    this.tiles.push({l1: 3, l2: 3});
    this.tiles.push({l1: 3, l2: 4});
    this.tiles.push({l1: 3, l2: 5});
    this.tiles.push({l1: 3, l2: 6});
    this.tiles.push({l1: 4, l2: 4});
    this.tiles.push({l1: 4, l2: 5});
    this.tiles.push({l1: 4, l2: 6});
    this.tiles.push({l1: 5, l2: 5});
    this.tiles.push({l1: 5, l2: 6});
    this.tiles.push({l1: 6, l2: 6});
  }

  shuffletiles() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  handOutTiles(){
    this.players.forEach(function(value, key) {
      //Set the next 7 tiles
      this.players.get(key).setTiles(this.tiles.splice(0,6));
      //console.log(key + " : " + value);
    });
  }

  addPlayer(socketId, name){
    var player = new Player(socketId, name);
    if (this.players.size < 4) {
      this.players.set(socketId, player);
      return true;
    } else {
      return false;
    }
  }

  setTeams(teams){
    if (this.players.size == 4) {

    } else {
      return false;
    }
  }

  nextTurn() {
    return this.width * 2;
  }
};

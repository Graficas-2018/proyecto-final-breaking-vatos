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
    this.turn = -1;
    this.primerMovimiento = true;
    this.numberLeft=0;
    this.numberRight = 0;
  }

  startGame(){
    this.shuffletiles();
    this.handOutTiles();
  }

  shuffletiles() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  handOutTiles(){
    var _this = this;
    this.players.forEach(function(value, key) {
      console.log(key + " : " + value);
      //Set the next 7 tiles
      _this.players.get(key).setTiles(_this.tiles.splice(0,7));
    });
  }

  getTile(){
    if (this.tiles.length > 0) {
      return this.tiles.splice(0,1);
    } else {
      return null;
    }
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

  setLastNumbers(move){
    if(move.numberLeft)
      this.numberLeft = move.numberLeft;
    if(move.numberRight)
      this.numberRight = move.numberRight;
  }

  getLastNumbers(){
    var numbers = {numberLeft: this.numberLeft, numberRight: this.numberRight};
    return numbers;
  }
  getFirstMove(){
    return this.primerMovimiento;
  }

  nextTurn() {
    var p = this.players.keys();
    this.turn++;
    if (this.turn >= this.players.size) {
      this.turn = 0;
    }
    return p[this.turn];
  }
};

var HashMap = require('hashmap');
var Player = require('./player.js');

// assigning to exports will not modify module, must use module.exports
module.exports = class Game {
  constructor() {
    // Array of players
    this.players = new HashMap();
    this.tiles = [];
    this.tiles.push({id:0,l1: 0, l2: 0});
    this.tiles.push({id:1,l1: 0, l2: 1});
    this.tiles.push({id:2,l1: 0, l2: 2});
    this.tiles.push({id:3,l1: 0, l2: 3});
    this.tiles.push({id:4,l1: 0, l2: 4});
    this.tiles.push({id:5,l1: 0, l2: 5});
    this.tiles.push({id:6,l1: 0, l2: 6});
    this.tiles.push({id:7,l1: 1, l2: 1});
    this.tiles.push({id:8,l1: 1, l2: 2});
    this.tiles.push({id:9,l1: 1, l2: 3});
    this.tiles.push({id:10,l1: 1, l2: 4});
    this.tiles.push({id:11,l1: 1, l2: 5});
    this.tiles.push({id:12,l1: 1, l2: 6});
    this.tiles.push({id:13,l1: 2, l2: 2});
    this.tiles.push({id:14,l1: 2, l2: 3});
    this.tiles.push({id:15,l1: 2, l2: 4});
    this.tiles.push({id:16,l1: 2, l2: 5});
    this.tiles.push({id:17,l1: 2, l2: 6});
    this.tiles.push({id:18,l1: 3, l2: 3});
    this.tiles.push({id:19,l1: 3, l2: 4});
    this.tiles.push({id:20,l1: 3, l2: 5});
    this.tiles.push({id:21,l1: 3, l2: 6});
    this.tiles.push({id:22,l1: 4, l2: 4});
    this.tiles.push({id:23,l1: 4, l2: 5});
    this.tiles.push({id:24,l1: 4, l2: 6});
    this.tiles.push({id:25,l1: 5, l2: 5});
    this.tiles.push({id:26,l1: 5, l2: 6});
    this.tiles.push({id:27,l1: 6, l2: 6});
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
    }
    else {
      return null;
    }
  }

  addPlayer(socketId, name,continuar){
    var player = new Player(socketId, name, continuar);
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

  gameOverTie(){
    var _this = this;
    var juegoTodos= [];
    var count = 0;
    if (this.tiles.length <= 0) {
      this.players.forEach(function(value, key) {
        juegoTodos.push(_this.players.get(key).jugadorPuedeContinuar);
      });
      for(var i =0; i< juegoTodos.length;i++){
        if(juegoTodos[i]==false){
          count++;
        }
        else{
          count = 0;
        }
      }
      if(count >= this.players.size){
        return true;
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }

  }

  sumPointsPlayers(){
    var _this = this;
    var mayor = 0;
    var jugadorGanador="";
    this.players.forEach(function(value, key) {
      //console.log(key + " : " + value);
      var points = _this.players.get(key).countPoints();
      if(points > mayor){
        mayor = points;
        jugadorGanador = _this.players.get(key).name;
      }
    });
    var message={};
    message.name = jugadorGanador;
    message.points = mayor
    return message;
  }
};

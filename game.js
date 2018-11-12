var HashMap = require('hashmap');

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

  addPlayer(){
    if (this.players.size < 4) {

    } else {

    }
    //this.players.push({
      //score:0,
    //});
  }

  setTeams(){
    if (this.players.size == 4) {

    } else {

    }
  }

  nextTurn() {
    return this.width * 2;
  }
};

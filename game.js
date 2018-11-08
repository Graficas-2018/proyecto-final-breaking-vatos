// assigning to exports will not modify module, must use module.exports
module.exports = class Game {
  constructor(password) {
    this.password = password;
    this.players = [];
  }

  addPlayer(){
    this.players.push({
      score:0,
    });
  }

  area() {
    return this.width ** 2;
  }
};

const { ranks, suits } = require("./reference");

class Game {
  constructor() {
    this.players = [];
    this.win = false;
  }

  start() {
    let deck = new Deck();
    deck.create();
    deck.shuffle();
    this.deck = deck;
    this.players.push(new Player());
    return this.deck;
  }

  dealCardToPlayer(player) {
    this.players[player].receive(this.deck.dealCard());
    return this.players;
  }
}

class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }
}

class Deck {
  constructor() {
    this.cards = [];
  }

  create() {
    // let cards = [];
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        let card = new Card(ranks[j], suits[i]);
        this.cards.push(card);
      }
    }
    // this.cards = cards;
    return this.cards;
  }

  shuffle() {
    for (let i = 0; i < 1000; i++) {
      let idx1 = Math.floor(Math.random() * this.cards.length);
      let idx2 = Math.floor(Math.random() * this.cards.length);

      [this.cards[idx1], this.cards[idx2]] = [
        this.cards[idx2],
        this.cards[idx1],
      ];
    }
    return this.cards;
  }

  dealCard() {
    let dealtCard = this.cards.pop();
    return dealtCard;
  }
}

class Player {
  constructor() {
    this.hand = [];
    this.cash = 1000;
    this.bid = 0;
  }

  receive(card) {
    this.hand.push(card);
    return this.hand;
  }

  bet(num) {
    this.cash -= num;
    return num;
  }

  hit() {}

  stay() {}
}

module.exports = { Game, Card, Deck, Player };

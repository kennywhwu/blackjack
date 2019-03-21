const { ranks, suits } = require("./reference");

class Game {
  constructor(numPlayers) {
    this.numPlayers = numPlayers;
    this.players = [];
    this.currentPlayer = {};
    this.currentIndex = 0;
    this.currentPlayers = [];
    this.win = false;
  }

  createPlayers() {
    for (let i = 1; i <= this.numPlayers; i++) {
      this.players.push(new Player(`Player ${i}`));
    }
    this.currentPlayer = this.players[this.currentIndex];
    return this.players;
  }

  createDeck() {
    let deck = new Deck();
    deck.create();
    deck.shuffle();
    this.deck = deck;
    return this.deck;
  }

  switchPlayers() {
    if (this.currentIndex < this.players.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.currentPlayer = this.players[this.currentIndex];
    return this.currentPlayer;
  }

  dealCardToPlayer(player) {
    let dealtCard = this.deck.dealCard();
    this.players[player].receive(dealtCard);
    return player;
  }

  playerBid(player, amount) {
    player.bet(amount);
    this.addPlayerToGame(player);
  }

  addPlayerToGame(player) {
    this.currentPlayers.push(player);
  }

  removePlayerFromGame(player) {
    this.currentPlayers.splice(this.currentIndex, 1);
  }

  playerWin(player) {
    player.win();
  }
}

class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
    this.value = this.assignValue();
  }

  assignValue() {
    if (this.rank === "J" || this.rank === "Q" || this.rank === "K") {
      this.value = 10;
    } else if (this.rank === "A") {
      this.value = 11;
    } else {
      this.value = +this.rank;
    }
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
  constructor(name) {
    this.name = name;
    this.hand = [];
    this.handValue = 0;
    this.cash = 1000;
    this.bid = 0;
  }

  receive(card) {
    this.hand.push(card);
    return this.hand;
  }

  bet(amount) {
    this.cash -= amount;
    this.bid += amount;
    return amount;
  }

  win() {
    this.cash += amount * 2;
    this.bid = 0;
  }

  lose() {
    this.bid = 0;
  }
}

class Dealer {
  constructor() {
    this.hand = [];
    this.handValue = 0;
  }

  receive(card) {
    this.hand.push(card);
    return this.hand;
  }
}

module.exports = { Game, Card, Deck, Player };

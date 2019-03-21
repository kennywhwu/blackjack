// Models file for all defined classes in Blackjack game

const { ranks, suits } = require("./reference");

class Game {
  constructor(numPlayers) {
    this.dealer = new Dealer();
    this.numPlayers = numPlayers;
    this.players = [];
    this.currentPlayer = {};
    this.currentIndex = 0;
    this.playingPlayers = [];
    this.scoringPlayers = [];
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

  dealCardToPlayer(player, secondHand) {
    let dealtCard = this.deck.dealCard();
    player.receive(dealtCard, secondHand);
    return dealtCard;
  }

  playerBid(player, amount) {
    player.bet(amount);
    this.addPlayerToGame(player);
    return player;
  }

  addPlayerToGame(player) {
    this.playingPlayers.push(player);
    return player;
  }

  removePlayerFromGame() {
    let removedPlayer = this.playingPlayers.splice(this.currentIndex, 1);
    this.currentIndex = Math.min(
      this.currentIndex,
      this.playingPlayers.length - 1
    );
    this.currentPlayer = this.playingPlayers[this.currentIndex];
    return removedPlayer[0];
  }

  addPlayerToScoring(player) {
    this.scoringPlayers.push(player);
    return player;
  }

  removePlayerFromScoring() {
    let removedPlayer = this.scoringPlayers.splice(this.currentIndex, 1);
    this.currentIndex = Math.min(
      this.currentIndex,
      this.scoringPlayers.length - 1
    );
    this.currentPlayer = this.scoringPlayers[this.currentIndex];
    return removedPlayer[0];
  }

  clearScoring() {
    this.scoringPlayers = [];
    return this.scoringPlayers;
  }

  deletePlayer(player) {
    this.players = this.players.filter(e => e.name !== player.name);
    return player;
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
      return 10;
    } else if (this.rank === "A") {
      return 11;
    } else {
      return +this.rank;
    }
  }
}

class Deck {
  constructor() {
    this.cards = [];
  }

  create() {
    this.cards = [];
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        let card = new Card(ranks[j], suits[i]);
        this.cards.push(card);
      }
    }
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

  receive(card, secondHand) {
    if (secondHand === "split") {
      this.secondHand.push(card);
      this.secondHandValue += card.value;
    } else {
      this.hand.push(card);
      this.handValue += card.value;
    }
    return this.hand;
  }

  bet(amount) {
    this.cash -= amount;
    this.bid += amount;
    return amount;
  }

  split() {
    this.secondHand = [this.hand.pop()];
    this.handValue /= 2;
    this.secondHandValue = this.handValue;
    this.cash -= this.bid;
    this.bid *= 2;
    return this.secondHand;
  }

  win(secondHand) {
    if (secondHand) {
      this.cash += +this.bid;
      this.bid /= 2;
    } else {
      this.cash += +this.bid * 2;
      this.bid = 0;
    }
    return this.cash;
  }

  lose(secondHand) {
    if (secondHand) {
      this.bid /= 2;
    } else {
      this.bid = 0;
    }
    return this.cash;
  }

  tie() {
    this.cash += +this.bid;
    this.bid = 0;
    return this.cash;
  }

  clearHand() {
    this.hand = [];
    this.handValue = 0;
    return this.hand;
  }
}

class Dealer {
  constructor() {
    this.hand = [];
    this.handValue = 0;
  }

  receive(card) {
    this.hand.push(card);
    this.handValue += card.value;
    return this.hand;
  }

  bust() {
    this.handValue = 0;
    return this.handValue;
  }

  clearHand() {
    this.hand = [];
    this.handValue = 0;
    return this.hand;
  }
}

module.exports = { Game, Card, Deck, Player, Dealer };

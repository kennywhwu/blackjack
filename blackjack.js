// Implement a simple game of blackjack in a language of your choice (Java, Ruby, and Python are ones we're most familiar with). The game should have a command-line interface and should follow all of the core blackjack rules that exist at a Las Vegas casino. In the interest of time, there's no need to implement surrendering or insurance, but your code should be extensible enough that adding these features in the future wouldn't be a big deal. All other blackjack rules should be supported.

// The program should start by prompting for the number of players at the table. Each player should start with $1000 and should be allowed to place any integer bet on each hand.

// One of the goals of the exercise is for us to get a feel for how you write code in the presence of incomplete requirements. We're looking for a finished product that (a) works correctly, (b) is a pleasure to use, and (c) is backed by clean code that is readily understood.

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { Card, Deck, Player, Game } = require("./models");

function startGame() {
  readline.question(`How many players? `, numPlayers => {
    console.log(`There will be ${numPlayers} players!`);
    let game = new Game(numPlayers);
    game.createPlayers();
    game.createDeck();

    console.log(`All players start with $1000`);
    bidding(game);

    // readline.close();
  });
}

function bidding(game) {
  let player = game.currentPlayer;
  readline.question(
    `${player.name} ($${player.cash}): How much will you bet? `,
    bet => {
      game.playerBid(player, bet);
      console.log(`${player.name} bet $${bet}, and has $${player.cash} left.`);
      game.switchPlayers();
      // After all players have made their bets, start hand
      if (game.currentPlayers.length === game.players.length) {
        startHand(game);
      } else {
        bidding(game);
      }
    }
  );
}

function startHand(game) {
  let player = game.currentPlayer;
  let card1 = game.dealCardToPlayer(player);
  let card2 = game.dealCardToPlayer(player);
  console.log(
    `${player.name} received ${card1.rank} of ${card1.suit} and ${
      card2.rank
    } of ${card2.suit}: Total is ${player.handValue}`
  );
  if (player.handValue === 21) {
    stay(game);
  } else {
    hitOrStay(game);
  }
}

function hitOrStay(game) {
  readline.question("[H]it or [S]tay? ", key => {
    if (key === "h" || key === "H") {
      hit(game);
    } else if (key === "s" || key === "S") {
      stay(game);
      startHand(game);
    }
  });
}

function hit(game) {
  let player = game.currentPlayer;
  let card = game.dealCardToPlayer(player);
  console.log(
    `${player.name} received ${card.rank} of ${card.suit}: Total is ${
      player.handValue
    }`
  );
  if (player.handValue > 21) {
    bust(game);
    startHand(game);
  } else if (player.handValue === 21) {
    stay(game);
  } else {
    hitOrStay(game);
  }
}

function stay(game) {
  game.removePlayerFromGame();
  game.switchPlayers();
}

function bust(game) {
  let player = game.currentPlayer;
  player.lose();
  console.log(`Bust! ${player.name} cash is ${player.cash}`);
  game.removePlayerFromGame();
}

startGame();

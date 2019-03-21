// Implement a simple game of blackjack in a language of your choice (Java, Ruby, and Python are ones we're most familiar with). The game should have a command-line interface and should follow all of the core blackjack rules that exist at a Las Vegas casino. In the interest of time, there's no need to implement surrendering or insurance, but your code should be extensible enough that adding these features in the future wouldn't be a big deal. All other blackjack rules should be supported.

// The program should start by prompting for the number of players at the table. Each player should start with $1000 and should be allowed to place any integer bet on each hand.

// One of the goals of the exercise is for us to get a feel for how you write code in the presence of incomplete requirements. We're looking for a finished product that (a) works correctly, (b) is a pleasure to use, and (c) is backed by clean code that is readily understood.

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { Deck, Player, Game } = require("./models");

function startGame() {
  readline.question(`How many players? `, numPlayers => {
    console.log(`There will be ${numPlayers} players!`);
    let game = new Game(numPlayers);
    game.createPlayers();
    game.createDeck();

    console.log(`All players start with $1000`);
    bid(game);

    // readline.close();
  });
}

function bid(game) {
  let player = game.currentPlayer;
  readline.question(
    `${player.name} ($${player.cash}): How much will you bet? `,
    bet => {
      game.playerBid(player, bet);
      console.log(`${player.name} bet $${bet}, and has $${player.cash} left.`);
      if (game.currentPlayers.length === game.players.length) {
        // playHand()
        console.log("Ready to start!");
      } else {
        game.switchPlayers();
        bid(game);
      }
    }
  );
}

function playHand(player) {}

startGame();

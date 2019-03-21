// Implement a simple game of blackjack in a language of your choice (Java, Ruby, and Python are ones we're most familiar with). The game should have a command-line interface and should follow all of the core blackjack rules that exist at a Las Vegas casino. In the interest of time, there's no need to implement surrendering or insurance, but your code should be extensible enough that adding these features in the future wouldn't be a big deal. All other blackjack rules should be supported.

// The program should start by prompting for the number of players at the table. Each player should start with $1000 and should be allowed to place any integer bet on each hand.

// One of the goals of the exercise is for us to get a feel for how you write code in the presence of incomplete requirements. We're looking for a finished product that (a) works correctly, (b) is a pleasure to use, and (c) is backed by clean code that is readily understood.

// Further specs:
// -Dealer hits on soft 17
// -Show first card for each player
//

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { Card, Deck, Player, Game } = require("./models");
const { dealerHit, bustValue } = require("./reference");

function startGame() {
  readline.question(`How many players? `, numPlayers => {
    if (Number.isNaN(+numPlayers) || numPlayers < 2) {
      console.log("Please enter at least 2 players");
      startGame();
    } else {
      console.log(`There will be ${numPlayers} players!`);
      let game = new Game(numPlayers);
      game.createPlayers();
      game.createDeck();

      console.log(`All players start with $1000`);
      bidding(game);
    }
  });
}

function bidding(game) {
  let player = game.currentPlayer;
  readline.question(
    `${player.name} ($${player.cash}): How much will you bet? `,
    bet => {
      if (bet > player.cash || bet < 0) {
        console.log("You may only bet up to cash amount");
        bidding(game);
      } else if (Number.isNaN(+bet)) {
        console.log("Please enter a dollar amount");
        bidding(game);
      } else {
        game.playerBid(player, bet);
        console.log(
          `${player.name} bet $${bet}, and has $${player.cash} left.`
        );
        game.switchPlayers();
        // After all players have made their bets, start hand
        if (game.playingPlayers.length === game.players.length) {
          dealerStart(game);
          startHand(game);
        } else {
          bidding(game);
        }
      }
    }
  );
}

function startHand(game) {
  if (game.playingPlayers.length === 0) {
    dealerPlay(game);
    scorePlayers(game);
    game.switchPlayers();
    bidding(game);
  } else {
    let player = game.currentPlayer;
    player.clearHand();
    let card1 = game.dealCardToPlayer(player);
    let card2 = game.dealCardToPlayer(player);
    console.log(
      `${player.name} received ${card1.rank} of ${card1.suit} and ${
        card2.rank
      } of ${card2.suit}: Total is ${player.handValue}`
    );
    if (player.handValue === bustValue) {
      stay(game);
      startHand(game);
    } else {
      hitOrStay(game);
    }
  }
}

function hitOrStay(game) {
  readline.question("[H]it or [S]tay? ", key => {
    if (key === "h" || key === "H") {
      hit(game);
    } else if (key === "s" || key === "S") {
      stay(game);
      startHand(game);
    } else {
      console.log("Please choose H/h for hit, or S/s for stay");
      hitOrStay(game);
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
  if (player.handValue > bustValue) {
    bust(game);
    startHand(game);
  } else if (player.handValue === bustValue) {
    stay(game);
    startHand(game);
  } else {
    hitOrStay(game);
  }
}

function stay(game) {
  let removedPlayer = game.removePlayerFromGame();
  game.addPlayerToScoring(removedPlayer);
}

function bust(game) {
  let player = game.currentPlayer;
  player.lose();
  console.log(`Bust! ${player.name} cash is $${player.cash}`);
  if (player.cash <= 0) {
    console.log(`${player.name} has lost all their cash`);
    game.deletePlayer(player);
  }

  game.removePlayerFromGame();
}

function dealerStart(game) {
  let dealer = game.dealer;
  dealer.clearHand();
  game.dealCardToPlayer(dealer);
  let card = game.dealCardToPlayer(dealer);
  console.log("Dealer deals 2 cards to self");
  console.log(`Dealer reveal card is ${card.rank} of ${card.suit}`);
}

function dealerPlay(game) {
  let dealer = game.dealer;
  let hiddenCard = dealer.hand[0];
  console.log(
    `Dealer's hidden card is ${hiddenCard.rank} of ${hiddenCard.suit}`
  );
  while (dealer.handValue < dealerHit) {
    let card = game.dealCardToPlayer(dealer);
    console.log(`Dealer draws ${card.rank} of ${card.suit}`);
  }
  if (dealer.handValue > bustValue) {
    console.log(`Dealer busts! Total is ${dealer.handValue}`);
    dealer.bust();
  } else if (dealer.handValue === bustValue) {
    console.log(`Dealer hits 21!`);
  } else {
    console.log(`Dealer total is ${dealer.handValue}`);
  }
}

function scorePlayers(game) {
  let dealer = game.dealer;
  let dealerTotal = dealer.handValue;
  game.scoringPlayers.forEach(player => {
    let playerTotal = player.handValue;
    if (playerTotal > dealerTotal) {
      player.win();
      console.log(`${player.name} wins! :) Total is $${player.cash}`);
    } else if (playerTotal === dealerTotal) {
      player.tie();
      console.log(`${player.name} push. :/ Total is $${player.cash}`);
    } else if (playerTotal < dealerTotal) {
      player.lose();
      console.log(`${player.name} lost. :( Total is $${player.cash}`);
    }
    if (player.cash <= 0) {
      console.log(`${player.name} has lost all their cash`);
      game.deletePlayer(player);
    }
  });
  game.clearScoring();
}

startGame();

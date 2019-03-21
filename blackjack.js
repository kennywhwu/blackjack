// Core application file with prompts directing flow of betting program and game

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { Game } = require("./models");
const {
  dealerHit,
  bustValue,
  blackjackPayout,
  doubleDownPayout,
} = require("./reference");

// Initialize game and prompt for players
function startGame() {
  readline.question(`How many players? `, numPlayers => {
    numPlayers = +numPlayers;
    if (Number.isNaN(numPlayers) || numPlayers < 2) {
      console.log("\nPlease enter at least 2 players");
      startGame();
    } else {
      console.log(`\nThere will be ${numPlayers} players!`);
      let game = new Game(numPlayers);
      game.createPlayers();
      game.createDeck();
      console.log(`All players start with $1000`);
      bidding(game);
    }
  });
}

// Each player to bid on current hand
function bidding(game) {
  let player = game.currentPlayer;
  if (game.players.length === 0) {
    console.log("\nAll players are broke, thanks for playing!");
    process.exit();
  }
  if (game.deck.cards.length <= 5 * (game.numPlayers + 1)) {
    game.createDeck();
    console.log("\nRefreshing deck");
  }
  readline.question(
    `\n${player.name} ($${player.cash}): How much will you bet? `,
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

// Determine whether to deal initial cards to player, or start scoring against dealer if all players have been dealt
function startHand(game, secondHand) {
  if (game.playingPlayers.length === 0) {
    if (game.scoringPlayers.length > 0) {
      dealerPlay(game);
      scorePlayers(game);
    }
    game.switchPlayers();
    bidding(game);
  } else if (secondHand) {
    console.log("Moving to second deck");
    hitOrStay(game);
  } else {
    let player = game.currentPlayer;
    player.clearHand();
    let card1 = game.dealCardToPlayer(player);
    let card2 = game.dealCardToPlayer(player);

    console.log(
      `\n${player.name} received ${card1.rank} of ${card1.suit} and ${
        card2.rank
      } of ${card2.suit}: Total is ${player.handValue}`
    );
    if (player.handValue === bustValue) {
      console.log(`Blackjack! Winnings increased to ${blackjackPayout}x`);
      player.bid *= blackjackPayout;
      stay(game);
      startHand(game);
    } else {
      if (card1.rank === card2.rank) {
        askSplit(game);
      } else {
        askDoubleDown(game);
      }
    }
  }
}

// Wait for user input for hit or stay actions
function hitOrStay(game, secondHand) {
  readline.question("[H]it or [S]tay? ", key => {
    if (key === "h" || key === "H") {
      hit(game, secondHand);
    } else if (key === "s" || key === "S") {
      stay(game, secondHand);
      startHand(game, secondHand);
    } else {
      console.log("Please choose H/h for hit, or S/s for stay");
      hitOrStay(game, secondHand);
    }
  });
}

// Add card to either main hand, or split hand
function hit(game, secondHand) {
  let player = game.currentPlayer;
  let card = game.dealCardToPlayer(player, secondHand);
  if (secondHand) {
    // Looping logic to revalue Aces to 1 if total is above bust value
    while (player.secondHandValue > bustValue) {
      let aceIndex = player.secondHand.findIndex(c => {
        return c.rank === "A" && c.value === 11;
      });
      if (aceIndex >= 0) {
        player.secondHand[aceIndex].value = 1;
        player.secondHandValue -= 10;
      } else {
        break;
      }
    }
    console.log(
      `\n${player.name} received ${card.rank} of ${card.suit}: Total is ${
        player.secondHandValue
      }`
    );
    if (player.secondHandValue > bustValue) {
      bust(game, secondHand);
      startHand(game);
    } else if (player.secondHandValue === bustValue) {
      stay(game, secondHand);
      startHand(game);
    } else {
      hitOrStay(game, secondHand);
    }
  } else {
    while (player.handValue > bustValue) {
      let aceIndex = player.hand.findIndex(c => {
        return c.rank === "A" && c.value === 11;
      });
      if (aceIndex >= 0) {
        player.hand[aceIndex].value = 1;
        player.handValue -= 10;
      } else {
        break;
      }
    }

    console.log(
      `\n${player.name} received ${card.rank} of ${card.suit}: Total is ${
        player.handValue
      }`
    );
    if (player.handValue > bustValue) {
      bust(game, secondHand);
      startHand(game);
    } else if (player.handValue === bustValue) {
      stay(game, secondHand);
      startHand(game);
    } else {
      hitOrStay(game, secondHand);
    }
  }
}

// If player stays, they are moved from game to scoring
function stay(game, secondHand) {
  if (!secondHand) {
    let removedPlayer = game.removePlayerFromGame();
    game.addPlayerToScoring(removedPlayer);
  }
}

// If player busts, they exit game early.  If out of cash, they are removed from program entirely
function bust(game, secondHand) {
  let player = game.currentPlayer;
  player.lose(secondHand);
  console.log(`Bust! ${player.name} cash is $${player.cash}`);
  if (player.cash <= 0) {
    console.log(`${player.name} has lost all their cash`);
    game.deletePlayer(player);
  }
  if (!secondHand) {
    game.removePlayerFromGame();
  }
}

// Initial deal for dealers (only one card is shown to everyone)
function dealerStart(game) {
  let dealer = game.dealer;
  dealer.clearHand();
  game.dealCardToPlayer(dealer);
  let card = game.dealCardToPlayer(dealer);
  console.log("\nDealer deals 2 cards to self");
  console.log(`Dealer reveal card is ${card.rank} of ${card.suit}`);
}

// After all players are dealt, dealer's second card is shown and results are calculated
function dealerPlay(game) {
  let dealer = game.dealer;
  let hiddenCard = dealer.hand[0];
  console.log(
    `\nDealer's hidden card is ${hiddenCard.rank} of ${hiddenCard.suit}`
  );
  while (dealer.handValue < dealerHit) {
    let card = game.dealCardToPlayer(dealer);
    while (dealer.handValue > bustValue) {
      let aceIndex = dealer.hand.findIndex(c => {
        return c.rank === "A" && c.value === 11;
      });
      if (aceIndex >= 0) {
        dealer.hand[aceIndex].value = 1;
        dealer.handValue -= 10;
      } else {
        break;
      }
    }
    console.log(`\nDealer draws ${card.rank} of ${card.suit}`);
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

// Results are calculated for players and broadcast
function scorePlayers(game) {
  let dealer = game.dealer;
  let dealerTotal = dealer.handValue;
  game.scoringPlayers.forEach(player => {
    let playerTotal = player.handValue;
    if (playerTotal > dealerTotal) {
      player.win();
      console.log(`\n${player.name} wins! :) Total is $${player.cash}`);
    } else if (playerTotal === dealerTotal) {
      player.tie();
      console.log(`\n${player.name} push. :/ Total is $${player.cash}`);
    } else if (playerTotal < dealerTotal) {
      player.lose();
      console.log(
        `\n${player.name} lost. :( Total is $${Math.max(+player.cash, 0)}`
      );
    }
    if (player.cash <= 0) {
      console.log(`\n${player.name} has lost all their cash`);
      game.deletePlayer(player);
    }
  });
  game.clearScoring();
}

// If split condition occurs, ask player for split decision.  If so, split cards into two decks and proceed
function askSplit(game) {
  let player = game.currentPlayer;
  readline.question("Split? Y/N? ", key => {
    if (key === "y" || key === "Y") {
      player.split();
      hitOrStay(game, "split");
      hitOrStay(game);
    } else if (key === "n" || key === "N") {
      askDoubleDown(game);
    } else {
      console.log("Please choose Y/y for Yes, or N/n for No");
      askSplit(game);
    }
  });
}

// If initial deal, ask player for double down decision
function askDoubleDown(game) {
  readline.question("[H]it, [S]tay, or [D]ouble Down? ", key => {
    if (key === "h" || key === "H") {
      hit(game);
    } else if (key === "s" || key === "S") {
      stay(game);
      startHand(game);
    } else if (key === "d" || key === "D") {
      doubleDown(game);
    } else {
      console.log(
        "Please choose H/h for Hit, S/s for Stay, or D/d for Double Down"
      );
      hitOrStay(game);
    }
  });
}

// Increase bid by specified payout factor
function doubleDown(game) {
  let player = game.currentPlayer;
  let increase = Math.floor(+player.bid * doubleDownPayout);
  player.cash = +player.cash - increase;
  player.bid = +player.bid + increase;
  let card = game.dealCardToPlayer(player);
  while (player.handValue > bustValue) {
    let aceIndex = player.hand.findIndex(c => {
      return c.rank === "A" && c.value === 11;
    });
    if (aceIndex >= 0) {
      player.hand[aceIndex].value = 1;
      player.handValue -= 10;
    } else {
      break;
    }
  }
  console.log(
    `${player.name} received ${card.rank} of ${card.suit}: Total is ${
      player.handValue
    }`
  );
  if (player.handValue > bustValue) {
    bust(game);
    startHand(game);
  } else {
    stay(game);
    startHand(game);
  }
}

startGame();

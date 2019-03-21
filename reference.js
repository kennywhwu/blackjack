// Constants and references for certain boundaries and payout factors

const suits = ["Spades", "Hearts", "Clubs", "Diamonds"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const dealerHit = 17;
const bustValue = 21;
const blackjackPayout = 1.5;
const doubleDownPayout = 0.3;

module.exports = {
  suits,
  ranks,
  dealerHit,
  bustValue,
  blackjackPayout,
  doubleDownPayout,
};

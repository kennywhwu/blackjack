# BlackJack in Node

Simple CLI-based game of Blackjack written in Node.  Follows Las Vegas casino rules, including double-down and splitting.  Does not include surrendering and insurance

## Instructions
*Implement a simple game of blackjack in a language of your choice (Java, Ruby, and Python are ones we're most familiar with). The game should have a command-line interface and should follow all of the core blackjack rules that exist at a Las Vegas casino. In the interest of time, there's no need to implement surrendering or insurance, but your code should be extensible enough that adding these features in the future wouldn't be a big deal. All other blackjack rules should be supported.*

*The program should start by prompting for the number of players at the table. Each player should start with $1000 and should be allowed to place any integer bet on each hand.*

*One of the goals of the exercise is for us to get a feel for how you write code in the presence of incomplete requirements. We're looking for a finished product that (a) works correctly, (b) is a pleasure to use, and (c) is backed by clean code that is readily understood.*

## Running program

Run blackjack.js in the terminal

```
node blackjack.js
```

### Future features / Assumptions
1. Allow dealer to hit on soft 17 (ie. A acts as 1 instead of 11)
2. Show everyone's cards before play
3. Multiple decks for large games
4. Currently no limit to number of players
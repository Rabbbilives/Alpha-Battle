// Define all possible suits
export type CardSuit = "circle" | "triangle" | "cross" | "square" | "star" | "whot";

// Card definition
export interface Card {
  id: string;        // unique id for each card
  suit: CardSuit;
  number: number;
}

// Player definition
export interface Player {
  id: string;
  name: string;
  hand: Card[];
}

// Rule versions
export type RuleVersion = "rule1" | "rule2";

// Game state definition
export interface GameState {
  players: Player[];
  market: Card[];          // draw pile
  pile: Card[];            // played pile
  currentPlayer: number;   // index of current player
  direction: number;       // 1 (clockwise) or -1 (counter-clockwise)
  pendingPick: number;     // accumulated pick cards to draw
  calledSuit?: CardSuit;   // for Whot in rule1
  ruleVersion: RuleVersion; // game mode (rule1 or rule2)
   mustPlayNormal: boolean; 
}

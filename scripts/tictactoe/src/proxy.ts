import {
    Field,
    State,
    PublicKey,
    SmartContract,
    state,
    method,
    Bool,
    Provable,
    Signature,
    Struct,
  } from 'o1js';

import { TicTacToe, Board } from './tictactoe.js';
export { TicTacToeProxy }

class TicTacToeProxy extends SmartContract {

  @method startGame(otherAddress: PublicKey, player1: PublicKey, player2: PublicKey) {
    const calledContract = new TicTacToe(otherAddress);
    calledContract.startGame(player1, player2);
  }

  @method play(otherAddress: PublicKey, pubkey: PublicKey, signature: Signature, x: Field, y: Field) {
    const calledContract = new TicTacToe(otherAddress);
    calledContract.play(pubkey, signature, x, y);
  }

}
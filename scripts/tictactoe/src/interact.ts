/**
 * This file specifies how to run the `TicTacToe` smart contract locally using the `Mina.LocalBlockchain()` method.
 * The `Mina.LocalBlockchain()` method specifies a ledger of accounts and contains logic for updating the ledger.
 *
 * Please note that this deployment is local and does not deploy to a live network.
 * If you wish to deploy to a live network, please use the zkapp-cli to deploy.
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/interact.js`.
 */

import {
  Field,
  PrivateKey,
  PublicKey,
  Mina,
  AccountUpdate,
  Signature,
  Lightnet,
} from 'o1js';
import { TicTacToe, Board } from './tictactoe.js';
import { getTxnUrl } from './utils.js';

import fs from 'fs';

// Network configuration
const config = {
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
};
const fee = Number("0.1") * 1e9; // in nanomina (1 billion = 1.0 mina)

const network = Mina.Network(config);
Mina.setActiveInstance(network);

// Fee payer setup
const feePayerPrivateKey = (await Lightnet.acquireKeyPair()).privateKey
const feePayerAccount = feePayerPrivateKey.toPublicKey();

if (fs.existsSync('tictactoe-zkApp.key')) {
  // File exists in path
} else {
  // File doesn't exist in path
}

const zkAppPrivateKey = PrivateKey.random();
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
const zkApp = new TicTacToe(zkAppPublicKey);

console.log('Compile the contract...');
await TicTacToe.compile();

// Create a new instance of the contract
console.log('\n\n====== DEPLOYING ======\n\n');
const sentTx = await Mina.transaction({ sender: feePayerAccount,fee: fee }, () => {
  AccountUpdate.fundNewAccount(feePayerAccount);
  zkApp.deploy();
});
console.log('Build transaction and create proof...');
await sentTx.prove();
/**
 * note: this tx needs to be signed with `tx.sign()`, because `deploy` uses `requireSignature()` under the hood,
 * so one of the account updates in this tx has to be authorized with a signature (vs proof).
 * this is necessary for the deploy tx because the initial permissions for all account fields are "signature".
 * (but `deploy()` changes some of those permissions to "proof" and adds the verification key that enables proofs.
 * that's why we don't need `tx.sign()` for the later transactions.)
 */
console.log('Sending the transaction.');
let pendingTx = await sentTx.sign([zkAppPrivateKey, feePayerPrivateKey]).send();

if (pendingTx.hash() !== undefined) {
    console.log(`Success! Update transaction sent.
  Your smart contract state will be updated
  as soon as the transaction is included in a block.
  Txn hash: ${pendingTx.hash()}`);
}

console.log('Waiting for transaction inclusion in a block.');
await pendingTx.wait({ maxAttempts: 90 });
        
if (pendingTx?.hash() !== undefined) {
    console.log(`
Success! Deploy TicTacToe transaction sent.

Your smart contract state will be updated
as soon as the transaction is included in a block:
${getTxnUrl(config.mina, pendingTx.hash())}
`);

}

// Release previously acquired key pair
const keyPairReleaseMessage = await Lightnet.releaseKeyPair({
  publicKey: feePayerAccount.toBase58(),
});
if (keyPairReleaseMessage) console.log(keyPairReleaseMessage);

// // initial state
// let b = zkApp.board.get();

// console.log('initial state of the zkApp');
// let zkAppState = Mina.getAccount(zkAppPublicKey);

// for (const i in [0, 1, 2, 3, 4, 5, 6, 7]) {
//   console.log('state', i, ':', zkAppState?.zkapp?.appState?.[i].toString());
// }

// console.log('\ninitial board');
// new Board(b).printState();

// // play
// console.log('\n\n====== FIRST MOVE ======\n\n');
// await makeMove(player1, player1Key, 0, 0);

// // debug
// b = zkApp.board.get();
// new Board(b).printState();

// // play
// console.log('\n\n====== SECOND MOVE ======\n\n');
// await makeMove(player2, player2Key, 1, 0);
// // debug
// b = zkApp.board.get();
// new Board(b).printState();

// // play
// console.log('\n\n====== THIRD MOVE ======\n\n');
// await makeMove(player1, player1Key, 1, 1);
// // debug
// b = zkApp.board.get();
// new Board(b).printState();

// // play
// console.log('\n\n====== FOURTH MOVE ======\n\n');
// await makeMove(player2, player2Key, 2, 1);

// // debug
// b = zkApp.board.get();
// new Board(b).printState();

// // play
// console.log('\n\n====== FIFTH MOVE ======\n\n');
// await makeMove(player1, player1Key, 2, 2);

// // debug
// b = zkApp.board.get();
// new Board(b).printState();

// let isNextPlayer2 = zkApp.nextIsPlayer2.get();

// console.log('did someone win?', isNextPlayer2 ? 'Player 1!' : 'Player 2!');
// // cleanup

// async function makeMove(
//   currentPlayer: PublicKey,
//   currentPlayerKey: PrivateKey,
//   x0: number,
//   y0: number
// ) {
//   const [x, y] = [Field(x0), Field(y0)];
//   const txn = await Mina.transaction(currentPlayer, async () => {
//     const signature = Signature.create(currentPlayerKey, [x, y]);
//     zkApp.play(currentPlayer, signature, x, y);
//   });
//   await txn.prove();
//   await txn.sign([currentPlayerKey]).send();
// }

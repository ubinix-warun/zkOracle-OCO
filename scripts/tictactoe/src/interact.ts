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
import { deploy, fetchTest, fetchTest2, getTxnUrl, isFileExists } from './utils.js';

import fs from 'fs/promises';

// Network configuration
const config = {
  network: {
    mina: 'http://localhost:8080/graphql',
    archive: 'http://localhost:8282',
    lightnetAccountManager: 'http://localhost:8181'
  },
  fee: Number("0.1") * 1e9 // in nanomina (1 billion = 1.0 mina)
};

const network = Mina.Network(config.network);
Mina.setActiveInstance(network);

// Fee payer setup
const feePayerPrivateKey = (await Lightnet.acquireKeyPair()).privateKey
const feePayerAccount = feePayerPrivateKey.toPublicKey();
console.log('Acquire feePayerPrivateKey ...');

// await fs.mkdir("keys");
if (!(await isFileExists('keys/tictactoe-zkApp.key'))) {
  
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppPublicKey = zkAppPrivateKey.toPublicKey();

  await fs.writeFile('keys/tictactoe-zkApp.key', JSON.stringify({
    privateKey: zkAppPrivateKey.toBase58(),
    publicKey: zkAppPublicKey
  }, null, 2))

  console.log('Generate zkAppPrivateKey ...');

}

let zkAppKeysBase58: { privateKey: string; publicKey: string } = 
JSON.parse(
  await fs.readFile('keys/tictactoe-zkApp.key', 'utf8')
);

console.log('Load zkAppPrivateKey ...');

const zkAppPrivateKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
const zkApp = new TicTacToe(zkAppPublicKey);

console.log('Compile the contract...');
await TicTacToe.compile();

if(process.argv[2] === "deploy")
{
  try {
    await deploy(config, feePayerPrivateKey, zkAppPrivateKey, zkApp, "TicTacToe");

  } catch (e) {
    console.log(e);
  }

}
else if(process.argv[2] === "dumpstate") 
{

  try {

  // await deploy(config, feePayerPrivateKey, zkAppPrivateKey, zkApp, "TicTacToe");

    await fetchTest();
    
    console.log(`initial state of the zkApp '${zkAppPublicKey.toBase58()}' = ${Mina.hasAccount(zkAppPublicKey)}`);
    let zkAppState = Mina.getAccount(zkAppPublicKey);

    for (const i in [0, 1, 2, 3, 4, 5, 6, 7]) {
      console.log('state', i, ':', zkAppState?.zkapp?.appState?.[i].toString());
    }
    
  } catch (e) {
    console.log(e);
  }
}
else if(process.argv[2] === "testgql") 
{

  try {

    await fetchTest2();    
    
  } catch (e) {
    console.log(e);
  }
}

// Release previously acquired key pair
const keyPairReleaseMessage = await Lightnet.releaseKeyPair({
  publicKey: feePayerAccount.toBase58(),
});
console.log('Release feePayerPrivateKey ...');
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

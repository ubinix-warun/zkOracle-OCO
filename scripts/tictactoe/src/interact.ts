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
  fetchAccount,
} from 'o1js';
import { TicTacToe, Board } from './tictactoe.js';
import { deploy, fetchTestGQL, initialKeyPairFromLightnet, initialZkAppKey, isFileExists, processTx } from './utils.js';

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

const feePayerBase58 = await initialKeyPairFromLightnet('keys/tictactoe-acquireFeePayer.key');
const feePayerPrivateKey = PrivateKey.fromBase58(feePayerBase58.privateKey);
const feePayerAccount = feePayerPrivateKey.toPublicKey();
console.log('Load feePayerPrivateKey ...');

const zkAppKeysBase58 = await initialZkAppKey('keys/tictactoe-zkApp.key');
console.log('Load zkAppPrivateKey ...');

const zkAppPrivateKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
const zkApp = new TicTacToe(zkAppPublicKey);

console.log('Compile the contract ...');
await TicTacToe.compile();

if(process.argv[2] === "deploy")
{
  try {
    await deploy(config, feePayerPrivateKey, 
        zkAppPrivateKey, zkApp, "Deploy TicTacToe");

  } catch (e) {
    console.log(e);
  }

}
else if(process.argv[2] === "play:demo") 
{

  try {

    // Player setup
    const player1PrivateKey = (await Lightnet.acquireKeyPair()).privateKey
    const player1PayerAccount = player1PrivateKey.toPublicKey();
    console.log('Acquire player1PrivateKey ...');

    const player2PrivateKey = (await Lightnet.acquireKeyPair()).privateKey
    const player2PayerAccount = player2PrivateKey.toPublicKey();
    console.log('Acquire player2PrivateKey ...');

    // Create a new instance of the contract
    console.log('\n\n====== START GAME ======\n\n');
    const sentTx = await Mina.transaction({ sender: feePayerPrivateKey.toPublicKey(), fee: config.fee }, () => {
      // AccountUpdate.fundNewAccount(feePayerPrivateKey.toPublicKey());
      zkApp.startGame(player1PayerAccount, player2PayerAccount);
    });

    await processTx(config, sentTx, [zkAppPrivateKey, feePayerPrivateKey], "Start Game -- TicTacToe");

    await fetchAccount({publicKey: zkAppPublicKey});
    let b = zkApp.board.get();
    
    console.log(`initial state of the zkApp '${zkAppPublicKey.toBase58()}' = ${Mina.hasAccount(zkAppPublicKey)}`);
    let zkAppState = Mina.getAccount(zkAppPublicKey);

    for (const i in [0, 1, 2, 3, 4, 5, 6, 7]) {
      console.log('state', i, ':', zkAppState?.zkapp?.appState?.[i].toString());
    }
    
    console.log('\ninitial board');
    new Board(b).printState();

    await fetchAccount({publicKey: player1PayerAccount});
    await fetchAccount({publicKey: player2PayerAccount});

    console.log(`player1 '${player1PayerAccount.toBase58()}' = ${Mina.getAccount(player1PayerAccount).balance}`);
    console.log(`player2 '${player2PayerAccount.toBase58()}' = ${Mina.getAccount(player2PayerAccount).balance}`);

    // play
    console.log('\n\n====== FIRST MOVE ======\n\n');
    await makeMove(player1PayerAccount, player1PrivateKey, 0, 0);
    await fetchAccount({publicKey: zkAppPublicKey});

    // debug
    b = zkApp.board.get();
    new Board(b).printState();

    // play
    console.log('\n\n====== SECOND MOVE ======\n\n');
    await makeMove(player2PayerAccount, player2PrivateKey, 1, 0);
    await fetchAccount({publicKey: zkAppPublicKey});
    // debug
    b = zkApp.board.get();
    new Board(b).printState();

    // play
    console.log('\n\n====== THIRD MOVE ======\n\n');
    await makeMove(player1PayerAccount, player1PrivateKey, 1, 1);
    await fetchAccount({publicKey: zkAppPublicKey});
    // debug
    b = zkApp.board.get();
    new Board(b).printState();

    // play
    console.log('\n\n====== FOURTH MOVE ======\n\n');
    await makeMove(player2PayerAccount, player2PrivateKey, 2, 1);

    // debug
    b = zkApp.board.get();
    new Board(b).printState();

    // play
    console.log('\n\n====== FIFTH MOVE ======\n\n');
    await makeMove(player1PayerAccount, player1PrivateKey, 2, 2);
    await fetchAccount({publicKey: zkAppPublicKey});

    // debug
    b = zkApp.board.get();
    new Board(b).printState();

    let isNextPlayer2 = zkApp.nextIsPlayer2.get();

    console.log('did someone win?', isNextPlayer2 ? 'Player 1!' : 'Player 2!');
    // cleanup

    // Release previously acquired key pair
    const keyPairPlayer1ReleaseMessage = await Lightnet.releaseKeyPair({
      publicKey: player1PayerAccount.toBase58(),
    });
    console.log('Release player1PayerAccount ...');
    if (keyPairPlayer1ReleaseMessage) console.log(keyPairPlayer1ReleaseMessage);

    // Release previously acquired key pair
    const keyPairPlayer2ReleaseMessage = await Lightnet.releaseKeyPair({
      publicKey: player2PayerAccount.toBase58(),
    });
    console.log('Release player2PayerAccount ...');
    if (keyPairPlayer2ReleaseMessage) console.log(keyPairPlayer2ReleaseMessage);
        
  } catch (e) {
    console.log(e);
  }
}
else if(process.argv[2] === "testgql") 
{

  try {

    await fetchTestGQL(); 
    // console.log(xyz?.data?.account?.zkappState);
    
  } catch (e) {
    console.log(e);
  }
}

async function makeMove(
  currentPlayer: PublicKey,
  currentPlayerKey: PrivateKey,
  x0: number,
  y0: number
) {
  const [x, y] = [Field(x0), Field(y0)];
  const txn = await Mina.transaction({ sender: currentPlayerKey.toPublicKey(), fee: config.fee }, async () => {
    const signature = Signature.create(currentPlayerKey, [x, y]);
    zkApp.play(currentPlayer, signature, x, y);
  });
  
  await processTx(config, txn, [currentPlayerKey], "makeMove -- TicTacToe");

}

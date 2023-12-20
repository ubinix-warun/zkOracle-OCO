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
    fetchEvents,
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

const zkAppKeysBase58 = await initialZkAppKey('keys/tictactoe-zkApp.key');
console.log('Load zkAppPrivateKey ...');

const zkAppPrivateKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
const zkApp = new TicTacToe(zkAppPublicKey);

console.log('Compile the contract ...');
await TicTacToe.compile();

// Fetch all events for a given address
const fetchedEvents = await fetchEvents({
    publicKey: zkAppPublicKey.toBase58(),
});

console.log(fetchedEvents);
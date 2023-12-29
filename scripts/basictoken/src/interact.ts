/**
 * This script can be used to interact with the Add contract, after deploying it.
 *
 * We call the update() method on the contract, create a proof and send it to the chain.
 * The endpoint that we interact with is read from your config.json.
 *
 * This simulates a user interacting with the zkApp from a browser, except that here, sending the transaction happens
 * from the script and we're using your pre-funded zkApp account to pay the transaction fee. In a real web app, the user's wallet
 * would send the transaction and pay the fee.
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/interact.js <deployAlias>`.
 */
import fs from 'fs/promises';
// import { deploy, fetchTestGQL, initialFeePayer, initialKey, initialKeyPairFromLightnet, initialPlayers, initialZkAppKey, isFileExists, processTx, sections } from './utils.js';
import { Toolkit } from "@zkoracle/opennautilus-contracts"

import { Mina, PrivateKey, Signature } from 'o1js';
import { buildBasicTokenContract } from './BasicTokenContract.js';

// Network configuration
let config = new Map([
  [
    "lightnet", {
      network: {
        mina: 'http://localhost:8080/graphql',
        archive: 'http://localhost:8282',
        lightnetAccountManager: 'http://localhost:8181'
      },
      fee: Number("0.1") * 1e9 // in nanomina (1 billion = 1.0 mina)
    }
  ],
  [
    "berkeley", {
      network: {
        mina: 'https://proxy.berkeley.minaexplorer.com/graphql',
        archive: 'https://api.minascan.io/archive/berkeley/v1/graphql/',
        // lightnetAccountManager: 'http://localhost:8181'
      },
      fee: Number("0.1") * 1e9 // in nanomina (1 billion = 1.0 mina)
    }
  ],
  [
    "testworld", {
      network: {
        mina: 'https://proxy.testworld.minaexplorer.com/graphql',
        archive: 'https://api.minascan.io/archive/testworld/v1/graphql/',
        // lightnetAccountManager: 'http://localhost:8181'
      },
      fee: Number("0.1") * 1e9 // in nanomina (1 billion = 1.0 mina)
    }
  ]
  
]);


const activeConfig = config.get(process.argv[2]) ;

if (activeConfig === undefined) {
  // console.log(commandLineUsage(sections));
  process.exit(1);
}

const network = Mina.Network(activeConfig.network);
Mina.setActiveInstance(network); 

let feePayerBase58 = await Toolkit.initialFeePayer(fs, process.argv[2]);

const feePayerPrivateKey = PrivateKey.fromBase58(feePayerBase58.privateKey);
const feePayerAccount = feePayerPrivateKey.toPublicKey();
console.log('Load feePayerPrivateKey ...');

const zkAppKeysBase58 = await Toolkit.initialZkAppKey(fs, 'keys/tictactoe-zkApp.key');
console.log('Load zkAppPrivateKey ...');

const zkAppPrivateKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
// const zkApp = new BasicTokenContract(zkAppPublicKey, {symbol: "MYTKN"});
// const zkApp = new BasicTokenContract(zkAppPublicKey);

console.log('Build the contract ... (BasicTokenContract)');
const zkApp = await buildBasicTokenContract(zkAppPublicKey, "MYTKN");  

// await BasicTokenContract.compile();

if(process.argv[3] === "deploy")
{
  try {
    await Toolkit.deploy(activeConfig, feePayerPrivateKey, 
        zkAppPrivateKey, zkApp, "Deploy BasicTokenContract");

  } catch (e) {
    console.log(e);
  }

} else if(process.argv[3] === "mint")
{
  try {

    // mint(
    //   receiverAddress: PublicKey,
    //   amount: UInt64,
    //   adminSignature: Signature
    // )
    
    // const adminAmount = amount.toFields().concat(receiverAddress.toFields())

    // const adminSignature = Signature.create(zkAppPrivateKey, adminAmount);

  } catch (e) {
    console.log(e);
  }
}
/**
 * This script can be used to interact with the Add contract, after deploying it.

 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/deploy.js <deployAlias>`.
 */
import fs from 'fs/promises';
import { AccountUpdate, Mina, PrivateKey, SmartContract, UInt64 } from 'o1js';

import { Erc20Contract } from './Erc20Contract.js';
// import { TicTacToe } from './tictactoe.js';

let indexedSmartContract = new Map<string, object>(
    [
        ["Erc20Contract", Erc20Contract],
        // ["TicTacToe", TicTacToe]
    ]
);



// check command line arg
let deployAlias = process.argv[2];
let smartContract = process.argv[3];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/deploy.js <deployAlias> <smartContract>
`);
Error.stackTraceLimit = 1000;


// parse config and private key from file
type Config = {
  deployAliases: Record<
    string,
    {
      url: string;
      keyPath: string;
      fee: string;
      feepayerKeyPath: string;
      feepayerAlias: string;
      archive: string;
    }
  >;
};
let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
let config = configJson.deployAliases[deployAlias];

// set up Mina instance and contract we interact with
const Network = Mina.Network({
    mina:config.url,
    archive:config.archive
});
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
Mina.setActiveInstance(Network);

let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
    await fs.readFile(config.feepayerKeyPath, 'utf8')
);

let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);

// if (!smartContract)
// {
//     // Deploy all.
    
// }

if(!indexedSmartContract.has(smartContract))
    throw Error(`Missing <smartContract> argument.

'${smartContract}' is not exists.
`);

function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
    const txnBroadcastServiceName = new URL(graphQlUrl).hostname
      .split('.')
      .filter((item) => item === 'minascan' || item === 'minaexplorer')?.[0];
    const networkName = new URL(graphQlUrl).hostname
      .split('.')
      .filter((item) => item === 'berkeley' || item === 'testworld')?.[0];
    if (txnBroadcastServiceName && networkName) {
      return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
    }
    return `Transaction hash: ${txnHash}`;
}

const zkAppPrivateKey = PrivateKey.random();
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
// let zkApp: SmartContract;


try {
  
//     if(smartContract==="Erc20Contract") {

//         zkApp = new Erc20Contract(zkAppPublicKey);
   
//        // compile the contract to create prover keys
//        console.log('Compile the contract...');
//        await Erc20Contract.compile();
//    }
   
//    if(smartContract==="TicTacToe") {
   
//        zkApp = new TicTacToe(zkAppPublicKey);
   
//       // compile the contract to create prover keys
//       console.log('Compile the contract...');
//       await TicTacToe.compile();
//    }


    // const zkApp = new TicTacToe(zkAppPublicKey);
    
    // compile the contract to create prover keys
    console.log('Compile the contract...');
    // await TicTacToe.compile();

    // Create a new instance of the contract
    const sentTx = await Mina.transaction({ sender: feepayerKey.toPublicKey(),fee: fee }, () => {
        AccountUpdate.fundNewAccount(feepayerKey);
        // zkApp.deploy();
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
    let pendingTx = await sentTx.sign([zkAppPrivateKey, feepayerKey]).send();

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
Success! Deploy ${smartContract} transaction sent.

Your smart contract state will be updated
as soon as the transaction is included in a block:
    ${getTxnUrl(config.url, pendingTx.hash())}
    `);

    }

} catch (err) {
    console.log(err);

}

// failureReason(s):  
// AccountUpdate #1 failed. Reason: "Cancelled", 
// AccountUpdate #2 failed. Reason: "Overflow", 
// AccountUpdate #3 failed. Reason: "Cancelled"






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
import { AccountUpdate, Mina, PrivateKey } from 'o1js';
import { Erc20Contract } from './Erc20Contract.js';

// check command line arg
let deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
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
    }
  >;
};
let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
let config = configJson.deployAliases[deployAlias];
let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.feepayerKeyPath, 'utf8')
);

let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.keyPath, 'utf8')
);

let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

// set up Mina instance and contract we interact with
const Network = Mina.Network(config.url);
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
Mina.setActiveInstance(Network);
let feepayerAddress = feepayerKey.toPublicKey();
let zkAppAddress = zkAppKey.toPublicKey();
let zkApp = new Erc20Contract(zkAppAddress);

let sentTx;
// compile the contract to create prover keys
console.log('compile the contract...');
await Erc20Contract.compile();

let personA = PrivateKey.fromBase58("EKEH6rMNoKeEBCjupw6zhx4drYA4LP8J3Eq4ipZBLTSM66gdRbqF");

try {
// call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction({ sender: feepayerAddress, fee }, () => {
    
    let feePayerUpdate = AccountUpdate.fundNewAccount(feepayerAddress, 3);
    feePayerUpdate.send({
      to: personA.toPublicKey(),
      amount: Mina.accountCreationFee(),
    });
    
  });
  await tx.prove();
  console.log('send transaction...');
  sentTx = await tx.sign([feepayerKey, zkAppKey]).send();
} catch (err) {
  console.log(err);
}

if (sentTx?.hash() !== undefined) {
  console.log(`
  Success! Deploy ERC20 transaction sent.

  Your smart contract state will be updated
  as soon as the transaction is included in a block:
    ${getTxnUrl(config.url, sentTx.hash())}
  `);
}

console.log(" personA = ", Mina.getBalance(personA.toPublicKey(), zkApp.tokenId).value.toBigInt());


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
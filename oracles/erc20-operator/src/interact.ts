import fs from 'fs/promises';
import { Toolkit, buildERC20Contract } from "@zkoracle/opennautilus-contracts"

import { Mina, PrivateKey, Signature } from 'o1js';

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

console.log('Build the contract ... (ERC20Contract)');
const zkApp = await buildERC20Contract(zkAppPublicKey, "MYTKN", "MYT", 9);

// await BasicTokenContract.compile();

if(process.argv[3] === "deploy")
{
  try {
    await Toolkit.deploy(activeConfig, feePayerPrivateKey, 
        zkAppPrivateKey, zkApp, "Deploy ERC20Contract");

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
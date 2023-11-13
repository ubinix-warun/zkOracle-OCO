import {
    UInt64,
    Mina,
    PrivateKey,
    AccountUpdate,
    PublicKey,
    Field,
    Experimental,
    TokenId,
    SmartContract,
    method,
    UInt32,
    CircuitString,
} from 'o1js';
  
// Credit: https://github.com/o1-labs/o1js/blob/a73937d4a1870cfab51c525b5246e1e2f2b9207f/src/lib/token.test.ts

// import { TokenContract } from './TokenContract';
// import { Erc20Contract } from './Erc20Contract';
// import { Erc677Contract } from './Erc677Contract';
// import { OracleContract } from './OracleContract';
import { BasicRequestClient } from './BasicRequestClient';
  
export const tokenSymbol = 'TOKEN';

class ZkAppB extends SmartContract {
  @method approveZkapp(amount: UInt64) {
    this.balance.subInPlace(amount);
  }
}

class ZkAppC extends SmartContract {
  @method approveZkapp(amount: UInt64) {
    this.balance.subInPlace(amount);
  }

  @method approveIncorrectLayout(amount: UInt64) {
    this.balance.subInPlace(amount);
    let update = AccountUpdate.defaultAccountUpdate(this.address);
    this.self.approve(update);
  }
}
  
let feePayerKey: PrivateKey;
let feePayer: PublicKey;
let tokenZkappKey: PrivateKey;
let tokenZkappAddress: PublicKey;
let basicReqZkapp: BasicRequestClient;
let tokenId: Field;

let zkAppBKey: PrivateKey;
let zkAppBAddress: PublicKey;
let zkAppB: ZkAppB;

let zkAppCKey: PrivateKey;
let zkAppCAddress: PublicKey;
let zkAppC: ZkAppC;

let zkOracleKey: PrivateKey;
let zkOracleAddress: PublicKey;
let zkBasicReq: BasicRequestClient;

function setupAccounts() {
  let Local = Mina.LocalBlockchain({
    proofsEnabled: true,
    enforceTransactionLimits: false,
  });
  Mina.setActiveInstance(Local);
  feePayerKey = Local.testAccounts[0].privateKey;
  feePayer = Local.testAccounts[0].publicKey;

  tokenZkappKey = PrivateKey.random();
  tokenZkappAddress = tokenZkappKey.toPublicKey();

  basicReqZkapp = new BasicRequestClient(tokenZkappAddress);
  // tokenId = basicReqZkapp.token.id;

  zkAppBKey = Local.testAccounts[1].privateKey;
  zkAppBAddress = zkAppBKey.toPublicKey();
  zkAppB = new ZkAppB(zkAppBAddress, tokenId);

  zkAppCKey = Local.testAccounts[2].privateKey;
  zkAppCAddress = zkAppCKey.toPublicKey();
  zkAppC = new ZkAppC(zkAppCAddress, tokenId);

  return Local;
}

async function setupLocal() {
  setupAccounts();
  let tx = await Mina.transaction(feePayer, () => {
    let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer);
    feePayerUpdate.send({
      to: tokenZkappAddress,
      amount: Mina.accountCreationFee(),
    });
    basicReqZkapp.deploy();
  });
  tx.sign([tokenZkappKey, feePayerKey]);
  await tx.send();

  // let tx2 = await Mina.transaction(feePayer, () => {
  //   let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer);
  //   feePayerUpdate.send({
  //     to: zkOracleAddress,
  //     amount: Mina.accountCreationFee(),
  //   });
  //   zkOracle.deploy();
  // });
  // tx2.sign([zkOracleKey, feePayerKey]);
  // await tx2.send();

}

async function setupLocalProofs() {
  let Local = setupAccounts();
  zkAppC = new ZkAppC(zkAppCAddress, tokenId);
  // don't use proofs for the setup, takes too long to do this every time
  Local.setProofsEnabled(false);
  let tx = await Mina.transaction({ sender: feePayer }, () => {
    let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer, 3);
    feePayerUpdate.send({
      to: tokenZkappAddress,
      amount: Mina.accountCreationFee(),
    });
    basicReqZkapp.deploy();
    // tokenZkapp.deployZkapp(zkAppBAddress, ZkAppB._verificationKey!);
    // tokenZkapp.deployZkapp(zkAppCAddress, ZkAppC._verificationKey!);
  });
  await tx.prove();
  tx.sign([tokenZkappKey, zkAppBKey, zkAppCKey, feePayerKey]);
  await tx.send();
  Local.setProofsEnabled(true);
}

describe('BasicRequest (Client)', () => {
  beforeAll(async () => {
    // await TokenContract.compile();
    await BasicRequestClient.compile();
    await ZkAppB.compile();
    await ZkAppC.compile();
  });

  describe('Signature Authorization ', () => {


  });
});
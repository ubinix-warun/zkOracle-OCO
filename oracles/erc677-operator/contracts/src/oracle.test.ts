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

import { OracleContract } from './OracleContract';
  
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
let oracleZkappKey: PrivateKey;
let oracleZkappAddress: PublicKey;
let oracleZkapp: OracleContract;
let oracleId: Field;

let zkAppBKey: PrivateKey;
let zkAppBAddress: PublicKey;
let zkAppB: ZkAppB;

let zkAppCKey: PrivateKey;
let zkAppCAddress: PublicKey;
let zkAppC: ZkAppC;

let zkOracleKey: PrivateKey;
let zkOracleAddress: PublicKey;
let zkOracle: OracleContract;

function setupAccounts() {
  let Local = Mina.LocalBlockchain({
    proofsEnabled: true,
    enforceTransactionLimits: false,
  });
  Mina.setActiveInstance(Local);
  feePayerKey = Local.testAccounts[0].privateKey;
  feePayer = Local.testAccounts[0].publicKey;

  oracleZkappKey = PrivateKey.random();
  oracleZkappAddress = oracleZkappKey.toPublicKey();

  oracleZkapp = new OracleContract(oracleZkappAddress);
  oracleId = oracleZkapp.token.id;

  zkAppBKey = Local.testAccounts[1].privateKey;
  zkAppBAddress = zkAppBKey.toPublicKey();
  // zkAppB = new ZkAppB(zkAppBAddress, tokenId);

  zkAppCKey = Local.testAccounts[2].privateKey;
  zkAppCAddress = zkAppCKey.toPublicKey();
  // zkAppC = new ZkAppC(zkAppCAddress, tokenId);

  return Local;
}

async function setupLocal() {
  setupAccounts();
  let tx = await Mina.transaction(feePayer, () => {
    let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer);
    feePayerUpdate.send({
      to: oracleZkappAddress,
      amount: Mina.accountCreationFee(),
    });
    oracleZkapp.deploy();
  });
  tx.sign([oracleZkappKey, feePayerKey]);
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
  // zkAppC = new ZkAppC(zkAppCAddress, tokenId);
  // don't use proofs for the setup, takes too long to do this every time
  Local.setProofsEnabled(false);
  let tx = await Mina.transaction({ sender: feePayer }, () => {
    let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer, 3);
    feePayerUpdate.send({
      to: oracleZkappAddress,
      amount: Mina.accountCreationFee(),
    });
    oracleZkapp.deploy();
    // tokenZkapp.deployZkapp(zkAppBAddress, ZkAppB._verificationKey!);
    // tokenZkapp.deployZkapp(zkAppCAddress, ZkAppC._verificationKey!);
  });
  await tx.prove();
  tx.sign([oracleZkappKey, zkAppBKey, zkAppCKey, feePayerKey]);
  await tx.send();
  Local.setProofsEnabled(true);
}

describe('Oracle', () => {
  beforeAll(async () => {
    // await TokenContract.compile();
    await OracleContract.compile();
    await ZkAppB.compile();
    await ZkAppC.compile();
  });

  describe('Signature Authorization ', () => {

    /*
      test case description:
      Check token contract can be deployed and initialized
      tested cases:
        - create a new token
        - deploy a zkApp under a custom token
        - create a new valid token with a different parentTokenId
        - set the token symbol after deployment
    */
    describe('Token Contract Creation/Deployment', () => {
      beforeEach(async () => {
        await setupLocal();
      });

      test('correct oracle id can be derived with an existing token owner', () => {
        expect(oracleId).toEqual(TokenId.derive(oracleZkappAddress));
      });

      test('deployed token contract exists in the ledger', () => {
        expect(Mina.getAccount(oracleZkappAddress, oracleId)).toBeDefined();
      });

      // test('setting a valid token symbol on a token contract', async () => {
      //   await (
      //     await Mina.transaction({ sender: feePayer }, () => {
      //       let oracleZkapp = AccountUpdate.createSigned(oracleZkappAddress);
      //       oracleZkapp.account.tokenSymbol.set(tokenSymbol);
      //     })
      //   )
      //     .sign([feePayerKey, oracleZkappKey])
      //     .send();
      //   const symbol = Mina.getAccount(oracleZkappAddress).tokenSymbol;
      //   expect(tokenSymbol).toBeDefined();
      //   expect(symbol).toEqual(tokenSymbol);
      // });
    });
    
  });
});
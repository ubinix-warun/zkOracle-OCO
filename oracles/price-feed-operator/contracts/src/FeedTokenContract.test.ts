import { FeedTokenContract } from './FeedTokenContract.js';
import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  UInt64,
  Signature,
  Field,
} from 'o1js';


// // let feePayerKey: PrivateKey;
// // let feePayer: PublicKey;
// // let tokenZkappKey: PrivateKey;
// // let tokenZkappAddress: PublicKey;
// // let tokenZkapp: FeedTokenContract;
// // let tokenId: Field;

// // let zkAppBKey: PrivateKey;
// // let zkAppBAddress: PublicKey;
// // let zkAppB: ZkAppB;

// // let zkAppCKey: PrivateKey;
// // let zkAppCAddress: PublicKey;
// // let zkAppC: ZkAppC;

// function setupAccounts() {
//   let Local = Mina.LocalBlockchain({
//     proofsEnabled: true,
//     enforceTransactionLimits: false,
//   });
//   Mina.setActiveInstance(Local);
//   feePayerKey = Local.testAccounts[0].privateKey;
//   feePayer = Local.testAccounts[0].publicKey;

//   tokenZkappKey = PrivateKey.random();
//   tokenZkappAddress = tokenZkappKey.toPublicKey();

//   tokenZkapp = new FeedTokenContract(tokenZkappAddress);
//   tokenId = tokenZkapp.token.id;

//   // zkAppBKey = Local.testAccounts[1].privateKey;
//   // zkAppBAddress = zkAppBKey.toPublicKey();
//   // zkAppB = new ZkAppB(zkAppBAddress, tokenId);

//   // zkAppCKey = Local.testAccounts[2].privateKey;
//   // zkAppCAddress = zkAppCKey.toPublicKey();
//   // zkAppC = new ZkAppC(zkAppCAddress, tokenId);

//   return Local;
// }

// // async function localDeploy(
// //   zkAppInstance: FeedTokenContract,
// //   zkAppPrivateKey: PrivateKey,
// //   deployerAccount: PrivateKey,
// //   verificationKey: {
// //     data: string;
// //     hash: Field;
// //   }
// // ) {
// //   const deploy_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
// //     AccountUpdate.fundNewAccount(deployerAccount.toPublicKey());
// //     zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
// //   });
// //   await deploy_txn.prove();
// //   await deploy_txn.sign([deployerAccount]).send();

// // }

// async function setupLocal() {
//   setupAccounts();
//   let tx = await Mina.transaction(feePayer, () => {
//     let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer);
//     feePayerUpdate.send({
//       to: tokenZkappAddress,
//       amount: Mina.accountCreationFee(),
//     });
//     tokenZkapp.deploy();
//   });
//   tx.sign([tokenZkappKey, 
//     feePayerKey]);
//   await tx.send();
// }

// async function setupLocalProofs() {
//   let Local = setupAccounts();
//   // // zkAppC = new ZkAppC(zkAppCAddress, tokenId);
//   // don't use proofs for the setup, takes too long to do this every time
//   Local.setProofsEnabled(false);
//   let tx = await Mina.transaction({ sender: feePayer }, () => {
//     let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer, 3);
//     feePayerUpdate.send({
//       to: tokenZkappAddress,
//       amount: Mina.accountCreationFee(),
//     });
//     tokenZkapp.deploy();
//     // // tokenZkapp.deployZkapp(zkAppBAddress, ZkAppB._verificationKey!);
//     // // tokenZkapp.deployZkapp(zkAppCAddress, ZkAppC._verificationKey!);
//   });
//   await tx.prove();
//   tx.sign([tokenZkappKey, 
//     // zkAppBKey, zkAppCKey, 
//     feePayerKey]);
//   await tx.send();
//   Local.setProofsEnabled(true);
// }

function createLocalBlockchain() {
  let Local = Mina.LocalBlockchain({
    proofsEnabled: true,
    enforceTransactionLimits: false,
  });
  Mina.setActiveInstance(Local);
  // feePayerKey = Local.testAccounts[0].privateKey;
  // feePayer = Local.testAccounts[0].publicKey;

  return Local.testAccounts[0].privateKey;
}

async function localDeploy(
  zkAppInstance: FeedTokenContract,
  zkAppPrivatekey: PrivateKey,
  deployerAccount: PrivateKey
) {
  // let tx = await Mina.transaction(deployerAccount, () => {
  //   let feePayerUpdate = AccountUpdate.fundNewAccount(deployerAccount);
  //   feePayerUpdate.send({
  //     to: zkAppPrivatekey.toPublicKey(),
  //     amount: Mina.accountCreationFee(),
  //   });
  //   zkAppInstance.deploy();
  // });
  // tx.sign([tokenZkappKey, deployerAccount]);
  // await tx.send();

}

describe('FeedToken', () => {

  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    verificationKeyCompiled: {
      data: string;
      hash: Field;
    }

  beforeAll(async () => {
    let { verificationKey } = await FeedTokenContract.compile();
    verificationKeyCompiled = verificationKey;

    // await ZkAppB.compile();
    // await ZkAppC.compile();
  });

  afterAll(async () => {
    // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
    // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
    // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
    setTimeout(shutdown, 0);
  });

  describe('Signature Authorization', () => {
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
        // await setupLocal();
        deployerAccount = createLocalBlockchain();
        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();

      });

      test('correct token id can be derived with an existing token owner', () => {
        // expect(tokenId).toEqual(TokenId.derive(tokenZkappAddress));
        it.todo('should be correct');
      });
    });

  });

});

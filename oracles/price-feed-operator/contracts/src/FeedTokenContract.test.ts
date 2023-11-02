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
  TokenId,
} from 'o1js';
import { Erc20Contract } from './feedERC20.js';


function createLocalBlockchain() {
  let Local = Mina.LocalBlockchain({
    // proofsEnabled: true,
    proofsEnabled: false,
    enforceTransactionLimits: false,
  });
  Mina.setActiveInstance(Local);

  return Local.testAccounts[0].privateKey; // feePayerKey => deployerAccount
}

async function localDeploy(
  zkAppInstance: FeedTokenContract,
  zkAppPrivatekey: PrivateKey,
  deployerAccount: PrivateKey
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy();
  });
  await txn.prove();
  await txn.sign([deployerAccount, zkAppPrivatekey]).send();
  // txn.sign([zkAppPrivatekey]);
  // await txn.send();
}


describe('FeedToken', () => {

  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey;

  beforeAll(async () => {
    await Erc20Contract.compile();
    await FeedTokenContract.compile();

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
        zkAppPrivateKey = PrivateKey.random(); // tokenZkappKey
        zkAppAddress = zkAppPrivateKey.toPublicKey(); // tokenZkappAddress

      });

      test('correct token id can be derived with an existing token owner', async () => {
        const zkAppInstance = new FeedTokenContract(zkAppAddress);
        await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);

        // console.log(zkAppInstance.tokenId.toString());
        // expect(zkAppInstance.tokenId.toString()).toEqual(TokenId.derive(zkAppAddress));
      });
    });

  });

});

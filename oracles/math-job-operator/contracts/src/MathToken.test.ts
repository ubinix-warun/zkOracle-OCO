import { MathToken } from './MathToken';
import { Field, Mina, 
  TokenId, UInt64,
  PrivateKey, PublicKey, AccountUpdate, 
  SmartContract, method } from 'o1js';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

class ZkAppB extends SmartContract {
  @method approveZkapp(amount: UInt64) {
    this.balance.subInPlace(amount);
  }
}

let proofsEnabled = false;

describe('MathToken', () => {
  let feePayer: PublicKey,
    feePayerKey: PrivateKey,
    tokenZkappAddress: PublicKey,
    tokenZkappKey: PrivateKey,
    zkAppBAddress: PublicKey,
    zkAppBKey: PrivateKey,

    tokenZkapp: MathToken,
    tokenId: Field,
    
    zkAppB: ZkAppB;

  beforeAll(async () => {
    if (proofsEnabled) await MathToken.compile();
  });

  async function setupAccounts() {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: feePayerKey, publicKey: feePayer } =
      Local.testAccounts[0]);
    tokenZkappKey = PrivateKey.random();
    tokenZkappAddress = tokenZkappKey.toPublicKey();

    tokenZkapp = new MathToken(tokenZkappAddress); // tokenZkapp
    tokenId = tokenZkapp.token.id;

    ({ privateKey: zkAppBKey, publicKey: zkAppBAddress } =
      Local.testAccounts[1]);

    zkAppB = new ZkAppB(zkAppBAddress, tokenId);

  }

  async function localDeploy() {

    setupAccounts();
 
    const txn = await Mina.transaction(feePayer, () => {
      let deployerUpdate = AccountUpdate.fundNewAccount(feePayer);
      // let deployerUpdate = AccountUpdate.fundNewAccount(deployerAccount);
      deployerUpdate.send({
        to: tokenZkappAddress,  
        amount: Mina.accountCreationFee(),
      });
      // deployerUpdate.send({
      //   to: senderAccount,  
      //   amount: Mina.accountCreationFee(),
      // });
      tokenZkapp.deploy();
      tokenZkapp.deployZkapp(zkAppBAddress, ZkAppB._verificationKey!);
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([feePayerKey, tokenZkappKey]).send();

  }

  const tokenSymbol = 'TOKEN';

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
        await localDeploy();
      });

      test('correct token id can be derived with an existing token owner', () => {
        expect(tokenId).toEqual(TokenId.derive(tokenZkappAddress));
      });

      // test('deployed token contract exists in the ledger', () => {
      //   expect(Mina.getAccount(zkAppAddress, tokenId)).toBeDefined();
      // });

      test('setting a valid token symbol on a token contract', async () => {
        await (
          await Mina.transaction({ sender: feePayer }, () => {
            let tokenZkapp = AccountUpdate.createSigned(tokenZkappAddress);
            tokenZkapp.account.tokenSymbol.set(tokenSymbol);
          })
        )
          .sign([feePayerKey, tokenZkappKey])
          .send();
        const symbol = Mina.getAccount(tokenZkappAddress).tokenSymbol;
        expect(tokenSymbol).toBeDefined();
        expect(symbol).toEqual(tokenSymbol);
      });

    });

    /*
      test case description:
      token contract can mint new tokens with a signature
      tested cases:
        - mints and updates the token balance of the receiver
        - fails if we mint over an overflow amount
    */
    describe('Mint token', () => {
      beforeEach(async () => {
        await localDeploy();
      });

      test('token contract can successfully mint and updates the balances in the ledger (signature)', async () => {
        await (
          await Mina.transaction({ sender: feePayer }, () => {
            AccountUpdate.fundNewAccount(feePayer);
            tokenZkapp.mint(zkAppBAddress, UInt64.from(100_000));
            // tokenZkapp.requireSignature();
          })
        )
          .sign([feePayerKey, tokenZkappKey])
          .send();
        expect(
          Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
        ).toEqual(100_000n);
      });
      
       
    });

  });

});

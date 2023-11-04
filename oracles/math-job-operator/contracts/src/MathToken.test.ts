import { MathToken } from './MathToken';
import { Field, Mina, 
  TokenId,
  PrivateKey, PublicKey, AccountUpdate } from 'o1js';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('MathToken', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: MathToken,
    tokenId: Field;

  beforeAll(async () => {
    if (proofsEnabled) await MathToken.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new MathToken(zkAppAddress);

    tokenId = zkApp.token.id;
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      let deployerUpdate = AccountUpdate.fundNewAccount(deployerAccount);
      // deployerUpdate.send({
      //   to: zkAppAddress,  
      //   amount: Mina.accountCreationFee(),
      // });
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  const tokenSymbol = 'TOKEN';

  // it('generates and deploys the `MathToken` smart contract', async () => {
  //   await localDeploy();
  //   const num = zkApp.num.get();
  //   expect(num).toEqual(Field(1));
  // });

  // it('correctly updates the num state on the `MathToken` smart contract', async () => {
  //   await localDeploy();

  //   // update transaction
  //   const txn = await Mina.transaction(senderAccount, () => {
  //     zkApp.update();
  //   });
  //   await txn.prove();
  //   await txn.sign([senderKey]).send();

  //   const updatedNum = zkApp.num.get();
  //   expect(updatedNum).toEqual(Field(3));
  // });

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
        expect(tokenId).toEqual(TokenId.derive(zkAppAddress));
      });

      // test('deployed token contract exists in the ledger', () => {
      //   expect(Mina.getAccount(zkAppAddress, tokenId)).toBeDefined();
      // });

      test('setting a valid token symbol on a token contract', async () => {
        await (
          await Mina.transaction({ sender: deployerAccount }, () => {
            let tokenZkapp = AccountUpdate.createSigned(zkAppAddress);
            tokenZkapp.account.tokenSymbol.set(tokenSymbol);
          })
        )
          .sign([deployerKey, zkAppPrivateKey])
          .send();
        const symbol = Mina.getAccount(zkAppAddress).tokenSymbol;
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
      // beforeEach(async () => {
      //   await localDeploy();
      // });

      // test('token contract can successfully mint and updates the balances in the ledger (signature)', async () => {
      //   await (
      //     await Mina.transaction({ sender: deployerAccount }, () => {
      //       AccountUpdate.fundNewAccount(deployerAccount);
      //       tokenZkapp.mint(zkAppBAddress, UInt64.from(100_000));
      //       tokenZkapp.requireSignature();
      //     })
      //   )
      //     .sign([deployerKey, zkAppPrivateKey])
      //     .send();
      //   expect(
      //     Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
      //   ).toEqual(100_000n);
      // });

       
    });

  });

});

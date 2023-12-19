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
import { Erc677Contract } from './Erc677Contract';
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
let tokenZkappKey: PrivateKey;
let tokenZkappAddress: PublicKey;
// let tokenZkapp: TokenContract;
// let tokenZkapp: Erc20Contract;
let tokenZkapp: Erc677Contract;
let tokenId: Field;

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

  tokenZkappKey = PrivateKey.random();
  tokenZkappAddress = tokenZkappKey.toPublicKey();

  // tokenZkapp = new TokenContract(tokenZkappAddress);
  // tokenZkapp = new Erc20Contract(tokenZkappAddress);
  tokenZkapp = new Erc677Contract(tokenZkappAddress);
  tokenId = tokenZkapp.token.id;

  zkAppBKey = Local.testAccounts[1].privateKey;
  zkAppBAddress = zkAppBKey.toPublicKey();
  zkAppB = new ZkAppB(zkAppBAddress, tokenId);

  zkAppCKey = Local.testAccounts[2].privateKey;
  zkAppCAddress = zkAppCKey.toPublicKey();
  zkAppC = new ZkAppC(zkAppCAddress, tokenId);

  zkOracleKey = Local.testAccounts[3].privateKey;
  zkOracleAddress = zkOracleKey.toPublicKey();
  zkOracle = new OracleContract(zkOracleAddress, tokenId);
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
    tokenZkapp.deploy();
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
    tokenZkapp.deploy();
    tokenZkapp.deployZkapp(zkAppBAddress, ZkAppB._verificationKey!);
    tokenZkapp.deployZkapp(zkAppCAddress, ZkAppC._verificationKey!);
  });
  await tx.prove();
  tx.sign([tokenZkappKey, zkAppBKey, zkAppCKey, feePayerKey]);
  await tx.send();
  Local.setProofsEnabled(true);
}

describe('Token (Erc677)', () => {
  beforeAll(async () => {
    // await TokenContract.compile();
    await Erc677Contract.compile();
    await ZkAppB.compile();
    await ZkAppC.compile();
    await OracleContract.compile();
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

      test('correct token id can be derived with an existing token owner', () => {
        expect(tokenId).toEqual(TokenId.derive(tokenZkappAddress));
      });

      test('deployed token contract exists in the ledger', () => {
        expect(Mina.getAccount(tokenZkappAddress, tokenId)).toBeDefined();
      });

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
    
    describe('Transfer', () => {
        beforeEach(async () => {
          await setupLocal();
        });
        
        test('transfer token account B to C should be 90K and 10K', async () => {
            let tx = await Mina.transaction(feePayer, () => {
              AccountUpdate.fundNewAccount(feePayer);
              tokenZkapp.mint(zkAppBAddress, UInt64.from(100_000));
              tokenZkapp.requireSignature();
            });
            await tx.sign([feePayerKey, tokenZkappKey]).send();
    
            tx = await Mina.transaction(zkAppBAddress, () => {
              AccountUpdate.fundNewAccount(zkAppBAddress);
              tokenZkapp.transfer(
                zkAppCAddress,
                UInt64.from(10_000),
              ); // .token.send
              tokenZkapp.requireSignature();
            });
            tx.sign([zkAppBKey, zkAppCKey, feePayerKey, tokenZkappKey]);
            await tx.send();

            expect(
              Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
            ).toEqual(90_000n);
            expect(
              Mina.getBalance(zkAppCAddress, tokenId).value.toBigInt()
            ).toEqual(10_000n);
        });
  
        test('transfer token B to C and e\'Transfer\' should be 90K and 10K', async () => {
            let tx = await Mina.transaction(feePayer, () => {
              AccountUpdate.fundNewAccount(feePayer);
              tokenZkapp.mint(zkAppBAddress, UInt64.from(100_000));
              tokenZkapp.requireSignature();
            });
            await tx.sign([feePayerKey, tokenZkappKey]).send();
    
            tx = await Mina.transaction(zkAppBAddress, () => {
              AccountUpdate.fundNewAccount(zkAppBAddress);
              tokenZkapp.transfer(
                zkAppCAddress,
                UInt64.from(10_000),
              ); // .token.send
              tokenZkapp.requireSignature();
            });
            tx.sign([zkAppBKey, zkAppCKey, feePayerKey, tokenZkappKey]);
            await tx.send();
    
            const events = await tokenZkapp.fetchEvents(UInt32.from(0));
            expect(events[0].type).toEqual('Transfer');

            expect(
              Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
            ).toEqual(90_000n);
            expect(
              Mina.getBalance(zkAppCAddress, tokenId).value.toBigInt()
            ).toEqual(10_000n);
        });

    });

    describe('TransferAndCall', () =>{
        beforeEach(async () => {
          await setupLocal();
        });
  
        test('token contract can successfully mint and transferAndCall to oracle (signature)', async () => {
          await (
            await Mina.transaction({ sender: feePayer }, () => {
              AccountUpdate.fundNewAccount(feePayer);
              tokenZkapp.mint(zkAppBAddress, UInt64.from(200_000));
              tokenZkapp.requireSignature();
            })
          )
            .sign([feePayerKey, tokenZkappKey])
            .send();
          expect(
            Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
          ).toEqual(200_000n);

          let tx = await Mina.transaction(zkAppBAddress, () => {
            AccountUpdate.fundNewAccount(zkAppBAddress);
            tokenZkapp.transferAndCall(
              zkAppCAddress,
              UInt64.from(10_000),
              CircuitString.fromString('REQUEST')
            ); // .token.send
            tokenZkapp.requireSignature();
          });
          await tx.prove();
          tx.sign([zkAppBKey, zkAppCKey, feePayerKey, tokenZkappKey]);
          await tx.send();

          // let tx = await Mina.transaction(zkAppBAddress, () => {
          //   // AccountUpdate.fundNewAccount(zkAppBAddress);
          //   tokenZkapp.transferAndCall(
          //     zkOracleAddress,
          //     UInt64.from(10_000),
          //     CircuitString.fromString('REQUEST')
          //   ); // .token.send
          //   // tokenZkapp.requireSignature();
          // });
          // await tx.prove();
          // tx.sign([zkAppBKey, tokenZkappKey]);
          // // tx.sign([zkAppBKey, zkOracleKey, feePayerKey, tokenZkappKey]);
          // await tx.send();
  
          const events = await tokenZkapp.fetchEvents(UInt32.from(0));
          expect(events[0].type).toEqual('TransferAndCall');

          expect(
            Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
          ).toEqual(190_000n);
          expect(
            Mina.getBalance(zkOracleAddress, tokenId).value.toBigInt()
          ).toEqual(10_000n);
        });

        // test('token contract can successfully mint and transferAndCall with JSON b64 to oracle (signature)', async () => {
        //   await (
        //     await Mina.transaction({ sender: feePayer }, () => {
        //       AccountUpdate.fundNewAccount(feePayer);
        //       tokenZkapp.mint(zkAppBAddress, UInt64.from(200_000));
        //       tokenZkapp.requireSignature();
        //     })
        //   )
        //     .sign([feePayerKey, tokenZkappKey])
        //     .send();
        //   expect(
        //     Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
        //   ).toEqual(200_000n);

        //   var obj = {a: 'a', b: 'b'};
        //   var encoded = btoa(JSON.stringify(obj));

        //   console.log(encoded);

        //   let tx = await Mina.transaction(zkAppBAddress, () => {
        //     AccountUpdate.fundNewAccount(zkAppBAddress);
        //     tokenZkapp.transferAndCall(
        //       zkOracleAddress,
        //       UInt64.from(10_000),
        //       CircuitString.fromString(encoded)
        //     ); // .token.send
        //     tokenZkapp.requireSignature();
        //   });
        //   await tx.prove();
        //   tx.sign([zkAppBKey, zkOracleKey, feePayerKey, tokenZkappKey]);
        //   await tx.send();
  
        //   const events = await tokenZkapp.fetchEvents(UInt32.from(0));
        //   expect(events[0].type).toEqual('TransferAndCall');

        //   expect(
        //     Mina.getBalance(zkAppBAddress, tokenId).value.toBigInt()
        //   ).toEqual(190_000n);
        //   expect(
        //     Mina.getBalance(zkOracleAddress, tokenId).value.toBigInt()
        //   ).toEqual(10_000n);
        // });


    });
  });
});
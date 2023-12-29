import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, SmartContract } from 'o1js';
import { buildBasicTokenContract } from './BasicTokenContract.js';

const tokenSymbol = "MYS";


let 
    player1: PublicKey,
  player1Key: PrivateKey,
//   player2: PublicKey,
//   player2Key: PrivateKey,
  zkAppAddress: PublicKey,
  zkAppPrivateKey: PrivateKey;

let zkApp: SmartContract;
let verificationKey: {
    data: string,
    hash: string | Field
};


async function setupAccounts() {
  let Local = Mina.LocalBlockchain({
    proofsEnabled: true,
    enforceTransactionLimits: false,
  });
  Mina.setActiveInstance(Local);
  player1Key = Local.testAccounts[0].privateKey;
  player1 = Local.testAccounts[0].publicKey;

//   player2Key = Local.testAccounts[1].privateKey;
//   player2 = Local.testAccounts[1].publicKey;

  zkAppPrivateKey = PrivateKey.random();
  zkAppAddress = zkAppPrivateKey.toPublicKey();

//   zkApp = new BasicTokenContract(zkAppAddress,
        //  {symbol: tokenSymbol});
  zkApp = await buildBasicTokenContract(zkAppAddress, tokenSymbol);  

}

async function setupLocal() {
    let tx = await Mina.transaction(player1, () => {
        let feePayerUpdate = AccountUpdate.fundNewAccount(player1);
        feePayerUpdate.send({
          to: zkAppAddress,
          amount: Mina.accountCreationFee(),
        });
        zkApp.deploy();
    });
    await tx.prove();
    tx.sign([zkAppPrivateKey, player1Key]);
    await tx.send();
}

describe('BasicTokenContract', () => {
  beforeAll(async () => {
    // await BasicTokenContract.compile();
    await setupAccounts();
  });

  beforeEach(async () => {
    await setupLocal();
  });

  describe('BasicTokenContract.ts()', () => {
    it.todo('should be correct');
  });

  describe('', () => {
    test('setting a valid token symbol on a token contract', async () => {
        // await (
        //   await Mina.transaction({ sender: player1 }, () => {
        //     let tokenZkapp = AccountUpdate.createSigned(zkAppAddress);
        //     // tokenZkapp.account.tokenSymbol.set(tokenSymbol);
        //   })
        // )
        //   .sign([feePayerKey, tokenZkappKey])
        //   .send();
        const symbol = Mina.getAccount(zkAppAddress).tokenSymbol;
        console.log(symbol);

        // expect(tokenSymbol).toBeDefined();
        // expect(symbol).toEqual(tokenSymbol);
      });
  });
  
});
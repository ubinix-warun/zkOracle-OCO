import { TicTacToe } from './tictactoe';
import { TicTacToeProxy } from './proxy';
import {
  Field,
  Bool,
  PrivateKey,
  PublicKey,
  Mina,
  AccountUpdate,
  Signature,
  fetchAccount,
} from 'o1js';

let player1: PublicKey,
  player1Key: PrivateKey,
  player2: PublicKey,
  player2Key: PrivateKey,
  zkAppAddress: PublicKey,
  zkAppPrivateKey: PrivateKey,
  zkAppProxyAddress: PublicKey,
  zkAppProxyPrivateKey: PrivateKey;

let zkApp: TicTacToe;
let zkAppProxy: TicTacToeProxy;

function setupAccounts() {
  let Local = Mina.LocalBlockchain({
    proofsEnabled: true,
    enforceTransactionLimits: false,
  });
  Mina.setActiveInstance(Local);
  player1Key = Local.testAccounts[0].privateKey;
  player1 = Local.testAccounts[0].publicKey;

  player2Key = Local.testAccounts[1].privateKey;
  player2 = Local.testAccounts[1].publicKey;

  zkAppPrivateKey = PrivateKey.random();
  zkAppAddress = zkAppPrivateKey.toPublicKey();

  zkAppProxyPrivateKey = PrivateKey.random();
  zkAppProxyAddress = zkAppProxyPrivateKey.toPublicKey();

  zkApp = new TicTacToe(zkAppAddress);
  zkAppProxy = new TicTacToeProxy(zkAppProxyAddress);

}

async function setupLocal() {
  setupAccounts();
  let tx = await Mina.transaction(player1, () => {
    let feePayerUpdate = AccountUpdate.fundNewAccount(player1);
    feePayerUpdate.send({
      to: zkAppAddress,
      amount: Mina.accountCreationFee(),
    });
    zkApp.deploy();
  });
  tx.sign([zkAppPrivateKey, player1Key]);
  await tx.send();

  let txProxy = await Mina.transaction(player1, () => {
    let feePayerUpdate = AccountUpdate.fundNewAccount(player1);
    feePayerUpdate.send({
      to: zkAppProxyAddress,
      amount: Mina.accountCreationFee(),
    });
    zkAppProxy.deploy();
  });
  txProxy.sign([zkAppProxyPrivateKey, zkAppPrivateKey, player1Key]);
  await txProxy.send();

}

describe('tictactoe (proxy)', () => {

  beforeAll(async () => {
    await TicTacToe.compile();
    await TicTacToeProxy.compile();
  });

  beforeEach(async () => {
    await setupLocal();
  });

  it('generates and deploys tictactoe', async () => {
    const board = zkApp.board.get();
    expect(board).toEqual(Field(0));
  });

  it('deploys tictactoe & accepts a correct move', async () => {
     // startGame
    let txn = await Mina.transaction(player1, () => {
      zkAppProxy.startGame(zkAppAddress, player1, player2);
    });
    await txn.prove();
    await txn.sign([zkAppProxyPrivateKey, zkAppPrivateKey, player1Key]).send();
    // await txn.sign([zkAppProxyPrivateKey, player1Key]).send();

    // move
    const [x, y] = [Field(0), Field(0)];
    const signature = Signature.create(player1Key, [x, y]);
    txn = await Mina.transaction(player1, async () => {
      zkAppProxy.play(zkAppAddress, player1, signature, x, y);
    });
    await txn.prove();
    await txn.sign([zkAppProxyPrivateKey,zkAppPrivateKey, player1Key]).send();

    // check next player
    let isNextPlayer2 = zkApp.nextIsPlayer2.get();
    expect(isNextPlayer2).toEqual(Bool(true));
  });
});


import fs from 'fs/promises';
import { AccountUpdate, Mina, PrivateKey, SmartContract } from 'o1js';


export function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
    const txnBroadcastServiceName = new URL(graphQlUrl).hostname
      .split('.')
      .filter((item) => item === 'minascan' || item === 'minaexplorer')?.[0];
    const networkName = new URL(graphQlUrl).hostname
      .split('.')
      .filter((item) => item === 'berkeley' || item === 'testworld')?.[0];
    if (txnBroadcastServiceName && networkName) {
      return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
    }
    return `Transaction hash: ${txnHash}`;
}

export async function isFileExists(f: string) {
  try {
    await fs.stat(f);
    return true;
  } catch {
    return false;
  }
}

export async function deploy(config: any, feePayerKey: PrivateKey, zkAppKey: PrivateKey, zkApp: SmartContract) {

  // Create a new instance of the contract
  console.log('\n\n====== DEPLOYING ======\n\n');
  const sentTx = await Mina.transaction({ sender: feePayerKey.toPublicKey(), fee: config.fee }, () => {
    AccountUpdate.fundNewAccount(feePayerKey.toPublicKey());
    zkApp.deploy();
  });
  console.log('Build transaction and create proof...');
  await sentTx.prove();

  /**
   * note: this tx needs to be signed with `tx.sign()`, because `deploy` uses `requireSignature()` under the hood,
   * so one of the account updates in this tx has to be authorized with a signature (vs proof).
   * this is necessary for the deploy tx because the initial permissions for all account fields are "signature".
   * (but `deploy()` changes some of those permissions to "proof" and adds the verification key that enables proofs.
   * that's why we don't need `tx.sign()` for the later transactions.)
   */
  console.log('Sending the transaction.');
  let pendingTx = await sentTx.sign([zkAppKey, feePayerKey]).send();

  if (pendingTx.hash() !== undefined) {
      console.log(`Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: ${pendingTx.hash()}`);
  }

  console.log('Waiting for transaction inclusion in a block.');
  await pendingTx.wait({ maxAttempts: 90 });
          
  if (pendingTx?.hash() !== undefined) {
      console.log(`Success! Deploy TicTacToe transaction sent.

  Your smart contract state will be updated
  as soon as the transaction is included in a block:
    ${getTxnUrl(config.mina, pendingTx.hash())}
    `);

  }

}
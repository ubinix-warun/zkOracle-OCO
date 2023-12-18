
import fs from 'fs/promises';
import { AccountUpdate, Lightnet, Mina, PrivateKey, SmartContract } from 'o1js';

export const sections = [
  {
    header: 'Interact script',
    content: 'Generates something {italic very} important.'
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'network',
        typeLabel: '{underline file}',
        description: 'lightnet'
      },
      {
        name: 'help',
        description: 'Print this usage guide.'
      }
    ]
  }
]

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

export async function processTx(config:any, sentTx: Mina.Transaction, keys: PrivateKey[], tag: string) {

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
  let pendingTx = await sentTx.sign(keys).send();

  if (pendingTx.hash() !== undefined) {
      console.log(`Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: ${pendingTx.hash()}
    `);
  }

  console.log('Waiting for transaction inclusion in a block.');
  await pendingTx.wait({ maxAttempts: 90 });
          
  if (pendingTx?.hash() !== undefined) {
      console.log(`Success! ${tag} transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    ${getTxnUrl(config.network.mina, pendingTx.hash())}
    `);

  }

}

export async function storePrivateKey(path:string, key: PrivateKey)
{
  await fs.writeFile(path, JSON.stringify({
    privateKey: key.toBase58(),
    publicKey: key.toPublicKey()
  }, null, 2))
}

export async function initialKeyPairFromLightnet(path:string)
{
  // await fs.mkdir("keys");
  if (!(await isFileExists(path))) {
    
    const feePayerPrivateKey = (await Lightnet.acquireKeyPair()).privateKey
    const feePayerAccount = feePayerPrivateKey.toPublicKey();

    await storePrivateKey(path, feePayerPrivateKey);

    console.log('Acquire feePayerPrivateKey ...');

  }

  let feePayerKeysBase58: { privateKey: string; publicKey: string } = 
  JSON.parse(
    await fs.readFile(path, 'utf8')
  );

  return  feePayerKeysBase58;
}

export async function initialKey(path:string, tag: string)
{
  // await fs.mkdir("keys");
  if (!(await isFileExists(path))) {
    
    const zkAppPrivateKey = PrivateKey.random();

    await storePrivateKey(path, zkAppPrivateKey);

    console.log(`Generate ${tag} ...`);

  }

  let zkAppKeysBase58: { privateKey: string; publicKey: string } = 
  JSON.parse(
    await fs.readFile(path, 'utf8')
  );

  return  zkAppKeysBase58;
}

export async function initialZkAppKey(path:string)
{
  return  initialKey(path, "zkAppPrivateKey");
}

export async function deploy(config: any, feePayerKey: PrivateKey, zkAppKey: PrivateKey, zkApp: SmartContract, tag: string) {

  // Create a new instance of the contract
  console.log('\n\n====== DEPLOYING ======\n\n');
  const sentTx = await Mina.transaction({ sender: feePayerKey.toPublicKey(), fee: config.fee }, () => {
    AccountUpdate.fundNewAccount(feePayerKey.toPublicKey());
    zkApp.deploy();
  });

  await processTx(config, sentTx, [zkAppKey, feePayerKey], tag);
}

export async function fetchTestGQL() {

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const operationsDoc = `
  query XyQuery {
    version
    account(publicKey: "B62qjnFHTRXgRNyAEgyH4dhaU93MshJUMtdRDrZgAqcyTfMgRkriH9Z") {
      nonce
      inferredNonce
      receiptChainHash
      delegate
      locked
      index
      zkappUri
      provedState
      tokenSymbol
      leafHash
      zkappState
    }
  }
`;

  var graphql = JSON.stringify({
    query: operationsDoc,
    variables: {}
  });

  // var graphql = JSON.stringify({
  //   query: "query Account {\n    account(publicKey: \"B62qjnFHTRXgRNyAEgyH4dhaU93MshJUMtdRDrZgAqcyTfMgRkriH9Z\") {\n        publicKey\n        tokenId\n        token\n        nonce\n        inferredNonce\n        receiptChainHash\n        delegate\n        votingFor\n        stakingActive\n        privateKeyPath\n        locked\n        index\n        zkappUri\n        zkappState\n        provedState\n        tokenSymbol\n        actionState\n        leafHash\n    }\n}\n",
  //   variables: {}
  // })
  var requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow'
  };

  const result = await fetch("http://localhost:8080/graphql", requestOptions);
  return await result.json();

}
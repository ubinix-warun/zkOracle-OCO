// Ref: jackryanservia/mina-credit-score-signer/main/scripts/keygen.js

import { isReady, PrivateKey, shutdown } from 'o1js';

async function generateKeypair() {
  await isReady;
  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  const encodedPrivateKey = privateKey.toBase58();
  const encodedPublicKey = publicKey.toBase58();

  console.log(
    JSON.stringify(
      { privateKey: encodedPrivateKey, publicKey: encodedPublicKey },
      null,
      2
    )
  );
}

generateKeypair().then(shutdown);
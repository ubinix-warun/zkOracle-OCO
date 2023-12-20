# Sandbox with Lightnet

```bash
zk lightnet start -b berkeley -m single-node
zk lightnet stop

zk lightnet status

```

## Sandbox console.log 

```
✔ Checking Docker Engine availability
✔ Checking prerequisites
✔ Stopping and removing the existing Docker container
✔ Pulling the corresponding Docker image
✔ Starting the lightweight Mina blockchain network Docker container
✔ Preserving the network configuration
✔ Waiting for the blockchain network readiness

Blockchain network is ready in 1 minute, 40 seconds.

Lightweight Mina Blockchain Network

Useful URLs
┌──────────────────────────────┬───────────────────────────────────────────────────────┐
│ Mina Daemon GraphQL endpoint │ http://localhost:8080/graphql                         │
├──────────────────────────────┼───────────────────────────────────────────────────────┤
│ Accounts Manager endpoint    │ http://localhost:8181                                 │
├──────────────────────────────┼───────────────────────────────────────────────────────┤
│ Archive-Node-API endpoint    │ http://localhost:8282                                 │
├──────────────────────────────┼───────────────────────────────────────────────────────┤
│ PostgreSQL connection string │ postgresql://postgres:postgres@localhost:5432/archive │
└──────────────────────────────┴───────────────────────────────────────────────────────┘

Logs produced by different processes are redirected into the files
located by the following path patterns inside the container:
┌──────────────────┐
│ /root/logs/*.log │
└──────────────────┘

Note: By default, important logs of the current session will be saved
to the host file system during the zk lightnet stop command execution.
To disable this behavior, please use the --no-save-logs option.

Blockchain network properties
┌─────────────────────────┬──────────────────────────────────────────────────────────────────┐
│ Sync status             │ SYNCED                                                           │
├─────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Commit ID               │ 27ace0692c8df3ab1d365b6bde3cf78aed9b9426                         │
├─────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Chain ID                │ a8cd34de8fb0747a6d289d9cbf9772b7b8c7207816855154f4b1eec823032fc4 │
├─────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Consensus mechanism     │ proof_of_stake                                                   │
├─────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Consensus configuration │ Transaction finality ("k" blocks): 30                            │
│                         │ Slot duration (new block every ~): 20 seconds                    │
│                         │ Slots per Epoch: 720                                             │
├─────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ SNARK work fee          │ 0.001 MINA                                                       │
├─────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Known accounts          │ 1007                                                             │
├─────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ Uptime                  │ 1 minute, 14 seconds                                             │
└─────────────────────────┴──────────────────────────────────────────────────────────────────┘

```

## zkApp snippet using o1js API

```
import {
  Lightnet,
  Mina,
  ...
} from 'o1js';

// Network configuration
const network = Mina.Network({
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
});
Mina.setActiveInstance(network);

// Fee payer setup
const feePayerPrivateKey = (await Lightnet.acquireKeyPair()).privateKey
const feePayerAccount = feePayerPrivateKey.toPublicKey();

...

// Release previously acquired key pair
const keyPairReleaseMessage = await Lightnet.releaseKeyPair({
  publicKey: feePayerAccount.toBase58(),
});
if (keyPairReleaseMessage) console.log(keyPairReleaseMessage);

Docker container state
Status: running; Is running: true; Killed by OOM: false;

```
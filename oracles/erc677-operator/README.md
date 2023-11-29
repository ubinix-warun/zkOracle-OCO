#  zkOracle-OCO: Erc677 Operator

zkOracle-OCO is an off-chain operator (OCO) for the Mina Protocol that allows users to request and receive data from oracles without having to interact with the blockchain directly.

The [Erc677 Operator](oracles/erc677-operator) is still under development, but it already has a number of features implemented, including:

* Support for performing transferAndCall with data: This allows users to request data from oracles and receive the results directly in their ERC677 wallets.
* Support for providing an Erc677Receiver and handling onTokenTransfer(): This allows users to implement custom logic for handling oracle data once it has been received.
* Support for oracleRequest(), fulfillOracleRequest(), cancelOracleRequest(), setFulfillmentPermission(), getAuthorizationStatus(), and withdraw(): These functions provide all of the necessary functionality for developers to build their own oracle-powered applications.

```
 PASS  src/consumer-basicReq.test.ts (21.8 s)
  BasicRequest (Client)
    Signature Authorization 
      Token Contract Creation/Deployment
        ✓ correct token id can be derived with an existing token owner (1982 ms)
        ✓ setting a valid token symbol on a token contract (2876 ms)

 PASS  src/oracle.test.ts (35.241 s)
  Oracle
    Signature Authorization 
      Oracle Contract Creation/Deployment
        ✓ correct oracle id can be derived with an existing oracle owner (1917 ms)
        ✓ setting a valid oracle symbol on a oracle contract (2194 ms)

 PASS  src/token-erc677.test.ts (68.133 s)
  Token (Erc677)
    Signature Authorization 
      Token Contract Creation/Deployment
        ✓ correct token id can be derived with an existing token owner (1376 ms)
        ✓ deployed token contract exists in the ledger (1199 ms)
        ✓ setting a valid token symbol on a token contract (1803 ms)
      Transfer
        ✓ transfer token account B to C should be 90K and 10K (3601 ms)
        ✓ transfer token B to C and e'Transfer' should be 90K and 10K (3728 ms)
      TransferAndCall
        ✓ token contract can successfully mint and transferAndCall to oracle (signature) (4141 ms)

 PASS  src/token.test.ts (199.744 s)
  Token (Erc20)
    Signature Authorization
      Token Contract Creation/Deployment
        ✓ correct token id can be derived with an existing token owner (1799 ms)
        ✓ deployed token contract exists in the ledger (1459 ms)
        ✓ setting a valid token symbol on a token contract (1894 ms)
      Mint token
        ✓ token contract can successfully mint and updates the balances in the ledger (signature) (2272 ms)
        ✓ minting should fail if overflow occurs  (1259 ms)
      Burn token
        ✓ token contract can successfully burn and updates the balances in the ledger (signature) (3170 ms)
        ✓ throw error if token owner burns more tokens than token account has (4257 ms)
      Transfer
        ✓ change the balance of a token account after sending (3344 ms)
        ✓ should error creating a token account if no account creation fee is specified (3301 ms)
        ✓ should error if sender sends more tokens than they have (3027 ms)
    Proof Authorization
      Token Contract Creation/Deployment
        ✓ should successfully deploy a token account under a zkApp (4198 ms)
      Mint token
        ✓ token contract can successfully mint and updates the balances in the ledger (proof) (39436 ms)
      Burn token
        ✓ token contract can successfully burn and updates the balances in the ledger (proof) (27261 ms)
      Transfer
        ✓ should approve and the balance of a token account after sending (50743 ms)
        ✓ should fail to approve with an incorrect layout (3045 ms)
        ✓ should reject tx if user bypasses the token contract by using an empty account update (2904 ms)

Test Suites: 4 passed, 4 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        200.103 s, estimated 625 s
Ran all test suites.

```

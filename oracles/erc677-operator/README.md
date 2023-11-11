#  zkOracle-OCO: Erc677 Operator

zkOracle-OCO is an off-chain operator (OCO) for the Mina Protocol that allows users to request and receive data from oracles without having to interact with the blockchain directly.

The [Erc677 Operator](oracles/erc677-operator) is still under development, but it already has a number of features implemented, including:

* Support for performing transferAndCall with data: This allows users to request data from oracles and receive the results directly in their ERC677 wallets.
* Support for providing an Erc677Receiver and handling onTokenTransfer(): This allows users to implement custom logic for handling oracle data once it has been received.
* Support for oracleRequest(), fulfillOracleRequest(), cancelOracleRequest(), setFulfillmentPermission(), getAuthorizationStatus(), and withdraw(): These functions provide all of the necessary functionality for developers to build their own oracle-powered applications.

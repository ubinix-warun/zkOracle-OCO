# Mina zkApp: TicTacToe on Lightnet https://github.com/ubinix-warun/zkOracle-OCO/issues/2

Tic-tac-toe, a classic game of strategy and chance, can be enhanced with the fascinating technology of zero-knowledge proofs (zk-proofs).

The previously described Tic-Tac-Toe implementation can be further enhanced by running the mina node server in a local development environment using Lightnet.

<img src="https://raw.githubusercontent.com/ubinix-warun/zkOracle-OCO/main/scripts/tictactoe/Screenshot%202566-12-11%20at%2013.30.52.png" />


## How to build

```sh
pnpm run build
```

## How to run tests

```sh
pnpm run test
pnpm run testw # watch mode
```

## How to run coverage

```sh
pnpm run coverage
```

## How to run 'interact.js'

```sh
pnpm run lightnet:up
pnpm run lightnet:deploy

pnpm run lightnet:play:demo

pnpm run lightnet:down

```

<details>
  <summary>Console log "lightnet:play:demo" (FULL)</summary>
  
```bash

Load feePayerPrivateKey ...
Load zkAppPrivateKey ...
Compile the contract ...
Acquire player1PrivateKey ...
Acquire player2PrivateKey ...


====== START GAME ======


Build transaction and create proof...
Sending the transaction.
Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: 5JuiGYqoufr2WDsAU5L4vKQg3Tmy44aLE6NBqt5f3ZVCGQ8VtrHu
    
Waiting for transaction inclusion in a block.
Success! Start Game -- TicTacToe transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    Transaction hash: 5JuiGYqoufr2WDsAU5L4vKQg3Tmy44aLE6NBqt5f3ZVCGQ8VtrHu
    
initial state of the zkApp 'B62qjnFHTRXgRNyAEgyH4dhaU93MshJUMtdRDrZgAqcyTfMgRkriH9Z' = true
state 0 : 0
state 1 : 0
state 2 : 0
state 3 : 17796799179564753912514343185169119342408834531546195409140777312281255731979
state 4 : 1
state 5 : 305789253364118576859831877176501964427402949492535362294086667710277665562
state 6 : 0
state 7 : 0

initial board
| _ | _ | _ | 
| _ | _ | _ | 
| _ | _ | _ | 
---

player1 'B62qirS2J5KLtE7io98R2zdLpziR3GCC4paqeC1pYEPia17fKmceeu3' = 1550000000000
player2 'B62qjMMMS4Q3Fqm45ZrakE6mQd7UiMZhP3NotH73PFpnSRVuam4MzFm' = 1550000000000


====== FIRST MOVE ======


Build transaction and create proof...
Sending the transaction.
Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: 5JvPRC6EeJHrA6Ss8XNcaC3aX2CqisvHYuWYQzBqXvsEp6skqVUu
    
Waiting for transaction inclusion in a block.
Success! makeMove -- TicTacToe transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    Transaction hash: 5JvPRC6EeJHrA6Ss8XNcaC3aX2CqisvHYuWYQzBqXvsEp6skqVUu
    
| O | _ | _ | 
| _ | _ | _ | 
| _ | _ | _ | 
---



====== SECOND MOVE ======


Build transaction and create proof...
Sending the transaction.
Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: 5Ju3Dkc12eMteH1ejm15jgiWLb2rk4w98DkrxtvXwrbRU9hvbRP1
    
Waiting for transaction inclusion in a block.
Success! makeMove -- TicTacToe transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    Transaction hash: 5Ju3Dkc12eMteH1ejm15jgiWLb2rk4w98DkrxtvXwrbRU9hvbRP1
    
| O | _ | _ | 
| X | _ | _ | 
| _ | _ | _ | 
---



====== THIRD MOVE ======


Build transaction and create proof...
Sending the transaction.
Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: 5JuoYsGEVG7ipDAFdFy3KXQk5jcP7jvgLSCAaVCRKSEpK758mQnS
    
Waiting for transaction inclusion in a block.
Success! makeMove -- TicTacToe transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    Transaction hash: 5JuoYsGEVG7ipDAFdFy3KXQk5jcP7jvgLSCAaVCRKSEpK758mQnS
    
| O | _ | _ | 
| X | O | _ | 
| _ | _ | _ | 
---



====== FOURTH MOVE ======


Build transaction and create proof...
Sending the transaction.
Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: 5JuWzY9XSmZPSC4YuaZs1WD43HcTByvjhPj3Bpd1BKkS33LzjZpc
    
Waiting for transaction inclusion in a block.
Success! makeMove -- TicTacToe transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    Transaction hash: 5JuWzY9XSmZPSC4YuaZs1WD43HcTByvjhPj3Bpd1BKkS33LzjZpc
    
| O | _ | _ | 
| X | O | _ | 
| _ | _ | _ | 
---



====== FIFTH MOVE ======


Build transaction and create proof...
Sending the transaction.
Success! Update transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block.
    Txn hash: 5Jv8BgwvKBiYXxW8BqZtdA7HJYVBdpT9VDGmkDDrqwZxMvF7zkYT
    
Waiting for transaction inclusion in a block.
Success! makeMove -- TicTacToe transaction sent.
    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    Transaction hash: 5Jv8BgwvKBiYXxW8BqZtdA7HJYVBdpT9VDGmkDDrqwZxMvF7zkYT
    
| O | _ | _ | 
| X | O | _ | 
| _ | X | O | 
---

did someone win? Player 1!
Release player1PayerAccount ...
Account with public key B62qirS2J5KLtE7io98R2zdLpziR3GCC4paqeC1pYEPia17fKmceeu3 is set to be released.
Release player2PayerAccount ...
Account with public key B62qjMMMS4Q3Fqm45ZrakE6mQd7UiMZhP3NotH73PFpnSRVuam4MzFm is set to be released.
```

</details>

## License

[Apache-2.0](LICENSE)

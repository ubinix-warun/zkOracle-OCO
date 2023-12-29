# Streamlining Token Creation for zkApps: A Token Builder

Introduces a prototype tool designed to simplify the process of building and deploying tokens for zkApps. Embark on your zkApp journey with this proof-of-concept builder, crafted to make token creation more intuitive and accessible.

## Build 'class BasicTokenContract {}' and return.

```typescript
console.log('Build the contract ... (BasicTokenContract)');
const zkApp = await buildBasicTokenContract(zkAppPublicKey, "MYTKN");  

```

## Return 'inner class' with customize Symbol.

```typescript
export async function buildBasicTokenContract(address: PublicKey, symbol: string):Promise<SmartContract> {

    class BasicTokenContract extends SmartContract {
        ...

        @method init() {
          super.init();
          this.account.tokenSymbol.set(symbol); // < Easy to customize contract.
        //   this.totalAmountInCirculation.set(UInt64.zero);
        }
        
    }
    
    await BasicTokenContract.compile();

    return new BasicTokenContract(address);
}

```

# Getting Started 

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

## License

[Apache-2.0](LICENSE)

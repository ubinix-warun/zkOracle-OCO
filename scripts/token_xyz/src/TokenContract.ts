import {
    isReady,
    method,
    Mina,
    AccountUpdate,
    PrivateKey,
    SmartContract,
    PublicKey,
    UInt64,
    shutdown,
    Int64,
    Experimental,
    Permissions,
    DeployArgs,
    VerificationKey,
    TokenId,
  } from 'o1js';
  
  await isReady;
  
  export let initialBalance = 10_000_000;
  
  class TokenContract extends SmartContract {
    deploy(args: DeployArgs) {
      super.deploy(args);
      this.setPermissions({
        ...Permissions.default(),
        access: Permissions.proofOrSignature(),
      });
      this.balance.addInPlace(UInt64.from(initialBalance));
    }
  
    @method tokenDeploy(deployer: PrivateKey, verificationKey: VerificationKey) {
      let address = deployer.toPublicKey();
      let tokenId = this.token.id;
      let deployUpdate = Experimental.createChildAccountUpdate(
        this.self,
        address,
        tokenId
      );
      deployUpdate.account.permissions.set(Permissions.default());
      deployUpdate.account.verificationKey.set(verificationKey);
      deployUpdate.sign(deployer);
    }
  
    @method mint(receiverAddress: PublicKey) {
      let amount = UInt64.from(1_000_000);
      this.token.mint({ address: receiverAddress, amount });
    }
  
    @method burn(receiverAddress: PublicKey) {
      let amount = UInt64.from(1_000);
      this.token.burn({ address: receiverAddress, amount });
    }
  
    @method sendTokens(
      senderAddress: PublicKey,
      receiverAddress: PublicKey,
      callback: Experimental.Callback<any>
    ) {
      let senderAccountUpdate = this.approve(
        callback,
        AccountUpdate.Layout.AnyChildren
      );
      let amount = UInt64.from(1_000);
      let negativeAmount = Int64.fromObject(
        senderAccountUpdate.body.balanceChange
      );
      negativeAmount.assertEquals(Int64.from(amount).neg());
      let tokenId = this.token.id;
      senderAccountUpdate.body.tokenId.assertEquals(tokenId);
      senderAccountUpdate.body.publicKey.assertEquals(senderAddress);
      let receiverAccountUpdate = Experimental.createChildAccountUpdate(
        this.self,
        receiverAddress,
        tokenId
      );
      receiverAccountUpdate.balance.addInPlace(amount);
    }
  }

export default TokenContract;
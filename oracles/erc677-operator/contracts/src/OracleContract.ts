import {
    Bool,
    CircuitString,
    Field,
    PublicKey,
    SmartContract,
    UInt64,
    ProvablePure,
    provablePure,
    Account,
    method,Permissions,
    VerificationKey,
    AccountUpdate,
    state,
    State,
    Experimental,
    Int64,
    Mina,
} from 'o1js';


export type Erc677Receiver = {

    onTokenTransfer(sender: PublicKey, value: UInt64, data: CircuitString): Bool; // emits "Transfer" event

};


export class OracleContract extends SmartContract implements Erc677Receiver {

      /**
   * This deploy method lets a another token account deploy their zkApp and verification key as a child of this token contract.
   * This is important since we want the native token id of the deployed zkApp to be the token id of the token contract.
   */
  @method deployZkapp(address: PublicKey, verificationKey: VerificationKey) {
    let tokenId = this.token.id;
    let zkapp = AccountUpdate.defaultAccountUpdate(address, tokenId);
    this.approve(zkapp);
    zkapp.account.permissions.set(Permissions.default());
    zkapp.account.verificationKey.set(verificationKey);
    zkapp.requireSignature();
  }

  init() {
      super.init();

      // mint the entire supply to the token account with the same address as this contract
      let address = this.address;
      // pay fees for opened account
    //   this.balance.subInPlace(Mina.accountCreationFee());

      // since this is the only method of this zkApp that resets the entire state, provedState: true implies
      // that this function was run. Since it can be run only once, this implies it was run exactly once

      // make account non-upgradable forever
      this.account.permissions.set({
          ...Permissions.default(),
          editState: Permissions.proofOrSignature(),
          receive: Permissions.proof(),
          access: Permissions.proofOrSignature(),
      });
  }

    @method onTokenTransfer(sender: PublicKey, value: UInt64, data: CircuitString): Bool {
        // Call Oracle ID

        return Bool(true);
    }

}
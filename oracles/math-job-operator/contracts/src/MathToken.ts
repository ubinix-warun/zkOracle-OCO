import { Field, SmartContract, VerificationKey,
    PublicKey, UInt64, AccountUpdate, Permissions,
    state, State, method } from 'o1js';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class MathToken extends SmartContract {

  SUPPLY = UInt64.from(10n ** 18n);
  @state(UInt64) totalAmountInCirculation = State<UInt64>();

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
  }

  @method mint(receiverAddress: PublicKey, amount: UInt64) {
    let totalAmountInCirculation = this.totalAmountInCirculation.get();
    this.totalAmountInCirculation.assertEquals(totalAmountInCirculation);
    let newTotalAmountInCirculation = totalAmountInCirculation.add(amount);
    newTotalAmountInCirculation.value.assertLessThanOrEqual(
      this.SUPPLY.value,
      "Can't mint more than the total supply"
    );
    this.token.mint({
      address: receiverAddress,
      amount,
    });
    this.totalAmountInCirculation.set(newTotalAmountInCirculation);
  }

}

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

import { Erc20 } from './Erc20Contract'
import { OracleContract } from './OracleContract';
  
  /**
   * ERC-677 token standard.
   * https://github.com/ethereum/EIPs/issues/677
   */
export type Erc677 = Erc20 & {

  transferAndCall(to: PublicKey, value: UInt64, data: CircuitString): Bool; // emits "Transfer" event

  // events
  events: {
    TransferAndCall: ProvablePure<{
      from: PublicKey;
      to: PublicKey;
      value: UInt64;
      data: CircuitString;
    }>;
  };

};


export class Erc677Contract extends SmartContract implements Erc677 {

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

      // mint the entire supply to the token account with the same address as this contract
      let address = this.address;
      let receiver = this.token.mint({
          address,
          amount: this.SUPPLY,
      });
      // assert that the receiving account is new, so this can be only done once
      receiver.account.isNew.assertEquals(Bool(true));
      // pay fees for opened account
      this.balance.subInPlace(Mina.accountCreationFee());

      this.totalAmountInCirculation.set(this.SUPPLY.sub(100_000_000));
    //   this.totalAmountInCirculation.set(UInt64.from(10n ** 18n));

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
  
  @method burn(receiverAddress: PublicKey, amount: UInt64) {
      let totalAmountInCirculation = this.totalAmountInCirculation.get();
      this.totalAmountInCirculation.assertEquals(totalAmountInCirculation);
      let newTotalAmountInCirculation = totalAmountInCirculation.sub(amount);
      totalAmountInCirculation.value.assertGreaterThanOrEqual(
          UInt64.from(0).value,
              "Can't burn less than 0"
          );
      this.token.burn({
          address: receiverAddress,
          amount,
      });
      this.totalAmountInCirculation.set(newTotalAmountInCirculation);
  }
  
  @method approveTransferCallback(
      senderAddress: PublicKey,
      receiverAddress: PublicKey,
      amount: UInt64,
      callback: Experimental.Callback<any>
  ) {
      let layout = AccountUpdate.Layout.NoChildren; // Allow only 1 accountUpdate with no children
      let senderAccountUpdate = this.approve(callback, layout);
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

  @method transferFromZkapp(
      from: PublicKey,
      to: PublicKey,
      value: UInt64,
      approve: Experimental.Callback<any>
    ): Bool {
      // TODO: need to be able to witness a certain layout of account updates, in this case
      // tokenContract --> sender --> receiver
      let fromUpdate = this.approve(approve, AccountUpdate.Layout.NoChildren);
  
      let negativeAmount = Int64.fromObject(fromUpdate.body.balanceChange);
      negativeAmount.assertEquals(Int64.from(value).neg());
      let tokenId = this.token.id;
      fromUpdate.body.tokenId.assertEquals(tokenId);
      fromUpdate.body.publicKey.assertEquals(from);
  
      let toUpdate = AccountUpdate.create(to, tokenId);
      toUpdate.balance.addInPlace(value);
      this.emitEvent('Transfer', { from, to, value });
      return Bool(true);
  }

  // for letting a zkapp do whatever it wants, as long as no tokens are transfered
  // TODO: atm, we have to restrict the zkapp to have no children
  //       -> need to be able to witness a general layout of account updates
  @method approveZkapp(callback: Experimental.Callback<any>) {
      let zkappUpdate = this.approve(callback, AccountUpdate.Layout.NoChildren);
      Int64.fromObject(zkappUpdate.body.balanceChange).assertEquals(UInt64.zero);
  }

  // ERC20 API
  name(): CircuitString {
      return CircuitString.fromString('SomeCoin');
  }
  symbol(): CircuitString {
      return CircuitString.fromString('SOM');
  }
  decimals(): Field {
      return Field(9);
  }
  totalSupply(): UInt64 {
      return this.SUPPLY;
  }
  balanceOf(owner: PublicKey): UInt64 {
      let account = Account(owner, this.token.id);
      let balance = account.balance.get();
      account.balance.assertEquals(balance);
      return balance;
  }
  allowance(owner: PublicKey, spender: PublicKey): UInt64 {
      // TODO: implement allowances
      return UInt64.zero;
  }

  @method transferAndCall(to: PublicKey, value: UInt64, data: CircuitString): Bool {
      this.token.send({ from: this.sender, to, amount: value });
      this.emitEvent('TransferAndCall', { from: this.sender, to, value, data });
      
      const oracleContract = new OracleContract(to);
      // oracleContract.onTokenTransfer(this.sender, value, data);
        
      // we don't have to check the balance of the sender -- this is done by the zkApp protocol
      return Bool(true);
  }

  @method transfer(to: PublicKey, value: UInt64): Bool {
      this.token.send({ from: this.sender, to, amount: value });
      this.emitEvent('Transfer', { from: this.sender, to, value });
      // we don't have to check the balance of the sender -- this is done by the zkApp protocol
      return Bool(true);
  }
  @method transferFrom(from: PublicKey, to: PublicKey, value: UInt64): Bool {
      this.token.send({ from, to, amount: value });
      this.emitEvent('Transfer', { from, to, value });
      // we don't have to check the balance of the sender -- this is done by the zkApp protocol
      return Bool(true);
  }
  @method approveSpend(spender: PublicKey, value: UInt64): Bool {
      // TODO: implement allowances
      return Bool(false);
  }

  events = {
    TransferAndCall: provablePure({
        from: PublicKey,
        to: PublicKey,
        value: UInt64,
        data: CircuitString
    }),
    Transfer: provablePure({
        from: PublicKey,
        to: PublicKey,
        value: UInt64,
    }),
    Approval: provablePure({
        owner: PublicKey,
        spender: PublicKey,
        value: UInt64,
    }),
  };

}
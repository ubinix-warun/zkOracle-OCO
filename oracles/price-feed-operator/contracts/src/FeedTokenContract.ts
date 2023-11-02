import {
  ProvablePure,
  Bool,
  CircuitString,
  provablePure,
  DeployArgs,
  Field,
  method,
  AccountUpdate,
  PublicKey,
  SmartContract,
  UInt64,
  Account,
  Experimental,
  Permissions,
  Mina,
  Int64,
  VerificationKey,
} from 'o1js';

import { Erc20Contract } from './feedERC20';

/**
 * ERC-677 token standard.
 * https://github.com/ethereum/EIPs/issues/677
 */
type Erc677 = {

  
}


class Erc677Contract extends Erc20Contract implements Erc677 {


}

export class FeedTokenContract extends Erc677Contract {

}

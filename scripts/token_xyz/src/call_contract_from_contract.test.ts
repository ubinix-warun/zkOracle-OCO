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
    PrivateKey,
  } from 'o1js';
  
  class HelloWorld extends SmartContract {
    @method myMethod(otherAddress: PublicKey) {
      const calledContract = new OtherContract(otherAddress);
      calledContract.otherMethod();
    }
  }
  
  class OtherContract extends SmartContract {
    @method otherMethod() {}
  }


  let feePayerKey: PrivateKey;
  let feePayer: PublicKey;
  
  let zkAppHwKey: PrivateKey;
  let zkAppHwAddress: PublicKey;
  let zkAppHw: HelloWorld;
  
  let zkAppOCKey: PrivateKey;
  let zkAppOCAddress: PublicKey;
  let zkAppOC: OtherContract;
  
  function setupAccounts() {
    let Local = Mina.LocalBlockchain({
      proofsEnabled: true,
      enforceTransactionLimits: false,
    });
    Mina.setActiveInstance(Local);
    feePayerKey = Local.testAccounts[0].privateKey;
    feePayer = Local.testAccounts[0].publicKey;
  
    // tokenZkappKey = PrivateKey.random();
    // tokenZkappAddress = tokenZkappKey.toPublicKey();
  
    // tokenZkapp = new TokenContract(tokenZkappAddress);
    // tokenId = tokenZkapp.token.id;
  
    // zkAppHwKey = Local.testAccounts[1].privateKey;
    zkAppHwKey = PrivateKey.random();
    zkAppHwAddress = zkAppHwKey.toPublicKey();
    zkAppHw = new HelloWorld(zkAppHwAddress);
  
    zkAppOCKey = Local.testAccounts[2].privateKey;
    zkAppOCAddress = zkAppOCKey.toPublicKey();
    zkAppOC = new OtherContract(zkAppOCAddress);
    return Local;
  }
  
  async function setupLocal() {
    setupAccounts();
    let tx = await Mina.transaction(feePayer, () => {
      let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer);
      feePayerUpdate.send({
        to: zkAppHwAddress,
        amount: Mina.accountCreationFee(),
      });
      zkAppHw.deploy();
      feePayerUpdate.send({
        to: zkAppOCAddress,
        amount: Mina.accountCreationFee(),
      });
      zkAppOC.deploy();
    });
    tx.sign([zkAppHwKey, zkAppOCKey, feePayerKey]);
    await tx.send();
    // console.log(`Deploy zkAppHw on ${zkAppHwAddress.toBase58()}`);
    // const updatedBalance = Mina.getBalance(zkAppHwAddress)
  }
  
  async function setupLocalProofs() {
    let Local = setupAccounts();
    // zkAppC = new ZkAppC(zkAppCAddress, tokenId);
    // don't use proofs for the setup, takes too long to do this every time
    Local.setProofsEnabled(false);
    let tx = await Mina.transaction({ sender: feePayer }, () => {
      let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer, 1);
      // let feePayerUpdate = AccountUpdate.fundNewAccount(feePayer, 3);
      feePayerUpdate.send({
        to: zkAppHwAddress,
        amount: Mina.accountCreationFee(),
      });
      zkAppHw.deploy();
      // tokenZkapp.deployZkapp(zkAppBAddress, ZkAppB._verificationKey!);
      // tokenZkapp.deployZkapp(zkAppCAddress, ZkAppC._verificationKey!);
    });
    await tx.prove();
    tx.sign([zkAppHwKey, feePayerKey]);
    await tx.send();
    Local.setProofsEnabled(true);
  }
  
  describe('SmartContract', () => {
    beforeAll(async () => {
      await HelloWorld.compile();
      await OtherContract.compile();
    });
  
    describe('Signature Authorization', () => {

      describe('Helloworld Contract Creation/Deployment', () => {
        beforeEach(async () => {
          await setupLocal();
        });

        test(' should be call myMethod from other contract (signature)', async () => {
          
          let tx = await Mina.transaction(feePayer, () => {
            zkAppHw.myMethod(zkAppOCAddress);
          });
          await tx.prove();
          await tx.sign([feePayerKey]).send();
          
        });

      });

    });
    
  });
  
 
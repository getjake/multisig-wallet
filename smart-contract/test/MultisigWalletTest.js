const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Deploy MultisigWallet", function () {
  // hardhatNetworkMnemonic = "test test test test test test test test test test test junk"
  // 3 accounts
  let admin
  let signer1
  let signer2
  let otherGuy

  // contract
  let MultisigWallet
  let multisigWallet
  let provider

  beforeEach(async function() {
    [admin, signer1, signer2, otherGuy] = await ethers.getSigners()
    MultisigWallet = await ethers.getContractFactory("MultisigWallet")
    multisigWallet = await MultisigWallet.deploy(2) // only requires 2 signers and admin is one of them.
    provider = ethers.provider
  })

  it("should add signer when admin is calling it and should not add signer in some other cases", async function () {
    await multisigWallet.connect(admin).addSigner(signer1.address)
    await expect(multisigWallet.connect(admin).addSigner(signer1.address)).to.be.revertedWith('signer already exists')
    await expect(multisigWallet.connect(signer1).addSigner(signer2.address)).to.be.revertedWith("msg.sender must be admin")
    await multisigWallet.connect(admin).addSigner(signer2.address)
  })

  it("should deposit eth into contract", async function() {
    // GOAL: deposit eth into smart contract
    // balance before deposit
    let adminEthBalanace = await provider.getBalance(admin.address)
    console.log("admin's original eth balance: ", ethers.utils.formatEther(adminEthBalanace))
    let multisigWalletEthBalance = await provider.getBalance(multisigWallet.address)
    console.log("contract's original eth balance: ", ethers.utils.formatEther(multisigWalletEthBalance)) // 0

    const deposit_amount = 15 // in eth
    let overrides = {
      value: ethers.utils.parseEther(deposit_amount.toString())
    }
    let tx = await multisigWallet.connect(admin).deposit(overrides)
    await tx.wait() // wait utils it is confirmed. - SUCCESS
    // balance after deposit
    adminEthBalanace = await provider.getBalance(admin.address)
    console.log("admin's eth balance after deposit: ", ethers.utils.formatEther(adminEthBalanace))
    multisigWalletEthBalance = await provider.getBalance(multisigWallet.address)
    console.log("contract's eth balance after 1st deposit: ", ethers.utils.formatEther(multisigWalletEthBalance))
    expect(parseFloat(ethers.utils.formatEther(multisigWalletEthBalance))).to.equal(parseFloat(deposit_amount))

    // another way -> just send eth to smart contract
    const deposit_amount_fromWallet = 2 // in eth
    const adminWallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider) // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - admin
    let tx_admin2Contract = {
      to: multisigWallet.address,
      value: ethers.utils.parseEther(deposit_amount_fromWallet.toString())
    }
    const expectedMultisigWalletEthBalance2nd = 17
    await adminWallet.sendTransaction(tx_admin2Contract)
    multisigWalletEthBalance = await provider.getBalance(multisigWallet.address)
    console.log("contract's eth balance after 2nd deposit: ", ethers.utils.formatEther(multisigWalletEthBalance))
    expect(parseFloat(ethers.utils.formatEther(multisigWalletEthBalance))).to.equal(parseFloat(expectedMultisigWalletEthBalance2nd))

  })

  it('should propose tranfer', async function() {
    // add signers
    await multisigWallet.connect(admin).addSigner(signer1.address)
    await expect(multisigWallet.connect(admin).addSigner(signer1.address)).to.be.revertedWith('signer already exists')
    await expect(multisigWallet.connect(signer1).addSigner(signer2.address)).to.be.revertedWith("msg.sender must be admin")
    await multisigWallet.connect(admin).addSigner(signer2.address)
    
    // deposit eth into contracgt
    const deposit_amount = 10 // in eth
    let overrides = {
      value: ethers.utils.parseEther(deposit_amount.toString())
    }
    await multisigWallet.connect(admin).deposit(overrides)
    // propose transfer
    const to = otherGuy.address
    const send_amont = ethers.utils.parseEther("1") // send 1 ether to otherGuy
    // examine the event emitted
    await expect(multisigWallet.connect(admin).proposeTranser(to, send_amont)).to.emit(multisigWallet, 'TransferProposed').withArgs(0, to, send_amont)
  })

  it('should sign tranfer and send', async function() {
    // add signers
    await multisigWallet.connect(admin).addSigner(signer1.address)
    await expect(multisigWallet.connect(admin).addSigner(signer1.address)).to.be.revertedWith('signer already exists')
    await expect(multisigWallet.connect(signer1).addSigner(signer2.address)).to.be.revertedWith("msg.sender must be admin")
    await multisigWallet.connect(admin).addSigner(signer2.address)
    
    // otherGuys' original eth balance:
    let otherGuyOriginalEthBalance = await provider.getBalance(otherGuy.address)
    otherGuyOriginalEthBalance = ethers.utils.formatEther(otherGuyOriginalEthBalance)
    // deposit eth into contract
    const deposit_amount = 10.0 // in eth
    let overrides = {
      value: ethers.utils.parseEther(deposit_amount.toString())
    }
    await multisigWallet.connect(admin).deposit(overrides)
    // propose transfer
    const to = otherGuy.address
    const send_amont = ethers.utils.parseEther("1") // send 1 ether to otherGuy
    // sign transfer by signer1
    await multisigWallet.connect(admin).proposeTranser(to, send_amont)
    await multisigWallet.connect(signer1).signTransfer(0)
    
    // check balance of `otherGuy`
    let otherGuyEthBalance = await provider.getBalance(otherGuy.address)
    otherGuyEthBalance = ethers.utils.formatEther(otherGuyEthBalance.toString())

    let diff = parseFloat(otherGuyEthBalance) - parseFloat(otherGuyOriginalEthBalance)
    expect(diff).to.equal(1)
  })

})

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const signerNumber = 2

  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet");
  const multisigWallet = await MultisigWallet.deploy(signerNumber);
  await multisigWallet.deployed();
  
  console.log("MultisigWallet deployed to:", multisigWallet.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

# Multisig Wallet

This is the multisig wallet that allows users to send Ether (or native token) to others only enough signers signed your transaction.

## Howto

### Deploy the smart contract

```bash
# Inside `smart-contract` folder  to install `hardhat`
cd ./smart-contract
yarn
touch .env  

# Edit `.env` to enter your private key and infura key here.
  INFURA_KEY=YOUR_INFURA_KEY
  PRIVATE_KEY=YOUR_PRIVATE_KEY

# Make sure the contract works well on the local testnet
npx hardhat test 

# Edit `scripts/deploy2testnet.js` 
# const signerNumber = 2 # Change the number to the number of signers you wish.

# Deploy the Contract on the BSC testnet
npx hardhat run --network bscTestnet scripts/deploy2mumbai.js

# Remember the contract address shown on the screen.
```

## Frontend Deployment

Replace the contract address in `./frontend/config.js` with yours.

```
## Install `nextjs` and all the dependencies
yarn 

## Install vercel and upload your site to Vercel
yarn add vercel -g
npx vc 

```


## Demo site

https://multisig-wallet-orcin.vercel.app

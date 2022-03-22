import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import web3 from "web3";

import MultisigWalletAbi from "../abis/MultisigWallet.json";
import { multisigwalletaddress } from "../config";

// debug
import { GetRole } from "../helpers";

export default function Home() {
  const [account, setAccount] = useState(""); // metamask account
  const [formInput, updateFormInput] = useState({ amount: 0 });
  const [submitStatus, setSubmitStatus] = useState("")
  // contract variables
  const [admin, setAdmin] = useState("");
  const [contractEthBalance, setContractEthBalance] = useState(0);
  // web3 components
  let web3Modal;
  let connection; // connection to metamask
  let provider; //
  let signer;
  let multisig_contract;

  // exec when page opens.
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    // provider with metamask
    web3Modal = new Web3Modal({
      // network: "testnet",
      // cacheProvider: true,
    });
    connection = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(connection);
    signer = provider.getSigner(); // metamask account
    multisig_contract = new ethers.Contract(
      multisigwalletaddress,
      MultisigWalletAbi.abi,
      provider
    ); // for readonly
    const admin_address = await multisig_contract.admin();
    setAdmin(admin_address);
    // get contract eth balance
    let contractEthBal = await multisig_contract.getEthBalance();
    contractEthBal = ethers.BigNumber.from(contractEthBal).toString();
    contractEthBal = ethers.utils.formatEther(contractEthBal);
    setContractEthBalance(contractEthBal);
    const signerAddress = await signer.getAddress();
    setAccount(signerAddress);
  };

  // propose transfer
  const depositBNB = async () => {
    const { amount } = formInput
    const weiValue = web3.utils.toWei(amount, 'ether')
    if( !amount ) return
    // write contract

    web3Modal = new Web3Modal({
      // network: "testnet",
      // cacheProvider: true,
    });
    connection = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(connection);
    signer = provider.getSigner(); // metamask account
    let multisig_contract2write = new ethers.Contract(
      multisigwalletaddress,
      MultisigWalletAbi.abi,
      signer
    );
    try {

      let overrides = {
        value: ethers.utils.parseEther(amount.toString())
      }

      const transaction = await multisig_contract2write.deposit(overrides)
      setSubmitStatus("In transaction")
      let tx = await transaction.wait()
      setSubmitStatus(`Transaction completed! You deposited ${amount} BNB into the contract!`)
      loadContent() // update page

    } catch (error) {
      setSubmitStatus(`Transaction failed: ${error}`)
      console.log("tx error: ", error)

    }
  };

  return (
    <div className="justify-center">
      {/* Show admin when component is loaded. */}
      This contract currently has {contractEthBalance} BNB.
      <GetRole admin={admin} signer={account} />
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="BNB Amount"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, amount: e.target.value })
          }
        />
        <button
          onClick={depositBNB}
          className="mt-4 bg-blue-500 text-white rounded p-4 shadow-lg"
        >
          Deposit BNB
        </button>
        <div>{submitStatus}</div>
      </div>
    </div>
  );
}

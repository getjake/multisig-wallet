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
  const [formInput, updateFormInput] = useState({ to: "", amount: 0 });
  const [submitStatus, setSubmitStatus] = useState("")
  // contract variables
  const [admin, setAdmin] = useState("");
  const [txCount, setTxCount] = useState(0);
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

  // when change the connected account
  // useEffect(() => {
  //   loadContent();
  // }, [account]);


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
  const submitProposal = async () => {
    const { to, amount } = formInput
    const weiValue = web3.utils.toWei(amount, 'ether')
    if(!amount) return
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
      const transaction = await multisig_contract2write.proposeTranser(to, weiValue)
      setSubmitStatus("In transaction")
      let tx = await transaction.wait()
      let event = tx.events[0]
      console.log(event)
      setSubmitStatus("Transaction completed!")
      let _id = event.args.id
      let _idStr = _id.toString()
      let _amount = event.args._amount
      let _amountStr = ethers.utils.formatEther(_amount).toString()
      let _to = event.args._to

      console.log("txId: ", _id.toString())
      console.log("_amount: ", ethers.utils.formatEther(_amount), "BNB")
      console.log("_to: ", _to)
      
      setSubmitStatus(`Transaction completed! \n\n Txid: ${_idStr}\n\nAmount:${_amountStr}\n\nToAddr: ${_to}`)


    } catch (error) {
      setSubmitStatus(`Transaction failed: ${error}`)
      console.log("tx error: ", error)

    }
  };

  return (
    <div className="justify-center">
      {/* Show admin when component is loaded. */}
      This contract currently has {contractEthBalance} BNB.
      <br />
      <br />
      {account == "0x745E69b2D8B18be987237f3C9411961530854075"
        ? "You are connected to the contract as admin, you can propose the transfer."
        : "You are NOT the contract admin, thus cannot propose transfer"}
      <br />
      <br />
      <GetRole admin={admin} signer={account} />
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="To address"
          className="mt-8 border rounded p-4"
          pattern="#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?"
          onChange={(e) =>
            updateFormInput({ ...formInput, to: e.target.value })
          }
        />
        <input
          placeholder="Amount"
          className="mt-8 border rounded p-4"
          type="number"
          onChange={(e) =>
            updateFormInput({ ...formInput, amount: e.target.value })
          }
        />
        <button
          onClick={submitProposal}
          className="mt-4 bg-blue-500 text-white rounded p-4 shadow-lg"
        >
          Submit Proposal
        </button>
        <div>{submitStatus}</div>
      </div>
    </div>






  );
}

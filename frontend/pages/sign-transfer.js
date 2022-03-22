import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import web3 from "web3";

import MultisigWalletAbi from "../abis/MultisigWallet.json";
import { multisigwalletaddress } from "../config";
import { Tx, ShowTransactions, GetRole } from "../helpers";

export default function Home() {
  const [account, setAccount] = useState(""); // metamask account
  const [formInput, updateFormInput] = useState({ to: "", amount: 0 })
  const [submitStatus, setSubmitStatus] = useState("")
  // contract variables
  const [admin, setAdmin] = useState("")
  const [txCount, setTxCount] = useState(0)
  const [contractEthBalance, setContractEthBalance] = useState(0)
  const [txArrays, setTxArrays] = useState([]) // array consists of Tx Object
  const [txToSign, setTxToSign] = useState(-1)
  const [txSignStatus, setTxSignStatus] = useState("")
  // web3 components
  let web3Modal;
  let connection; // connection to metamask
  let provider; //
  let signer;
  let multisig_contract;

  // exec when page opens.
  useEffect(() => {
    loadContent();
    loadTxData();
  }, []);

  useEffect(() => {
    signTransfer()
  }, [txToSign])

  // when change the connected account
  // useEffect(() => {
  //   loadContent();
  // }, [account]);

  const signTransfer = async () => {
    if (txToSign < 0) return
    web3Modal = new Web3Modal({
      // network: "testnet",
      // cacheProvider: true,
    });
    connection = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(connection);
    signer = provider.getSigner(); // metamask account

    // Some security checks. 先省略
    let multisig_contract2write = new ethers.Contract(
      multisigwalletaddress,
      MultisigWalletAbi.abi,
      signer
    );

    try {
      const transaction = await multisig_contract2write.signTransfer(parseInt(txToSign))
      setTxSignStatus("In transaction")
      let tx = await transaction.wait()
      let event = tx.events[0]
      console.log(event)
      setTxSignStatus("Transaction completed!")
      let _to = event.args._to
      let _amount = event.args._amount
      _amount = ethers.utils.formatEther(_amount).toString()
      setTxSignStatus(`BNB Sent! \n\n Txid: ${txToSign}\n\nAmount:${_amount}\n\nToAddr: ${_to}`)

    } catch(error) {
      setTxSignStatus(`Transaction error: ${error}`)
    }

  }


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
    loadTxData()
  };

  const loadTxData = async () => {
    // provider with metamask
    web3Modal = new Web3Modal({
      // network: "testnet",
      // cacheProvider: true,
    });
    connection = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(connection);
    multisig_contract = new ethers.Contract(
      multisigwalletaddress,
      MultisigWalletAbi.abi,
      provider
    ); // for readonly
    let totalTx = await multisig_contract.txCount()
    totalTx = parseInt(ethers.BigNumber.from(totalTx).toString()); // need to covert big number 
    console.log("totalTx: ", totalTx) 
    if(totalTx === 0) return

    let tempArray = new Array()
    for(let i=0; i<totalTx; i++) {
      let txid = i
      let [to, amount] = await multisig_contract.transactions(i)
      console.log('to: ', to)
      console.log('amount: ', amount)
      amount = ethers.BigNumber.from(amount).toString()
      let isSent = await multisig_contract.isEthSent(i)
      let peopleSigned = await multisig_contract.numberPeopleSigned(i)
      peopleSigned = ethers.BigNumber.from(peopleSigned).toString()

      let item = new Tx(txid, to, amount, peopleSigned, isSent)
      tempArray.push(item)
    }
    setTxArrays(tempArray)
  };

  return (
    <div className="justify-center">
        {txSignStatus ? (<div className="px-4 py-6"> Sign status: {txSignStatus} </div>): null}
        <br />
        <ShowTransactions txArrays={txArrays} setTxToSign={setTxToSign} txToSign={txToSign}/>
        <GetRole admin={admin} signer={account} />
    </div>
  );
}

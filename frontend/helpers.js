import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Show status and wallet-connected
export function GetRole(props) {
  let admin = props.admin;
  let signer = props.signer;

  return (
    <div>
      <p>Contract admin: {admin}</p>
      <p>Wallet: {signer}</p>
    </div>
  );
}

// Tx Object
export function Tx(txid, to, amount, peopleSigned, isSent) {
  this.txid = txid;
  this.to = to;
  this.amount = amount;
  this.peopleSigned = peopleSigned;
  this.isSent = isSent; // boolean
}

// Show contract Transaction History
export function ShowTransactions(props) {
  let txArrays = props.txArrays;
  let txToSign = props.txToSign
  let setTxToSign = props.setTxToSign

  return (
    <div className="container flex justify-center mx-auto">
      <div className="flex flex-col">
        <div className="w-full">
          <div className="border-b border-gray-200 shadow">
            <table>
              <thead className="bg-gray-50">
                <tr>
                  {/* 5 columns */}
                  <th className="px-6 py-2 text-xs text-gray-500">TxID</th>
                  <th className="px-6 py-2 text-xs text-gray-500">To Address</th>
                  <th className="px-6 py-2 text-xs text-gray-500">BNB Amount</th>
                  <th className="px-6 py-2 text-xs text-gray-500"># People Signed</th>
                  <th className="px-6 py-2 text-xs text-gray-500">Completed</th>
                  <th className="px-6 py-2 text-xs text-gray-500">Sign it!</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {
                    txArrays.map((item, i) => (
                        <tr key={i} className="whitespace-nowrap">
                            <td className="px-6 py-4 text-sm text-gray-500">{item.txid}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{item.to}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{ethers.utils.formatEther(item.amount)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{item.peopleSigned}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{item.isSent? "Yes": "No"}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{
                                item.isSent ? (
                                <div className="px-6 py-2 mt-1 bg-grey-500">Sent</div>
                                    ):
                                    (
                                <button
                                    onClick={() => {setTxToSign(i)}}
                                    className="px-6 py-2 mt-1 bg-blue-500 text-white rounded p-3 shadow-lg"
                                >
                                Sign
                                </button>)
                                }                      
                            </td>
                        </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

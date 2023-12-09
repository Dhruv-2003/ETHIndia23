import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import sha256 from "sha256";
import { privateKeyToAccount } from "viem/accounts";
import { useNetwork } from 'wagmi'

const Navbar = () => {

  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [spendingKey, setSpendingKey] = useState<string>();
  const [viewingKey, setViewingKey] = useState<string>();

  const signAndGenerateKey = async () => {
    try {
      if (!walletClient) {
        return;
      }
      const signature = await walletClient.signMessage({
        account,
        message:
          "Sign this message to get access to your app-specific keys. Only Sign this Message while using this app",
      });
      console.log(signature);
      const portion = signature.slice(2, 66);

      const privateKey = sha256(`0x${portion}`);
      console.log(`0x${privateKey}`);

      const newAccount = privateKeyToAccount(`0x${privateKey}`);
      console.log(newAccount);

      setSpendingKey(`0x${privateKey}`);
      setViewingKey(`0x${privateKey}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen bg-gradient-to-r from-white via-blue-100 to-rose-200">
    <div className="flex mt-4 justify-between mx-6">
      <div className="">
        <p className="font-semibold text-2xl">ProjectName</p>
      </div>
      <div className="flex">
        <button onClick={() => signAndGenerateKey()} className='bg-white mx-3 border border-blue-500 rounded-xl px-6 py-1 text-lg text-blue-500 font-semibold'>Register</button>
        <ConnectButton accountStatus="address" showBalance={false}/>
      </div>
    </div>
  </div>
  )
}

export default Navbar
import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import LoadingBar from "react-top-loading-bar";
import dayjs from "dayjs";

import "./App.css";
import abi from "./utils/WavePortal.json";

const contractAddress = "0xFb4e347600fa94190Fdf865aC86bD8cA298C1eE2";
const contractABI = abi.abi;

const getWavePortal = () => {
  const { ethereum } = window;

  if (!ethereum) {
    console.log("Make sure you have metamask!");
    return;
  }

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const wavePortalContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return wavePortalContract;
};

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState(0);
  const [message, setMessage] = useState("");
  const ref = useRef(null);
  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        wavesCleaned.sort((x, y) => y.timestamp - x.timestamp);
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      }
      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        const account = accounts[0];
        setCurrentAccount(account);
        getAllWaves();
        getWavePortal().on("NewWave", getAllWaves);
        const baseTotalWaves = await getWavePortal().getTotalWaves();
        setTotalWaves(baseTotalWaves.toNumber());
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const wave = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;
      if (ethereum) {
        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await getWavePortal().wave(message);
        ref.current.continuousStart(6);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        ref.current.complete();
        console.log("Mined -- ", waveTxn.hash);

        const totalWaves = await getWavePortal().getTotalWaves();
        setTotalWaves(totalWaves.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mainContainer">
      <LoadingBar color="#fcffbe" ref={ref} height={5} />
      <div className="dataContainer">
        <div className="header">Bonjour ! Hello !</div>
        <div className="bio">
          I am Kedabi and I want to track how many people wave at me. Connect
          your Ethereum wallet and dont be shy !
          <br />
          <br />
          {totalWaves ? "Already" : ""} {totalWaves} wave
          {totalWaves ? "s !" : " :("}
        </div>

        {!currentAccount ? (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <>
            <form className="form" onSubmit={wave}>
              <label htmlFor="message">Type a message :</label>
              <div className="inputWrapper">
                <input
                  id="message"
                  name="message"
                  type="text"
                  className="messageInput"
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="submitButton">
                  Send{" "}
                  <span role="img" aria-label="wave">
                    👋
                  </span>
                </button>
              </div>
            </form>

            {allWaves.map((wave, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "rgb(239, 239, 239)",
                  marginBottom: "16px",
                  padding: "8px",
                  borderRadius: "5px",
                }}
              >
                <div>
                  Message: <br />
                  {wave.message ? wave.message : "No message :("}
                </div>
                <br />
                <div>From: {wave.address}</div>
                <div>
                  Date:{" "}
                  {dayjs(wave.timestamp.toString()).format("HH:mm MM/DD/YYYY")}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

import * as React from "react";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const wave = () => {};

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">Bonjour !</div>

        <div className="bio">
          I am Kevin and I want to track how many adresses wave at me. Connect
          your Ethereum wallet and dont be shy !
        </div>

        <button className="waveButton" onClick={wave}>
          Say hello{" "}
          <span role="img" aria-label="wave">
            👋
          </span>
        </button>
      </div>
    </div>
  );
}

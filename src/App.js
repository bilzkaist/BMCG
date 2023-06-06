import React, { useEffect, useState } from "react";
import Web3 from "web3";
import ChessGameContract from "./contracts/ChessGame.json";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [totalPrize, setTotalPrize] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    initializeWeb3();
    initializeContract();
  }, []);

  async function initializeWeb3() {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3Instance);
      } catch (error) {
        console.error("Error initializing web3: ", error);
      }
    } else {
      console.error("Web3 provider not found");
    }
  }

  async function initializeContract() {
    if (web3) {
      try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ChessGameContract.networks[networkId];
        const contractInstance = new web3.eth.Contract(
          ChessGameContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contractInstance);

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error initializing contract: ", error);
      }
    }
  }

  async function enterCompetition(amount) {
    if (contract && web3) {
      try {
        const transactionParameters = {
          from: account,
          to: contract.options.address,
          value: web3.utils.toHex(amount),
        };

        // Request payment from the user using MetaMask
        await window.ethereum.send("eth_sendTransaction", [transactionParameters]);

        console.log("Entered the competition successfully!");
      } catch (error) {
        console.error("Error entering the competition: ", error);
      }
    }
  }

  async function distributePrize() {
    if (contract && web3) {
      try {
        await contract.methods.distributePrize().send({ from: account });
        console.log("Prize distributed successfully!");
      } catch (error) {
        console.error("Error distributing the prize: ", error);
      }
    }
  }

  async function getGameInfo() {
    if (contract && web3) {
      try {
        const prize = await contract.methods.getTotalPrize().call();
        setTotalPrize(web3.utils.fromWei(prize.toString(), "ether"));

        const finished = await contract.methods.isGameFinished().call();
        setGameFinished(finished);
      } catch (error) {
        console.error("Error getting game info: ", error);
      }
    }
  }

  return (
    <div className="App">
      <h1>Chess Game App</h1>
      <p>Connected Account: {account}</p>
      <p>Total Prize: {totalPrize} ETH</p>
      <p>Game Finished: {gameFinished ? "Yes" : "No"}</p>

      <button onClick={() => enterCompetition(web3.utils.toWei("1", "ether"))}>
        Enter Competition
      </button>

      <button onClick={() => distributePrize()}>Distribute Prize</button>

      <button onClick={() => getGameInfo()}>Refresh Game Info</button>
    </div>
  );
}

export default App;

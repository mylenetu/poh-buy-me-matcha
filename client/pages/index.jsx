import abi from "../utils/BuyMeAMatcha.json";
import { ethers } from "ethers";
import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
// import MATCHA from '../assets/matcha.png';

//============= PROOF OF HUMANITY =============
import { useProofOfHumanity } from "poh-react";
import HCaptchaValidator from "poh-validator-hcaptcha-react";
//=============================================

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x14810D97514dfc3cE0BfAbAC4d3FbD649807AEEB";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  //============= PROOF OF HUMANITY =============
  const validator = (
    <HCaptchaValidator
      validatorApiUrl="/api/proof"
      sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_KEY}
    />
  );
  const { getProofOfHumanity } = useProofOfHumanity(validator);
  //=============================================

  // Wallet connection logic - IMPORTANT & CAN BE USED    IN OTHER APPS
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // Frontend version of the buyMatcha function
  const buyMatcha = async () => {
    try {
      //============= PROOF OF HUMANITY =============
      const { error, errorMessage, proof } = await getProofOfHumanity();
      if (error) {
        console.error(error);
        return;
      }
      //=============================================

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeAMatcha = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying matcha..");
        // This line below is how we actually run the function
        const matchaTxn = await buyMeAMatcha.buyMatcha(
          name ? name : "anon",
          message ? message : "Enjoy your matcha!",
          proof,
          { value: ethers.utils.parseEther("0.001") }
        );

        await matchaTxn.wait();

        console.log("mined ", matchaTxn.hash);

        console.log("matcha purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeAMatcha = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeAMatcha.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeAMatcha;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeAMatcha = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeAMatcha.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeAMatcha) {
        buyMeAMatcha.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Mylene a Matcha!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>
          <img src="/matcha.png" width="420px" height="320px" />
        </div>
        <h1 className={styles.title}>Buy Mylene a Matcha!</h1>

        {currentAccount ? (
          <div>
            <form>
              <div className={styles.inputContainer}>
                <label className={styles.inputContainerLabel}>Name</label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                  className={styles.inputContainerInput}
                />
              </div>
              <br />
              <div className={styles.inputContainer}>
                <label className={styles.inputContainerLabel}>
                  Send Mylene a message
                </label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your matcha!"
                  id="message"
                  onChange={onMessageChange}
                  required
                  className={styles.inputContainerInput}
                ></textarea>
              </div>
              <div>
                <button
                  type="button"
                  onClick={buyMatcha}
                  className={styles.button}
                >
                  Send 1 Matcha for 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet} className={styles.button}>
            {" "}
            Connect your wallet{" "}
          </button>
        )}
      </main>

      {currentAccount && <h1>Memos received</h1>}

      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: "2px solid",
                borderRadius: "5px",
                padding: "5px",
                margin: "5px",
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                {'"'}
                {memo.message}
                {'"'}
              </p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          );
        })}

      <footer className={styles.footer}>
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by @mylenetu for Alchemy{"'"}s Road to Web3 lesson two!
        </a>
      </footer>
    </div>
  );
}

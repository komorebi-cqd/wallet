import "./index.css";
import xpotABI from "../../config/xpot_abi.json";
import Web3 from "web3/dist/web3.min.js";

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

const noMetamask = "请先下载小狐狸，";
//下面是正式网地址 和 合约地址
const netWords = {
	chainId: "0x38",
	rpcUrls: ["https://bsc-dataseed.binance.org/"],
	chainName: "BSC",
	default: false,
	POT: "0x4c7b04d50e070848e3c7757995a57624563e0245",
	claim: "0x24367DD2a01e866e45eFEEE9cfaf483FD8aD25D2",
}
const contractAddress = '0x4c7b04d50e070848e3c7757995a57624563e0245'

//下面是测试网地址 和 合约地址
// const netWords = {
//     chainId: "0x7b",
//     chainName: "Test Chian",
//     claim: "0x096bd91e851d3bd71a98053427da0394a732ab35",
//     default: true,
//     rpcUrls: ["https://testnet-eth.wlblock.io/"],
//     tokens: ["0xf7118ac23fa5e238e96d79a0504d7606effa2624"],
// };
// const contractAddress = "0x63a03409E9cfC5983E30568F384000E3d4dC1357";

const ethereum = window.ethereum;
let web3Ex = null;
let account = "";
let chainId = "";
let timer = null;
let handleWallteChange = null;

//游客连接
function touristsConnect() {
    console.log("游客连接");
}

// 小狐狸连接
async function connect() {
    if (!ethereum) {
        console.log("error");
        const tip = document.querySelector(".tip");
        tip.innerHTML = noMetamask;
        const a = document.createElement("a");
        a.href = "https://metamask.io/";
        a.target = "_blank";
        a.innerText = "下载地址";
        tip.appendChild(a);
        return false;
    }
    subscribeChain();
    web3Ex = new Web3(ethereum);
    const accounts = await ethereum.request({
        method: "eth_requestAccounts",
    });
    account = accounts[0];
    chainId = await ethereum.request({ method: "eth_chainId" });
    console.log(account, chainId);
    console.log(chainId !== netWords.chainId);
    if (chainId !== netWords.chainId) {
        const res = await switchChainId(netWords);
        if (!res) {
            console.log("切换失败");
            return;
        }
    }
    //获取ETH余额
    const balance = await web3Ex.eth.getBalance(account);
    console.log(balance * 10 ** -18, "账户余额");
    await getPotBalance(account, contractAddress);
    timer = setInterval(() => {
        if (typeof window.startGame === "function") {
            window.startGame(
                { id: account, chainId: chainId },
                showAlert
            );
            clearInterval(timer);
        }
    }, 500);
    console.log("进入");
}

//监听钱包的操作
function subscribeChain() {
    if (!ethereum) {
        return;
    }
    ethereum.on("accountsChanged", (accounts) => {
        console.log(accounts, "accountsChanged");
        typeof handleWallteChange === "function" && handleWallteChange('account');
        account = accounts[0];
    });
    ethereum.on("chainIdChanged", (chainId) => {
        console.log("chainIdChanged-" + chainId);
    });
    ethereum.on("chainChanged", (event) => {
        console.log("chainChanged --- event", event);
        typeof handleWallteChange === "function" && handleWallteChange('chainId');
        // typeof window.exitGame === "function" && window.exitGame();
        if (netWords.chainId !== event) {
            typeof window.exitGame === "function" && window.exitGame();
        }
    });
    ethereum.on("disconnect", (error) => {
        // 清空钱包连接类型
        console.log(error, "disconnect");
    });
}
//切换地址
async function switchChainId(chainObj) {
    const { chainId, rpcUrls, chainName } = chainObj;
    const chainId_16 = `0x${Number(chainId).toString(16)}`;
    try {
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainId_16 }],
        });
        return true;
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{ chainId: chainId_16, rpcUrls, chainName }],
                });
                return true;
            } catch (addError) {
                console.log(addError, "error");
            }
        }
    }
}
//获取pot余额
async function getPotBalance(account, xpotAccount) {
    const xpotContract = new web3Ex.eth.Contract(xpotABI, xpotAccount);
    const intBalance = await xpotContract.methods.balanceOf(account).call();
    const decimals = await xpotContract.methods.decimals().call();
    const balance = intBalance * 10 ** -decimals;
    console.log("平台币余额", balance);
}
//隐藏或显示遮罩层
function showOrHiddleMask(is) {
    const mask = document.querySelector(".mask");
    if (is) {
        mask.classList.remove("hidden_mask");
    } else {
        mask.classList.add("hidden_mask");
    }
}
//隐藏或显示整个界面
function showOrHiddleView(is) {
    const container = document.querySelector(".container");
    if (is) {
        container.style.display = "none";
    } else {
        container.style.display = "block";
    }
}

//下面是移动钱包的连接
//移动钱包连接
async function walletConnect() {
    const connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal,
    });
    if (!connector.connected) {
        // create new session
        try {
            await connector.createSession();
        } catch (error) {
            console.log(error);
        }
        
    }
    connector.on("connect", (error, payload) => {
        if (error) {
            throw error;
        }
        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.log(accounts, chainId);
    });
}

// //移动钱包事件监听用例 https://test.walletconnect.org/ 


//设置事件
(function setEvent() {
    const btns = document.querySelectorAll(".login-btn");
    btns[0].onclick = function () {
        showOrHiddleMask(true);
    };
    btns[1].onclick = function () {
        touristsConnect();
    };
    const close = document.querySelector(".close");
    close.onclick = function () {
        showOrHiddleMask(false);
    };

    const walletBtns = document.querySelectorAll(".wallect_text");
    walletBtns[0].onclick = function () {
        connect();
        showOrHiddleMask(false);
    };
    walletBtns[1].onclick = function () {
        walletConnect();
    };
})();

function walletChange(callack){
    handleWallteChange = callack;
}

window.walletChange = walletChange;




import "./index.css";
import xpotABI from "../../config/xpot_abi.json";
import Web3 from "web3/dist/web3.min.js";

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import NodeWalletConnect from "@walletconnect/node";

const noMetamask = "请先下载小狐狸，";
//下面是正式网地址 和 合约地址
// const netWords = {
// 	chainId: "0x38",
// 	rpcUrls: ["https://bsc-dataseed.binance.org/"],
// 	chainName: "BSC",
// 	default: false,
// 	POT: "0x4c7b04d50e070848e3c7757995a57624563e0245",
// 	claim: "0x24367DD2a01e866e45eFEEE9cfaf483FD8aD25D2",
// }
// const contractAddress = '0x4c7b04d50e070848e3c7757995a57624563e0245'

//下面是测试网地址 和 合约地址
const netWords = {
    chainId: "0x7b",
    chainName: "Test Chian",
    claim: "0x096bd91e851d3bd71a98053427da0394a732ab35",
    default: true,
    rpcUrls: ["https://testnet-eth.wlblock.io/"],
    tokens: ["0xf7118ac23fa5e238e96d79a0504d7606effa2624"],
};
const contractAddress = "0x63a03409E9cfC5983E30568F384000E3d4dC1357";

const ethereum = window.ethereum;
let web3Ex = null;
let account = "";
let chainId = "";

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
    getPotBalance(account, contractAddress);
    console.log("进入");
}

//监听钱包的操作
function subscribeChain() {
    if (!ethereum) {
        return;
    }
    ethereum.on("accountsChanged", (accounts) => {
        console.log(accounts, "accountsChanged");
        account = accounts[0];
    });
    ethereum.on("chainIdChanged", (chainId) => {
        console.log("chainIdChanged-" + chainId);
    });
    ethereum.on("chainChanged", (event) => {
        console.log("chainChanged --- event", event);
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
    const walletConnector = new NodeWalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
    }, {
        clientMeta: {
            description: "WalletConnect NodeJS Client",
            url: "https://nodejs.org/en/",
            icons: ["https://nodejs.org/static/images/logo.svg"],
            name: "WalletConnect",
        },
    });
    // Check if connection is already established
    if (!walletConnector.connected) {
        // create new session
        walletConnector.createSession().then(() => {
            // get uri for QR Code modal
            const uri = walletConnector.uri;
            // display QR Code modal
            WalletConnectQRCodeModal.open(
                uri,
                () => {
                    console.log("QR Code Modal closed");
                },
                true // isNode = true
            );
            console.log('disconnect!');
            localStorage.clear();
        });
    }

    // Subscribe to connection events
    walletConnector.on("connect", (error, payload) => {
        if (error) {
            throw error;
        }
        // Close QR Code Modal
        WalletConnectQRCodeModal.close(
            true // isNode = true
        );

        // Get provided accounts and chainId
        const {accounts, chainId} = payload.params[0];
        console.log(chainId, 'payload.params')
        if (chainId != 56) {
            localStorage.removeItem("walletconnect")
            console.log('please use Binance Smart Chain!');
        }
        //  console.log(accounts, "accounts");
        let myeth = accounts[0];
        let wallet = myeth.slice(0, 6) + "..." + myeth.slice(-4)
        // Store.commit('set_address', myeth)
        // Store.commit('set_wallet', wallet)
        // Store.commit('set_address', myeth)
        sessionStorage.setItem("address",myeth)
    });

    walletConnector.on("session_update", (error, payload) => {
        if (error) {
            throw error;
        }
        // Get updated accounts and chainId
        const {accounts, chainId} = payload.params[0];
    });
    walletConnector.on("disconnect", (error, payload) => {
        if (error) {
            throw error;
        }
        // Delete walletConnector
    });

}


// //移动钱包事件监听
// async function subscribeToEvents(connector) {
//     if (!connector) {
//         return;
//     }

//     connector.on("session_update", async (error, payload) => {
//         console.log(`connector.on("session_update")`);
//         if (error) {
//             console.log(error,'error');
//             throw error;
//         }
//         const { chainId, accounts } = payload.params[0];
//         console.log(payload);
//         onSessionUpdate(accounts, chainId);
//     });

//     connector.on("connect", (error, payload) => {
//         console.log(`connector.on("connect")`);

//         if (error) {
//             throw error;
//         }
//         onConnect(payload);
//     });

//     connector.on("disconnect", (error, payload) => {
//         console.log(`connector.on("disconnect")`);
  
//         if (error) {
//           throw error;
//         }
  
//         onDisconnect();
//       });

//       if (connector.connected) {
//         const { chainId, accounts } = connector;
//         const address = accounts[0];
//         // this.setState({
//         //   connected: true,
//         //   chainId,
//         //   accounts,
//         //   address,
//         // });
//         onSessionUpdate(accounts, chainId);
//       }
// }


// function onSessionUpdate(accounts, chainId) {
//     console.log(accounts, chainId);
// }

// function onConnect(payload){
//     console.log(payload);
// }

// function onDisconnect() {
    
// }

//设置事件
(function setEvent() {
    const btns = document.querySelectorAll(".login-btn");
    btns[0].onclick = function () {
        showOrHiddleMask(true);
    };
    btns[1].onclick = function () {
        touristsConnect();
    };
    const close = document.querySelectorAll(".close");
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

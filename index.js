//In nodeJs -> require()
//In front-end Jsyou can't use require but -> import
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAdress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fund")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected!"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        fundButton.innerHTML = "Please install Metamask!"
    }
}

async function getBalance() {
    try {
        if (typeof window.ethereum !== "undefined") {
            //Provider -> Connection to the blockchain
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const balance = await provider.getBalance(contractAdress)
            console.log(ethers.utils.formatEther(balance))
        }
    } catch (error) {
        console.log(error)
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    try {
        //Provider -> Connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //Signer / Wallet / someone with some gas
        const signer = provider.getSigner()
        //Contract that we are interacting with
        //ABI & Address
        const contract = new ethers.Contract(contractAdress, abi, signer)
        if (typeof window.ethereum !== "undefined") {
            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(txResponse, provider)
            console.log("Done!")
        }
    } catch (error) {
        console.log(error)
    }
}

function listenForTransactionMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    //listen to this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(
                `Transaction completed with ${txReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAdress, abi, signer)
        try {
            const txResponse = await contract.withdraw()
            await listenForTransactionMine(txResponse, provider)
            console.log("Withdrawed!")
        } catch (error) {
            console.log(error)
        }
    }
}

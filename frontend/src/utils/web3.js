import Web3 from 'web3';

let web3;

// Controlla se MetaMask è installato
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
        // Richiedi l'autorizzazione per accedere agli account
        window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
        console.error("Accesso all'account rifiutato.");
    }
} else {
    console.warn("MetaMask non è installato! Usa un provider locale.");
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545")); // Ganache
}

export default web3;

import { providers } from 'ethers';

export const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;

export const gnosisPrefixes = {
    1: 'eth',
    5: 'gor',
    137: 'matic'
}

export const rpcUrls = {
    1: 'https://mainnet.infura.io/v3/' + infuraId,
    4: 'https://rinkeby.infura.io/v3/' + infuraId,
    5: 'https://goerli.infura.io/v3/' + infuraId,
    11155111: 'https://sepolia.infura.io/v3/' + infuraId,
    80001: 'https://rpc-mumbai.maticvigil.com/',
    137: 'https://rpc-mainnet.maticvigil.com/'
}

export const gnosisServiceUrls = {
    1: 'https://safe-transaction.gnosis.io',
    4: 'https://safe-transaction.rinkeby.gnosis.io',
    5: 'https://safe-transaction-goerli.safe.global',
    137: 'https://safe-transaction.polygon.gnosis.io'
}

export const supportedChains = [
  parseInt(process.env.NEXT_PUBLIC_MORALIS_SERVER_NETWORK)
]

export const defaultProvider = new providers.JsonRpcProvider( rpcUrls[supportedChains[0]] )



export const signingMessage = 'Sign with Round'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { InjectedConnector } from "@web3-react/injected-connector";

export const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;
const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/' + infuraId,
  4: 'https://rinkeby.infura.io/v3/' + infuraId,
}
export const injected = new InjectedConnector({
  supportedChainIds: [1, 4]
});
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  qrcode: true,
  
})

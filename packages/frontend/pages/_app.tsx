/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import '../styles.css'
import { ChakraProvider } from '@chakra-ui/react'
import { MoralisProvider } from 'react-moralis'
import type { AppProps } from 'next/app'

import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'

import React from 'react'
import theme from '../lib/theme'
import { Layout } from '../components/layout/Layout'
/// REDUX IMPORT
import { Provider } from 'react-redux'
import store from '../reducers/index'
import { providers } from 'ethers'
import 'focus-visible/dist/focus-visible'
import { Global, css } from '@emotion/react'

import { WagmiProvider, createClient, chain, defaultChains } from 'wagmi';
// import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { supportedChains, rpcUrls } from '../constants/network'
import Script from 'next/script'

import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'

const GlobalStyles = css`
  /*
    This will hide the focus indicator if the element receives focus    via the mouse,
    but it will still show up on keyboard focus.
  */
  .js-focus-visible :focus:not([data-focus-visible-added]) {
     outline: none;
     box-shadow: none;
   }
`;

// intersect supported chains with the chains from wagmi
let chains = defaultChains.filter(({ id }) => supportedChains.includes(id))

if( chains.length < supportedChains.length ) {
  chains = [...chains, ...(Object.values( chain ).filter(({ id }) => supportedChains.includes(id)))]
}



const client = createClient({
  autoConnect: true,
  connectors({chainId}) {
    return [
      new MetaMaskConnector({
          chains,
          options: { shimDisconnect: true }
      }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
          // infuraId,
          rpc: {
            1: rpcUrls[1],
            4: rpcUrls[4],
            80001: rpcUrls[80001],
            11155111: rpcUrls[11155111],
            137: rpcUrls[137],
          }
        }
      }),
      new CoinbaseWalletConnector({
        options: {
          appName: 'aikido',
          jsonRpcUrl: rpcUrls[chainId],
        },
      })
    ]
  },
  provider({ chainId }) {
    return new providers.JsonRpcProvider( rpcUrls[chainId] || rpcUrls[supportedChains[0]] )
  }
})
const queryClient = new QueryClient()

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {

  return (
    <Provider store={store}>   
        <MoralisProvider 
          appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID} 
          serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_URL}
        >
          <WagmiProvider client={client}>
            <ChakraProvider theme={theme}>
              <QueryClientProvider client={queryClient}>
                <Layout>
                  {/* @ts-ignore */}
                  <Component {...pageProps} />
                </Layout>
              </QueryClientProvider>
            </ChakraProvider>
          </WagmiProvider>
        </MoralisProvider>
    </Provider>
  )
}

export default MyApp

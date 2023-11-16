import { Flex, Alert, AlertDescription, Button } from '@chakra-ui/react';

import { getErrorMessage } from '../../lib/utils';
import { useNetwork, useAccount, useConnect } from 'wagmi';
import { supportedChains } from '../../constants/network';
import { useEffect, useState } from 'react';

export default function NetworkError(): JSX.Element {
    

    const { activeChain: chain, chains, switchNetworkAsync: switchNetwork } = useNetwork()
    const { error } = useConnect();
    const [ isCorrectChain, setIsCorrectChain ] = useState(true);
    useEffect(() => {
        if(chain) {
            setIsCorrectChain(supportedChains.includes(chain?.id));
        }
    }, [chain])
    
    const supportedChainId = supportedChains[0];
    
    const supportedChainName = chains.find(c => c.id === supportedChainId)?.name;

    const { data: accountData } = useAccount();
    const isWalletConnect = accountData?.connector?.id === 'walletConnect'

    
        

    const doSwitchNetwork = () => {
        switchNetwork(supportedChainId);
    }

    return (
        <>
        {(!isCorrectChain || error ) && 
            <Flex>
                <Alert flexDirection={['column','row','row']} status="error" justifyContent='center' py={2}>
                <AlertDescription fontSize="xs" pr={2}>
                    { 
                        !chain ? "Please connect your wallet." : 
                        !isCorrectChain ? 'Your wallet is connected to an unsupported chain.' : 
                        getErrorMessage(error)
                    }
                </AlertDescription>
                { !isCorrectChain && switchNetwork && !isWalletConnect &&
                    <Button
                    size="xs"
                    colorScheme="pink"
                    onClick={ doSwitchNetwork }
                    >Switch to { supportedChainName }</Button>
                }
                </Alert>
            </Flex>
        }
        </>
    )
}
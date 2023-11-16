import {
    Flex,
    Button,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    useDisclosure
  
  } from '@chakra-ui/react'
import {  useAppSelector , useAppDispatch} from '../../reducers/index'
import { useTokenList } from '../../hooks/useTokenList'
import { useState, useEffect } from 'react'
import {initCurrencyValue}from '../../reducers/bountytoken/reducer'
import { useAccount, useNetwork } from 'wagmi'
// import down chevron icon from react
import { ChevronDownIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers';
import useNativeCurrency from "../../hooks/useNativeCurrency";

import { getGnosisAssets } from '../../lib/utils'

export default function SelectToken({fund, gnosis}){
    
    const dispatch = useAppDispatch()
    const bountyTokenState = useAppSelector((state) => fund ? state.fundBounty : state.createBounty)
    const { data: accountData } = useAccount();
    const { activeChain: chain } = useNetwork();
    const chainId = chain?.id;
    const account = accountData?.address
    const nativeCurrency = useNativeCurrency()

    const walletState = useAppSelector((state) => state.wallet)

    const walletTokenList = useTokenList(walletState.tokenBalance);
    
    // by default it will be wallet token list, in case of gosis, it will be overwritten
    const [tokenList, setTokenList] = useState([]);
    
    const [token,setToken] = useState(bountyTokenState.currency);

    useEffect(() => {
      if(!gnosis){
        setTokenList(walletTokenList);
      }
    }, [walletTokenList])

    useEffect(() => {
      // if gnosis is a valid address
      if(ethers.utils.isAddress(gnosis)){
        // get token balance from gnosis
        getGnosisAssets(chainId, gnosis, (data) => {
          
          setTokenList(data.items.map((item:any) => {

            const currency = item.tokenInfo.type === 'NATIVE_TOKEN' ? 
            {
                chain: chainId,
                decimals: nativeCurrency.decimals,
                isNative: nativeCurrency.isNative,
                isToken: false,
                name: nativeCurrency.name,
                symbol: nativeCurrency.symbol,
                logo: nativeCurrency.logo,
                token_address: nativeCurrency.token_address,
            } : {
              chain: chainId,
              logo: item.tokenInfo.logoUri,
              decimals: item.tokenInfo.decimals,
              isNative: false,
              isToken: item.tokenInfo.type === "ERC20",
              name: item.tokenInfo.name,
              symbol: item.tokenInfo.symbol,
              token_address: item.tokenInfo.address
            }
            
              
            return {
              amount: item.balance,
              currency 
            }
          }))
          
        });
        
      } else {
        setTokenList(walletTokenList);
      }

    }, [gnosis])

    useEffect(() => {
      const defaultToken = tokenList.length >0 ?tokenList[0].currency : null;
      if(defaultToken && !token) setToken(defaultToken);
    }, [tokenList])

    useEffect(() => {
      setToken(bountyTokenState.currency);
    }, [account, bountyTokenState.currency]);

    const handleChangeToken = async (token)=>{
      try {
        setToken(token.currency);
        const initToken = token;
        if(token.currency.symbol === "ETH" && !initToken.currency.isNative) initToken.currency.isNative = true;
        dispatch(initCurrencyValue(initToken))
        onClose();
      } catch (error) {
        console.error(error);
      }
    }
    const { onOpen, isOpen, onClose } = useDisclosure();
    

    return (<Flex>
        <Flex onClick={onOpen} ml={1} cursor="pointer" gap={1} alignItems="center">
          {bountyTokenState.currency?.logo && 
          <Image 
            src={bountyTokenState.currency?.logo.startsWith('/') || bountyTokenState.currency?.logo.startsWith('http') ? bountyTokenState.currency?.logo : '/'+ bountyTokenState.currency?.logo} 
            alt={bountyTokenState.currency?.symbol} 
            w="18px" h="18px" /> }
          <strong>{token?.symbol}</strong>
          <ChevronDownIcon w={6} h={6} />
        </Flex>
        
              <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Choose a Token</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {
                        tokenList.map( t => {
                            return <Button
                            key={t.currency.token_address}
                            justifyContent="space-between"
                            width="100%"
                            mb="4"
                            size="lg"
                            variant="outline"
                            rightIcon={
                              (t.currency.logo ? <Image
                                maxWidth="20px"
                                src= {(!t.currency.logo.startsWith('http') ? '/' : '')+t.currency.logo}
                              /> : null )
                            }
                            onClick={()=> handleChangeToken(t)}
                          >
                            {t.currency.name} - {t.currency.symbol}
                          </Button>;

                    })}

                </ModalBody>
              </ModalContent>
            </Modal>
            </Flex>)
}
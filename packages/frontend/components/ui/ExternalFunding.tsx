import { Box, Button,Text, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from '../../reducers/index'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useMoralis } from "react-moralis";
import { useAccount, useConnect, useNetwork, useSigner } from "wagmi";
import { CurrencyAmount } from '@uniswap/sdk-core'
import { moralisAuthentication } from "../../lib/utils";
import { toCurrency } from '../../utils/currency'
import PriceSelector from './PriceSelector';
import { getChainDetails } from "../../constants/addresses";
import { toDecimal } from "../../utils/bignumber";
import { trim } from '../../utils/formatting'
// import { BountyTokenVersion } from '../../constants/standardBounties'
// import Moralis from 'moralis'
import { useRouter } from 'next/router'
import { fundBounty } from "../../reducers/bounty/asyncActions";
import { initCurrencyValue } from "../../reducers/bountytoken/fundReducer";
import useNativeCurrency from '../../hooks/useNativeCurrency'

import { PRICING_TOKENS } from "../../constants/tokens";

import { useTokenContract } from "../../hooks/useContract";
import { ethers } from "ethers";
import { BigNumber } from "ethers";
// import { setConnectingWallet, WalletTypeEnum } from "../../reducers/wallet/state";



export function ExternalFunding(props): JSX.Element {

    const { user, authenticate, isAuthenticated } = useMoralis();
    const { data: accountData } = useAccount();
    const { activeChain: chain } = useNetwork()
    const { data: signer } = useSigner();
    const chainId = chain?.id;
    const isWalletConnect = accountData?.connector?.id === "walletConnect"
    const account = accountData?.address
    const toast = useToast();
    const router = useRouter();
    const { isConnected: connected, connectors, connectAsync: connect } = useConnect()
    const connectorInjected = connectors?.[0];
    const { bid } = router.query;
    const [nextAction, setNextAction] = useState(null);

    const bountyState = useAppSelector((state: RootState) => { return state.bounties; });
    const themeColor = bountyState?.bounty.themeColor;
    
    const walletState = useAppSelector((state) => state.wallet)
    const nativeCurrency = useNativeCurrency()

    const fundBountyState = useAppSelector((state) => state.fundBounty)
    const dispatch = useAppDispatch()
    
    const currency = toCurrency(fundBountyState?.currency)
    

    const bountyContractAddress = chainId
    ? getChainDetails(chainId)?.address
    : null

    const amountToApprove =
    currency && fundBountyState.amount
      ? CurrencyAmount.fromRawAmount(currency, fundBountyState.amount)
      : null

    const [approval, approveCallback] = useApproveCallback(
        amountToApprove,
        bountyContractAddress
    )

    // enable button again once funds have been approved
    useEffect(() => {
        if(approval === ApprovalState.APPROVED) {
            setInProgress(false);
        }
    }, [approval])
    
    
    const tokenContract = useTokenContract(props?.bountyMetadata?.tokenAddress)
    
    // set the fund currency state based on the bounty's currency
    useEffect(() => {
        // if tokeAddress is zeroaddress
        const isNative = !props?.bountyMetadata?.tokenAddress || props?.bountyMetadata?.tokenAddress === ethers.constants.AddressZero;
        
        if( !isNative) {
            if(
                fundBountyState.currency === null ||
                fundBountyState.currency.token_address !== props?.bountyMetadata?.tokenAddress ||
                fundBountyState.currency.chain !== chainId
            ){
                // get hold of token currency
                const token = PRICING_TOKENS.find(p=>p.symbol === props?.bountyMetadata?.tokenSymbol && p.chainId === chainId && p.address === props?.bountyMetadata?.tokenAddress)
                if(token) {
                    tokenContract.balanceOf(account).then(balance => {
                        dispatch( initCurrencyValue({
                            amount: balance.toString(),
                            currency: {
                                chain: chainId,
                                decimals: token.decimals,
                                isNative: false,
                                isToken: true,
                                name: token.name,
                                symbol: token.symbol,
                                token_address: token.address
                            }
                        }) )
                    })
                }    
            }
        } else {
            if(walletState?.['nativeBalance'] && !fundBountyState.amount) {
                dispatch(
                    initCurrencyValue({
                        amount: walletState.nativeBalance,
                        currency : {
                            chain: chainId,
                            decimals: nativeCurrency.decimals,
                            isNative: nativeCurrency.isNative,
                            isToken: false,
                            name: nativeCurrency.name,
                            symbol: nativeCurrency.symbol,
                            logo: nativeCurrency.logo,
                            token_address: nativeCurrency.token_address
                        }
                    })
                )
            }
        }
        
    }, [chainId, walletState]);
        
    const bountyTokenAmount = fundBountyState.amount ? toDecimal(fundBountyState.amount, fundBountyState.currency) : 0;

    const formattedAmount = bountyTokenAmount ? trim(bountyTokenAmount.toLocaleString('en-US', {useGrouping:false}), 6) : '';
    

    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const [invalidity, setInvalidity] = useState({
        tokenAmount: '',
    });

    const setAmountInvalidity = ({rewardAmountFiat, rewardAmountToken}) => {
        if(rewardAmountFiat === '' || rewardAmountToken === '') {
            setInvalidity((prev) => ({...prev, tokenAmount: ''}));
        }
    }

    const [ inProgress, setInProgress ] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let isValid = true;

        // check if reward is not 0
        
        if ( !fundBountyState.amount || 0 >= parseFloat(fundBountyState.amount) ) {
            
            setInvalidity((prevState) => ({
                ...prevState,
                tokenAmount: 'Please enter a valid reward amount'
            }))
            
            isValid = false;
        }
        

        if (!isValid) {
            return;
        }
        
        try {
            const res = await moralisAuthentication( authenticate, isAuthenticated, user, account, toast, isWalletConnect, chainId )
            if (
                !res ||
                !signer ||
                !fundBountyState.amount ||
                !fundBountyState.maxAmount ||
                !bountyTokenAmount
              )
                return
        
            setInProgress(true);
                
            const isNative = fundBountyState.currency.isNative;
            // const tokenVersion = isNative ? BountyTokenVersion.Native : BountyTokenVersion.ERC20
    
            if (!isNative) {
                if (approval === ApprovalState.UNKNOWN || approval === ApprovalState.PENDING) return
                if (approval == ApprovalState.NOT_APPROVED) {
                    await approveCallback()
                    // return so that the user can attempt once again to create (after the approval is done)
                    return; 
                }
            }

            const transaction = await fundBounty(
                dispatch,
                bid,
                bountyTokenAmount,
                chainId,
                bountyState?.bounty?.bountyId,
                signer,
                fundBountyState.amount,
                account,
                isNative
              )

            if(transaction && transaction.hash) {
                props.appendContribution({ contributor: account, amount: BigNumber.from(fundBountyState.amount), refunded: false});
            }
            // console.log(fundedBountyTransaction);
            onClose();
            setInProgress(false);
        } catch(e) {
            setInProgress(false);
            // console.log(e)
        }

    }

    const disableFundButton = bountyState.waitingDrainConfirmation || bountyState.waitingPayout || bountyState.waitingSubmissionConfirmation || bountyState.creating || bountyState.bounty.isCompleted || props.isExpired;

    const handleFunding = async () => {
      
        if( connected ) onOpen();
        else {
          setNextAction('open');
          connect(connectorInjected);
        }
    }

    useEffect(() => {
        if(connected) {
            if(nextAction === 'open') {
                onOpen();
            }
            setNextAction(null);
        }
    }, [connected])

    return(
        <>
            <Button colorScheme={themeColor} disabled={disableFundButton} onClick={handleFunding} w='100%'>Fund this Round</Button> 

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>Fund this Round</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={ handleSubmit }>
                    <ModalBody>
                    <Text mb={3}>
                            You can add funds as a way of supporting or sponsoring this Round. Funds added will be be added to a pool to be rewarded to the Round contributors when work is accepted. 
                        </Text>
                    <PriceSelector token={{address: props?.bountyMetadata?.tokenAddress, symbol: props?.bountyMetadata?.tokenSymbol}} invalidity={{rewardAmountFiat: invalidity.tokenAmount, rewardAmountToken: invalidity.tokenAmount}} setInvalidity={setAmountInvalidity} fund={true} />
                    </ModalBody>

                    <ModalFooter>
                        <Center><VStack>
                            <Button
                                isDisabled={ !account || inProgress || (!bountyState.bounty?.issueTxId && !bountyState.bounty?.metadataUrl) }
                                isLoading={ inProgress }
                                colorScheme={themeColor}
                                type="submit"
                                px={10}
                                fontSize="xl"
                                fontWeight="extrabold"
                                size="lg"
                                >
                                {account ? (<Box>{(!fundBountyState?.currency?.isNative && approval !== ApprovalState.APPROVED) ? 'Approve Spending' : 'Fund this Round'} <br/><Text fontWeight="light" fontSize="xs">({formattedAmount} {fundBountyState?.currency?.symbol})</Text></Box>) : (<Box>Create Bounty</Box>)}

                            </Button>

                            </VStack>
                        </Center>
                    </ModalFooter>
                </form>
                </ModalContent>
            </Modal>
            </>
        
    );
}
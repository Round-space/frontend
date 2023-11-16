import { useEffect, useState, useCallback } from "react";
import BountyStep1 from "./BountyStep1";
import BountyStep2 from "./BountyStep2";
import BountyStep3 from "./BountyStep3";
import {
    Grid,
    Box,
    Stack,
    Heading,
    useToast,
    Spacer,
    Flex,
    Button,
    Text,
    Input,
    Link,
    ScaleFade,
    OrderedList,
    ListItem,
    IconButton,
    useClipboard,
    Alert,
    AlertIcon,
    // useBreakpointValue
} from '@chakra-ui/react';
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useStep } from "../../hooks/useStep";
import { Step } from "./Step";
import BountyGraphic from "./BountyGraphic";
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";
import useNativeCurrency from "../../hooks/useNativeCurrency";
import { BountyTokenVersion } from '../../constants/standardBounties'
import { toCurrency } from '../../utils/currency'
import { initCurrencyValue, setNewBountyAmount, setNewBountyMaxAmount } from '../../reducers/bountytoken/reducer'
import { useAppDispatch, useAppSelector } from '../../reducers/index'
import { Bounty } from "../../data/model";
import { toDecimal } from "../../utils/bignumber";
import { createBountyMetadata, getGnosisAssets, moralisAuthentication } from "../../lib/utils";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
// import { trim } from '../../utils/formatting'
// import { toDate } from 'date-fns-tz'
import { fromUnixTime, format } from 'date-fns'

import Moralis from 'moralis'
import { supportedChains } from "../../constants/network";
import { getTokenPrice } from '../../reducers/bountytoken/asyncActions'
import { useRouter } from "next/router";

import { FaExternalLinkAlt } from 'react-icons/fa'
import { ApprovalState, useApproveCallback, } from '../../hooks/useApproveCallback'
import { getChainDetails } from "../../constants/addresses";
// import { IBountyMetadata } from "../../web3/contractService";
import { publishBounty } from "../../reducers/bounty/asyncActions";

import Safe from '@gnosis.pm/safe-core-sdk'
import { EthAdapter } from '@gnosis.pm/safe-core-sdk-types';
import { SafeService, SafeEthersSigner } from '@gnosis.pm/safe-ethers-adapters'
import EthersAdapter, { EthersAdapterConfig } from '@gnosis.pm/safe-ethers-lib'
import { ethers } from "ethers";
import { gnosisServiceUrls } from "../../constants/network";


const steps = [
    {
        title: 'Details',
    },
    {
        title: 'Settings',
    },
    {
        title: 'Launch',
    }
]

let autoSaveTimeout = null, justLoaded = true;

export default function CreateSteps({ draftId }): JSX.Element {

    const { data: accountData } = useAccount();
    const account = accountData?.address
    const isWalletConnect = accountData?.connector?.id === "walletConnect"
    const { data: signer } = useSigner();
    const { activeChain: chain } = useNetwork();
    const chainId = chain?.id;
    const bountyContractAddress = chainId
        ? getChainDetails(chainId)?.address
        : null
    const { isAuthenticated, user, authenticate } = useMoralis()
    const nativeCurrency = useNativeCurrency()
    const dispatch = useAppDispatch()
    const toast = useToast()
    const [isDraftOwner, setIsDraftOwner] = useState(false)
    const { token } = useMoralisWeb3Api()
    const router = useRouter();
    const [draft, setDraft] = useState(null);
    // const isMobile = useBreakpointValue({ base: true, md: false })

    const gnosisService = gnosisServiceUrls[chainId] ? new SafeService(gnosisServiceUrls[chainId]) : null

    const [errorMessage, setErrorMessage] = useState(null);

    const provider = useProvider();

    const [invalidityStep1, setInvalidityStep1] = useState({
        links: [],
        description: '',
        name: '',
    });

    const [invalidityStep2, setInvalidityStep2] = useState({
        email: '',
        deadline: '',
        gnosis: '',
        tokenAmount: ''
    });

    const [invaliditySteps, setInvaliditySteps] = useState([
        false,
        false
    ])

    // hold new bounty metadata in a local state
    const [bountyMetadata, setBountyMetadata] = useState({
        name: null,
        description: null,
        links: [''],
        requiresApplication: false,
        publicSubmissions: false,
        externalFunding: true,
        showContributors: true,
        email: undefined,
        gnosis: undefined,
        forAddresses: [],
        deadline: null,
        applicationsDeadline: null,
        tokenAmount: null,
        voting: false,
        votingStart: null,
        votingEnd: null,
        votingNFT: null,
        numRewards: 1
    })

    const [helperData, setHelperData] = useState({
        onlyForAddresses: false,
        forAddresses: [],
        tokenAmount: '',
        isSavingDraft: false,
        isCreatingBounty: false,
        isLoadingPreview: false,
        inGnosisApproval: false
    });

    const [currentStep, { setStep }] = useStep({ maxStep: steps.length, initialStep: 0 })

    const walletState = useAppSelector((state) => state.wallet)
    const createBounty = useAppSelector((state) => state.createBounty)
    const bountyTokenAmount = createBounty.amount ? toDecimal(createBounty.amount, createBounty.currency) : 0;
    // const formattedAmount = bountyTokenAmount ? trim(bountyTokenAmount.toLocaleString('en-US', {useGrouping:false}), 6) : '';
    const [previewUrl, setPreviewUrl] = useState('')
    const { hasCopied, onCopy } = useClipboard(previewUrl)
    const [gnosisSigner, setGnosisSigner] = useState(null);

    const gotoPreview = useCallback(() => {
        setHelperData((prevState) => ({
            ...prevState,
            isLoadingPreview: true
        }));

        if (draft) {
            // router.push('/bounty/' + draft);
            // open in a new tab
            window.open('/bounty/' + draft, '_blank');
        }
    }, [draft])


    useEffect(() => {
        if (draft) {
            setPreviewUrl(window.location.protocol + '//' + window.location.host + '/bounty/' + draft)
        }
    }, [draft])

    useEffect(() => {
        if (draftId) {
            setDraft(draftId)
        }
    }, [draftId])

    useEffect(() => {
        if (bountyMetadata.voting) {
            setBountyMetadata((prev) => ({ ...prev, requiresApplication: false }));
            setBountyMetadata((prev) => ({ ...prev, publicSubmissions: true }));

        }
    }, [bountyMetadata?.voting])

    useEffect(() => {
        if (helperData?.onlyForAddresses === true) {
            setBountyMetadata((prev) => ({ ...prev, forAddresses: [...helperData?.forAddresses] }));
        } else {
            setBountyMetadata((prev) => ({ ...prev, forAddresses: [] }));
        }
    }, [helperData?.onlyForAddresses])

    useEffect(() => {
        if (helperData?.onlyForAddresses === true) {
            setBountyMetadata((prev) => ({ ...prev, forAddresses: [...helperData?.forAddresses] }));
        }
    }, [helperData?.forAddresses])

    useEffect(() => {
        if( bountyMetadata?.gnosis && signer) {
            // prepare gnosis signer, which will be used in gnosis context
            const ethAdapter = new EthersAdapter({
                ethers,
                signer
            } as EthersAdapterConfig );

            Safe.create({
                // ignore the error for now, as the issue lies with the gnosis sdk
                // @ts-ignore
                ethAdapter: ethAdapter as EthAdapter,
                safeAddress: bountyMetadata?.gnosis,
            }).then(async (safe) => {
                const gnosisSigner = bountyMetadata?.gnosis ? await new SafeEthersSigner(safe, gnosisService, provider) : null;
                setGnosisSigner(gnosisSigner);
            });
        }
        if( !bountyMetadata?.gnosis ) {
            setGnosisSigner(null);
        }
    }, [bountyMetadata?.gnosis, signer])

    useEffect(() => {
        if (justLoaded) {
            return;
        }

        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        if (!isAuthenticated) {
            return;
        }

        if (draft && !helperData.isSavingDraft) {
            autoSaveTimeout = setTimeout(() => {
                saveDraft();
            }, 3000);
        }
    }, [bountyMetadata, createBounty?.amount, createBounty?.currency])


    useEffect(() => {
        let invalid = false;
        Object.keys(invalidityStep1).forEach(key => {
            if (Array.isArray(invalidityStep1[key])) {
                invalidityStep1[key].forEach(obj => {
                    if (obj) {
                        invalid = true;
                        return;
                    }
                })
            }
            else if (invalidityStep1[key]) {
                invalid = true;
                return;
            }
        })

        setInvaliditySteps((prevState) => {
            const newState = [...prevState];
            newState[0] = invalid;
            return newState;
        })

    }, [invalidityStep1]);

    useEffect(() => {
        let invalid = false;
        Object.keys(invalidityStep2).forEach(key => {
            if( Array.isArray(invalidityStep2[key])) {
                invalidityStep2[key].forEach(obj => {
                    if( obj ) {
                        invalid = true;
                        return;
                    }
                })
            }
            else if(invalidityStep2[key]) {
                invalid = true;
                return;
            }
        })

        setInvaliditySteps((prevState) => {
            const newState = [...prevState];
            newState[1] = invalid;
            return newState;
        })

    }, [invalidityStep2]);

    useEffect(() => {
        if( bountyMetadata.gnosis ) {
            getGnosisAssets(chainId, bountyMetadata.gnosis, (data) => {
                const nativeGnosisAsset = data.items.find(({tokenInfo}) => tokenInfo.type === 'NATIVE_TOKEN');
                if (nativeGnosisAsset) {
                    dispatch(
                        initCurrencyValue({
                            amount: nativeGnosisAsset.balance,
                            currency: {
                                chain: chainId,
                                decimals: nativeCurrency.decimals,
                                isNative: nativeCurrency.isNative,
                                isToken: false,
                                name: nativeCurrency.name,
                                symbol: nativeCurrency.symbol,
                                logo: nativeCurrency.logo,
                                token_address: nativeCurrency.token_address,
                            }
                        })
                    );

                }
            })
        } else {
            dispatch(
                initCurrencyValue({
                    amount: walletState.nativeBalance,
                    currency: {
                        chain: chainId,
                        decimals: nativeCurrency.decimals,
                        isNative: nativeCurrency.isNative,
                        isToken: false,
                        name: nativeCurrency.name,
                        symbol: nativeCurrency.symbol,
                        logo: nativeCurrency.logo,
                        token_address: nativeCurrency.token_address,
                    },
                })
            )
        }
    }, [bountyMetadata?.gnosis])

    useEffect(() => {
        // only if it is not a previously saved draft
        if (chainId) {
            if (draft) {
                // only update the maxamount, the user edited amount will be loaded from the draft data
                dispatch(setNewBountyMaxAmount(walletState.nativeBalance));
            } else {
                // if its a new draft, then populate the priceselector by default means
                dispatch(
                    initCurrencyValue({
                        amount: walletState.nativeBalance,
                        currency: {
                            chain: chainId,
                            decimals: nativeCurrency.decimals,
                            isNative: nativeCurrency.isNative,
                            isToken: false,
                            name: nativeCurrency.name,
                            symbol: nativeCurrency.symbol,
                            logo: nativeCurrency.logo,
                            token_address: nativeCurrency.token_address,
                        },
                    })
                )
            }
        }
    }, [walletState.nativeBalance])

    // the following will run only if the request comes from create/[draft].tsx page
    useEffect(() => {
        if (draft && account) {

            const query = new Moralis.Query('Bounty');
            query.get(draft).then(bountyDraft => {

                const creatorAddress = bountyDraft.get('creatorAddress');

                if (creatorAddress !== account) {
                    setIsDraftOwner(false);
                    setErrorMessage('You are not the owner of this draft. You can only edit your own drafts.');
                    return
                }

                const issueTxId = bountyDraft.get('extId');

                if (issueTxId) {
                    setErrorMessage('This draft is already published. You cannot edit it.');
                    return
                }


                setIsDraftOwner(true);

                const deadline = bountyDraft.get('deadline');
                const applicationsDeadline = bountyDraft.get('applicationsDeadline');
                const tokenAmount = bountyDraft.get('tokenAmount');
                const votingStart = bountyDraft.get('votingStart');
                const votingEnd = bountyDraft.get('votingEnd');
                const votingNFT = bountyDraft.get('votingNFT');

                setBountyMetadata({
                    name: bountyDraft.get('name'),
                    description: bountyDraft.get('description'),
                    links: bountyDraft.get('url').split('\n'),
                    requiresApplication: bountyDraft.get('requiresApplication'),
                    voting: bountyDraft.get('voting'),
                    publicSubmissions: bountyDraft.get('publicSubmissions'),
                    externalFunding: bountyDraft.get('externalFunding'),
                    showContributors: bountyDraft.get('showContributors'),
                    forAddresses: bountyDraft.get('forAddresses'),
                    deadline: deadline ? format(fromUnixTime(deadline), 'yyyy-MM-dd') : '',
                    applicationsDeadline: applicationsDeadline ? format(fromUnixTime(applicationsDeadline), 'yyyy-MM-dd') : '',
                    // creatorAddress: bountyDraft.creatorAddress,
                    // tokenSymbol: bountyDraft.tokenSymbol,
                    // tokenAddress: bountyDraft.tokenAddress,
                    tokenAmount: bountyDraft.get('tokenAmount') || 0,
                    // tokenVersion: bountyDraft.tokenVersion,
                    gnosis: bountyDraft.get('gnosis'),
                    email: bountyDraft.get('email'),
                    votingStart: votingStart ? format(fromUnixTime(votingStart), 'yyyy-MM-dd') : '',
                    votingEnd: votingEnd ? format(fromUnixTime(votingEnd), 'yyyy-MM-dd') : '',
                    votingNFT: votingNFT ? votingNFT : null,
                    numRewards: bountyDraft.get('numRewards') || 1
                })

                // set helper data
                setHelperData((prevState) => ({
                    ...prevState,
                    forAddresses: bountyDraft.get('forAddresses')
                }));

                // set currency and createState object
                const tokenVersion = bountyDraft.get('tokenVersion');
                const tokenSymbol = bountyDraft.get('tokenSymbol');
                const tokenAddress = bountyDraft.get('tokenAddress');

                if (tokenVersion === BountyTokenVersion.Native) {
                    const currency = {
                        chain: chainId,
                        decimals: nativeCurrency.decimals,
                        isNative: nativeCurrency.isNative,
                        isToken: false,
                        name: nativeCurrency.name,
                        symbol: nativeCurrency.symbol,
                        logo: nativeCurrency.logo,
                        token_address: nativeCurrency.token_address,
                    };

                    setHelperData((prevState) => ({
                        ...prevState,
                        tokenAmount: tokenAmount?.toString(),
                    }));

                    dispatch(
                        initCurrencyValue({
                            amount: walletState.nativeBalance,
                            currency
                        })
                    );

                    // set the create new bounty amount from the draft
                    if (tokenAmount) {
                        dispatch(setNewBountyAmount(tokenAmount));
                    }

                    getTokenPrice(dispatch, currency, token);

                } else {

                    const hexChainId = `0x${supportedChains[0]?.toString(16)}`;

                    token.getTokenMetadata({
                        chain: hexChainId as "eth" | "0x1" | "ropsten" | "0x3" | "rinkeby" | "0x4" | "goerli" | "0x5" | "kovan" | "0x2a" | "polygon" | "0x89" | "mumbai" | "0x13881" | "bsc" | "0x38" | "bsc testnet" | "0x61" | "avalanche" | "0xa86a" | "avalanche testnet" | "0xa869" | "fantom" | "0xfa" | undefined,
                        addresses: [tokenAddress],
                    }).then(async res => {
                        if (!res.length) {
                            return;
                        }
                        const tokenCurrency = {
                            chain: chainId,
                            token_address: tokenAddress,
                            symbol: tokenSymbol,
                            isNative: false,
                            decimals: parseInt(res[0]['decimals']),
                            name: res[0]['name'],
                            isToken: true,
                        }

                        const tokenBalance = walletState.tokenBalance.find(({ token_address }) => token_address === tokenAddress);

                        // set the create new bounty currency and max amount
                        const currentToken = {
                            currency: tokenCurrency,
                            amount: tokenBalance?.balance ? tokenBalance.balance : '0'
                        }

                        dispatch(initCurrencyValue(currentToken));

                        // set the create new bounty amount from the draft
                        if (tokenAmount) {
                            dispatch(setNewBountyAmount(tokenAmount));
                        }

                        getTokenPrice(dispatch, currentToken.currency, token);
                    })

                }

            })
                .catch(() => {
                    // console.log(err);
                    toast({
                        title: 'An error occured',
                        description: 'Please try again',
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                        position: 'top',
                    })
                })
                .finally(() => {
                    setTimeout(() => {
                        justLoaded = false;
                    }, 200);
                })
        }
    }, [draft, account, walletState.tokenBalance])

    const createMetadata = useCallback(() => {
        return createBountyMetadata(bountyMetadata, account, createBounty, BountyTokenVersion, account);
    }, [bountyMetadata, account, createBounty, BountyTokenVersion]);

    const saveDraft = async () => {

        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;

        try {

            const res = await moralisAuthentication(authenticate, isAuthenticated, user, account, toast, isWalletConnect, chainId)

            if (
                !res ||
                !signer ||
                !(!draft || isDraftOwner)
            ) {
                return
            }

            setHelperData((prevState) => ({
                ...prevState,
                isSavingDraft: true,
            }));

            const draftBounty = new Bounty()

            if (draft) {
                draftBounty.id = draft;
            }

            const metaData = createMetadata();


            for (const key in metaData) {
                draftBounty.setKeyValue(key, metaData[key]);
            }

            const savedItem = await draftBounty.save();

            setHelperData((prevState) => ({
                ...prevState,
                isSavingDraft: false,
            }));

            // store the new draftId in memory
            if (!draft) {
                setDraft(savedItem.id);
                setIsDraftOwner(true);
                // not actually reloading the page, just setting the new link in the browser history, so that it loads on refresh
                setTimeout(() => {
                    window.history.pushState({}, '', `/bounty/create/${savedItem.id}`);
                }, 0);
                toast({
                    title: 'New Draft Created',
                    description: 'You can always come back to this draft later',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                    position: 'top',
                })
                // window history push with the same content on the current page

                setTimeout(() => {
                    justLoaded = false;
                }, 200);
            }


        } catch (error) {
            setHelperData((prevState) => ({
                ...prevState,
                isSavingDraft: false,
            }));
        }
    }

    const checkValidity = (e) => {
        e.preventDefault();

        let isValid = true;

        // Step 1 validations
        // check if fields are empty
        [
            { key: 'name', label: 'Title' },
            { key: 'description', label: 'Description' }
        ].forEach(({ key, label }) => {
            if (!bountyMetadata?.[key] || bountyMetadata[key]?.length === 0) {
                // set it to display the error
                setInvalidityStep1((prevState) => ({
                    ...prevState,
                    [key]: `Please fill out a ${label}`
                }))
                isValid = false;
            }
        })

        // prune the empty links
        const links = bountyMetadata.links.filter(link => link.trim().length > 0);

        // check if links are valid
        for (let i = 0; i < Math.min(links?.length, 3); i++) {
            const link = bountyMetadata?.links?.[i];
            if (!link || !link.match(/^(?:https?):\/\/(?:[\w-]+\.)+[\w-]+(?:\/[\w-./?%&=]*)?$/)) {
                setInvalidityStep1((prevState) => {
                    const links = [...prevState['links']];
                    links[i] = 'Invalid link';
                    return {
                        ...prevState,
                        links
                    }
                })

                isValid = false;
            }
        }
        // in case some links have been pruned, update the state
        if (links.length !== bountyMetadata.links.length) {
            // must have atleast one link field to show
            if (links.length === 0) {
                links.push('');
            }
            setBountyMetadata((prevState) => ({
                ...prevState,
                links
            }))
        }

        // Step 2 validations

        // check if fields are empty
        [
            { key: 'deadline', label: 'Deadline' },
            ...(bountyMetadata.voting ? [{ key: 'votingStart', label: 'Voting Start' },
            { key: 'votingEnd', label: 'Voting End' }] : [])
        ].forEach(({ key, label }) => {
            if (!bountyMetadata?.[key] || bountyMetadata[key]?.length === 0) {
                // set it to display the error
                setInvalidityStep2((prevState) => ({
                    ...prevState,
                    [key]: `Please fill out a ${label}`
                }))
                isValid = false;
            }
        })

        // check if email if not empty, is valid
        if (bountyMetadata?.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(bountyMetadata.email)) {
            setInvalidityStep2((prevState) => ({
                ...prevState,
                email: 'Invalid email'
            }))
            isValid = false;
        }

        // check if date is not in the past
        const dateDeadline = new Date(bountyMetadata?.deadline);
        if (dateDeadline.getTime() < Date.now()) {
            setInvalidityStep2((prevState) => ({
                ...prevState,
                deadline: 'Deadline must be in the future'
            }));
            isValid = false;
        }

        if( bountyMetadata.voting ) {
            
            // check if votingStart is not in the past
            const votingStart = new Date(bountyMetadata?.votingStart);
            if (votingStart.getTime() < Date.now()) {
                setInvalidityStep2((prevState) => ({
                    ...prevState,
                    votingStart: 'Voting start must be in the future'
                }));
                isValid = false;
            }

            // check if votingEnd is not in the past
            const votingEnd = new Date(bountyMetadata?.votingEnd);
            if (votingEnd.getTime() < Date.now()) {
                setInvalidityStep2((prevState) => ({
                    ...prevState,
                    votingEnd: 'Voting end must be in the future'
                }));
                isValid = false;
            }

            // check if votingEnd is not after deadline
            if (votingEnd.getTime() >= dateDeadline.getTime() ) {
                setInvalidityStep2((prevState) => ({
                    ...prevState,
                    votingEnd: 'Voting end must be before deadline'
                }));
                isValid = false;
            }

            // check if voting Start is not after the deadline
            if (votingStart.getTime() >= dateDeadline.getTime() ) {
                setInvalidityStep2((prevState) => ({
                    ...prevState,
                    votingStart: 'Voting start must be before deadline'
                }));
                isValid = false;
            }

            // check if votingEnd is not before votingStart
            if (votingEnd.getTime() <= votingStart.getTime()) {
                setInvalidityStep2((prevState) => ({
                    ...prevState,
                    votingEnd: 'Voting end must be after voting start',
                    votingStart: 'Voting start must be before voting end'
                }));
                isValid = false;
            }

            if(isValid) {
                setInvalidityStep2((prevState) => ({
                    ...prevState,
                    votingEnd: '',
                    votingStart: ''
                }));
            }

        }

        // check if reward is not 0
        if (!createBounty.amount || 0 >= parseFloat(createBounty.amount)) {
            setInvalidityStep2((prevState) => ({
                ...prevState,
                tokenAmount: 'Please enter a valid reward amount'
            }))

            isValid = false;
        }

        // check if 'onlyFor Addresses' are valid
        // check if links are valid
        // for (let i = 0; i < Math.min(bountyMetadata?.forAddresses?.length, 3); i++) {
        //     const address = bountyMetadata?.forAddresses?.[i];

        //     // check if a valid address
        //     if (!ethers.utils.isAddress(address)) {

        //         setInvalidityStep2((prevState) => {
        //             const addresses = prevState.addresses || [];
        //             addresses[i] = 'Invalid address';
        //             return {
        //                 ...prevState,
        //                 addresses
        //             }
        //         })

        //       isValid = false;
        //     }
        // }

        // atleast one of the field was invalid so not processing further
        if (!isValid) {
            return false;
        }

        return true;
    }
    const currency = toCurrency(createBounty.currency)

    const amountToApprove =
        currency && createBounty.amount
            ? CurrencyAmount.fromRawAmount(currency, createBounty.amount)
            : null

    const [approval, approveCallback, approving] = useApproveCallback(
        amountToApprove,
        bountyContractAddress,
        bountyMetadata?.gnosis ? bountyMetadata?.gnosis : null,
        gnosisSigner
    )

    // enable button again once funds have been approved
    useEffect(() => {
        if (approval === ApprovalState.APPROVED) {
            setHelperData((prevState) => ({
                ...prevState,
                isCreatingBounty: false,
                inGnosisApproval: false
            }));
        }
    }, [approval])

    useEffect(() => {
        if( approving && bountyMetadata?.gnosis ) {
            setHelperData((prevState) => ({
                ...prevState,
                inGnosisApproval: true
            }));
        } else {
            setHelperData((prevState) => ({
                ...prevState,
                inGnosisApproval: false
            }));
        }
    }, [approving])

    const handleCreateBounty = async (e) => {

        if (!checkValidity(e)) {
            return;
        }

        try {

            const res = await moralisAuthentication(authenticate, isAuthenticated, user, account, toast, isWalletConnect, chainId)

            if (
                !res ||
                !signer ||
                !createBounty.amount ||
                !createBounty.maxAmount ||
                !bountyTokenAmount
            ) {
                return;
            }


            const isNative = createBounty.currency.isNative;
            const tokenVersion = isNative ? BountyTokenVersion.Native : BountyTokenVersion.ERC20

            setHelperData((prevState) => ({
                ...prevState,
                isCreatingBounty: true,
            }));


            if (!isNative) {
                if (approval === ApprovalState.UNKNOWN || approval === ApprovalState.PENDING) return

                if (approval == ApprovalState.NOT_APPROVED) {
                    await approveCallback()
                    // return so that the user can attempt once again to create (after the approval is done)
                    return;
                }
            }

            const metaData = createMetadata();

            const ethAdapter = new EthersAdapter({
                ethers,
                signer
            } as EthersAdapterConfig );

            const safe = await Safe.create({
                // ignore the error for now, as the issue lies with the gnosis sdk
                // @ts-ignore
                ethAdapter: ethAdapter as EthAdapter,
                safeAddress: bountyMetadata?.gnosis,
            });

            const gnosisSigner = bountyMetadata?.gnosis ? await new SafeEthersSigner(safe, gnosisService, provider) : null

            const publishedBounty = await publishBounty(
                dispatch,
                signer,
                chainId,
                metaData,
                tokenVersion,
                createBounty.amount,
                metaData.deadline,
                createBounty.currency.decimals,
                draft,
                gnosisService ? bountyMetadata?.gnosis ?? null : null,
                gnosisSigner,
                null
            )

            if (publishedBounty != null && publishedBounty) {
                const bountyUrl = '/bounty/' + publishedBounty.id
                router.push(bountyUrl)
            }
            else {
                setHelperData((prevState) => ({
                    ...prevState,
                    isCreatingBounty: false,
                }));
            }
        } catch (err) {
            setHelperData((prevState) => ({
                ...prevState,
                isCreatingBounty: true,
            }));
        }
    }

    // const { isOpen, onToggle } = useDisclosure()

    const previewLinkField = draft && 
    (<ScaleFade initialScale={0.7} in={draft}>
        <Stack gap='0'>
        <Heading size="sm" fontWeight="bold" >Link to your Round:</Heading>
           
        <Flex gap={2} py={3} bgColor="white" justifyContent="space-between" alignItems="center">
            <Input rounded="lg" size="sm" value={previewUrl} isReadOnly placeholder='' />
            <Button onClick={onCopy} size="sm">{hasCopied ? 'Copied!' : 'Copy'}</Button>
            <IconButton aria-label='Preview Link' onClick={gotoPreview} icon={<FaExternalLinkAlt cursor="pointer"/>} size="sm"/>
        </Flex>
    </Stack>
    </ScaleFade>);

   



    const saveDraftButton = <Button variant="outline" colorScheme="black" borderRadius="6" p="6" onClick={saveDraft} isLoading={helperData?.isSavingDraft} loadingText="Saving..." isDisabled={helperData?.isSavingDraft}>Save Draft</Button>;
    const smallSaveDraftButton = <Button variant="outline" colorScheme="black" borderRadius="6" size="xs" onClick={saveDraft} isLoading={helperData?.isSavingDraft} loadingText="Saving..." isDisabled={helperData?.isSavingDraft}>Save Draft</Button>;

    const mintBountyButton = <Button
        variant="solid"
        bg="#000"
        colorScheme="white"
        flexGrow={1}
        p="6"
        borderRadius="6"
        borderWidth={1}
        onClick={handleCreateBounty}
        isDisabled={helperData.isCreatingBounty}
        isLoading={helperData.isCreatingBounty}>
        {account ? (<Box>{(!createBounty.currency?.isNative && approval !== ApprovalState.APPROVED) ?
            'Approve Spending' :
            'Launch Round'}
        </Box>
        ) : (<Box>Start Round</Box>)}

    </Button>;
    const continueButton = <Button variant="solid" bg="#000" colorScheme="white" flexGrow={1} p="6" borderRadius="6" onClick={() => setStep(currentStep + 1)}>Continue</Button>;

    const wizardNavigationSteps = 
    (<Stack spacing="0" direction={{ base: 'column', md: 'row' }}>
        {steps.map((step, id) => (
            <Step
                key={id}
                cursor="pointer"
                onClick={() => setStep(id)}
                title={step.title}
                index={id + 1}
                isInvalid={invaliditySteps[id]}
                isActive={currentStep === id}
                isCompleted={currentStep > id}
                isFirstStep={id === 0}
                // isLastStep={steps.length === id + 1} 
                />
        ))}
    </Stack>);

const discordURL = "https://discord.gg/JKjY5tmvSu";
const docsURL = "https://docs.round.space"


 const whatNextCTA = (
    <>        <Heading size="md" fontWeight="bold" mb={2}>You&apos;re almost there...</Heading>

    <Box p={4} rounded="2xl" borderWidth={1} borderColor="gray.200" bgColor="gray.50">

        <OrderedList>
  <ListItem mb={3}>
      <span><b>🔍 Review details:</b> Check all the Details and Settings sections in this wizard. If you&apos;re not quite ready to launch yet, just {smallSaveDraftButton}.</span>

  </ListItem>

  <ListItem mb={3}>
      <Text><b>🚀 Launch your Round!</b> Once you launch your Round, you will be able to accept submissions. This will require an onchain transaction to custody reward tokens (more information in our <Link fontWeight="bold" href="/dashboard" target="_blank">docs<ExternalLinkIcon mx='2px' /></Link>)</Text>
</ListItem>
  <ListItem mb={3}>
      <span>
        <b>🔗 Share with your community:</b> After your transaction is confirmed, you will be redirected to the <Link fontWeight="bold" href={previewUrl} target="_blank">Round page <ExternalLinkIcon mx='2px' /></Link>, which you can share anywhere. You can also use <Link fontWeight="bold" href="/dashboard" target="_blank">Round.Space<ExternalLinkIcon mx='2px' /></Link> to manage multiple Rounds and build a contributor network.
        </span>
    </ListItem>
</OrderedList>




    </Box>
    <Text>If you have any questions, please feel free to ask in our <Link fontWeight="bold" href={discordURL} target="_blank">Discord</Link> or check out the <Link fontWeight="bold" href={docsURL} target="_blank">docs</Link>. </Text>
    </>
);
    const wizardStepContent = (
    <Stack> 
        <Box>
            {!currentStep &&
                <BountyStep1
                    bountyMetadata={bountyMetadata}
                    setBountyMetadata={setBountyMetadata}
                    invalidity={invalidityStep1}
                    setInvalidity={setInvalidityStep1} 
/>}

            {currentStep === 1 &&
                <BountyStep2
                    bountyMetadata={bountyMetadata}
                    setBountyMetadata={setBountyMetadata} 
                    invalidity={invalidityStep2}
                    setInvalidity={setInvalidityStep2} 
                    />}

            {currentStep === 2 &&
                <BountyStep3>
                    {draft? "No draft" : "Draft"}
                    {whatNextCTA}

                </BountyStep3>}
        </Box>
    </Stack>);

    const wizardPreview = (<Stack pb={2} gap={5}>
        <Box position="fixed" width="lg" display={{ lg: 'block', sm: 'none' }}>
            <Heading mb={4}>Preview</Heading>
            <BountyGraphic bountyMetadata={bountyMetadata} />
            <Spacer mb="6" />
            {previewLinkField}
        </Box>
    </Stack>);

    return (
        <>
            <Box position="fixed" 
                left="0"
                right="0"
                 bottom="0" 
                 width={"100vw"} 
                 px={5}
                 py={5}
                 zIndex="5" 
                 alignItems={'center'}
                 bgColor="gray.300"
                 color="on-accent"
                //  borderRadius={"lg"}
                 opacity="95%"
                 >
                     <Flex id="afterbox">
                         <Stack>
                             <Spacer/>
                            {wizardNavigationSteps}
                            <Spacer/>
                        </Stack>

                        <Spacer />
                        
                        <Flex id="buttoncontainer" gap={2} align='center'>
                            {/* <Flex id="buttons" display={isMobile ? 'none' : 'initial'}>{previewLinkField}</Flex> */}
                            {saveDraftButton}
                            {currentStep === 2 ? 
                            (
                                <Flex align='center' flexWrap={{base: 'wrap', md: 'nowrap'}}>
                                    
                                    { helperData.inGnosisApproval &&  
                                    <Alert status='info' flexBasis={{ base: '100%', md: '50%'}} mx='2'>
                                        <AlertIcon />
                                        <Text fontSize="sm">
                                            You will be able to mint, once Safe transaction for ERC20 token spending is approved. {' '}
                                            <Link href={'https://gnosis-safe.io/app/'+bountyMetadata.gnosis+'/transactions/queue'} target='_blank'>
                                            (Go To Safe <ExternalLinkIcon mx='2px' />)</Link>
                                        </Text>
                                    </Alert>
                                    }
                                    {mintBountyButton}
                                </Flex>
                            ) : 
                            continueButton }                            
                        </Flex>
                    </Flex>
            </Box>

            {(!draft || isDraftOwner) ?
                <>
                <Grid pb="24" px={{ base: '4', lg: '8' }} templateColumns={{ lg: "1fr 1fr", md: "1fr" }} gap={8}>
                    {wizardStepContent}
                    {wizardPreview}
                </Grid>

                 </>
                :
                <>{errorMessage && <Text fontSize="xl" fontWeight="bold" align="center">{errorMessage}</Text>}</>
            }

        </>
    )
}
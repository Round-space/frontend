import { useEffect, useState, useCallback } from "react";
import {
    Box,
    Center,
    Text,
    useToast,
    Flex,
    Button,
    useClipboard,
    GridItem,
    IconButton,
    Input,
    ScaleFade,
    Stack,
    Link,
    HStack,
    Tooltip
} from '@chakra-ui/react';
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";
import useNativeCurrency from "../../hooks/useNativeCurrency";
import { BountyTokenVersion } from '../../constants/standardBounties'
import { toCurrency } from '../../utils/currency'
import { initCurrencyValue, setNewBountyAmount, setNewBountyMaxAmount } from '../../reducers/bountytoken/reducer'
import { RootState, useAppDispatch, useAppSelector } from '../../reducers/index'
import { Bounty } from "../../data/model";
import { toDecimal } from "../../utils/bignumber";
import { createBountyMetadata, getGnosisAssets, moralisAuthentication } from "../../lib/utils";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";

import { fromUnixTime, format } from 'date-fns'

import Moralis from 'moralis'
import { supportedChains } from "../../constants/network";
import { getTokenPrice } from '../../reducers/bountytoken/asyncActions'
import { useRouter } from "next/router";

import { FaExternalLinkAlt } from 'react-icons/fa'
import { ApprovalState, useApproveCallback, } from '../../hooks/useApproveCallback'
import { getChainDetails } from "../../constants/addresses";
import { publishBounty } from "../../reducers/bounty/asyncActions";
import NewBountyForm from "./NewBountyForm";
import Safe from '@gnosis.pm/safe-core-sdk'
import { EthAdapter } from '@gnosis.pm/safe-core-sdk-types';
import { SafeService, SafeEthersSigner } from '@gnosis.pm/safe-ethers-adapters'
import EthersAdapter, { EthersAdapterConfig } from '@gnosis.pm/safe-ethers-lib'
import { ethers } from "ethers";
import { gnosisServiceUrls } from "../../constants/network";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { addToEnsDirectory, appendDraftBounty, setUseTemplate } from "../../reducers/dashboard/state";
import bountyTemplates from "../../constants/bountyTemplates";
import PopoverGuide from './PopoverGuide';
import { useQueryEnsName } from "../../hooks/useQueryEnsName";

let autoSaveTimeout = null, justLoaded = true;

const Collaborator = function({collaborator, gnosisSigWarning}: any) : JSX.Element {
    const { data: accountData } = useAccount();
    const account = accountData?.address

    const walletState = useAppSelector((state) => state.wallet)
    const etherScanUrl = walletState.chainMeta ? walletState.chainMeta.info.explorer : '';

    const dispatch = useAppDispatch();
    
    const ensName = useQueryEnsName(collaborator.address);

    useEffect(() => {
        if(ensName) {
          // just to help the cache
          dispatch(addToEnsDirectory({address: collaborator.address.toLowerCase(), ensName}))
        }
    }, [ensName]);
    
    if(collaborator.address === account) {
        return null;
    }
    return (
        <Box mt='2'>                            
            <HStack>
                <>•</>
                <Link href={`${etherScanUrl}address/${collaborator.address}`} target='_blank'>
                    { ensName ? 
                        <Tooltip label={collaborator.address} placement='top'>
                            <Text fontSize='sm'>{ensName}</Text> 
                        </Tooltip>
                        : <Text fontSize='sm'>{collaborator.address}</Text>
                    }
                    
                </Link>
                { gnosisSigWarning && <PopoverGuide 
                    isWarning={true}
                    title="Warning" 
                    text="This collaborator is not a Signer to the Safe that you are using. If you mint this bounty, they will still have access to admin actions on this bounty." 
                />}
            </HStack>  
        </Box>
    )
}

export default function NewBounty({ draftId }): JSX.Element {

    const { data: accountData } = useAccount();
    const account = accountData?.address
    const isWalletConnect = accountData?.connector?.id === "walletConnect"
    const { data: signer } = useSigner();
    const provider = useProvider();
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
    const [approvers, setApprovers] = useState(null);
    const [gnosisSigs, setGnosisSigs] = useState([]);

    const dashBoardState = useAppSelector((state: RootState) => { return state.dashBoard });

    const gnosisService = gnosisServiceUrls[chainId] ? new SafeService(gnosisServiceUrls[chainId]) : null
    const themeColor = dashBoardState.metadata.themeColor;

    const collaborators = dashBoardState.collaborators;
    
    const [errorMessage, setErrorMessage] = useState(null);

    const [invalidityStep1, setInvalidityStep1] = useState({
        links: [],
        description: '',
        name: '',
        deadline: '',
        votingStart: '',
        votingEnd: '',
        tokenAmount: ''
    });


    // hold new bounty metadata in a local state
    const [bountyMetadata, setBountyMetadata] = useState({
        name: null,
        description: null,
        links: [''],
        requiresApplication: false,
        voting: false,
        publicSubmissions: false,
        externalFunding: true,
        showContributors: true,
        forAddresses: [],
        deadline: null,
        numRewards: 1,
        gnosis: undefined,
        applicationsDeadline: null,
        votingStart: null,
        votingEnd: null,
        votingNFT: null,
        tokenAmount: null
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



    const walletState = useAppSelector((state) => state.wallet)
    
    const createBounty = useAppSelector((state) => state.createBounty)
    const bountyTokenAmount = createBounty.amount ? toDecimal(createBounty.amount, createBounty.currency) : 0;
    // const formattedAmount = bountyTokenAmount ? trim(bountyTokenAmount.toLocaleString('en-US', {useGrouping:false}), 6) : '';
    const [previewUrl, setPreviewUrl] = useState('')
    const { hasCopied, onCopy } = useClipboard(previewUrl)
    const [templateName, setTemplateName] = useState(''); 

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
        if(dashBoardState.useTemplate !== null) {
            
            const templateData = bountyTemplates[dashBoardState.useTemplate];

            if(templateData) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { template, ...rest} = templateData;
                setBountyMetadata((prev) => ({ ...prev, ...rest }));
                setTemplateName(templateData.template);
                dispatch(setUseTemplate(null));
            }
        }
    }, [dashBoardState.useTemplate])

    useEffect(() => {
        if (draftId) {
            // console.log('setting draft id', draftId)
            setDraft(draftId)
        }
    }, [draftId])

    useEffect(() => {
        setApprovers([...(collaborators ? collaborators : []), ...(dashBoardState.board ? [{address: dashBoardState.board}] : [])])
    }, [collaborators, dashBoardState.board])

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
        if (bountyMetadata.gnosis === undefined && dashBoardState.metadata.gnosis) {

            const gnosisSafeContract = new ethers.Contract(dashBoardState.metadata?.gnosis, ['function isOwner(address) view returns (bool)', 'function getOwners() view returns (address[])'], provider);
            gnosisSafeContract.getOwners().then(owners => {
                setGnosisSigs(owners);
                if(owners.includes(account)) {
                    setBountyMetadata((prev) => ({ ...prev, gnosis: dashBoardState.metadata.gnosis }));
                }
            })
            
        }
        
    }, [dashBoardState.metadata?.gnosis, bountyMetadata?.gnosis, account])


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
        if (bountyMetadata.voting) {
            setBountyMetadata((prev) => ({ ...prev, requiresApplication: false }));
            setBountyMetadata((prev) => ({ ...prev, publicSubmissions: true }));

        }
    }, [bountyMetadata?.voting])

    useEffect(() => {

        Object.keys(invalidityStep1).forEach(key => {
            if (Array.isArray(invalidityStep1[key])) {
                invalidityStep1[key].forEach(obj => {
                    if (obj) {

                        return;
                    }
                })
            }
            else if (invalidityStep1[key]) {

                return;
            }
        })


    }, [invalidityStep1]);

    useEffect(() => {
        if (bountyMetadata.gnosis) {
            getGnosisAssets(chainId, bountyMetadata.gnosis, (data) => {
                const nativeGnosisAsset = data.items.find(({ tokenInfo }) => tokenInfo.type === 'NATIVE_TOKEN');
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
            } else if (!bountyMetadata?.gnosis) {
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

                if (creatorAddress !== account &&
                    !collaborators?.find(collaborator => collaborator.address === account)
                    ) {
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
                const votingStart = bountyDraft.get('votingStart');
                const votingEnd = bountyDraft.get('votingEnd');
                const votingNFT = bountyDraft.get('votingNFT');
                const tokenAmount = bountyDraft.get('tokenAmount');

                const existingGnosis = bountyDraft.get('gnosis');
                
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
                    votingStart: votingStart ? format(fromUnixTime(votingStart), 'yyyy-MM-dd') : '',
                    votingEnd: votingEnd ? format(fromUnixTime(votingEnd), 'yyyy-MM-dd') : '',
                    votingNFT: votingNFT ? votingNFT : null,
                    tokenAmount: bountyDraft.get('tokenAmount') || 0,
                    gnosis: existingGnosis === null ? null : (dashBoardState.metadata?.gnosis ? dashBoardState.metadata?.gnosis : null),
                    numRewards: bountyDraft.get('numRewards') ?? 1
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
    }, [draft, account, walletState.tokenBalance, collaborators])

    const createMetadata = useCallback(() => {
        return createBountyMetadata(bountyMetadata, account, createBounty, BountyTokenVersion, dashBoardState.board);
    }, [bountyMetadata, account, createBounty, BountyTokenVersion, dashBoardState.board]);

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
            
            if(savedItem && savedItem.id) {
                dispatch(appendDraftBounty(JSON.parse(JSON.stringify(savedItem))));
            }

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
                    window.history.pushState({}, '', `/dashboard/bounty/create/${savedItem.id}`);
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



        // check if fields are empty
        [
            { key: 'deadline', label: 'Deadline' },
            ...(bountyMetadata.voting ? [{ key: 'votingStart', label: 'Voting Start' },
            { key: 'votingEnd', label: 'Voting End' }] : [])
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

        // check if date is not in the past
        const dateDeadline = new Date(bountyMetadata?.deadline);
        if (dateDeadline.getTime() < Date.now()) {
            setInvalidityStep1((prevState) => ({
                ...prevState,
                deadline: 'Deadline must be in the future'
            }));
            isValid = false;
        }
        
        if( bountyMetadata.voting ) {
            
            // check if votingStart is not in the past
            const votingStart = new Date(bountyMetadata?.votingStart);
            if (votingStart.getTime() < Date.now()) {
                setInvalidityStep1((prevState) => ({
                    ...prevState,
                    votingStart: 'Voting start must be in the future'
                }));
                isValid = false;
            }

            // check if votingEnd is not in the past
            const votingEnd = new Date(bountyMetadata?.votingEnd);
            if (votingEnd.getTime() < Date.now()) {
                setInvalidityStep1((prevState) => ({
                    ...prevState,
                    votingEnd: 'Voting end must be in the future'
                }));
                isValid = false;
            }

            // check if votingEnd is not after deadline
            if (votingEnd.getTime() >= dateDeadline.getTime() ) {
                setInvalidityStep1((prevState) => ({
                    ...prevState,
                    votingEnd: 'Voting end must be before deadline'
                }));
                isValid = false;
            }

            // check if voting Start is not after the deadline
            if (votingStart.getTime() >= dateDeadline.getTime() ) {
                setInvalidityStep1((prevState) => ({
                    ...prevState,
                    votingStart: 'Voting start must be before deadline'
                }));
                isValid = false;
            }

            // check if votingEnd is not before votingStart
            if (votingEnd.getTime() <= votingStart.getTime()) {
                setInvalidityStep1((prevState) => ({
                    ...prevState,
                    votingEnd: 'Voting end must be after voting start',
                    votingStart: 'Voting start must be before voting end'
                }));
                isValid = false;
            }

            if(isValid) {
                setInvalidityStep1((prevState) => ({
                    ...prevState,
                    votingEnd: '',
                    votingStart: ''
                }));
            }

            

        }


        // check if reward is not 0
        if (!createBounty.amount || 0 >= parseFloat(createBounty.amount)) {
            setInvalidityStep1((prevState) => ({
                ...prevState,
                tokenAmount: 'Please enter a valid reward amount'
            }))

            isValid = false;
        }

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

    const [gnosisSigner, setGnosisSigner] = useState(null);

    const [approval, approveCallback, approving] = useApproveCallback(
        amountToApprove,
        bountyContractAddress,
        bountyMetadata?.gnosis ? bountyMetadata?.gnosis : null,
        gnosisSigner
    )

    useEffect(() => {
        if (bountyMetadata?.gnosis && signer) {
            // prepare gnosis signer, which will be used in gnosis context
            const ethAdapter = new EthersAdapter({
                ethers,
                signer
            } as EthersAdapterConfig);

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
        if (!bountyMetadata?.gnosis) {
            setGnosisSigner(null);
        }
    }, [bountyMetadata?.gnosis, signer])

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
        if (approving && bountyMetadata?.gnosis) {
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

    // useEffect(() => {
    //     if(dashBoardState.metadata?.gnosis && !gnosisSigs?.length) {
    //         const gnosisSafeContract = new ethers.Contract(dashBoardState.metadata?.gnosis, ['function isOwner(address) view returns (bool)', 'function getOwners() view returns (address[])'], provider);
    //         gnosisSafeContract.getOwners().then(owners => {
    //             setGnosisSigs(owners);
    //         })
    //     }
    // }, [dashBoardState.metadata?.gnosis])

    // useEffect(() => {
    //     if(gnosisSigs.length && !gnosisSigs.includes(account)) {
    //         setBountyMetadata((prevState) => ({
    //             ...prevState,
    //             gnosis: null
    //         }))
    //     }
    // }, [gnosisSigs, account])

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

                    await approveCallback();
                    // return so that the user can attempt once again to create (after the approval is done)
                    return;
                }
            }

            const metaData = createMetadata();


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
                gnosisService ? (bountyMetadata?.gnosis ? bountyMetadata?.gnosis : null) : null,
                gnosisSigner,
                approvers.map((approver) => approver.address),
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
            <Text fontSize='md' fontWeight='bold' mb='3'>Preview</Text>

                <Flex gap={2} borderWidth="1px" borderRadius="6" p={3} bgColor="white" justifyContent="space-between" alignItems="center">
                    <Input rounded="lg" size="sm" value={previewUrl} isReadOnly placeholder='' />
                    <Button onClick={onCopy} size="sm">{hasCopied ? 'Copied!' : 'Copy'}</Button>
                    <IconButton aria-label='Preview Link' onClick={gotoPreview} icon={<FaExternalLinkAlt cursor="pointer" />} size="sm" />
                </Flex>
            </Stack>
        </ScaleFade>);

    const saveDraftButton = <Button 
        variant="ghost"
        colorScheme={themeColor}
        borderRadius="xl" 
        p="6" 
        onClick={saveDraft} 
        isLoading={helperData?.isSavingDraft} 
        loadingText="Saving..." 
        isDisabled={helperData?.isSavingDraft}>
            Save Draft
        </Button>;

    const mintBountyButton = <Button
        colorScheme={themeColor}
        p="6"
        borderRadius="xl"
        borderWidth={1}
        onClick={handleCreateBounty}
        isDisabled={helperData.isCreatingBounty || (bountyMetadata?.gnosis && !gnosisSigner)}
        isLoading={helperData.isCreatingBounty}>
        {account ? (<Box>{(!createBounty.currency?.isNative && approval !== ApprovalState.APPROVED) ?
            'Approve Spending' :
            'Launch Round'}
        </Box>
        ) : (<Box>Launch Round</Box>)}
    </Button>;

    return (
        <Center>
            <Flex width={["90%", "80%", "70%"]} direction="column">
                {(!draft || isDraftOwner) ?
                    <>
                        <Center mb={2} flexDirection="column" my={6}>
                            <Text fontWeight="extrabold" fontSize="xl">New Round</Text>
                            <Text verticalAlign="center" fontSize="md" color="gray.400" fontWeight="normal">Describe your Round and rewards, and then publish onchain.</Text>
                        </Center>


                        {templateName && 
                        <Center borderWidth="thin" backgroundColor="gray.200" borderColor="gray.300" rounded="2xl" p={3} mb={2}>
                            <Text>This Round was created based on the Template: {templateName}</Text>
                        </Center>
                        }

                        <NewBountyForm
                            bountyMetadata={bountyMetadata}
                            setBountyMetadata={setBountyMetadata}
                            invalidity={invalidityStep1}
                            setInvalidity={setInvalidityStep1}
                            canUseGnosis={gnosisSigs.includes(account)}
                        />
                        <Box my='3'>
                            {previewLinkField}
                        </Box>
                        <Box backgroundColor="gray.100" borderColor="gray.600" rounded="2xl" boxShadow="base" p={5} >
                            <Text>The following collaborators of this board will also be added as approvers.</Text>
                            {approvers?.map((collaborator, index) => <Collaborator key={index} collaborator={collaborator} gnosisSigWarning={bountyMetadata.gnosis ? !gnosisSigs.includes(collaborator.address) : false} /> )}
                        </Box>
                        <Center id="buttoncontainer" mb={10} mt={5} gap={2}>
                            {saveDraftButton}
                            {mintBountyButton}
                            {helperData.inGnosisApproval && <Box fontSize='xs' color='red' flexBasis='33%'>
                                You will be able to mint, once Safe transaction for ERC20 token spending is approved. {' '}
                                <Link href={'https://gnosis-safe.io/app/' + bountyMetadata.gnosis + '/transactions/queue'} target='_blank'>
                                    (Go To Safe <ExternalLinkIcon mx='2px' />)</Link>
                            </Box>
                            }
                        </Center>
                    </>
                    :
                    (errorMessage &&
                        <GridItem colStart={8} colEnd={10}><Text fontSize="xl" fontWeight="bold" align="center">{errorMessage}</Text></GridItem>)
                }

            </Flex>
        </Center>
    )
}
import {
    Box,
    Code,
    Link,
    Stack,
    Text
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

import { truncate, truncateHash } from "../../lib/utils";
import { useQueryEnsName } from '../../hooks/useQueryEnsName';
import { useEffect } from 'react';
import { useAppDispatch } from '../../reducers';
import { addToEnsDirectory } from '../../reducers/dashboard/state';

// import { getChainName } from "../../utils/getChainName";

const Approver = function({approver, etherScanUrl} : any) : JSX.Element {
    const dispatch = useAppDispatch();
    const ensName = useQueryEnsName( approver )
    useEffect(() => {
        if(ensName) {
        // just to help the cache
        dispatch(addToEnsDirectory({address: approver.toLowerCase(), ensName}))
        }
    }, [ensName]);
    return (<Link href={etherScanUrl + "address/" + approver} isExternal><Text><Code>{ ensName || truncate(approver,10)}</Code></Text></Link>);
}

function ChainCheck(props): JSX.Element {
    const { etherScanUrl, walletState, bountyState, fulfillmentTrxs } = props;
    
    // const accountName = walletState.currentAccountEns ? walletState.currentAccountEns : walletState.currentAccount;
    // const chainName = getChainName(walletState.chainMeta?.chainId);
    const fulfillments = fulfillmentTrxs.map( (txId, index) => {
        return ( <Box key={index} ><Link href={etherScanUrl + "tx/" + txId} isExternal><Code>{truncate(txId,10)}</Code></Link></Box> );
    });
    
    return (
        <Stack display={{ base: 'none', md: 'unset' }} gap="5" borderWidth="thin" p={6} borderRadius="3xl" boxShadow="md" bgColor="white" fontWeight="500" fontSize="md">
            <Text fontSize="xl" lineHeight="short" fontWeight="800">Contract Details</Text>
            <Box>
                <Text color="gray.500">Smart Contract Address</Text>
                <Link href={etherScanUrl + "address/" + walletState.chainMeta?.address} isExternal><Text>{truncateHash(walletState.chainMeta?.address)}</Text></Link>
            </Box>
            <Box>
                <Text color="gray.500">Issuer Wallet</Text>
                <Link href={etherScanUrl + "address/" + bountyState.bounty?.creatorAddress} isExternal><Text>{bountyState.bounty?.creatorAddressEns ? bountyState.bounty?.creatorAddressEns : truncateHash(bountyState.bounty?.creatorAddress)}</Text></Link>
            </Box>
            { bountyState.approvers?.length ? 
                <Box>
                    <Text color="gray.500">Approvers</Text>
                    {bountyState.approvers.map( (approver, index) => <Approver etherScanUrl={etherScanUrl} approver={approver} key={index} />)}
                    
                </Box>
                : <></>
            }
            <Box>
                <Text color="gray.500">Issuing Transaction</Text>
                { (bountyState.bounty?.issueTxId && bountyState.bounty?.metadataUrl) ?
                        <Link href={ etherScanUrl + "tx/" + bountyState.bounty.issueTxId } isExternal><Text>{truncate(bountyState.bounty?.issueTxId, 10)}</Text></Link>
                        :
                        <Text>None</Text>
                    }
            </Box>

            { bountyState.bounty?.fulfillTxId && 
                <Box>
                    <Text color="gray.500">Payment Transaction(s)</Text>
                    { fulfillments }
                </Box> 
            }

            { bountyState.bounty?.drainTxId &&
                <Box>
                    <Text color="gray.500">Drain Transaction</Text>
                    <Link href={etherScanUrl + "tx/" + bountyState.bounty?.drainTxId} isExternal><Text>{truncate(bountyState.bounty?.drainTxId,10)}</Text></Link>                    
                </Box>
            }
            
            <Box>
                <Text color="gray.500">Metadata</Text>
                <Box>
                    { (bountyState.bounty?.issueTxId && bountyState.bounty?.metadataUrl) ?
                        <Link href={bountyState.bounty?.metadataUrl} isExternal>IPFS <ExternalLinkIcon /></Link>
                        :
                        <>IPFS <ExternalLinkIcon /></>
                    }
                </Box>
            </Box>
        </Stack>
    )
}

export default ChainCheck;
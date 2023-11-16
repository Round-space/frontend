import {
    Heading,
    Divider,
    Spacer,
    Flex,
    Text,
    Box,
    Stack,
    Alert,
    AlertIcon,
    Link,
} from '@chakra-ui/react'
import { useNetwork, useProvider, useSigner } from 'wagmi'

import { drainBounty } from '../../reducers/bounty/asyncActions'
import { useAppDispatch, useAppSelector } from '../../reducers/index'
import DeleteBountyDraft from './DeleteBountyDraft'
import CancelBounty from './CancelBounty'


import Safe from '@gnosis.pm/safe-core-sdk'
import { EthAdapter } from '@gnosis.pm/safe-core-sdk-types';
import { SafeService, SafeEthersSigner } from '@gnosis.pm/safe-ethers-adapters'
import EthersAdapter, { EthersAdapterConfig } from '@gnosis.pm/safe-ethers-lib'
import { ethers } from "ethers";
import { gnosisServiceUrls } from "../../constants/network";
import { setDraining } from '../../reducers/bounty/state'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useState } from 'react'

function BountySettings (props): JSX.Element {
    const dispatch = useAppDispatch();
    const { activeChain: chain } = useNetwork()
    const chainId = chain?.id;
    const { data: signer } = useSigner();
    const { account, bountyState } = props;
    const [ transactionSent, setTransactionSent ] = useState(false);
    const provider = useProvider();

    // the fundBounty currency is the one that the bid was originally created with
    const fundingTokenState = useAppSelector((state) => state.fundBounty);

    

    const handleDrain = async () => {

        let gnosisSigner = null;
        
        if( bountyState.bounty?.gnosis ) {
            // this is going to take some extra seconds, so we should show a loading indicator
            
            dispatch(setDraining(true));

            const ethAdapter = new EthersAdapter({
                ethers,
                signer
            } as EthersAdapterConfig );

            const safe = await Safe.create({
                // ignore the error for now, as the issue lies with the gnosis sdk
                // @ts-ignore
                ethAdapter: ethAdapter as EthAdapter,
                safeAddress: bountyState.bounty?.gnosis,
            });
            
            const gnosisService = gnosisServiceUrls[chainId] ? new SafeService(gnosisServiceUrls[chainId]) : null

            gnosisSigner = bountyState.bounty?.gnosis ? await new SafeEthersSigner(safe, gnosisService, provider) : null
        }

        const drainMessage = {
          account: bountyState.bounty?.gnosis ? bountyState.bounty?.gnosis : account,
          bountyId: bountyState.bounty.bountyId,
          tokenAmount: bountyState.bounty.remainTokenAmount,
          databaseId : bountyState.bounty.databaseId
        }
        
        drainBounty(
          dispatch, 
          drainMessage, 
          signer, 
          chainId, 
          fundingTokenState,
          gnosisSigner,
          setTransactionSent,
          bountyState.issuers ?? []
        );
      }

    return (
      <Stack mb={{ base: 150, md: 'unset' }} gap="5" borderWidth="thin" p={6} borderRadius="3xl" boxShadow="md" fontWeight="500" fontSize="md" bgColor="gray.100" >
        <Heading as="h3" size="sm">&#128274; Admin Zone &#128274;</Heading>
        <Divider mb={3} />
        { (!bountyState.bounty?.issueTxId && !bountyState.bounty?.metadataUrl) && 
        <>
          <Flex direction="row">
            <Box fontSize="sm">
              <Text as="b">Delete Round</Text>
              <Text color="gray.500">This will delete this Round draft. This action is irreversible.</Text>
            </Box>
            <Spacer />
            <DeleteBountyDraft bountyState={bountyState} />
              
          </Flex>
          <Divider mb={3} />
        </>
        }
        {bountyState.bounty?.gnosis && bountyState.waitingDrainConfirmation && transactionSent &&
        <Alert status='info'>
          <AlertIcon />
          <Text fontSize='sm'>
            Draining will be complete, once Safe transaction for draining is approved. {' '}
            <Link href={'https://gnosis-safe.io/app/'+bountyState.bounty?.gnosis+'/transactions/queue'} target='_blank'>
            (Go To Safe <ExternalLinkIcon mx='2px' />)</Link>
          </Text>
        </Alert>
        }
        <Flex direction="row">
          <Box fontSize="sm">
            <Text as="b">Cancel Round</Text>
            <Text color="gray.500">This will drain all funds and cancel this Round. A Round can be cancelled before any payment starts.</Text>
          </Box>
          <Spacer />
          <CancelBounty
            issuer={account}
            isExpired={props.isExpired}
            bountyState={bountyState}
            onDrainBounty={handleDrain}>
          </CancelBounty>
        </Flex>
      </Stack>
    )
  }

export default BountySettings;
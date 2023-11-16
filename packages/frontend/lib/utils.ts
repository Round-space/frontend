import { UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { getUnixTime } from 'date-fns';
import { toDate } from 'date-fns-tz'
// import { signingMessage } from '../constants/network';
import { toDecimal } from '../utils/bignumber';
import { IBountyMetadata } from '../web3/contractService';
import { Moralis } from 'moralis';


function truncateHash(hash: string, length = 38): string {
  if(hash === undefined || hash === null)
    return '';
  return hash.replace(hash.substring(6, length), '...')
}

export function truncate(text: string, max = 20): string {
  if(text === undefined || text === null)
    return '';
  if(text.length < max)
    return text;
  return text.substring(0, max) +  '...';
}
// From https://github.com/NoahZinsmeister/web3-react/blob/v6/example/pages/index.tsx
// Parses the possible errors provided by web3-react
function getErrorMessage(error: Error): string {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "Your wallet is connected to an unsupported chain."
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

async function moralisAuthentication( authenticate, isAuthenticated, user, account, toast, isWalletConnect, chainId ) {
  if ( !isAuthenticated || account.toLowerCase() !== user.get('ethAddress').toLowerCase()) {
    toast.closeAll()
    toast({
      title: 'Authentication Required',
      description: "Please authenticate using your wallet",
      status: 'info',
      duration: 9000,
      isClosable: true,
    })
    const { message } = await Moralis.Cloud.run('requestMessage', {
      address: account,
      chain: chainId,
      networkType: 'evm',
    });
    const res = await authenticate(isWalletConnect ? { signingMessage: message, provider: 'walletconnect' } : { signingMessage: message } );
    
    if(res) {
      toast.closeAll()
      toast({
        title: 'Authentication Successful',
        description: "You have successfully authenticated",
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } else {
      toast.closeAll()
      toast({
        title: 'Authentication Failed',
        description: "Could not authenticate using your wallet",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
      return false;
    }
  }
  return true;
}


const createBountyMetadata = (bountyMetadata, account, createBounty, BountyTokenVersion, board) => {
  const tokenAmount = (createBounty?.amount && createBounty?.currency) ?
      toDecimal(
          createBounty.amount,
          createBounty.currency
      )
      : 0;

  const currentTimezone = 'UTC';//Intl.DateTimeFormat().resolvedOptions().timeZone
  
  const deadlineDate = toDate(bountyMetadata.deadline, {
      timeZone: currentTimezone,
  })
  const deadline = getUnixTime(deadlineDate)

  let applicationsDeadline = null;

  if (bountyMetadata.requiresApplication && bountyMetadata.applicationsDeadline) {
      const applicationsDeadlineDate = toDate(bountyMetadata.applicationsDeadline, {
          timeZone: currentTimezone,
      })

      applicationsDeadline = getUnixTime(applicationsDeadlineDate)
  }

  let votingStart = null;

  if (bountyMetadata.voting && bountyMetadata.votingStart) {
      const votingStartDate = toDate(bountyMetadata.votingStart, {
          timeZone: currentTimezone,
      })

      votingStart = getUnixTime(votingStartDate)
  }

  let votingEnd = null;

  if (bountyMetadata.voting && bountyMetadata.votingEnd) {
      const votingEndDate = toDate(bountyMetadata.votingEnd, {
          timeZone: currentTimezone,
      })

      votingEnd = getUnixTime(votingEndDate)
  }

  return {
      name: bountyMetadata.name,
      description: bountyMetadata.description,
      url: bountyMetadata.links.join('\n'),
      requiresApplication: bountyMetadata.requiresApplication,
      voting: bountyMetadata.voting,
      publicSubmissions: bountyMetadata.publicSubmissions,
      requiresApproval: false,
      externalFunding: bountyMetadata.externalFunding,
      showContributors: bountyMetadata.showContributors,
      forAddresses: bountyMetadata.forAddresses,
      creatorAddress: board,
      bountyCreatorAddress: account,
      deadline: deadline ? deadline : 0,
      gnosis: bountyMetadata.gnosis ?? null,
      email: bountyMetadata.email ?? null,
      urlname: bountyMetadata.urlname ?? null,
      applicationsDeadline: applicationsDeadline ? applicationsDeadline : 0,
      votingStart: votingStart ? votingStart : 0,
      votingEnd: votingEnd ? votingEnd: 0,
      votingNFT: bountyMetadata.votingNFT ?? null,
      tokenAmount,
      tokenSymbol: createBounty?.currency?.symbol,
      tokenAddress: createBounty?.currency?.token_address,
      tokenVersion: createBounty?.currency?.isNative ? BountyTokenVersion.Native : BountyTokenVersion.ERC20,
      numRewards: bountyMetadata.numRewards ?? 1
  } as IBountyMetadata
}

const getGnosisAssets = (chainId, address, callback) => {
  const url = `https://safe-client.gnosis.io/v1/chains/${chainId}/safes/${address}/balances/USD`
        fetch(url)
        .then((response) => response.json())
        .then(callback);
}

export {getErrorMessage,truncateHash, moralisAuthentication, createBountyMetadata, getGnosisAssets}


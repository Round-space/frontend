import { ethers } from "ethers";
import StandardBountiesDefinition from '../artifacts/contracts/StandardBounties.sol/StandardBounties.json';
import { StandardBounties as StandardBountiesType } from "../types/typechain/StandardBounties";
import { getChainDetails } from "../constants/addresses";
import { supportedChains, defaultProvider } from '../constants/network';
export interface IBountyMetadata {
  name :string
  url : string
  description: string
  requiresApproval : boolean
  requiresApplication : boolean
  applicationsDeadline : number | null | undefined
  publicSubmissions : boolean | null | undefined
  externalFunding : boolean
  deadline : number
  creatorAddress : string
  bountyCreatorAddress: string
  tokenSymbol : string
  tokenAddress : string
  tokenAmount : number
  tokenVersion : number
  voting: boolean
  votingStart: number
  votingEnd: number
  votingNFT: string | null | undefined
  numRewards: number | undefined
}

export interface IBounty  extends IBountyMetadata{
  id : string | null;
  bountyId : number | string;
  metadataUrl : string; // metadata url
  creationDate : string | null;
  issueTxId : string | null; // complete tx hash
  fulfillTxId : string | null; // complete tx hash
  drainTxId : string | null; // complete tx hash
  themeColor: string | null | undefined;
}




let cachedContract = null as StandardBountiesType;
const getBountyContract = (chainId, signer) =>{
  
  // in case a wallet is not connected, then fallback to default chainId and provider
  if( !chainId ) {
    chainId = supportedChains[0];
    signer = defaultProvider;
  }

  const contractAddressData = getChainDetails(chainId);

  if(cachedContract != null && cachedContract.address == contractAddressData.address && cachedContract.signer == signer){
    return cachedContract
  }else{
    if(cachedContract!=null){
      cachedContract.removeAllListeners();
    }
    cachedContract = new ethers.Contract(contractAddressData.address,StandardBountiesDefinition.abi,signer) as StandardBountiesType
    return cachedContract;     
  }
 
}

const createPersona = (account, email )=>{
        return {
                email: email,// optional - A string representing the preferred contact email of the persona
                address: account// required - A string web3 address of the persona
             };
}


const createFullfillmentMessage = (description, link, date ,persona ,fileName , fileHash)=>{
        return {
          payload: {
            description: description ,// A string representing the description of the fulfillment, and any necessary links to works
            link: link,
            date: date,
            sourceFileName: fileName,// A string representing the name of the file being submitted
            sourceFileHash: fileHash, // A string representing the IPFS hash of the file being submitted
            sourceDirectoryHash: '', // A string representing the IPFS hash of the directory which holds the file being submitted
            fulfillers: [
              // a list of personas for the individuals whose work is being submitted
              persona
            ],
            payoutAmounts: [
              100
              // an array of floats which is equal in length to the fulfillers array, representing the % of tokens which should be paid to each of the fulfillers (ie [50, 50] would represent an equal split of a bounty by 2 fulfillers)
            ]
        
            // ------- add optional fields here -------
          },
          meta: {
            platform: 'meed' ,// a string representing the original posting platform (ie 'gitcoin')
            schemaVersion: '0.1',// a string representing the version number (ie '0.1')
            schemaName: 'meedSchema',// a string representing the name of the schema (ie 'standardSchema' or 'gitcoinSchema')
          }
        };
    }



export { createFullfillmentMessage,createPersona, getBountyContract }
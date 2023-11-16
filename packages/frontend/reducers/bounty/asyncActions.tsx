/* eslint-disable @typescript-eslint/no-unused-vars, no-console , react/no-unescaped-entities */
import { BigNumber } from 'ethers'
import { Moralis } from 'moralis'
import {
  setWaitingSubmission,
  setWaitingPayout,
  setCreating,
  setCreated,
  setBountyContributions,
  setCreateData,
  setCompleteTx,
  setBountyCompleted,
  setDraining,
  setCancelTx,
  setRemainTokenBalance,
  addAcceptedApplication,
  addApplication,
  setReducedTokenBalance,
  addTokenBalance,
  updateSubmissionAccept
} from './state'
import {
  createPersona,
  createFullfillmentMessage,
  getBountyContract,
  IBountyMetadata,
} from '../../web3/contractService'
import { utils } from 'ethers'
import { Bounty, BountyMetaFulfilled, BountyApplication, IBountyApplication } from '../../data/model'
import { StandardBounties } from '../../types/typechain'
import { BountyTokenVersion } from '../../constants/standardBounties'
import {Base64} from 'js-base64';

export async function submitBountyFulfillment(
  dispatch,
  bountySubmissionData,
  signer: any,
  chainId
) {
  try {
    dispatch(setWaitingSubmission('Uploading data to IPFS'))

    const bountyId = BigNumber.from(bountySubmissionData.bountyId)
    const account = bountySubmissionData.account
    const persona = createPersona(
      bountySubmissionData.account,
      bountySubmissionData.email
    )

    let filename = ''
    let fileHash = ''
    const fileInputElement = bountySubmissionData.fileRef.current
    if (fileInputElement != null && fileInputElement.files.length > 0) {
      const fileData = fileInputElement.files[0]
      const attachment = new Moralis.File(fileData.name, fileData)
      await attachment.saveIPFS()

      filename = fileData.name
      fileHash = attachment['_hash']
    }

    const message = createFullfillmentMessage(
      bountySubmissionData.workDescription,
      bountySubmissionData.workLink,
      bountySubmissionData.date,
      persona,
      filename,
      fileHash
    )

    const submissionFile = new Moralis.File('submission.json', {
      base64: Base64.encode(JSON.stringify(message)),
    })
    await submissionFile.saveIPFS()

    dispatch(setWaitingSubmission('Sending Submission'));

    const hash = submissionFile['_hash']
    const smartContract = getBountyContract(chainId, signer)
    
    const tx = await smartContract.fulfillBounty(
      account,
      bountyId,
      [account],
      hash,
      { gasLimit: 250000 }
    )
    await tx.wait()
  } catch (error) {
    console.log(error)
    dispatch(setWaitingSubmission(''))
  }
  dispatch(setWaitingSubmission(''))
}

export async function drainBounty(
  dispatch,
  drainBountyMessage,
  signer,
  chainId, 
  fundingTokenState,
  gnosisSigner: any,
  setTransactionSent,
  issuers
  ) {

  try{
    console.log('Draining Bounty',drainBountyMessage,'ChainId',chainId,'Signer',signer);
    dispatch(setDraining(true));
    const contract = getBountyContract(chainId, gnosisSigner ? gnosisSigner : signer)

    const bountyId = BigNumber.from(drainBountyMessage.bountyId);
    

      contract.on("BountyDrained",async function(_bountyId: BigNumber,_issuer: string,_amounts:BigNumber[]){
        if(_bountyId.toNumber() == bountyId.toNumber()){
          dispatch(setBountyCompleted());
          dispatch(setDraining(false));
          dispatch(setRemainTokenBalance(0))
        }
      });
    const account = drainBountyMessage.account;

    const amountInWei = fundingTokenState?.currency?.decimals
    ? utils.parseUnits(drainBountyMessage.tokenAmount.toString(), fundingTokenState.currency.decimals)
    : utils.parseEther(drainBountyMessage.tokenAmount.toString());

    // const amountInWei = utils.parseEther(drainBountyMessage.tokenAmount.toString());
    const issuerId = issuers.findIndex(issuer => issuer.toLowerCase() == account.toLowerCase());

    const tx = await contract.drainBounty(
      account,
      bountyId,
      BigNumber.from(issuerId > -1 ? issuerId : 0),
      [amountInWei]
    );
    setTransactionSent(true);
    dispatch(setCancelTx(tx.hash));
    // if(tx.hash){
    //   const bountyRecord = new Bounty();    
    //   bountyRecord.setKeyValue('id', drainBountyMessage.databaseId);
    //   bountyRecord.setKeyValue('drainTxId', tx.hash);
    //   bountyRecord.setKeyValue('isCompleted',true);
    //   const savedItem = await bountyRecord.save();
    // }

  }catch(e){
    console.log(e);
    dispatch(setCancelTx(null));
    dispatch(setDraining(false));
  }
  
}

export async function submitAcceptApplication(
  dispatch,
  bountyId,
  applicationId,
  applicant,
  setAccepting
) {
  setAccepting(true);
  try {
    
    await Moralis.Cloud.run("acceptBountyApplication", {
      applicationId,
      applicant,
      bountyId
    })

    dispatch(addAcceptedApplication({applicationId, applicant}));

    setAccepting(false);
  } catch (error) {
    console.log(error);
    setAccepting(false);
  }
  
}

export async function submitBountyApplication(
  applicationData,
  signer: any,
  chainId,
  user,
  dispatch
) {
  try {
    
    const persona = createPersona(
      applicationData.account,
      applicationData.email
    )

    const message = {
      description: applicationData.description,
      persona: persona
    }

    // const applicationFile = new Moralis.File('application.json', {
    //   base64: Base64.encode(JSON.stringify(message)),
    // })

    // await applicationFile.saveIPFS()
    // const hash = applicationFile['_hash']

    const res = await Moralis.Cloud.run("uploadToIPFS", { filename: 'application.json', base64: Base64.encode(JSON.stringify(message)) });
    const urlObj = new URL(res?.[0]?.path);
    const pathSegments = urlObj.pathname.split('/');
    const ipfsHashIndex = pathSegments.findIndex(segment => segment === 'ipfs') + 1;
    const hash = pathSegments[ipfsHashIndex];

    const bountyApplication = new BountyApplication();
    
    bountyApplication.setKeyValue('bountyId', applicationData.bountyId);
    bountyApplication.setKeyValue('ipfsHash', hash);
    bountyApplication.setKeyValue('email', applicationData.email);

    const result =  await bountyApplication.save();
    
    if(result) {

      const application = {
        objectId: result.id,
        bountyId: result.bountyId,
        ipfsHash: result.ipfsHash,
        applicant: applicationData.account,
        date: (new Date()).toString()
      } as IBountyApplication;

      dispatch(addApplication(application));

    }

    return result;
    
  } catch (error) {
    console.log(error)
    return false;
  }
}

export async function submitBountyMetaFulfillment(
  dispatch,
  bountySubmissionData,
  signer: any,
  chainId
) {
  try {
    dispatch(setWaitingSubmission('Uploading to IPFS'))

    const account = bountySubmissionData.account
    const persona = createPersona(
      bountySubmissionData.account,
      bountySubmissionData.email
    )

    let filename = ''
    let fileHash = ''
    const fileInputElement = bountySubmissionData.fileRef.current
    if (fileInputElement != null && fileInputElement.files.length > 0) {
      const fileData = fileInputElement.files[0];
      // const attachment = new Moralis.File(fileData.name, fileData);
      // await attachment.saveIPFS()
      // Convert file data to a base64-encoded string
      const reader = new FileReader();
      const res = await (() => new Promise((resolve, reject) => {
        reader.onload = async (event) => {
          const base64 = event.target.result;

          const res = await Moralis.Cloud.run("uploadToIPFS", { filename: fileData.name, base64 });
          const urlObj = new URL(res?.[0]?.path);
          const pathSegments = urlObj.pathname.split('/');
          const ipfsHashIndex = pathSegments.findIndex(segment => segment === 'ipfs') + 1;
          const hash = pathSegments[ipfsHashIndex];

          const filename = fileData.name;
          const fileHash = hash;
          
          resolve({ filename, fileHash});
        };
        reader.readAsDataURL(fileData);
      }))() as any
        
      filename = res.filename;
      fileHash = res.fileHash;
    }

    const message = createFullfillmentMessage(
      bountySubmissionData.workDescription,
      bountySubmissionData.workLink,
      bountySubmissionData.date,
      persona,
      filename,
      fileHash
    )
    const appId =  process.env.NEXT_PUBLIC_MORALIS_APP_ID;
    const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
    Moralis.start({appId, serverUrl});
      
    const res = await Moralis.Cloud.run("uploadToIPFS", {filename: 'submission.json', base64: Base64.encode(JSON.stringify(message))})
    
    const urlObj = new URL(res?.[0]?.path);
    const pathSegments = urlObj.pathname.split('/');
    const ipfsHashIndex = pathSegments.findIndex(segment => segment === 'ipfs') + 1;
    const hash = pathSegments[ipfsHashIndex];
    
    console.log('hash', hash);
    
    // const submissionFile = new Moralis.File('submission.json', {
    //   base64: Base64.encode(JSON.stringify(message)),
    // })
    // try {
    //   const result = await submissionFile.saveIPFS()
    // } catch(e) {
    //   console.log(e);
    // }
    dispatch(setWaitingSubmission('Sending Submission'))
    // console.log('submission file', submissionFile);
    // const hash = submissionFile['_hash']

    // Save Meta Fulfillment into DB
    const metaFulfillment = new BountyMetaFulfilled();
    metaFulfillment.setKeyValue('bountyId',bountySubmissionData.bountyId);
    metaFulfillment.setKeyValue('ipfsHash',hash);
    metaFulfillment.setKeyValue('fulfiller',account);
    metaFulfillment.setKeyValue('email',bountySubmissionData.email);
    metaFulfillment.setKeyValue('rejected',false);
    await metaFulfillment.save();

  } catch (error) {
    console.log(error)
    dispatch(setWaitingSubmission(''))
  }
  dispatch(setWaitingSubmission(''))
}

export function bindBountyIssuedEventListener(
  dispatch,
  contract: StandardBounties,
  data
) {
  if (contract.listenerCount('BountyIssued') == 0) {
    console.log('Binding bountyIssued Event...')
    contract.on(
      'BountyIssued',
      function (
        _bountyId: BigNumber,
        _creator: string,
        _issuers: string[],
        _approvers: string[],
        _data: string,
        _deadline: BigNumber,
        _token: string,
        _tokenVersion: BigNumber,
        event: Event
      ) {
        if (_data == data) {
          //trigger flag so we do need to reload bounty
          dispatch(setCreated({ bountyId: _bountyId.toString(), txId: event['transactionHash'] ?? null }))
          contract.removeAllListeners('BountyIssued')
        }
      }
    )
  }
}

export async function acceptBountyFulfillment(
  dispatch,
  submission,
  signer,
  chainId
) {
  // TODO MOVE TO SUBMISSION COMPONENT
  try {

    dispatch(setWaitingPayout(true))

    const account = submission.account
    const bountyId = BigNumber.from(submission.bountyId)
    const approverId = BigNumber.from(0)
    const fulfillmentId = BigNumber.from(submission.fulfillmentId)
    const amountNumber = BigNumber.from(submission.tokenAmount.toString());
    const amountInWei = [utils.parseEther(submission.tokenAmount.toString())]
    const contract = getBountyContract(chainId, signer)
    const [a,b,c,d,e,f,g] = await contract.getBounty(submission.bountyId);
    console.log('Read Data From bounty:',a,b,c,d,e,f,g);
    if(contract.listeners("FulfillmentAccepted").length == 0){
      contract.on("FulfillmentAccepted",function(_bountyId?: null,_fulfillmentId?: null,_approver?: null,_tokenAmounts?: null){
        if(_bountyId == submission.bountyId){
          dispatch(setBountyCompleted());
        }
      });
    }
    const tx = await contract.acceptFulfillment(
      account,
      bountyId,
      fulfillmentId,
      approverId,
      amountInWei
    )
    dispatch(setCompleteTx({txId: tx.hash, data: submission.data}));    
  } catch (error) {
    console.log(error.message)
    dispatch(setWaitingPayout(false));
  }
  
}

export async function acceptBountyMetaFulfillment(
  dispatch,
  submissions,
  signer,
  chainId,
  fundingTokenState,
  appendFulfillment,
  bountyState,
  account,
  bountyId
) {
  
  // TODO MOVE TO SUBMISSION COMPONENT
  try {
    dispatch(setWaitingPayout(true))
    const fulfillers = submissions.map( submission => submission.address );
    const approverIndex = bountyState.approvers.indexOf(account);
    const approverId = BigNumber.from(approverIndex > 0 ? approverIndex : 0);
    const contract = getBountyContract(chainId, signer)
    const fulfillData = submissions.map( submission => submission.data).join(',');
    
    const amounts = submissions.map( submission =>fundingTokenState?.currency?.decimals
      ? BigNumber.from(utils.parseUnits(submission.tokenAmount.toString(), fundingTokenState.currency.decimals))
      : BigNumber.from(utils.parseEther(submission.tokenAmount.toString())));


    let gasEstimate = BigNumber.from(500000);
    try{
       gasEstimate = await contract.estimateGas.fulfillAndAccept(
        account,
        bountyId,
        fulfillers,
        fulfillData,
        approverId,
        amounts
      );
    }catch(err){
      console.log(err);
      console.log('Something Failed estimating gas, will use hardcoded gas limit:',gasEstimate);
      dispatch(setWaitingPayout(false));
    }
    
    console.log('Using Gas Limit',gasEstimate);
    const overrides = { gasLimit : gasEstimate} ;
    const tx = await contract.fulfillAndAccept(
      account,
      bountyId,
      fulfillers,
      fulfillData,
      approverId,
      amounts,
      overrides
    )
    appendFulfillment(tx.hash);
    dispatch(setCompleteTx({txId: tx.hash, data: fulfillData}));
    dispatch(updateSubmissionAccept(fulfillData))

    const tokenAmounts = submissions.map( submission => submission.tokenAmount ).reduce((a:any, b:any) => {
      const bValue = parseFloat(b);
      const aValue = parseFloat(a);
      return (isNaN(aValue) ? 0 : aValue) + (isNaN(bValue) ? 0 : bValue);
     } );

    dispatch(setReducedTokenBalance(tokenAmounts))
    dispatch(setWaitingPayout(false))  

  } catch (error) {
    console.log(error.message)
    dispatch(setWaitingPayout(false));
  }
  
}

export async function fundBounty(
  dispatch,
  bid,
  amountInDecimal,
  chainId,
  bountyId,
  signer,
  amountInWei : string,
  account,
  isNative
) {

  const standardBountyContract = getBountyContract(chainId, signer)
  
  const overrides = isNative ?  {value:   amountInWei } : {value:  BigNumber.from(0) } ;
  
  const transaction = await standardBountyContract.contribute(
    account,
    bountyId,
    BigNumber.from(amountInWei),
    overrides
  )
  
  if( transaction.hash ) {
    dispatch(addTokenBalance(amountInDecimal));
    dispatch (setReducedTokenBalance( -1 * amountInDecimal))
  }

  return transaction;
  
}

export async function publishBounty(
  dispatch,
  signer,
  chainId,
  bountyMetadata : IBountyMetadata,
  tokenVersion : BountyTokenVersion,
  amountInWei : string,
  deadline : number,
  decimals,
  draftId: string,
  gnosis: string | null,
  gnosisSigner: any,
  moreApprovers: string[] | null,
) {
  
  try {
    
    await dispatch(setCreating())
    const approvers = [...(moreApprovers || [bountyMetadata.bountyCreatorAddress])]
    const overrides = tokenVersion == 0 ?  {value:   amountInWei } : {value:  BigNumber.from(0) } ;
    const tokenVersionBn = BigNumber.from(tokenVersion);
    
    
    
    // const submissionFile = new Moralis.File('newbounty.json', {
    //   base64: Base64.encode(JSON.stringify(bountyMetadata)),
    // })
    // const result = await submissionFile.saveIPFS()

    const result = await Moralis.Cloud.run("uploadToIPFS", { filename: 'newbounty.json', base64: Base64.encode(JSON.stringify(bountyMetadata)) });
    const urlObj = new URL(result?.[0]?.path);
    const pathSegments = urlObj.pathname.split('/');
    const ipfsHashIndex = pathSegments.findIndex(segment => segment === 'ipfs') + 1;
    const metadataHash = pathSegments[ipfsHashIndex];

    const standardBountyContract = getBountyContract(chainId, gnosis ? gnosisSigner : signer)
    
    bindBountyIssuedEventListener(
      dispatch,
      standardBountyContract,
      metadataHash
    )

    console.log('calling smart contract method...')
    const tokenAddress = bountyMetadata.tokenAddress;
  // console.log(gnosis ? gnosis : approvers[0],
  //   gnosis ? [gnosis] : approvers,
  //   approvers,
  //   metadataHash,
  //   BigNumber.from(deadline),
  //   tokenAddress,
  //   tokenVersionBn,
  //   BigNumber.from(amountInWei),
  //   overrides)

    const transaction = await standardBountyContract.issueAndContribute(
        gnosis ? gnosis : bountyMetadata.bountyCreatorAddress,
        gnosis ? [gnosis] : approvers,
        approvers,
        metadataHash,
        BigNumber.from(deadline),
        tokenAddress,
        tokenVersionBn,
        BigNumber.from(amountInWei),
        overrides
      )

    const newBounty = new Bounty()
    
    if(draftId) {
      newBounty.id = draftId;
    }

    const newBountyData = {
      creatorAddress: bountyMetadata.creatorAddress,
      bountyCreatorAddress: bountyMetadata.bountyCreatorAddress,
      name: bountyMetadata.name,
      metadataUrl: 'https://gateway.moralisipfs.com/ipfs/' + metadataHash + '/newbounty.json',
      description: bountyMetadata.description,
      url: bountyMetadata.url,
      requiresApproval: bountyMetadata.requiresApproval,
      requiresApplication: bountyMetadata.requiresApplication,
      applicationsDeadline: bountyMetadata.applicationsDeadline,
      publicSubmissions: bountyMetadata.publicSubmissions,
      externalFunding: bountyMetadata.externalFunding,
      tokenSymbol: bountyMetadata.tokenSymbol,
      tokenAddress: bountyMetadata.tokenAddress,
      tokenAmount: bountyMetadata.tokenAmount,
      tokenDecimals: decimals,
      voting: bountyMetadata.voting,
      votingStart: bountyMetadata.votingStart,
      votingEnd: bountyMetadata.votingEnd,
      votingNFT: bountyMetadata.votingNFT,
      gnosis: gnosis ?? undefined,
      deadline: bountyMetadata.deadline,
      extId: transaction.hash,
      numRewards: bountyMetadata.numRewards
    }

    newBounty.setProperties( newBountyData );

    const savedItem = await newBounty.save();
    // const created = savedItem.bountyCreatedAt ? new Date(savedItem.bountyCreatedAt).toISOString() : 
    const created = savedItem.updatedAt.toISOString();
    
    let creationData = {};

    try {
      creationData = { ...JSON.parse(JSON.stringify(newBounty)), ...newBountyData};
    } catch (error) {
      creationData = newBounty;
    }

    dispatch(setCreateData({...creationData as any, creationDate:created,issueTxId: transaction.hash}));
    dispatch(setBountyContributions([
      {
        contributor: bountyMetadata.creatorAddress,
        amount: amountInWei,
        refunded: false
      }
    ]))
    //TODO User route with bounty id from saved Item
    return savedItem
  } catch (error) {
    console.log(error)
    //TODO: HANDLE ERROR CREATING BOUNTY
    // dispatch(setCreatingFailed(error))
  }

  return null
}

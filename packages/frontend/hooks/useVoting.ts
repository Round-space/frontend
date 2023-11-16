import {  useCallback, useState } from 'react';
import { useAppSelector, RootState, useAppDispatch } from '../reducers';
import { useAccount, useNetwork } from 'wagmi';
import { moralisAuthentication } from '../lib/utils'
import { useMoralis } from 'react-moralis';
import { useToast } from '@chakra-ui/react';
import { setMyVote, setMyVoteAndCount } from '../reducers/bounty/state';

export default function useVoting() {

    const { data } = useAccount();
    const address = data?.address;
    const { activeChain: chain } = useNetwork();
    const isWalletConnect = data?.connector?.id === "walletConnect"
    const dispatch = useAppDispatch();
    const bountyState = useAppSelector((state: RootState) => { return state.bounties; });
    const [ isVoting, setIsVoting ] = useState<boolean>(false);
    
    
    /* voting states
        0 - None
        1 - Accepting
        2 - Voting
        3 - Closed
    */

    const {
        Moralis,
        user,
        authenticate,
        isAuthenticated
    } = useMoralis();
    
    const toast = useToast();


    const castVote = useCallback( async (objectId) => {
        
        if(bountyState.votingState !== 2) {
            toast({
                title: "Voting is not open",
                description: "Voting is not open for this bounty",
                status: "error",
                duration: 5000,
                isClosable: true,
            })
            return;
        }
        
        if(!bountyState?.votingAllowed) {
            toast({
                title: "Voting is not allowed",
                description: "You are not allowed to vote for this bounty",
                status: "error",
                duration: 5000,
                isClosable: true,
            })
            return;
        }

        try {
            
            setIsVoting(true);

            const res = await moralisAuthentication(authenticate, isAuthenticated, user, address, toast, isWalletConnect, chain?.id)
            
            if (!res) {
                return;
            }

            // make a call to cloud function 'voteOnSubmission'
            Moralis.Cloud.run('voteOnSubmission', { 
                submissionId: objectId,
                bountyId: bountyState.bounty?.databaseId,
            }).then((result) => {
                dispatch(setMyVoteAndCount(objectId));
                setIsVoting(false);
            }).catch((error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                })
                setIsVoting(false);
            });
            
        } catch (error) {
            console.log('error', error);
            setIsVoting(false);
        }
        
    
    }, [address, bountyState.bounty?.databaseId, bountyState.votingState, bountyState.votingAllowed, authenticate, isAuthenticated, user, chain]);

    
    return { 
        votingState: bountyState?.votingState, 
        votingDates: bountyState?.votingDates,
        votingAllowed: bountyState?.votingAllowed,
        votes: bountyState?.votes,
        myVote: bountyState?.myVote,
        isVoting,
        castVote 
    };

}
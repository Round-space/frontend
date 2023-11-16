import { RootState } from '../reducers/index'
import { useSelector } from 'react-redux'
import useVoting from './useVoting';

// export const BOUNTY_STATUS = {
//     DRAFT: 'draft',
//     CREATING: 'creating',
//     ACTIVE: 'active',
//     COMPLETED: 'completed',
//     DRAINING: 'draining',
//     CANCELLED: 'cancelled',
//     EXPIRED: 'expired',
//     UNKNOWN: 'unknown',
//     VOTING: 'voting on',
    

export function useBountyStatus() {
    
    const bountyState = useSelector((state: RootState) => { return state.bounties; });
    const { votingState } = useVoting();
    const { isDraft, isPending, isExpired } = bountyState;
    
    const awatingConfirmation = bountyState.waitingSubmissionConfirmation ||
    bountyState.waitingDrainConfirmation ||
    bountyState.isLoading ||
    bountyState.creating ||
    bountyState.waitingPayout;

    let bountyProgress =
    (!bountyState.bounty.issueTxId && !bountyState.bounty.metadataUrl) ? 'draft' :

    (isPending || (bountyState.bounty.issueTxId && !bountyState.bounty.bountyId)) ? 'creating' :
      

        (!isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && bountyState.creating) ? "active" :
          (!isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && !awatingConfirmation) ? "active" :
            (!isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length == 0 && bountyState.waitingSubmissionConfirmation) ? "active" :
              (!isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && !awatingConfirmation) ? "active" :
                (!isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && bountyState.waitingSubmissionConfirmation) ? "active" :
                  (!isExpired && !bountyState.bounty.isCompleted && bountyState.submissions.length != 0 && bountyState.waitingPayout) ? "active" :
                    (!isExpired && bountyState.bounty.isCompleted && bountyState.bounty.drainTxId == null && !awatingConfirmation) ? "completed" :
                      (!isExpired && bountyState.waitingDrainConfirmation) ? "draining" :
                        (bountyState.bounty.isCompleted && bountyState.bounty.drainTxId != null) ? "cancelled" :
                          (isExpired) ? "expired" : "unknown";
    
                          // accomdate voting state
    // if(bountyProgress === 'active') {
    //   bountyProgress =  (votingState === 0 ? 'active' : votingState === 1 ? 'submissions on' : votingState === 2 ? 'voting on' : 'voting closed');
    // }
    // console.log('state changed', bountyState.creating, bountyProgress);
    return bountyProgress;
}
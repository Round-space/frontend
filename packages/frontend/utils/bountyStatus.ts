import { fromUnixTime } from 'date-fns'
/*
* Hard Status means, it is not going to take into consideration any transitory states such as "creating", "paying out", 
* draining", etc, which are generated temporarily due to interaction with the UI
*
*/
export function bountyHardStatus( bountyData: any) {
    const today = new Date();
    const deadline = bountyData ? fromUnixTime(bountyData.deadline) : today;
    const isExpired = today >= deadline;

    let status = 'unknown';

    if( !bountyData?.issueTxId && !bountyData?.metadataUrl ) {
        status = 'draft';
    } else if( isExpired ) {
        status = 'expired';
    } else {     
        if( bountyData.isCompleted) {
            if( bountyData.drainTxId == null ) {
                status = 'completed';
            } else {
                status = 'cancelled';
            }
        } else {
            status = 'active'
            // if( bountyData.submissions.length === 0 ) {
            //     status = 'new';
            // } else {
            //     status = 'active'
            // }
        }
    } 
                        
    return status;
}
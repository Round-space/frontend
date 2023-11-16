import {
  Box,
  Flex,
  Link,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react'

import steps from '../../data/bountyStates.json'
import { StepsProgressBar } from './StepsProgressBar'
import { Step } from './Step'
import { useProgressState } from './useProgressState'

import { format, formatDistanceToNow, fromUnixTime } from 'date-fns'
import { toDate } from 'date-fns-tz'

const ProgressBar = (props): JSX.Element => {
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // IF props.creationDate is undefined then we're in 'Preview' mode and the bounty doesn't truly exist yet
  // this means we should display 'Today' as the start date and infinity as the deadline
  // these values can later be overwritten via changes to the parent props

  const deadlineDate = fromUnixTime(props.deadline ?? 0); // ms value turned to date
  const creationDate = toDate(props.creationDate ?? new Date().getTime(), { timeZone: currentTimezone }); // turn string into date
  // const now = toDate(new Date(), { timeZone: currentTimezone })

  const deadlineStr = props.deadline == 0 ? '' : format(deadlineDate, 'PP');
  const creationStr = props.creationDate == 0 ? '' : format(creationDate, 'PP');

  // const daysTillDeadline = props.deadline == 0 ? 0 : differenceInCalendarDays(deadlineDate, now);
  // const totalDays = props.deadline == 0 ? 0 : differenceInCalendarDays(deadlineDate, creationDate);
  const daysTillDeadlineStr = props.deadline == 0 ? '' : formatDistanceToNow(deadlineDate, { addSuffix: true })

  // // This is a hack - need to remove
  // const daysElapsed = totalDays - daysTillDeadline + 1;
  // const daysPerc = daysTillDeadline == 0 || daysTillDeadline <= 0 || totalDays == 0 ? 0 : Math.round((daysElapsed / totalDays) * 100);
  const bountyProgress = props.bountyProgress

  const { value, getState } = useProgressState(steps, bountyProgress)


  return (
    <Box p={5}>
      <Box mx="auto" maxW="3xl" py={2} px={2}>
        <Box as="nav" aria-label="Steps" position="relative">
          <Flex justify="space-between" align="center" as="ol" listStyleType="none" zIndex={1}>
            {steps.map((step, index) => (<Step  key={`"${index}`} label={step.label}  state={getState(index)} />))}
          </Flex>
          <StepsProgressBar value={value} />
        </Box>
      </Box>
      
      <SimpleGrid columns={3} spacing={1} fontSize="xs" >
        <Box textAlign="left">
          { bountyProgress == 'draft' ? <b>Draft {creationStr}</b> : 
              bountyProgress == 'creating' ? <><Spinner size='xs' /> Confirming Transaction</> : 
                                          <><b>Created {creationStr}</b><br/><Link href={props.issueTxLink} isExternal>(Etherscan)</Link></> }
        </Box>
        <Box textAlign="center"><b>{props.numSubmissions != 0 ? "Active (" + props.numSubmissions + " claim" + (props.numSubmissions > 1 ? "s)" : ")") : ""}</b><br/>
                                {(bountyProgress == 'submitting' || bountyProgress == 'activating') ? <>Incoming! <Spinner size='xs' /></> : ""} 
        </Box>
        <Box textAlign="right">{bountyProgress == 'expired' ? "Expired on " + deadlineStr : 
                                bountyProgress == 'cancelled' ? <b>Cancelled </b> : 
                                bountyProgress == 'completed' && props.fulfillTxLink ? <><b>Completed </b><br/><Link href={props.fulfillTxLink} isExternal>(View on Etherscan)</Link></> : 
                                "Due on " + deadlineStr + " (" + daysTillDeadlineStr + ")"}<br/>
                                {(bountyProgress == 'paying' || bountyProgress == 'draining') ? <>Updating... <Spinner size='xs' /></> : ""}                                
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default ProgressBar;
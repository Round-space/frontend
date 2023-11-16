

import {
  Text,
  Stack,
  Box,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppSelector } from '../../reducers/index'

// import { fromUnixTime } from 'date-fns'
import ProgressBar from '../bounty/ProgressBar'
// import { toDate } from 'date-fns-tz'

const BountyReward = (props): JSX.Element => {
  const NULL_AMOUNT = '';
  // const [usdDepositEquivalent, setUsdDepositEquivalent] = useState(NULL_AMOUNT);
  const [usdRemainEquivalent, setUsdRemainEquivalent] = useState(NULL_AMOUNT);

  const bountyTokenState = useAppSelector((state) => state.fundBounty);
  // const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // const deadlineDate = fromUnixTime(props.deadline ?? 0); // ms value turned to date
  // const creationDate = toDate(props.creationDate ?? new Date().getTime(), { timeZone: currentTimezone }); // turn string into date
  // const now = toDate(new Date(), { timeZone: currentTimezone })
  const usdPrecision = 2;

  // const deadlineStr = props.deadline == 0 ? '' : format(deadlineDate, 'PP');
  // const creationStr = props.creationDate == 0 ? '' : format(creationDate, 'PP');

  // const daysTillDeadline = props.deadline == 0 ? 0 : differenceInCalendarDays(deadlineDate, now);
  // const totalDays = props.deadline == 0 ? 0 : differenceInCalendarDays(deadlineDate, creationDate);
  // const daysTillDeadlineStr = props.deadline == 0 ? '' : formatDistanceToNow(deadlineDate, { addSuffix: true })

  const conversionRate = bountyTokenState.currencyUsdPrice;

  useEffect(() => {
    if (bountyTokenState.currencyUsdPrice > 0.001) {
      // const newUsdDepositValue = toUsdAmount(Number.parseFloat(props.tokenAmount));
      const newUsdRemainValue = toUsdAmount(Number.parseFloat(props.remainTokenAmount));
      // setUsdDepositEquivalent(newUsdDepositValue);   
      setUsdRemainEquivalent(newUsdRemainValue);
    }
  }, [bountyTokenState.currencyUsdPrice, props.remainTokenAmount, props.tokenAmount]);

  const toUsdAmount = (tokenAmount: number) => {
    if (Number.isNaN(tokenAmount) || Number.isNaN(conversionRate) || conversionRate < 0.000000001)
      return NULL_AMOUNT;
    return (tokenAmount * conversionRate).toFixed(usdPrecision);
  }


  return (
    <Stack gap="5" borderWidth="thin" p={6} borderRadius="3xl" boxShadow="md" bgColor="white">
      <Text fontSize="xl" lineHeight="short" fontWeight="800">Summary</Text>
      <Box>
        <Text fontSize="md" fontWeight="700" color="black" mb={2}>Reward Pool</Text>
        <Text fontWeight="700" fontSize="2xl">{props.tokenAmount == "" ? "-" : props.tokenAmount} {props.tokenSymbol}</Text>
        {/* <StatHelpText color="gray.600">{usdDepositEquivalent && `($${usdDepositEquivalent})`}</StatHelpText> */}
        <Text color="gray.500" fontSize="md" fontWeight="500">
          { props.numRewards ? <>This pool will be split into {props.numRewards} reward{props.numRewards > 1 ? 's.' : '.'}</> : "" }
          { props.completed ? "This round is completed. " :
            "This round has " + 
            props.remainTokenAmount + " " +
            props.tokenSymbol + " " +
            (usdRemainEquivalent && `($${usdRemainEquivalent})`) + " left in the reward pool."
          }
        </Text>
      </Box>
      <Box>
        <Text fontSize="md" fontWeight="700" mb={2}>Milestones</Text>
        <ProgressBar />
        {/* <Text fontWeight="700" fontSize="2xl">{"Due " + daysTillDeadlineStr} </Text>
        <Text color="gray.500" fontSize="md" fontWeight="500">On {deadlineStr}</Text> */}
      </Box>
      {props.children}
    </Stack>
  )
}

export default BountyReward;
import { Box, UnorderedList, chakra } from '@chakra-ui/react'
import HistoryUpdate from './HistoryUpdate'
function BountySubmissionsList(props) {
  return (
    <Box pt={10}>
      <chakra.h1 fontSize="2xl" fontWeight="bold">
        History
      </chakra.h1>
      <UnorderedList>
        {props.submissions.map((m,index) => {
          const message = m.user + ' ' + m.action
          return (<HistoryUpdate key = {index} info={message}  />)
        })}
      </UnorderedList>
    </Box>
  )
}

export default BountySubmissionsList

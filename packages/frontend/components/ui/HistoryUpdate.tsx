import {
  ListItem,
  chakra,
} from '@chakra-ui/react'

const HistoryUpdate = (props) => {
    return (
      <ListItem>
        <chakra.h3>{props.info}</chakra.h3>
      </ListItem>
    )
  }


export default HistoryUpdate;
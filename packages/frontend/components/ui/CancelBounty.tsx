/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Stack, chakra, Flex, HStack, Button, useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
} from "@chakra-ui/react";
import { useState, useRef } from 'react'

const CancelBounty = (props) => {
  const [accepting, setAccepting] = useState(false);
  const cancelRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isReady, setIsReady] = useState(false);
  const handleCancelBountyClick = () => {
    try {
      setAccepting(true);
      props.onDrainBounty();
      onClose();
    } catch (e) {
      console.log(e);
    }
    setAccepting(false);
  }

  const message = accepting ? 'Draining...' : 'Drain';
  const isRunningSomething = props.bountyState.waitingSubmissionConfirmation ||
                              props.bountyState.waitingDrainConfirmation ||
                              props.bountyState.isLoading ||
                              props.bountyState.creating ||
                              props.bountyState.waitingPayout;

  let shouldDisable = accepting || isRunningSomething || props.bountyState.bounty?.isCompleted ;
  if(!props.isExpired && props.bountyState.submissions){
    if(props.bountyState.submissions.length > 0)
        shouldDisable = true;
  }

  const button = <Button isDisabled={shouldDisable}
    onClick={onOpen}
    colorScheme="red">{message}
    {props.bountyState.waitingDrainConfirmation && <Spinner size="sm" ml='2' />}
    </Button>

  const modal = (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Drain Bounty
          </AlertDialogHeader>

          <AlertDialogBody>
            Do you want to drain all funds and cancel this bounty? If you proceed, you will be prompted to confirm this transaction. Please note this action cannot be reversed.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Keep Active
            </Button>
            <Button colorScheme="red" onClick={handleCancelBountyClick} ml={3}>
              Proceed with Cancellation
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>);

  const content = (<Flex>
    {button}
    {modal}
  </Flex>)
  return content;

  
}


export default CancelBounty;
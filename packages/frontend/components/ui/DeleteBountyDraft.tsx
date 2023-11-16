/* eslint-disable @typescript-eslint/no-unused-vars, no-console */
import {
  Flex, Button, useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useRef } from 'react'
import { Bounty } from "../../data/model";
import { AccountMetadata } from "../../data/model";
import Moralis from 'moralis';
import { useAccount } from "wagmi";

const DeleteBountyDraft = ({bountyState}) => {
  
  const { data: accountData } = useAccount();
  const account = accountData?.address
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef();
  const router = useRouter();
  
  const [deleting, setDeleting] = useState(false)
  
  const handleDelete = () => {
    const draftBounty = new Bounty()
            
    if(bountyState?.bounty?.databaseId) {
            
        setDeleting(true);
        draftBounty.id = bountyState.bounty.databaseId;
        draftBounty.destroy().then(() => {
            console.log('Bounty deleted');
            // check if the user has a board
            const accountQuery = new Moralis.Query(AccountMetadata);
            accountQuery.equalTo('account', account);
            accountQuery.find().then(res => {
              if(res && res.length) {
                router.push('/dashboard');
              } else {
                router.push('/');
              }
            });
          },
          (err) => {
              console.log(err);
              setDeleting(false);
          }
        );
    }
    
    onClose()
  }

  const button = <Button 
    onClick={onOpen}
    colorScheme="red">{ deleting? 'Deleting...': 'Delete' }</Button>

  const modal = (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Bounty Draft ?
          </AlertDialogHeader>

          <AlertDialogBody>
            Do you want to delete this Bounty Draft? You will not be able to recover it.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Keep Draft
            </Button>
            <Button colorScheme="red" ml={3} onClick={handleDelete}>
              Proceed with Deletion
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


export default DeleteBountyDraft;
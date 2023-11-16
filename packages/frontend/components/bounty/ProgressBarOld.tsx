import { Box, HStack, VStack, Text, Flex } from "@chakra-ui/react";


import { CheckCircleIcon } from "@chakra-ui/icons"

import useVoting from "../../hooks/useVoting";
import { useAppSelector, RootState } from "../../reducers";
import { useBountyStatus } from "../../hooks/useBountyStatus";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const statuses = {
    'draft': 0,
    'creating': 0,
    'active': 1,
    'cancelled': 2,
    'completed': 2,
    'expired': 2,
    'draining': 2,
}

const startSteps = [
    {
        title: "Bounty Created", // creating
        others: {
            'draft': 'Draft',
            'creating': 'Creating'
        },
        dates: [{
            title: 'on',
            key: 'creationDate'
        }]
    },
    {
        title: "Submissions",
        others: {
            'submissions on': 'Submissions',
            'active': 'Submissions',
        },
        // dates: [{
        //     title: 'till',
        //     key: 'votingStart'
        // }]
    },
];

const votingSteps = [
    {
        title: "Submissions",
        others: {
            'submissions on': 'Submissions close',
            'active': 'Submissions close',
            'voting on': 'Submissions Closed',
            'voting closed': 'Submissions Closed'
        },
        dates: [{
            title: 'on',
            key: 'votingStart'
        }]
    },
    {
        title: "Voting Starts",
        others: {
            'voting on': 'Voting Closing',
            'voting closed': 'Voting Closed'
        },
        dates: [{
            title: 'on',
            key: 'votingStart'
        }, {
            title: 'on',
            key: 'votingEnd'
        }]

    },
    {
        title: "Results",
        others: {
            'voting closed': 'Results Awaited',
        },
        // dates: [{
        //     title: 'from',
        //     key: 'votingEnd'
        // }]
    }
];

const applicationSteps = [
    {
        title: "Applications",
        others: {
            'active': 'Applications closing',
        },
        dates: [{
            title: 'on',
            key: 'applicationsDeadline'
        }]
    },
    {
        title: "Submissions",
        others: {
            'submissions on': 'Accepting Submissions',
            'active': 'Accepting Submissions',
        }
    }
]

const finalSteps = [
    {
        title: "Deadline",
        others: {
            'cancelled': 'Cancelled',
            'completed': 'Completed',
            'expired': 'Expired',
            'draining': 'Draining'
        },
        dates: [{
            title: 'on',
            key: 'deadline'
        }]

    }
]


export default function ProgressBar() : JSX.Element {
    
    const bountyState = useAppSelector((state: RootState) => { return state.bounties; });
    const { allowedSubmission } = bountyState;
    const { votingState, votingDates } = useVoting();
    const { requiresApplication, applicationsDeadline} = bountyState.bounty ?? {};

    const bountyStatus = useBountyStatus();
    
    const steps = [
        ...( votingState > 0 || requiresApplication ? startSteps.slice(0, 1) : startSteps ),
        ...(requiresApplication ? applicationSteps : []),
        ...(votingState > 0 ? votingSteps : []),
        ...finalSteps
    ]

    const dates = {
        creationDate: {
            date: new Date(bountyState.bounty?.creationDate),
            daysTill: formatDistanceToNow((new Date(bountyState.bounty?.creationDate)).getTime(), { addSuffix: true })
        },
        deadline: {
            date: new Date(bountyState.bounty?.deadline * 1000),
            daysTill: formatDistanceToNow(bountyState.bounty?.deadline * 1000, { addSuffix: true })
        },
        votingStart: {
            date: new Date(votingDates[0]),
            daysTill: formatDistanceToNow((new Date(votingDates[0])).getTime(), { addSuffix: true })
        },
        votingEnd: {
            date: new Date(votingDates[1]),
            daysTill: formatDistanceToNow((new Date(votingDates[1])).getTime(), { addSuffix: true })
        },
        applicationsDeadline: {
            date: applicationsDeadline ? new Date(applicationsDeadline * 1000) : null,
            daysTill: applicationsDeadline ? formatDistanceToNow(applicationsDeadline  * 1000, { addSuffix: true }) : null
        }        
    }
    
    
    const state = 0 + (statuses[bountyStatus] ?? 0) + (requiresApplication && (allowedSubmission || Date.now() > (applicationsDeadline * 1000)) ? 1 : 0) + votingState;
    
    return (
        <VStack w='full' alignItems='flex-start'>
            
            {steps.map((step : any, index) => {
                return (
                    <>
                        <HStack key={index} alignItems='flex-start'>
                            <Flex 
                                fontSize='2xl' 
                                bg='gray.200' 
                                w='9' h='9' 
                                alignItems='center' 
                                justifyContent='center'
                                borderRadius='50%'
                                >
                                {[
                                    <CheckCircleIcon color="black" key='check' w='7' h='7' />,
                                    <Flex w='7' h='7' bg='black' borderRadius='50%' alignItems='center' justifyContent='center' key='progress'>
                                        <Box w='4' h='4' bg='gray.200' borderRadius='50%' />
                                    </Flex>,
                                    <Box key='blank' />
                                ][index === state ? 1 : index < state  ? 0 : 2]}
                            </Flex>
                            <Flex direction='column' pt='1' h='44px' alignItems='flex-start' >
                                <Text 
                                    fontSize={index === state || index === steps.length - 1 ? 'lg' : 'sm'}
                                    color={ index === state || index === steps.length - 1 ? 'black' : 'gray.400' } 
                                    fontWeight='bold' 
                                    wordBreak='keep-all'>
                                    {step?.['others']?.[bountyStatus] ?? step.title} {dates[step.dates?.[(index <= state ?  step.dates.length - 1 : 0)].key ?? 0]?.daysTill ?? ''}
                                </Text>
                                { (index === 0 || index === steps.length - 1 || index === state) && step.dates?.length && 
                                    <Text fontSize='xs' fontWeight={index === state ? 'bold' : 'normal'} color='gray.500' textAlign='left'>
                                        {
                                        dates[step.dates[(index <= state ?  step.dates.length - 1 : 0)].key] && <>
                                            {step.dates[(index <= state ?  step.dates.length - 1 : 0)].title + ' '}  
                                            {
                                                index === state ? (dates[step.dates[(index <= state ?  step.dates.length - 1 : 0)].key].date?.toUTCString())
                                                : dates[step.dates[(index <= state ?  step.dates.length - 1 : 0)].key].date.toLocaleDateString()
                                                


                                            }
                                        </>
                                        }
                                    </Text> 
                                }
                            </Flex>
                            

                        </HStack>
                        {index < steps.length - 1 && <Box flexGrow={1} position='relative'><Box w='1'  bg={ index <= state - 1 ? 'black' : 'gray.200'} position='absolute' left='4' top='-5' bottom='-3' /></Box>}
                    </>
                )
            })}
        </VStack>
    )
}
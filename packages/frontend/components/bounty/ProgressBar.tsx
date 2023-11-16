import { Box, HStack, VStack, Text, Flex, IconButton } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";


import useVoting from "../../hooks/useVoting";
import { useAppSelector, RootState } from "../../reducers";
import { useBountyStatus } from "../../hooks/useBountyStatus";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useEffect, useState } from "react";
// import { setBountyState } from "../../reducers/bounty/state";

// const statuses = {
//     'draft': 0,
//     'creating': 0,
//     'active': 1,
//     'cancelled': 2,
//     'completed': 2,
//     'expired': 2,
//     'draining': 2,
// }

const vanillaSteps = {
    creating: {
        titles: {
            default: {
                text: "Created",
                date: "creationDate"
            },
            draft: {
                text: "Draft"
            },
            creating: {
                text: "Creating"
            }
        }
    },
    active: {
        titles: {
            default: {
                text: "Proposals",
            },
            active: {
                text: "Open for Proposals"
            }
        }
    },
    completed: {
        titles: {
            default: {
                text: "Deadline",
                date: "deadline"
            },
            completed: {
                text: "Completed"
            },
            expired: {
                text: "Expired",
                date: "deadline"
            },
            draining: {
                text: "Draining"
            },
            cancelled: {
                text: "Cancelled"
            }
        }
    }
};

const applicationSteps = {
    creating: {
        titles: {
            default: {
                text: "Created",
                date: "creationDate"
            },
            draft: {
                text: "Draft"
            },
            creating: {
                text: "Creating"
            }
        }
    },
    applications: {
        titles: {
            default: {
                text: "Applications",
            },
            applications: {
                text: "Open for Applications"
            },
            active: {
                text: "Applications Closed"
            },
            accepted: {
                text: "Application Accepted"
            }

        }
    },
    accepted: {
        titles: {
            default: {
                text: "Proposals",
            },
            accepted: {
                text: "Open for Proposals"
            }
        }
    },
    completed: {
        titles: {
            default: {
                text: "Deadline",
                date: "deadline"
            },
            completed: {
                text: "Completed"
            },
            expired: {
                text: "Expired",
                date: "deadline"
            },
            draining: {
                text: "Draining"
            },
            cancelled: {
                text: "Cancelled"
            }
        }
    }
}

const applicationDeadlineSteps = {
    creating: {
        titles: {
            default: {
                text: "Created",
                date: "creationDate"
            },
            draft: {
                text: "Draft"
            },
            creating: {
                text: "Creating"
            }
        }
    },
    applications: {
        titles: {
            default: {
                text: "Applications",
            },
            applications: {
                text: "Applications Deadline",
                date: "applicationsDeadline"
            },
            active: {
                text: "Applications Closed"
            },
            accepted: {
                text: "Application Accepted"
            }

        }
    },
    accepted: {
        titles: {
            default: {
                text: "Proposals",
            },
            accepted: {
                text: "Open for Proposals"
            }
        }
    },
    completed: {
        titles: {
            default: {
                text: "Deadline",
                date: "deadline"
            },
            completed: {
                text: "Completed"
            },
            expired: {
                text: "Expired",
                date: "deadline"
            },
            draining: {
                text: "Draining"
            },
            cancelled: {
                text: "Cancelled"
            }
        }
    }
}

const votingSteps = {
    creating: {
        titles: {
            default: {
                text: "Created",
                date: "creationDate"
            },
            draft: {
                text: "Draft"
            },
            creating: {
                text: "Creating"
            }
        }
    },
    active: {
        titles: {
            default: {
                text: "Submissions",
            },
            active: {
                text: "Accepting Submissions",
                date: "votingStart"
            }
        }
    },
    voting: {
        titles: {
            default: {
                text: "Voting",
            },
            voting: {
                text: "Voting in Progress",
                date: "votingEnd"
            },
            votingclosed: {
                text: "Voting Ended"
            }
        }
    },
    completed: {
        titles: {
            default: {
                text: "Deadline",
                date: "deadline"
            },
            completed: {
                text: "Completed"
            },
            expired: {
                text: "Expired",
                date: "deadline"
            },
            draining: {
                text: "Draining"
            },
            cancelled: {
                text: "Cancelled"
            }
        }
    }
}

const GreenCheck = function ({size, border} : any) : JSX.Element {
    const { bounty } = useAppSelector((state: RootState) => { return state.bounties; });
    const themeColor = bounty.themeColor ?? 'green';
    
    return (
        <IconButton
            size={size ?? 'sm'}
            colorScheme={themeColor}
            aria-label="Green Check"
            borderRadius='50%'
            borderWidth={border}
            cursor='default'
            pointerEvents={'none'}
            borderColor='blackAlpha.500'
            icon={<CheckIcon />}
        >
        </IconButton>
    )
}


export default function ProgressBar() : JSX.Element {
    
    const bountyState = useAppSelector((state: RootState) => { return state.bounties; });
    const { allowedSubmission } = bountyState;
    const { votingState
        // , votingDates 
    } = useVoting();
    const { requiresApplication, applicationsDeadline, votingStart, votingEnd} = bountyState.bounty ?? {};

    // const [current, setCurrent] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    const bountyStatus = useBountyStatus();

    const [status, setStatus] = useState<string>(bountyStatus);
    
    const [steps, setSteps] = useState<any>(vanillaSteps);
    const [stepKeys, setStepKeys] = useState<any>(Object.keys(vanillaSteps));
    

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
            date: new Date(votingStart * 1000),
            daysTill: formatDistanceToNow(votingStart * 1000, { addSuffix: true })
        },
        votingEnd: {
            date: new Date(votingEnd * 1000),
            daysTill: formatDistanceToNow(votingEnd * 1000, { addSuffix: true })
        },
        applicationsDeadline: {
            date: applicationsDeadline ? new Date(applicationsDeadline * 1000) : null,
            daysTill: applicationsDeadline ? formatDistanceToNow(applicationsDeadline  * 1000, { addSuffix: true }) : null
        }        
    }

    useEffect(() => {
        if( requiresApplication ) {
            if( applicationsDeadline ) {
                setSteps(applicationDeadlineSteps);
                setStepKeys(Object.keys(applicationDeadlineSteps));
            } else {
                setSteps(applicationSteps);
                setStepKeys(Object.keys(applicationSteps));
            }
        } else if( votingState > 0) {
            setSteps(votingSteps);
            setStepKeys(Object.keys(votingSteps));
        } else {
            setSteps(vanillaSteps);
            setStepKeys(Object.keys(vanillaSteps));
        }
    }, [votingState, requiresApplication, applicationsDeadline, allowedSubmission])

    useEffect(() => {
        
        const step = bountyStatus === 'draft' ? 'creating' : 
            bountyStatus === 'creating' ? 'creating' :
            bountyStatus === 'active' ? 'active' :
            bountyStatus === 'draining' ? 'completed':
            bountyStatus === 'cancelled' ? 'completed' :
            bountyStatus === 'expired' ? 'completed' :
            'completed'

                
        
        if ( votingState ) {
            // console.log('votingState', votingState, 'step', step);
            if( step === 'active' ) {
                if(votingState > 1) {
                    
                    setCurrentIndex( stepKeys.indexOf('voting') );
                    setStatus( votingState > 2 ? 'votingclosed' : 'voting' );
                    return;
                }
            }
        
        } else if( requiresApplication ) { // applications without close date
            if( step === 'active' ) {
                if(allowedSubmission) {
                    setCurrentIndex( stepKeys.indexOf('accepted') );
                    setStatus( 'accepted' );
                    return;
                } else if(applicationsDeadline && Date.now() > (applicationsDeadline * 1000)) {
                    setCurrentIndex( stepKeys.indexOf('accepted') );
                    setStatus( 'active' );
                    return;
                } else {
                    setCurrentIndex( stepKeys.indexOf('applications') );
                    setStatus( 'applications' );
                    return;
                }
            }
        } 
        
        
        setCurrentIndex( stepKeys.indexOf(step) );
        setStatus( bountyStatus );
        
    }, [votingState, bountyStatus, requiresApplication, allowedSubmission, applicationsDeadline, stepKeys])
    
    
    // const state = 0 + (statuses[bountyStatus] ?? 0) + (requiresApplication && (allowedSubmission || Date.now() > (applicationsDeadline * 1000)) ? 1 : 0) + votingState;
    
    return (
        <VStack w='full' alignItems='flex-start'>
            
            {stepKeys.map((key : any, index) => {
                const step = steps[key];
                const text = step.titles[status]?.text ?? step.titles['default'].text;
                const date = dates[(step.titles[status] ?? step.titles['default'])?.date]?.daysTill?.replace('in ', 'closing in ') ?? null
                return (
                    <>
                        <HStack key={index} alignItems='center' position='relative' zIndex='1'>
                            <Flex w='8' h='8' justifyContent='center' alignItems='center'>
                                {[
                                    <GreenCheck size='xs' border={2} key='check1'/>,
                                    <GreenCheck border={3} key='check2' />,
                                    <Box bg='gray.200' w='7' h='7' borderRadius='50%' key='check3' />
                                    
                                ][index === currentIndex ? 1 : index < currentIndex  ? 0 : 2]}
                            </Flex>
                            <Flex 
                                direction='column' 
                                alignItems='flex-start'
                                fontWeight={ index === currentIndex ? 'bold' : 'normal'}
                                >
                                <Text wordBreak='keep-all' 
                                    fontSize={ index === currentIndex ? 'lg' : 'md'}
                                    >
                                    { text }
                                </Text>
                                { date && <Text fontSize='xs' color='gray.500' wordBreak='keep-all'>
                                    { date }
                                </Text> }
                            </Flex>

                        </HStack>
                        {index < stepKeys.length - 1 && 
                            <Flex 
                                w='8'
                                justifyContent='center'
                                position='relative'
                                >
                                <Box 
                                    w='2px' 
                                    position='absolute'
                                    top='-30'
                                    bottom='-30'
                                    bg='gray.200'  />
                            </Flex>
                        }
                    </>
                )
            })}
        </VStack>
    )
}
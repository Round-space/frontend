import { Image, Skeleton } from "@chakra-ui/react";
import { toDate } from 'date-fns-tz'
import { format } from 'date-fns'
import { useEffect, useState } from "react";
import { useAppSelector } from '../../reducers/index'
import { toDecimal } from '../../utils/bignumber'

let throttler = null;

export default function BountyGraphic({bountyMetadata}): JSX.Element {
    const [amount, setAmount] = useState('0.00');

    const createBounty = useAppSelector((state) => state.createBounty);

    const [dueDate, setDueDate] = useState('');

    const [bountyGraphicURL, setBountyGraphicURL] = useState('');

    const [imageIsLoaded, setImageIsLoaded] = useState(false);

    // get the protocol and the hostname from the url
    // const router = useRouter();
    
    const onImageLoad = () => {
        setImageIsLoaded(true);
    }


    useEffect(() => {
        
        if(bountyMetadata?.deadline) {
            const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const deadlineDate = toDate(bountyMetadata?.deadline, {
                timeZone: currentTimezone,
            })
            
            setDueDate(format(deadlineDate, 'MMM dd, yyyy'));
        }


    }, [bountyMetadata])

    useEffect(() => {
        
        if(createBounty.amount && createBounty.currency) {
            // const tokenPrecision = createBounty.currency?.isNative ? 4 : 2;
            setAmount(toDecimal(createBounty.amount, createBounty.currency).toString() + ' ' + createBounty.currency?.symbol ?? '');
        } else {
            setAmount('0.00' + ' ' + createBounty.currency?.symbol ?? '');
        }
    }, [createBounty?.amount, createBounty?.currency])

    useEffect(() => {
        
        if( throttler ) {
            clearTimeout( throttler );
            throttler = null;
        }
        let isMounted = true;
        throttler = setTimeout(async () => {
            
            const truncatedName = bountyMetadata?.name?.length ? (bountyMetadata.name.length > 60 ? bountyMetadata.name.substring(0, 60) + '...' : bountyMetadata.name) : '';
            // fetch request to api/graphics
            // const bountyGraphicUrl = `/api/graphics/?name=${truncatedName}&amount=${amount}&date=${dueDate}`;
            
            // // const {result} = await ().json();
            // const result = await fetch(bountyGraphicUrl);
            // console.log(result);
            if( isMounted ) {
                setBountyGraphicURL(`/api/graphics/?name=${truncatedName}&amount=${amount}&date=${dueDate}&status=draft`);
            }
            
        }, 1000)
        
        return () => { isMounted = false };
        
    }, [bountyMetadata.name, dueDate, amount]);

    return (
        <>
            <Skeleton
                isLoaded={imageIsLoaded}
                display={imageIsLoaded ? 'none' : 'block'}
                height='230px'
                borderRadius='2xl'
                />
            <Image src={bountyGraphicURL} alt="bounty graphic" onLoad={onImageLoad} opacity={ imageIsLoaded ? 1 : 0} />
            {/* <Flex h="300" w="100%" borderRadius="24" direction="column" boxShadow="1px -1px 2px rgba(0, 0, 0, 0.05)" zIndex={0}>
                <Flex direction="column" flexGrow={1}>
                    <Stack flexGrow={1} px={5} py={2} position="relative" overflow="hidden" borderRadius="24px 24px 0 0">
                        
                        <Box position="absolute" top={0} left={-50} width={255} height={255} bg="#FFCCF1" filter="blur(80px)" transform="rotate(-54.6deg)" />
                        <Box position="absolute" top={280} left={-141} width={524} height={333} bg="#6C76FF" opacity={0.7} filter="blur(80px)" transform="rotate(-76.6deg)" />
                        <Stack position="relative" zIndex={1}>
                            <HStack justifyContent="space-between">
                                <Text textTransform="uppercase" fontSize={18} color="#5350D4" fontWeight="bold">Open Bounty</Text>
                                <Image
                                    opacity="0.7"
                                    maxWidth="65px"
                                    src="/images/aikido_logo3.png"
                                    alt="Aikido"
                                    />
                            </HStack>
                            <Text fontSize={40} maxWidth="75%" lineHeight={1.2} py={2}>{truncatedName}</Text>
                        </Stack>

                    </Stack>
                    <HStack justifyContent="space-between" px={5} py={4} bg="black" color="white" borderRadius="0 0 24px 24px">
                        <Text>Due: <strong>{dueDate}</strong></Text>
                        <Text><strong>{amount} {createBounty?.currency?.symbol}</strong></Text>
                    </HStack>

                </Flex>
            </Flex> */}
        </>
    )
}
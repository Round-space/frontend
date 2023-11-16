import {
    Box,
    Link,
    Text,
    Stack
} from '@chakra-ui/react'

import { truncateHash } from "../../lib/utils";
import { toDecimal } from '../../utils/bignumber';
import { trim } from '../../utils/formatting';
import { useQueryEnsName } from '../../hooks/useQueryEnsName';


function BountyContribution({amount, contributor, refunded, currency, etherScanUrl, index}): JSX.Element {

    const ensName = useQueryEnsName(contributor);
    
    
    if( refunded ) {
        return null;
    }

    return (
        <Box>
            <Link color="gray.500" href={etherScanUrl + "address/" + contributor} isExternal>{ ensName ? ensName : truncateHash(contributor, 24)} { index === 0 && '(Initial Contribution)'}</Link>
            <Text mt={1}>{ trim(toDecimal(amount, currency).toString(), 6) } { currency?.symbol }</Text>
        </Box>
    )
}

function BountyContributions({ contributions, currency, etherScanUrl } : any ): JSX.Element {
    return (
        <Stack gap="5" borderWidth="thin" p={6} borderRadius="3xl" boxShadow="md" bgColor="white" fontWeight="500" fontSize="md">
            <Text fontSize="xl" lineHeight="short" fontWeight="800">Funding History</Text>
            { contributions.length > 0 ? <>
                { contributions.map((contribution, index) => (<BountyContribution key={index} index={index} currency={currency} etherScanUrl={etherScanUrl} {...contribution}  /> )) }
                </> 
                : <Box fontSize="small" color="gray.400">No external funds have been contributed to this bounty.</Box>
            }       
        </Stack>
    )
}

export default BountyContributions;
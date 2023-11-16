import { Badge } from "@chakra-ui/react";

export function RequiredBadge(props): JSX.Element {

    return (
        <Badge 
        borderRadius="xl"
        border={props.isInvalid ? '2px solid #9B2C2C' : ''}
        ml={2}
        py={1}
        px={2}
        colorScheme={props.isInvalid ? 'red' : props.themeColor ? props.themeColor : 'purple'}>
            Required
    </Badge>

    )
}


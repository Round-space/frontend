import { VStack, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";


export function BoardSettingsPane(): JSX.Element {


    const router = useRouter();
    const current = router.asPath;
    const onGotoSettings = ()=>{

        router.push(`${current}/settings`);

    }
    return (

        <VStack>
            <Button onClick={onGotoSettings}  >Settings</Button>
        </VStack>
    );


}



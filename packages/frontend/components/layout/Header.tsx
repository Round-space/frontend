import { Flex, Button, Spacer, Box, Center, Image, Link } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { WalletConnector } from "../ConnectButton/WalletConnector";
import NetworkError from "../ui/NetworkError";
import { HiOutlineHome } from "react-icons/hi"
// import { useAppSelector, RootState } from "../../reducers";
 

export default function Header() {
    const { data: accountData } = useAccount();
    const account = accountData?.address;

    const router = useRouter();
    
    // const dashboardState = useAppSelector((state: RootState) => { return state?.dashBoard; });
    // const { board } = dashboardState;

    const isDashboard = router.pathname.includes("/dashboard") ? true : false;
    
    const gotoDashboard = useCallback(() => {
        if (account) {
          // router.push("/dashboard/"+(board ?? account)+"/home")
          router.push("/dashboard")
        }
    }, [account])
    
    const goToRoot = () => {
      router.push('/');
    }

    return (
      <>
        <NetworkError />
        <Flex as="header" top="0" py="3" px="8" background="transparent" alignItems={'center'} >
            <Center>
              <Link onClick={ (account && isDashboard) ? gotoDashboard : goToRoot} display={["none", 'inherit', 'inherit']}>
                <Image width="120px" src="/images/round-logo-color.png" />
              </Link>
          </Center>

          { (account && !isDashboard) && 
            <Button borderRadius="2xl" ml={[0,2,2]} onClick={gotoDashboard} colorScheme="gray">
              <HiOutlineHome/>
            </Button> }
          <Spacer />
          <Spacer/>
          <Flex order={[1, null, null, 1]} alignItems={'center'} justifyContent={['flex-end', null, null, 'flex-end']}>
            <Box borderRadius="lg">
              <WalletConnector  simpleButton="true"/>
            </Box>
          </Flex>
        </Flex>
        </>

    )

}

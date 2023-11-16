import { Flex, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { RootState, useAppSelector } from "../../reducers";

export default function DashBoardLanding() : JSX.Element {
    const dashboardState = useAppSelector((state: RootState) => { return state?.dashBoard; });
    const { canBoards } = dashboardState;
    const router = useRouter();

    useEffect(() => {
        if(canBoards?.length) {
            const board = canBoards[0]?.new && canBoards[1] ? canBoards[1].board : canBoards[0].board;
            router.push(`/dashboard/${board}/home`);
        }
      }, [canBoards])

    return (
        <Flex p={5} gap='4' flexDirection="column" height="80vh" alignItems='center' justifyContent="center" w="full" color="gray.700">
            <Spinner size='xl' />
            <Text fontSize="lg" fontWeight="medium" mb={5}>Loading...</Text>
        </Flex>
    )
}
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const CreateSteps = dynamic(() => import('../../../components/bounty/CreateSteps'), {
    ssr: false,
})

const Splash = dynamic(() => import('../../../components/bounty/Splash'), {
    ssr: false,
})

const BountyEditPage = (): JSX.Element => {
    
    const { data: accountData } = useAccount();
    const account = accountData?.address
    const router = useRouter()
    const { draft } = router.query;
    return (
        <>
            {account ? <CreateSteps draftId={draft} /> : <Splash />}
        </>
    )

}

export default BountyEditPage;
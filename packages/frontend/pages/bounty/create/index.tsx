import dynamic from "next/dynamic";
import Head from "next/head";
import { useAccount } from "wagmi";

const CreateSteps = dynamic(() => import('../../../components/bounty/CreateSteps'), {
    ssr: false,
})

const Splash = dynamic(() => import('../../../components/bounty/Splash'), {
    ssr: false,
})

export default function BountyNew({url}: any) : JSX.Element {

    const { data: accountData } = useAccount();
    const account = accountData?.address
    return (
        <>
            <Head>
                <meta property="og:title" content="Round" />
                <meta property="og:description" content="Round is a tool for onchain collective action." />
                <meta property="og:image" content={url + 'images/landing/og.png'} />
                <meta property="og:url" content="https://round.space" />
                <meta name="twitter:title" content="Round" />
                <meta name="twitter:description" content="Round is a tool for for on-chain collective action." />
                <meta name="twitter:image" content={url + 'images/landing/og.png'} />
            </Head>
            {account ? <CreateSteps draftId={null} /> : <Splash />}
        </>
    )
}

export const getServerSideProps = async (ctx) => {
    // get url from ctx.req.url
    return {
      props: {
        url: (ctx.req.headers.host.includes('localhost') ? 'http' : 'https') + '://' + ctx.req.headers.host + '/',
      }
    }
  }
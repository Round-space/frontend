/* eslint-disable @typescript-eslint/no-unused-vars, no-console,react/no-unescaped-entities */
import {
  Box,
  Spacer,
  Container,
  Flex
} from '@chakra-ui/react'
import React, { useEffect } from 'react'

import { MetaProps } from './Head'
import { useRouter } from 'next/router'

import { Dashboard} from './Dashboard'

import dynamic from 'next/dynamic'

import Head from 'next/head';
import { RootState, useAppDispatch, useAppSelector } from '../../reducers'
import { fromUnixTime } from 'date-fns'
import { transformToBountyData } from '../../reducers/bounty/actions'
import { fetchAllBountiesByCreator } from '../../service/bounties'
import { useAccount } from 'wagmi'
import { setAllBounties, setAvailableBounties, setDraftBounties } from '../../reducers/dashboard/state'

const Header = dynamic(() => import('./Header'), {
  ssr: false,
})

/**
 * Constants & Helpers
 */

// Title text for the various transaction notifications.
const TRANSACTION_TITLES = {
  transactionStarted: 'Local Transaction Started',
  transactionSucceed: 'Local Transaction Completed',
}

// Takes a long hash string and truncates it.

/**
 * Prop Types
 */
interface LayoutProps {
  children: React.ReactNode
  customMeta?: MetaProps
}


/**
 * Component
 */
export const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  
  const { data: accountData } = useAccount();
  const account = accountData?.address
  
  const router = useRouter();
  const isHomepage = router.pathname === "/" ? true : false;
  const isDashboard = router.pathname.includes("/dashboard") ? true : false;
  
  
  const pageHeader = <Header />;

  const pageContents = (
    <Box overflow="hidden" as="main" 
      mt={isHomepage ? 0 : 4}
      px={isHomepage? 0 : [8, 8, 8]}
      pb={isHomepage? 0 : [2, 4, 8]}
    >
      {children}
    </Box>
  
  )

  return (
    <>
      <Head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥷</text></svg>" />
      </Head>
      
      {/* Gradient */}
      <Box width="100%" backgroundImage={isHomepage? "/images/landing/gradient.png" : ""} backgroundSize="cover" backgroundRepeat="no-repeat">

      {/* <Head customMeta={customMeta} /> */}
      {pageHeader}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        height={isDashboard ? 'calc(100vh - 50px)': ''}
        bg="bg-canvas"
        overflowY="auto"
      >
      { isDashboard && <Dashboard> { pageContents } </Dashboard> }

      { !isDashboard && !isHomepage && (
        <Container as="section" overflow="" maxW='container.xl' px={[0, 0, 1]} flexGrow={[1]}>
          {pageContents}
        </Container>
        )
      }
      { isHomepage && (
        <Box as="section" overflow="auto" flexGrow={[1]}>
          {pageContents}
        </Box>
      ) }
      </Flex>
      </Box>
    </>
  )
}

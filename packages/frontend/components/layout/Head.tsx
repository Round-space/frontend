import NextHead from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
/**
 * Constants & Helpers
 */
export const WEBSITE_HOST_URL = (process.env.NEXT_PUBLIC_VERCEL_URL == null  || process.env.NEXT_PUBLIC_VERCEL_URL == '') ? 'https://www.aikido.work/' : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`

/**
 * Prop Types
 */
export interface MetaProps {
  description?: string
  image?: string
  title: string
  type?: string
}

/**
 * Component
 */
export const Head = ({
  customMeta,
}: {
  customMeta?: MetaProps
}): JSX.Element => {
  const router = useRouter()
  const meta: MetaProps = {
    title: 'Aikido',
    description: '',
    image: `${WEBSITE_HOST_URL}/images/site-preview.png`,
    type: 'website',
    ...customMeta,
  }

  return (
    <NextHead>
      <title>{meta.title}</title>
      <meta content={meta.description} name="Aikido" />
      <meta property="og:url" content={`${WEBSITE_HOST_URL}${router.asPath}`} />
      <link rel="canonical" href={`${WEBSITE_HOST_URL}${router.asPath}`} />
      <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥷</text></svg>" />
      <meta property="og:type" content={meta.type} key="og_type" />
      <meta property="og:site_name" content="Aikido" />
      <meta property="og:description" content={meta.description} key="og_description" />
      <meta property="og:title" content={meta.title} key="og_title" />
      <meta property="og:image" content={meta.image} key="og_image" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@aikido" />
      <meta name="twitter:title" content={meta.title} key="tw_title" />
      <meta name="twitter:description" content={meta.description} key="twitter:description" />
      <meta name="twitter:image" content={meta.image}  key="twitter_image"/>
    </NextHead>
  )
}

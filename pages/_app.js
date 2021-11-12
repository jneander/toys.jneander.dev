import Head from 'next/head'

import 'normalize.css'

import '../src/styles/globals.css'

export default function App({Component, pageProps}) {
  return (
    <>
      <Head>
        <title>CS Learning</title>

        <meta
          name="description"
          content="Examples of things I've learned in CS topics"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Component {...pageProps} />
    </>
  )
}

import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
  <div>
    <nav className='border-b px-12 py-6'>
      <p className="text-xl">Multisig Wallet</p>
      <div className="flex mt-4">
      <Link href="/deposit-bnb">
          <a className='mr-4 text-blue-500'>
            Deposit BNB
          </a>
        </Link>
        <Link href="/propose-transfer">
          <a className='mr-4 text-blue-500'>
            Propose Transfer
          </a>
        </Link>
        <Link href="/sign-transfer">
          <a className='mr-4 text-blue-500'>
            Sign Transfer
          </a>
        </Link>
        <Link href="/about">
          <a className='mr-4 text-blue-500'>
            About
          </a>
        </Link>
      </div>
    </nav>
  
  <Component {...pageProps} />
  <br />
  <br />
  <p className='text-center text-gray-400'>This app works on BSC Testnet</p>
  </div>)
}

export default MyApp

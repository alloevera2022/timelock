import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import React, { useMemo } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';


require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  // you can use Mainnet, Devnet or Testnet here
  const solNetwork = WalletAdapterNetwork.Mainnet;
  // const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  // const solNetwork = WalletAdapterNetwork.Mainnet;
  const endpoint = 'https://api.mainnet-beta.solana.com'; // useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  // initialise all the wallets you want to use
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ solNetwork }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [solNetwork]
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>


          <div className="App">
            <Header />
            <Routes>
              <Route path={'/'} element={<Home />} />
              <Route path={'/dashboard'} element={<Dashboard />} />
              <Route path={'/create'} element={<Create />} />
              <Route path={'/referral'} element={<></>} />
              <Route path={'/api'} element={<></>} />
            </Routes>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;

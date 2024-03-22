import React from 'react';
import Button from "../../components/Button";
import { AiOutlinePlusCircle } from "react-icons/ai";
import styles from './home.module.scss';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TableOfAssets from "../../components/TableOfAssets";

const Home = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  return (
    <div className='page'>
      <div className='container-fluid'>
        <div className='row'>
          <div className={`col-lg-12 ${styles.content}`}>
            <h1>Lock the token for the time you need</h1>

            <WalletMultiButton></WalletMultiButton>
            <TableOfAssets></TableOfAssets>
            
            <Button
              type={'innerLink'}
              to={'/create'}
              title={'Create LOCK'}
              size={'large'}
              icon={<AiOutlinePlusCircle />}
              className={styles.button}
            />
            <h2 className={styles.landing}>Landing</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
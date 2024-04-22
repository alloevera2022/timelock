import React from 'react';
import {Bars} from "react-loader-spinner";
import styles from './loader.module.scss';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Loader = () => {
  return (
    <div className={styles.loader}>
      <Bars
        height="80"
        width="80"
        color="#33B18B"
        ariaLabel="bars-loading"
        wrapperStyle={{}}
        wrapperClass={styles.bar}
        visible={true}
      />
      <h2>To create a lock, please connect your wallet</h2>
    <WalletMultiButton></WalletMultiButton>
    </div>
  );
};

export default Loader;
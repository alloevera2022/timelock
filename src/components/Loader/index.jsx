import React from 'react';
import {Bars} from "react-loader-spinner";
import styles from './loader.module.scss';
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
    </div>
  );
};

export default Loader;
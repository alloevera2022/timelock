import React from 'react';
import { MdInfoOutline } from "react-icons/md";

import styles from './info.module.scss';
const Info = ({ data }) => {
  const {how_much, how_much_percents, token, day, month, year} = data;
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <MdInfoOutline />
      </div>
      <p className={styles.text}>
        {how_much_percents} of {how_much} <span className={styles.token}>{token}</span> will be unlocked on {day}&nbsp;{month}&nbsp;{year}
      </p>
    </div>
  );
};

export default Info;
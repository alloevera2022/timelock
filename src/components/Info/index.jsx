import React from 'react';
import { BiInfoCircle } from "react-icons/bi";
import styles from './info.module.scss';

const Info = ({ data }) => {
  const {how_much, how_much_percents, token, day, month, year} = data;
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <BiInfoCircle />
      </div>
      <p className={styles.text}>
        {how_much_percents} of {how_much} <span className={styles.token}>{token}</span> will be unlocked on {day}&nbsp;{month}&nbsp;{year}
      </p>
    </div>
  );
};

export default Info;
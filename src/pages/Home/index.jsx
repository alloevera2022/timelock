import React from 'react';
import Button from "../../components/Button";
import { AiOutlinePlusCircle } from "react-icons/ai";
import styles from './home.module.scss';

const Home = () => {
  return (
    <div className='page'>
      <div className='container-fluid'>
        <div className='row'>
          <div className={`col-lg-12 ${styles.content}`}>
            <h1>Lock the token for the time you need</h1>
            <Button
              type={'innerLink'}
              to={'/create'}
              title={'Create SOL'}
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
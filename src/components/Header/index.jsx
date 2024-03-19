import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from "react-router-dom";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useMediaQuery } from "react-responsive";
import Button from "../Button";
import styles from './header.module.scss';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header = (props) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [active, setActive] = useState(false);
  const isTablet = useMediaQuery({ maxDeviceWidth: 992 });
  const location = useLocation();

  useEffect(() => {
    isTablet && setActive(false);
  }, [location]);

  return (
    <header className={styles.wrapper}>
      <div className={`container-fluid ${styles.container}`}>
        <Link className={styles.logo} to={'/'}>TimeLock</Link>
        <div className={`${styles.menu} ${active ? styles.active : ''}`}>
          <nav className={styles.navigation}>
            <NavLink className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navActive}` : `${styles.navLink}`)} exact={'true'} to={'/'}>Home</NavLink>
            <NavLink className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navActive}` : `${styles.navLink}`)} to={'/dashboard'}>Dashboard/Locks</NavLink>
            <NavLink className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navActive}` : `${styles.navLink}`)} to={'/referral'}>Referral program</NavLink>
            <NavLink className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.navActive}` : `${styles.navLink}`)} to={'/api'}>API</NavLink>
          </nav>
          <div className={styles.buttons}>
          <WalletMultiButton></WalletMultiButton>
            {/* { location.pathname === '/' ? (
              
              <Button
                type={'link'}
                to={'https://google.com'}
                title={'Connect wallet'}
              />
            ) : (
              <>
                <Button
                  title={'Create for 1 SOL'}
                  icon={<AiOutlinePlusCircle />}
                  onClick={() => alert('1 SOL created')}
                  className={styles.createBtn}
                />
                <Button
                  title={'0x3A13...e4bc'}
                  onClick={() => alert('open 0x3A13...e4bc')}
                />
              </>
            )} */}
          </div>
        </div>
        <button
          className={`${styles.menuBtn} ${active ? styles.active : ''}`}
          onClick={() => setActive(!active)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
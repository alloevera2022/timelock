import React, {useState} from 'react';
import styles from "./dashboard.module.scss";
import Button from "../../components/Button";
import { useMediaQuery } from "react-responsive";
import {BiCopy, BiInfoCircle, BiPencil, BiTrashAlt} from "react-icons/bi";

const DATA = [
  {
    icon: '/token_icons/solana.svg',
    token: 'Solana',
    wallet: '0x3A13...e4bc',
    upcoming: '25.01.2025',
    percent: '50%',
    amount: '$2,500'
  },
  {
    icon: '/token_icons/ethereum.svg',
    token: 'Ethereum',
    wallet: '0x3A13...e4bc',
    upcoming: '25.01.2025',
    percent: '50%',
    amount: '$11,500'
  },
  {
    icon: '/token_icons/tron.svg',
    token: 'Tron',
    wallet: '0x3A13...e4bc',
    upcoming: '25.01.2025',
    percent: '70%',
    amount: '$1,500'
  },
  {
    icon: '/token_icons/btc.svg',
    token: 'Bitcoin',
    wallet: '0x3A13...e4bc',
    upcoming: '25.01.2025',
    percent: '100%',
    amount: '$500'
  },
  {
    icon: '/token_icons/usdc.svg',
    token: 'USDc',
    wallet: '0x3A13...e4bc',
    upcoming: '25.01.2025',
    percent: '100%',
    amount: '$500'
  }
]

const Dashboard = () => {
  const isMobile = useMediaQuery({ maxDeviceWidth: 992 });
  const [activeTab, setActiveTab] = useState([true, false]);

  const handleTab = (tab) => {
    tab === 0 ?
      setActiveTab([true, false]) :
      setActiveTab([false, true])
  }

  return (
    <div className='page'>
      <div className='container-fluid'>
        <div className='row'>
          <div className={styles.container}>
            <div className={styles.header}>
              <h3 className={styles.title}>Locks</h3>
              <div className={styles.tabs}>
                <button onClick={() => handleTab(0)} className={`${styles.tab} ${activeTab[0] && styles.active}`}>All locks</button>
                <button onClick={() => handleTab(1)} className={`${styles.tab} ${activeTab[1] && styles.active}`}>My locks</button>
              </div>
            </div>
            <div className={styles.wrapper}>
              {/* table header */}
              <div className={`${styles.row} ${styles.desktopHeadings}`}>
                <div className={styles.mobileBlock}>
                  <div className={styles.mobileRow}>
                    <div className={styles.tokenIcon}><span className={styles.heading}>Token</span></div>
                    <div className={styles.tokenName}>&nbsp;</div>
                  </div>
                  <div className={styles.mobileRow}>
                    <div className={styles.wallet}><span className={styles.heading}>Wallet</span></div>
                    <div className={styles.button}>&nbsp;</div>
                  </div>
                </div>
                <div className={styles.mobileBlock}>
                  <div className={styles.mobileCol}>
                    <div className={styles.upcoming}><span className={styles.heading}>Upcoming unlock date</span></div>
                    <div className={styles.percent}><span className={styles.heading}>% of upcoming unlock</span></div>
                    <div className={styles.amount}><span className={styles.heading}>Amount</span></div>
                  </div>
                </div>
                <div className={styles.editDelete}>
                  <div className={`${styles.mobileBlock} ${styles.editDelete}`}>
                    <div className={styles.mobileCol}>
                      <div className={styles.button}>&nbsp;</div>
                    </div>
                  </div>
                  <div className={styles.mobileBlock}>
                    <div className={styles.mobileCol}>
                      <div className={styles.button}>&nbsp;</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* table body */}
              {
                DATA.map(({ icon, token, wallet, upcoming, percent, amount }, index) => (
                  <div className={styles.row} key={`${token}_${index}`}>
                    <div className={styles.mobileBlock}>
                      <div className={styles.mobileRow}>
                        <div className={styles.tokenIcon}>
                          <div className={styles.iconBorder}>
                            <img className={styles.icon} src={icon} alt={token} />
                          </div>
                        </div>
                        <div className={styles.tokenName}>{token}</div>
                      </div>
                      <div className={styles.mobileRow}>
                        <div className={styles.wallet}>{wallet}</div>
                        <div className={styles.button}>
                          <button className={styles.iconBtn}><BiCopy /></button>
                        </div>
                      </div>
                    </div>
                    <div className={styles.mobileBlock}>
                      <div className={`${styles.mobileCol} ${styles.mobileHeadings}`}>
                        <div className={styles.upcoming}><span className={styles.heading}>Upcoming</span></div>
                        <div className={styles.percent}><span className={styles.heading}>%</span></div>
                        <div className={styles.amount}><span className={styles.heading}>Amount</span></div>
                      </div>
                      <div className={styles.mobileCol}>
                        <div className={styles.upcoming}>{upcoming}</div>
                        <div className={styles.percent}>{percent}</div>
                        <div className={styles.amount}>{amount}</div>
                      </div>
                    </div>

                    {!isMobile && activeTab[1] &&
                      <>
                        <div className={styles.mobileBlock}>
                          <div className={styles.mobileCol}>
                            <div className={styles.button}>
                              <button className={styles.iconBtn}>
                                <BiPencil />
                              </button>
                            </div>
                          </div>
                          <div className={styles.mobileCol}>
                            <div className={styles.button}>
                              <button className={styles.iconBtn}>
                                <BiTrashAlt />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className={styles.tooltip}>
                          <BiInfoCircle className={styles.icon} />
                          <span className={styles.title}>0.5 SOL</span>
                        </div>
                      </>
                    }
                    {isMobile && activeTab[1] &&
                      <div className={styles.mobileBlock}>
                        <div className={styles.mobileCol}>
                          <Button className={styles.mobileBtn} outline title={'Extend for 1 SOL'}/>
                        </div>
                        <div className={styles.mobileCol}>
                          <Button className={styles.mobileBtn} outline title={'Delete for 1 SOL'}/>
                        </div>
                      </div>
                    }
                  </div>
                ))
              }

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
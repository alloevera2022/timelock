import React, { useEffect, useState } from 'react';
import { useForm, useWatch, Controller } from "react-hook-form";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { PERCENTS, MONTHS, YEARS } from './data';
import { useTableOfAssets } from '../../components/TableOfAssets';
import CustomSelect from "../../components/CustomSelect";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Info from "../../components/Info";
import styles from './create.module.scss';
import { useMediaQuery } from "react-responsive";
import { Keypair, Connection, SystemProgram, Transaction, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

const Create = () => {
  const { names } = useTableOfAssets();
  const [days, setDays] = useState([{ label: 1, value: 1 }]);
  const [monthsList, setMonthsList] = useState(MONTHS);
  const [yearsList, setYearsList] = useState(YEARS);
  const [currentToken, setCurrentToken] = useState(names.length > 0 ? names[0].value : '');
  const [edit, setEdit] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [formData, setFormData] = useState({});
  const isMobile = useMediaQuery({ maxDeviceWidth: 992 });
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=59dcc64e-6eaa-4d48-b97e-407c2792cb52');
  const { publicKey: userWalletPublicKey, sendTransaction, signTransaction, connected } = useWallet();
  const [successLock, setSuccesLock] = useState(false);

  const lockTokens = async () => {
    // if (!depositAmount || depositAmount === 0) {
    //     setInputError(true);
    //     return;
    // }
    try {

        const fromPublicKey = userWalletPublicKey;
        // const storedAddress = keypair.publicKey.toBase58();
        const toPublicKey = new PublicKey('9EYKVhh2rfN7yDxCq9EeTKFBcktfqSiKt4dYuq7br3zv');
        const blockhash = await connection.getLatestBlockhash('confirmed');
        const transaction = new Transaction({
            recentBlockhash: blockhash.blockhash,
            feePayer: userWalletPublicKey,
        }).add(
            SystemProgram.transfer({
                fromPubkey: fromPublicKey,
                toPubkey: toPublicKey,
                lamports: 0.001 * 10 ** 9,
            })
        );

        const signedTx = await signTransaction(transaction);
        const compiledTransaction = signedTx.serialize();
        const signature = await connection.sendRawTransaction(compiledTransaction, { preflightCommitment: 'confirmed' });

        // setDepositSuccess(true);
        // setTimeout(() => {
        //     setDepositSuccess(false);
        // }, 5000);
        // setDepositAmount(null);

        console.log('Транзакция успешно выполнена, подпись:', signature);
        setSuccesLock(true); 
    } catch (error) {
        console.error('Ошибка транзакции:', error);
    }
};

  const {
    register,
    handleSubmit,
    setValue,
    control
  } = useForm({
    defaultValues: {
      how_much: '5000',
      how_much_percents: '100%',
      token: names.length > 0 ? names[0].value : '',
      day: days[0].value,
      month: monthsList[0].value,
      year: yearsList[0].value
    }
  });

  const watchAll = useWatch({ control });

  useEffect(() => {
    setMonthsList(MONTHS);
    setYearsList(YEARS);
  }, []);


  useEffect(() => {

    setValue("how_much", currentToken);
  }, [currentToken]);
  

  useEffect(() => {
    const currentMonth = watchAll.month ? watchAll.month : monthsList[0].value;
    const currentYear = watchAll.year ? watchAll.year : yearsList[0].value;

    setDays(getDaysInMonth(
      monthsList,
      currentMonth,
      currentYear
    ));

    setCurrentToken(watchAll.token);
  }, [watchAll]);

  const onSubmit = (data) => {
    setEdit(false);
    setIsBlocked(true);
    setFormData(data);
    isMobile && scrollToTop();
  };

  const extendToken = (e) => {
    e.preventDefault();
    setIsBlocked(false);
    setEdit(true);
  };

  const deleteToken = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  const getDaysInMonth = (monthsList, currentMonth, currentYear) => {
    const monthIndex = monthsList.findIndex(month => month.value === currentMonth)
    const date = new Date(currentYear, monthIndex, 1);
    const days = [];
    while (date.getMonth() === monthIndex) {
      days.push(new Date(date).getDate());
      date.setDate(date.getDate() + 1);
    }
    return days.map(day => ({
      value: day,
      label: day
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  if (names.length === 0 || days.length === 0 || monthsList.length === 0 || yearsList.length === 0) {
    return <Loader />;
  }


  return (
    <div className='page'>
      <div className='container-fluid'>
        <div className='row mobile-reverse'>
          <div className='col-lg-7 col-xl-6'>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              {!edit && !isBlocked && <h3 className={styles.title}>Create a lock</h3>}
              {edit && <h3 className={styles.title}>Edit lock</h3>}
              {isBlocked && <h3 className={styles.title}>Lock created</h3>}
              <div className='input__block'>
                <div className="row">
                  <div className="col-lg-12 col-sm-7 d-flex space-between">
                    <label className='input__title'>Choose a token</label>
                    <span className={`${styles.total} mobile`}>Total {currentToken}</span>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-lg-7 col-sm-7'>
                    <Controller
                      control={control}
                      name="token"
                      defaultValue={names[0].label}
                      render={({ field }) => (
                        <CustomSelect
                          options={names}
                          icons={true}
                          field={field}
                          setValue={setValue}
                          name={"token"}
                          isDisabled={isBlocked}
                        />
                      )}
                    />
                  </div>
                  <div className='col-lg-5 d-flex middle-xs desktop'>
                    <span className={styles.total}>Total {currentToken}</span>
                  </div>
                </div>
              </div>


              <div className='input__block'>
                <label className='input__title' htmlFor={'how_much'}>How much to block?</label>
                <div className='row'>
                  <div className={`col-lg-7 col-sm-7 col-xs-12 ${styles.inputMobile}`}>
                    <input
                      id='how_much'
                      type='text'
                      className='input input__wide'
                      disabled={isBlocked}
                      {...register("how_much")}
                    />
                  </div>
                  <div className={`col-lg-5 col-sm-5 col-xs-12 d-flex middle-xs ${styles.radioBlock}`}>
                    {
                      PERCENTS.map((item, index) => (
                        <div className='radio' key={index}>
                          <input
                            type='radio'
                            name='radiogroup_01'
                            id={`radio_${index}`}
                            value={item}
                            disabled={isBlocked}
                            {...register("how_much_percents")}
                          />
                          <label htmlFor={`radio_${index}`}>{item}</label>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              <div className='input__block'>
                <label className='input__title'>When to unlock ?</label>
                <div className='row'>
                  <div className='col-lg-7 col-sm-7 col-xs-12'>
                    <div className="row">
                      <div className={`col-lg-4 col-sm-4  col-xs-4 ${styles.inputMobile}`}>
                        <Controller
                          name="day"
                          control={control}
                          defaultValue={days[0].value}
                          render={({ field }) => (
                            <CustomSelect
                              name="day"
                              field={field}
                              options={days}
                              setValue={setValue}
                              isDisabled={isBlocked}
                            />
                          )}
                        />
                      </div>
                      <div className={`col-lg-8 col-sm-8 col-xs-8 ${styles.inputMobile}`}>
                        <Controller
                          name="month"
                          control={control}
                          defaultValue={monthsList[0].value}
                          render={({ field }) => (
                            <CustomSelect
                              name="month"
                              options={monthsList}
                              buttons={true}
                              field={field}
                              setValue={setValue}
                              isDisabled={isBlocked}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`col-lg-5 col-sm-5 col-xs-12 ${styles.yearSelect}`}>
                    <Controller
                      control={control}
                      defaultValue={yearsList[0].value}
                      name="year"
                      render={({ field }) => (
                        <CustomSelect
                          options={yearsList}
                          buttons={true}
                          field={field}
                          setValue={setValue}
                          name={'year'}
                          isDisabled={isBlocked}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              { isBlocked ?
                <div className={styles.formButtons}>
                  <Button className={styles.formButton} onClick={(e) => extendToken(e)} outline>Extend for 0.5 {currentToken}</Button>
                  <Button className={styles.formButton} onClick={(e) => deleteToken(e)} outline>Delete for 0.5 {currentToken}</Button>
                </div> :

                <Button
                  icon={<AiOutlineCheckCircle />} onClick={() => {
                    if (connected) {
                        lockTokens();
                    }
                }}
                >
                  {edit ? 'Extend' : 'Create'} for {currentToken}<span className={styles.token}></span>
                </Button>
              }
            </form>
          </div>
          {successLock && (
          <div className='col-lg-5 col-xl-6'>
            {isBlocked && formData && <Info data={formData}/>}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Create;
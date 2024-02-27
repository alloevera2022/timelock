import React, { useEffect, useState } from 'react';
import { useForm, useWatch, Controller } from "react-hook-form";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { PERCENTS, TOKENS, MONTHS, YEARS } from './data';
import { useMediaQuery } from "react-responsive";
import Button from "../../components/Button";
import CustomSelect from "../../components/CustomSelect";
import Loader from "../../components/Loader";
import Info from "../../components/Info";
import styles from './create.module.scss';

// get array of days depending on month and year. returns correct object for select
const getDaysInMonth = (monthsList, currentMonth, currentYear) => {
  const monthIndex = monthsList.findIndex(month => month.value === currentMonth)

  const date = new Date(currentYear, monthIndex, 1);
  const days = [];
  while (date.getMonth() === monthIndex) {
    days.push(new Date(date).getDate());
    date.setDate(date.getDate() + 1);
  }
  return days.map(day => {
    return {
      value: day,
      label: day
    }
  });
}

//scroll to top when blocked token and mobile
const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
};

const Create = () => {
  const [days, setDays] = useState([{label: 1, value: 1}]);
  const [monthsList, setMonthsList] = useState(MONTHS);
  const [yearsList, setYearsList] = useState(YEARS);
  const [total, setTotal] = useState(10000)
  const [currentToken, setCurrentToken] = useState(TOKENS[0].value);
  const [edit, setEdit] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [formData, setFormData] = useState({});

  const isMobile = useMediaQuery({ maxDeviceWidth: 992 });

  const {
    register,
    handleSubmit,
    setValue,
    control
  } = useForm({
    // set default params to form on page load
    defaultValues: {
      how_much: '5000',
      how_much_percents: '100%',
      token: TOKENS[0].value,
      day: days[0].value,
      month: monthsList[0].value,
      year: yearsList[0].value
    }
  });
  const watchAll = useWatch({ control });

  // set months and years to state
  useEffect(() => {
    setMonthsList(MONTHS);
    setYearsList(YEARS);
  }, []);

  // set days depending on months and year
  useEffect(() => {
    const currentMonth = watchAll.month ? watchAll.month : monthsList[0].value;
    const currentYear = watchAll.year ? watchAll.year : yearsList[0].value;

    setDays(getDaysInMonth(
      monthsList,
      currentMonth,
      currentYear
      )
    );

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
  }
  const deleteToken = (e) => {
    e.preventDefault();
    window.location.reload();
  }

  // set loader if no data
  if (days.length < 1 && monthsList.length < 1 && yearsList.length < 1) {
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
                    <span className={`${styles.total} mobile`}>Total {total}</span>
                  </div>
                </div>

                <div className='row'>
                  <div className='col-lg-7 col-sm-7'>
                    <Controller
                      control={control}
                      name="token"
                      defaultValue={TOKENS[0].value}
                      render={({ field }) => (
                        <CustomSelect
                          options={TOKENS}
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
                    <span className={styles.total}>Total {total}</span>
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
                  icon={<AiOutlineCheckCircle />}
                >
                  {edit ? 'Extend' : 'Create'} for 1 <span className={styles.token}>{currentToken}</span>
                </Button>
              }
            </form>
          </div>
          <div className='col-lg-5 col-xl-6'>
            { isBlocked && formData && <Info data={formData}/> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
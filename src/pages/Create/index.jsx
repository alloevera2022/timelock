import React, { useEffect, useState } from 'react';
import { useForm, useWatch, Controller } from "react-hook-form"
import { MdCheckCircleOutline } from "react-icons/md";
import Button from "../../components/Button";
import CustomSelect from "../../components/CustomSelect";
import Loader from "../../components/Loader";
import Info from "../../components/Info";
import styles from './dashboard.module.scss';
import { PERCENTS, TOKENS, MONTHS, YEARS } from './data';

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

const Dashboard = () => {
  const [days, setDays] = useState([{label: 1, value: 1}]);
  const [monthsList, setMonthsList] = useState(MONTHS);
  const [yearsList, setYearsList] = useState(YEARS);

  const [currentToken, setCurrentToken] = useState(TOKENS[0].value);
  const [isBlocked, setIsBlocked] = useState(false);
  const [formData, setFormData] = useState({});

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
    setIsBlocked(true);
    setFormData(data);
  };

  const extendToken = (e) => {
    e.preventDefault();
    setIsBlocked(false);
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
        <div className='row'>
          <div className='col-lg-6'>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <h3 className={styles.title}>Create a lock</h3>

              <div className='input__block'>
                <label className='input__title'>Choose a token</label>
                <div className='row'>
                  <div className='col-lg-7'>
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
                  <div className='col-lg-5 d-flex middle-xs'>
                    <span className={styles.total}>Total 10000</span>
                  </div>
                </div>
              </div>

              <div className='input__block'>
                <label className='input__title' htmlFor={'how_much'}>How much to block?</label>
                <div className='row'>
                  <div className='col-lg-7'>
                    <input
                      id='how_much'
                      type='text'
                      className='input input__wide'
                      disabled={isBlocked}
                      {...register("how_much")}
                    />
                  </div>
                  <div className={`col-lg-5 d-flex middle-xs ${styles.radioBlock}`}>
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
                  <div className='col-lg-7'>
                    <div className="row">
                      <div className="col-lg-4">
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
                      <div className="col-lg-8">
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
                  <div className={`col-lg-5 ${styles.yearSelect}`}>
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
                  icon={<MdCheckCircleOutline/>}
                >
                  Create for 1 <span className={styles.token}>{currentToken}</span>
                </Button>
              }
            </form>
          </div>
          <div className='col-lg-6'>
            { isBlocked && formData && <Info data={formData}/> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
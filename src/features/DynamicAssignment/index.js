import { useFormik } from 'formik';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';
import { dynamicAssignment, generateFiles, getNotAssignedOrders } from './dynamicAssignmentSlice';
import InputAsyncSelect from '../../components/Input/InputAsyncSelect';
import { getLivreursBySearch } from '../livreurs/livreursSlice';
import { openModal } from '../common/modalSlice';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import ClientOrdres from './components/ClientOrdres';
import InfoText from '../../components/Typography/InfoText';
import { showNotification } from '../common/headerSlice';

const INITIAL_WALLET_FILTER_OBJ = {
  from: moment.utc().subtract(1, 'd').format('YYYY-MM-DD'),
  to: moment.utc().add(1, 'days').format('YYYY-MM-DD')
  // to: moment.utc().add(1, 'days').format('YYYY-MM-DD'),
};

function DynamicAssignment() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.dynamicAssignment);
  const [livreur, setLivreur] = useState('');

  const applyFilter = async (dispatchParams) => {
    await dispatch(getNotAssignedOrders(dispatchParams));
  };

  const formik = useFormik({
    initialValues: INITIAL_WALLET_FILTER_OBJ
  });

  const [dateValue, setDateValue] = useState({
    startDate: formik.values.from,
    endDate: formik.values.to
  });

  const handleDatePickerValueChange = (newValue) => {
    setDateValue(newValue);
    formik.setValues({
      ...formik.values,
      from: newValue.startDate,
      to: newValue.endDate
    });
  };

  const updateForm = useCallback(({ key, value }) => {
    if (key === 'livreur') {
      return setLivreur(value);
    }
  }, []);

  const livreursPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      if (inputValue?.length >= 3) {
        dispatch(getLivreursBySearch({ searchPattern: inputValue })).then((res) =>
          resolve(
            (res?.payload.livreurs || [])
              .filter(
                (livreur) =>
                  livreur?.first_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.last_name?.toLowerCase()?.includes(inputValue.toLowerCase()) ||
                  livreur?.whatsapp?.toLowerCase()?.includes(inputValue.toLowerCase())
              )
              .map((livreur) => {
                return {
                  value: livreur.id,
                  label: `${livreur.first_name} ${livreur.last_name} (${livreur?.whatsapp})`
                };
              })
          )
        );
      } else {
        resolve([]);
      }
    });

  useEffect(() => {
    const dispatchParams = {
      to: formik.values.to,
      from: formik.values.from
    };
    applyFilter(dispatchParams);
  }, [formik.values.to]);

  return (
    <div>
      <div className="flex justify-between">
        <h4>
          From{' '}
          <span className="font-semibold">
            {moment.utc(dateValue.startDate).format('DD/MM/YYYY')}
          </span>{' '}
          to{' '}
          <span className="font-semibold">
            {moment.utc(dateValue.endDate).format('DD/MM/YYYY')}
          </span>
        </h4>

        <div>
          <Datepicker
            isMulti
            containerClassName="w-60"
            value={dateValue}
            theme={'light'}
            inputClassName="input input-bordered w-full input-sm"
            popoverDirection={'down'}
            toggleClassName="invisible"
            onChange={handleDatePickerValueChange}
            showShortcuts={true}
            primaryColor={'white'}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <button
            className="btn btn-outline btn-secondary btn-sm"
            onClick={async () => {
              await dispatch(generateFiles()).then(async (response) => {
                if (response?.error) {
                  console.log(response.error);
                  dispatch(
                    showNotification({
                      message: 'Error while generating the input files',
                      status: 0
                    })
                  );
                } else {
                  dispatch(
                    showNotification({
                      message: 'Succefully generated the input files',
                      status: 1
                    })
                  );
                }
              });
            }}
          >
            Generate Files
          </button>
        </div>
        <div>
          <button
            className="btn btn-outline btn-secondary btn-sm"
            onClick={async () => {
              await dispatch(dynamicAssignment()).then(async (response) => {
                if (response?.error) {
                  console.log(response.error);
                  dispatch(
                    showNotification({
                      message: 'Error while changing the order status',
                      status: 0
                    })
                  );
                } else {
                  dispatch(
                    showNotification({
                      message: 'Succefully changed the order status and assigned livreur',
                      status: 1
                    })
                  );
                }
              });
            }}
          >
            Dynamic Assignment
          </button>
        </div>
        <div>
          <button
            className="btn btn-outline btn-primary btn-sm"
            onClick={() => {
              dispatch(
                openModal({
                  title: 'Livreurs Assignment',
                  bodyType: MODAL_BODY_TYPES.ASSIGN_LIVREURS_TO_ZONE,
                  size: 'lg',
                  extraObject: {}
                })
              );
            }}
          >
            Assign Livreur To a Zone
          </button>
        </div>
      </div>

      {orders.length ? (
        <ClientOrdres />
      ) : (
        <InfoText styleClasses={'md:grid-cols-2'}>No order found ...</InfoText>
      )}
    </div>
  );
}

export default DynamicAssignment;

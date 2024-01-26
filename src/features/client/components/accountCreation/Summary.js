import React from 'react';

import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import { FiEdit2, FiMapPin, FiTrash2 } from 'react-icons/fi';

import PlusSmallIcon from '@heroicons/react/24/outline/PlusSmallIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

import ImageUpload from '../../../../components/Input/ImageUpload';
import { getWeekDateRange } from '../../../../utils/functions/getWeekDateRange';
import { showNotification } from '../../../common/headerSlice';
import { closeModal } from '../../../common/modalSlice';
import {
  createMerchantClientAccount,
  createPersonalClientAccount,
  modifyMerchantClientAccount,
  modifyPersonalClientAccount,
  turnClientIntoMerchantAccount
} from '../../clientSlice';

const transformTime = (_date, _time) => {
  const datetime = moment.utc(_date + ' ' + _time);

  return datetime.toDate();
};

const { weekDatesNamesVsDates } = getWeekDateRange();

const Summary = ({
  registrationInfo,
  locationsInfo,
  workDaysInfo,
  clickAction,
  actionTypeBool,
  clientToMarchant,
  client
}) => {
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (clientToMarchant) {
      // turnClientIntoMerchantAccount
      const data = {
        clientId: client?.id,
        registration: registrationInfo,
        locations: locationsInfo,
        workDays: workDaysInfo
      };
      dispatch(turnClientIntoMerchantAccount(data)).then(async (response) => {
        if (response?.error) {
          console.log(response.error);
          dispatch(
            showNotification({
              message: 'Error while editing the merchant account',
              status: 0
            })
          );
        } else {
          dispatch(
            showNotification({
              message: 'Succefully editing the merchant account',
              status: 1
            })
          );
          dispatch(closeModal());
        }
      });
    } else if (registrationInfo.accountType === 'PERSO') {
      const data = {
        clientId: client?.id,
        registration: registrationInfo
      };

      if (actionTypeBool) {
        dispatch(modifyPersonalClientAccount(data)).then(async (response) => {
          console.log('response: ', response);
          if (response?.error) {
            console.log(response.error);
            dispatch(
              showNotification({
                message: 'Error while creating the client account',
                status: 0
              })
            );
          } else {
            dispatch(
              showNotification({
                message: 'Succefully created the client account',
                status: 1
              })
            );
            dispatch(closeModal());
          }
        });
      } else {
        dispatch(createPersonalClientAccount(data)).then(async (response) => {
          console.log('response: ', response);
          if (response?.error) {
            console.log(response.error);
            dispatch(
              showNotification({
                message: 'Error while creating the client account',
                status: 0
              })
            );
          } else {
            dispatch(
              showNotification({
                message: 'Succefully created the client account',
                status: 1
              })
            );
            dispatch(closeModal());
          }
        });
      }
    } else if (registrationInfo.accountType === 'MARCH') {
      const data = {
        clientId: client?.id,
        merchantId: client?.merchants[0]?.id,
        registration: registrationInfo,
        locations: locationsInfo,
        workDays: workDaysInfo
      };
      console.log('data', data);
      console.log('actionTypeBool', actionTypeBool);

      if (actionTypeBool) {
        dispatch(modifyMerchantClientAccount(data)).then(async (response) => {
          console.log('response: ', response);
          if (response?.error) {
            console.log(response.error);
            dispatch(
              showNotification({
                message: 'Error while editing the merchant account',
                status: 0
              })
            );
          } else {
            dispatch(
              showNotification({
                message: 'Successfully editing the merchant account',
                status: 1
              })
            );
            dispatch(closeModal());
          }
        });
      } else {
        dispatch(createMerchantClientAccount(data)).then(async (response) => {
          console.log('response: ', response);
          if (response?.error) {
            console.log(response.error);
            dispatch(
              showNotification({
                message: 'Error while creating the merchant account',
                status: 0
              })
            );
          } else {
            dispatch(
              showNotification({
                message: 'Succefully created the merchant account',
                status: 1
              })
            );
            dispatch(closeModal());
          }
        });
      }
    }
  };

  return (
    <>
      <div
        tabIndex={0}
        className="collapse collapse-open border border-base-300 bg-base-100 rounded-box mx-5 mt-5">
        <div className="collapse-title text-xl font-medium">Basic Account Info</div>
        <div className="collapse-content mx-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="inline-flex items-baseline">
              <PlusSmallIcon className="h-3 w-3 mx-3" />
              <span className="font-semibold">Account Type</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-primary">
                {registrationInfo.accountType === 'PERSO' ? 'PERSONAL ACCOUNT' : 'MERCHANT ACCOUNT'}
              </span>
            </div>

            <div className="inline-flex items-baseline">
              <PlusSmallIcon className="h-3 w-3 mx-3" />
              <span className="font-semibold">Phone Number</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-primary">{registrationInfo.phone_number}</span>
            </div>
            {registrationInfo.accountType === 'MARCH' && (
              <>
                <div className="inline-flex items-baseline">
                  <PlusSmallIcon className="h-3 w-3 mx-3" />
                  <span className="font-semibold">Merchant Name</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-primary">
                    {registrationInfo.merchant_name}
                  </span>
                </div>

                <div className="inline-flex items-baseline">
                  <PlusSmallIcon className="h-3 w-3 mx-3" />
                  <span className="font-semibold">Position (Latitude, Longitude)</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-primary">
                    {registrationInfo.latitude}, {registrationInfo.longitude}
                  </span>
                </div>
                <div className="sm:col-span-3">
                  <ImageUpload
                    id="image"
                    name="picture"
                    defaultValue={registrationInfo.profile_picture}
                    updateType="profile_picture"
                    disabled={true}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {registrationInfo.accountType === 'MARCH' && locationsInfo?.length && (
        <>
          <div
            tabIndex={0}
            className="collapse collapse-open border border-base-300 bg-base-100 rounded-box mx-5 mt-5">
            <div className="collapse-title text-xl font-medium">Locations Info</div>
            <div className="collapse-content mx-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-3">
                {locationsInfo.map((location) => (
                  <div
                    key={location.id}
                    className="bg-white rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-6">
                    <div className="mb-4 flex items-center">
                      <div className="text-4xl text-primary mr-4">
                        <FiMapPin />
                      </div>
                      <h3 className="text-2xl font-semibold">{location.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {location.details ? location.details : 'No description'}
                    </p>
                    <div className="text-gray-600">
                      <p>
                        <span className="font-semibold">Latitude:</span>{' '}
                        {parseFloat(location.latitude).toFixed(8)}
                      </p>
                      <p>
                        <span className="font-semibold">Longitude:</span>{' '}
                        {parseFloat(location.longitude).toFixed(8)}
                      </p>
                      <p>
                        <span className="font-semibold">Radius:</span> {location.radius} meter(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            tabIndex={0}
            className="collapse collapse-open border border-base-300 bg-base-100 rounded-box mx-5 mt-5">
            <div className="collapse-title text-xl font-medium">Work Days Info</div>
            <div className="collapse-content mx-3">
              <FullCalendar
                timeZone="UTC"
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                firstDay={1}
                headerToolbar={{
                  left: '',
                  center: '',
                  right: ''
                }}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false // Set to false to use 24-hour format
                }}
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false // Display in 24-hour format
                }}
                events={workDaysInfo.map((weekDay) => {
                  return {
                    id: weekDay.id,
                    title: weekDay.status === true || weekDay.status === 'OPEN' ? 'Open' : 'Closed',
                    start: transformTime(weekDatesNamesVsDates[weekDay.day], weekDay.start_time),
                    end: transformTime(weekDatesNamesVsDates[weekDay.day], weekDay.end_time),
                    backgroundColor:
                      weekDay.status === true || weekDay.status === 'OPEN' ? '#009688' : '#777777'
                  };
                })}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-row-reverse mt-6 mb-2 mx-4 gap-3">
        <button className="btn btn-outline btn-primary btn-sm" onClick={handleSubmit}>
          {clientToMarchant
            ? 'Create New Merchant'
            : actionTypeBool
            ? 'Modify Account'
            : 'Create Account'}
        </button>
        <button
          className=" btn btn-outline btn-ghost btn-sm"
          onClick={() => clickAction((old) => old - 1)}>
          Back
        </button>
      </div>
    </>
  );
};

export default Summary;

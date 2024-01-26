import React, { useCallback, useEffect, useRef, useState } from 'react';

import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment, { weekdays } from 'moment';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { AiOutlineDelete } from 'react-icons/ai';

import InputAsyncSelect from '../../../../components/Input/InputAsyncSelect';
import InputText from '../../../../components/Input/InputText';
import { getWeekDateRange } from '../../../../utils/functions/getWeekDateRange';
import { enableScroll } from '../../../../utils/functions/preventAndAllowScroll';
import { showNotification } from '../../../common/headerSlice';
import { closeModal } from '../../../common/modalSlice';
import { updateMerchantSchedule } from '../../clientSlice';

// Define an array of week day options.
const week_days_options = [
  { value: 'MONDAY', label: 'MONDAY' },
  { value: 'TUESDAY', label: 'TUESDAY' },
  { value: 'WEDNESDAY', label: 'WEDNESDAY' },
  { value: 'THURSDAY', label: 'THURSDAY' },
  { value: 'FRIDAY', label: 'FRIDAY' },
  { value: 'SATURDAY', label: 'SATURDAY' },
  { value: 'SUNDAY', label: 'SUNDAY' }
];

// Define an array of status options.
const status_options = [
  { value: true, label: 'OPEN' },
  { value: false, label: 'CLOSED' }
];

// Define an initial object with empty properties.
const INITIAL_OBJ = {
  id: '',
  day: '',
  status: '',
  start_time: '',
  end_time: '',
  description: ''
};

/**
 * Represents a mapping of week dates to their names.
 * @type {Object}
 */
const { weekDatesNamesVsDates } = getWeekDateRange();

/**
 * Transforms a date and time into a JavaScript Date object.
 * @param {string} _date - The date in string format (e.g., 'YYYY-MM-DD').
 * @param {string} _time - The time in string format (e.g., 'HH:mm').
 * @returns {Date} - The JavaScript Date object representing the combined date and time.
 */
const transformTime = (_date, _time) => {
  // Combine the date and time and convert it to a Date object using moment.js.
  const datetime = moment.utc(_date + ' ' + _time);
  return datetime.toDate();
};

/**
 * Represents the WorkSchedule component.
 * This component allows the user to manage and edit work schedules.
 *
 * @component
 * @param {Object} props - The component's props.
 * @param {function} props.clickAction - The click action function.
 * @param {Array} props.workDays - An array of work days.
 * @param {function} props.setWorkDays - A function to set work days.
 * @param {boolean} props.isEditCustomerSchedule - Indicates if editing a customer's schedule.
 * @param {string} props.merchantId - The ID of the merchant.
 */
const WorkSchedule = ({
  clickAction,
  workDays,
  setWorkDays,
  isEditCustomerSchedule,
  merchantId
}) => {
  const dispatch = useDispatch();

  console.log(workDays);
  const mainContentRef = useRef(null);
  const [addNew, setAddNew] = useState(false);
  const [isDelteWorkSchOpened, setIsDelteWorkSchOpened] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  /**
   * Represents the initial state of a work day object.
   * @type {Object}
   */
  const [workDay, setWorkDay] = useState(INITIAL_OBJ);

  const [firstDayOfMonth] = useState(moment.utc().startOf('month'));

  /**
   * Filters the week days based on the input value.
   * @param {string} inputValue - The input value to filter by.
   * @returns {Array} - An array of filtered week day options.
   */
  const filterWeekDays = (inputValue) => {
    return week_days_options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  /**
   * Asynchronously returns promise options for week days.
   * @param {string} inputValue - The input value to filter by.
   * @returns {Promise} - A promise that resolves to filtered week day options.
   */
  const weekDaysPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      resolve(filterWeekDays(inputValue));
    });

  /**
   * Filters the status options based on the input value.
   * @param {string} inputValue - The input value to filter by.
   * @returns {Array} - An array of filtered status options.
   */
  const filterStatus = (inputValue) => {
    return status_options.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
  };

  /**
   * Asynchronously returns promise options for status.
   * @param {string} inputValue - The input value to filter by.
   * @returns {Promise} - A promise that resolves to filtered status options.
   */
  const statusPromiseOptions = (inputValue) =>
    new Promise((resolve) => {
      resolve(filterStatus(inputValue));
    });

  /**
   * Updates the form value with a key-value pair.
   * @param {Object} param - The key and value to update.
   * @param {string} param.key - The key to update.
   * @param {string} param.value - The value to update.
   */
  const updateFormValue = useCallback(({ key, value }) => {
    return setWorkDay((oldValues) => {
      return { ...oldValues, [key]: value };
    });
  }, []);

  /**
   * Handles a date click event by opening the add/edit form.
   * @param {Object} param - The event object.
   * @param {number|string} param.event.id - The ID of the event.
   */
  const handleDateClick = ({ event }) => {
    console.log(event.id);
    console.log(event.title);
    // Close before opening
    setTimeout(() => {
      setAddNew(() => false);
      setIsUpdate(() => false);
      setWorkDay(() => INITIAL_OBJ);
    }, 5);

    const weekEvent = workDays.find((wd) => {
      let response = wd.id === event.id;
      if (!response) {
        response = wd.id === parseInt(event.id);
      }
      return response;
    });
    console.log(weekEvent);
    if (weekEvent) {
      setTimeout(() => {
        setAddNew(true);
        setIsUpdate(true);
        setWorkDay((_) => weekEvent);
        mainContentRef?.current?.scrollIntoView(true);
      }, 30);
    }
  };

  /**
   * A hook that sets the initial values of workDay based on conditions.
   */
  useEffect(() => {
    if (workDay.id) {
      setWorkDay((oldValues) => ({
        ...oldValues,
        day: workDay.day,
        status: workDay.status
      }));
    } else {
      setWorkDay((oldValues) => ({
        ...oldValues,
        day: week_days_options[0]?.value || '',
        status: status_options[0]?.value || ''
      }));
    }
  }, [addNew]);

  /**
   * Handles the addition or update of a work schedule.
   * Performs validation, clash detection, and dispatches notifications.
   */
  const handleAddOrUpdate = () => {
    // Check if required fields are filled
    if (
      workDay.day.length &&
      // workDay.status.length &&
      workDay.start_time.length &&
      workDay.end_time.length
    ) {
      if (isUpdate) {
        // Handle update logic
        if (
          moment.utc(workDay.end_time, 'HH:mm').isBefore(moment.utc(workDay.start_time, 'HH:mm'))
        ) {
          // Show notification for invalid time range
          dispatch(
            showNotification({
              message: 'Start time cannot be after end time',
              status: 0
            })
          );
        } else {
          let tempWorkDays = [];
          const existingIndex = workDays.findIndex((obj) => obj.id === workDay.id);

          if (existingIndex !== -1) {
            tempWorkDays = [...workDays.filter((elt) => elt?.id !== workDays[existingIndex]?.id)];
          }

          const clash = tempWorkDays.some((obj) => {
            return (
              obj.day === workDay.day &&
              ((moment
                .utc(obj.start_time, 'HH:mm')
                .isSameOrBefore(moment.utc(workDay.start_time, 'HH:mm')) &&
                moment
                  .utc(obj.end_time, 'HH:mm')
                  .isSameOrAfter(moment.utc(workDay.start_time, 'HH:mm'))) ||
                (moment
                  .utc(obj.start_time, 'HH:mm')
                  .isSameOrBefore(moment.utc(workDay.end_time, 'HH:mm')) &&
                  moment
                    .utc(obj.end_time, 'HH:mm')
                    .isSameOrAfter(moment.utc(workDay.end_time, 'HH:mm'))))
            );
          });

          if (clash) {
            // Show notification for clash with existing schedule
            dispatch(
              showNotification({
                message: 'Could not update schedule as it clashes with an existing one',
                status: 0
              })
            );
          } else {
            // Update the work schedule
            console.log(workDay);
            setWorkDays(() => {
              return [{ ...workDay, id: uuidv4() }, ...tempWorkDays];
            });
            setWorkDay(INITIAL_OBJ);
            setAddNew((old) => !old);
            setIsUpdate(false);
          }
        }
      } else {
        // Handle add logic
        if (
          moment.utc(workDay.end_time, 'HH:mm').isBefore(moment.utc(workDay.start_time, 'HH:mm'))
        ) {
          // Show notification for invalid time range
          dispatch(
            showNotification({
              message: 'Start time cannot be after end time',
              status: 0
            })
          );
        } else {
          const clash = workDays.some((obj) => {
            return (
              obj.day === workDay.day &&
              ((moment
                .utc(obj.start_time, 'HH:mm')
                .isSameOrBefore(moment.utc(workDay.start_time, 'HH:mm')) &&
                moment
                  .utc(obj.end_time, 'HH:mm')
                  .isSameOrAfter(moment.utc(workDay.start_time, 'HH:mm'))) ||
                (moment
                  .utc(obj.start_time, 'HH:mm')
                  .isSameOrBefore(moment.utc(workDay.end_time, 'HH:mm')) &&
                  moment
                    .utc(obj.end_time, 'HH:mm')
                    .isSameOrAfter(moment.utc(workDay.end_time, 'HH:mm'))))
            );
          });

          if (clash) {
            // Show notification for clash with existing schedule
            dispatch(
              showNotification({
                message: 'Could not add schedule as it clashes with an existing one',
                status: 0
              })
            );
          } else {
            // Add the work schedule
            setWorkDays((oldValues) => {
              let existingIndex = -1;
              if (workDay?.id?.length) {
                existingIndex = workDays.findIndex((obj) => obj.id === workDay.id);
              }

              if (existingIndex !== -1) {
                workDays[existingIndex] = workDay;
                return workDays;
              } else {
                return [{ ...workDay, id: uuidv4() }, ...oldValues];
              }
            });
            setWorkDay(INITIAL_OBJ);
            setAddNew((old) => !old);
            setIsUpdate(false);
          }
        }
      }
    }
  };

  /**
   * Handles the cancellation of the delete confirmation modal.
   */
  const handleCancelDelete = () => {
    enableScroll();
    setIsDelteWorkSchOpened(false);
  };

  /**
   * Handles the deletion of a work day schedule.
   */
  const handleDeleteWorkDay = () => {
    if (workDay.day.length && workDay.start_time.length && workDay.end_time.length) {
      const existingIndex = workDays.findIndex((obj) => obj.id === workDay.id);
      if (existingIndex !== -1) {
        setWorkDays((oldData) => oldData.filter((elt) => elt?.id !== workDays[existingIndex]?.id));
      }

      setWorkDay(INITIAL_OBJ);
      setAddNew((old) => !old);
      setIsUpdate(false);
    }
    enableScroll();
    setIsDelteWorkSchOpened(false);
  };

  /**
   * Handles the submission of the merchant's workday schedule for saving.
   */
  const handleSaveSchedule = () => {
    // Prepare the data for submission
    const data = {
      merchantId: merchantId,
      workDays: workDays
    };

    // Dispatch the action to update the merchant's schedule
    dispatch(updateMerchantSchedule(data)).then(async (response) => {
      if (response?.error) {
        // Show an error notification if there was an issue
        dispatch(
          showNotification({
            message: 'Error while updating the merchant workdays',
            status: 0
          })
        );
      } else {
        // Show a success notification and close the modal on success
        dispatch(
          showNotification({
            message: 'Successfully updated the merchant workdays',
            status: 1
          })
        );
        dispatch(closeModal());
      }
    });
  };

  return (
    <div className="w-full my-3" ref={mainContentRef}>
      <DeleteConfirmationModal
        isOpen={isDelteWorkSchOpened}
        workDay={workDay}
        onClose={handleCancelDelete}
        onDelete={handleDeleteWorkDay}
      />
      <div className="flex items-center justify-between bg-blue-500 p-4 rounded-lg shadow-lg">
        <div className="text-white">
          <p className="text-xl font-semibold">
            {moment.utc(firstDayOfMonth).format('MMMM yyyy').toString()}
          </p>
          <p className="text-sm text-gray-200">Street</p>
        </div>
        <div>
          <button
            className="px-4 py-2 bg-white text-blue-500 rounded-full hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={() => setAddNew(true)}>
            Add New Work Day
          </button>
        </div>
      </div>

      {addNew && (
        <div className="bg-white p-4 rounded-lg shadow-[inset_-12px_-8px_40px_#46464620] my-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <InputAsyncSelect
                type="text"
                updateType="day"
                labelTitle="Day"
                updateFormValue={updateFormValue}
                loadOptions={weekDaysPromiseOptions}
                defaultValue={
                  workDay.id
                    ? { label: workDay.day, value: workDay.day }
                    : { ...week_days_options[0] }
                }
              />
            </div>
            <div>
              <InputText
                type="time"
                defaultValue={workDay.start_time}
                updateType="start_time"
                placeholder="From"
                labelTitle="From"
                updateFormValue={updateFormValue}
              />
            </div>
            <div>
              <InputText
                type="time"
                defaultValue={workDay.end_time}
                updateType="end_time"
                placeholder="To"
                labelTitle="To"
                updateFormValue={updateFormValue}
              />
            </div>
            <div>
              <InputAsyncSelect
                type="text"
                updateType="status"
                labelTitle="Status"
                updateFormValue={updateFormValue}
                loadOptions={statusPromiseOptions}
                defaultValue={
                  workDay.id
                    ? {
                        label: workDay.status ? 'OPEN' : 'CLOSED',
                        value: workDay.status
                      }
                    : { ...status_options[0] }
                }
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <InputText
                type="text"
                defaultValue={workDay.description}
                updateType="description"
                placeholder="Description"
                labelTitle="Description"
                updateFormValue={updateFormValue}
              />
            </div>
          </div>

          <div className="flex items-center justify-center mt-4 space-x-3">
            {isUpdate && (
              <button
                className="btn btn-sm border-red-800 bg-white text-red-800 hover:border-white hover:bg-red-800 hover:text-white"
                onClick={() => {
                  setIsDelteWorkSchOpened(true);
                }}>
                <AiOutlineDelete className="w-6 h-6" />
              </button>
            )}
            <button
              className="btn btn-outline btn-sm btn-secondary"
              onClick={() => {
                setAddNew(false);
                setIsUpdate(false);
                setWorkDay(INITIAL_OBJ);
              }}>
              Cancel
            </button>
            <button
              className={`btn btn-outline btn-sm ${isUpdate ? 'btn-ghost' : 'btn-primary'}`}
              onClick={handleAddOrUpdate}>
              {isUpdate ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-white p-4 rounded-lg shadow-lg">
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
          eventClick={handleDateClick}
          events={workDays.map((weekDay) => {
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

      <div
        className={`mt-4 ${
          isEditCustomerSchedule ? 'grid grid-cols-3' : 'flex flex-row-reverse mt-6 mb-2 mx-4 gap-3'
        }`}>
        {isEditCustomerSchedule ? (
          <button className="btn btn-primary btn-sm col-start-2" onClick={handleSaveSchedule}>
            Save Schedule
          </button>
        ) : (
          <div className="flex flex-row-reverse mt-6 mb-2 mx-4 gap-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => clickAction((old) => old + 1)}>
              Next
            </button>
            <button
              className="btn btn-outline btn-secondary btn-sm"
              onClick={() => clickAction((old) => old - 1)}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSchedule;

const DeleteConfirmationModal = ({ isOpen, workDay, onClose, onDelete }) => {
  const handleClose = () => {
    onClose();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-semibold text-2xl mb-4">Confirm Deletion</h3>

        <div className="p-4 bg-gray-100 rounded-lg mb-4">
          <p className="text-lg">
            Are you sure you want to delete the work day schedule with ID{' '}
            <span className="text-primary">{workDay?.id}</span>?
          </p>
          <div className="mt-4">
            <p>
              <span className="font-semibold">Day:</span> {workDay?.day}
            </p>
            <p>
              <span className="font-semibold">Interval:</span> {workDay?.start_time} -{' '}
              {workDay?.end_time}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {workDay?.status}
            </p>
            <p>
              <span className="font-semibold">Description:</span> {workDay?.description}
            </p>
          </div>
        </div>

        <div className="modal-action flex justify-end mt-4">
          <button className="btn btn-sm btn-outline btn-secondary mr-2" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-sm btn-outline btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { AiOutlineDelete } from 'react-icons/ai';

import TitleCard from '../../../../components/Cards/TitleCard';
import InputText from '../../../../components/Input/InputText';

import moment, { weekdays } from 'moment';
import InputAsyncSelect from '../../../../components/Input/InputAsyncSelect';
import { getWeekDateRange } from '../../../../utils/functions/getWeekDateRange';
import { isNaN } from 'lodash';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../../common/headerSlice';
import { closeModal } from '../../../common/modalSlice';
import { updateMerchantSchedule } from '../../clientSlice';
import { disableScroll, enableScroll } from '../../../../utils/functions/preventAndAllowScroll';

const week_days_options = [
	{ value: 'MONDAY', label: 'MONDAY' },
	{ value: 'TUESDAY', label: 'TUESDAY' },
	{ value: 'WEDNESDAY', label: 'WEDNESDAY' },
	{ value: 'THURSDAY', label: 'THURSDAY' },
	{ value: 'FRIDAY', label: 'FRIDAY' },
	{ value: 'SATURDAY', label: 'SATURDAY' },
	{ value: 'SUNDAY', label: 'SUNDAY' },
];

const status_options = [
	{ value: 'OPENED', label: 'OPENED' },
	{ value: 'CLOSED', label: 'CLOSED' },
];

const INITIAL_OBJ = {
	id: '',
	day: '',
	status: '',
	start_time: '',
	end_time: '',
	description: '',
};

const { startingDate, endingDate, weekDatesNamesVsDates } = getWeekDateRange();

const transformTime = (_date, _time) => {
	const datetime = moment(_date + ' ' + _time);

	return datetime.toDate();
};

const WorkSchedule = ({ clickAction, workDays, setWorkDays, isEditCustomerSchedule, merchantId }) => {
	const dispatch = useDispatch();

	console.log(workDays);
	const mainContentRef = useRef(null);
	const [addNew, setAddNew] = useState(false);
	const [isDelteWorkSchOpened, setIsDelteWorkSchOpened] = useState(false);
	const [isUpdate, setIsUpdate] = useState(false);
	const [workDay, setWorkDay] = useState(INITIAL_OBJ);
	const [firstDayOfMonth, setFirstDayOfMonth] = useState(moment().startOf('month'));

	const filterWeekDays = (inputValue) => {
		return week_days_options.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
	};

	const weekDaysPromiseOptions = (inputValue) =>
		new Promise((resolve) => {
			resolve(filterWeekDays(inputValue));
		});

	const filterStatus = (inputValue) => {
		return status_options.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
	};

	const statusPromiseOptions = (inputValue) =>
		new Promise((resolve) => {
			resolve(filterStatus(inputValue));
		});

	const updateFormValue = useCallback(({ key, value }) => {
		return setWorkDay((oldValues) => {
			return { ...oldValues, [key]: value };
		});
	}, []);

	const handleDateClick = ({ event }) => {
		console.log(event.id);
		console.log(event.title);
		// Close before opening
		setTimeout(() => {
			setAddNew((_) => false);
			setIsUpdate((_) => false);
			setWorkDay((_) => INITIAL_OBJ);
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

	useEffect(() => {
		console.log(
			workDays.map((weekDay) => {
				return {
					id: weekDay.id,
					title: `(${weekDay.status}) - ${weekDay.description}`,
					start: transformTime(weekDatesNamesVsDates[weekDay.day], weekDay.start_time),
					end: transformTime(weekDatesNamesVsDates[weekDay.day], weekDay.end_time),
				};
			})
		);
	}, [workDays]);

	useEffect(() => {
		if (workDay.id) {
			return setWorkDay((oldValues) => {
				return {
					...oldValues,
					day: workDay.day,
					status: workDay.status,
				};
			});
		} else {
			return setWorkDay((oldValues) => {
				return {
					...oldValues,
					day: week_days_options[0]?.value || '',
					status: status_options[0]?.value || '',
				};
			});
		}
	}, [addNew]);

	const handleSubmit = () => {
		const data = {
			merchantId: merchantId,
			workDays: workDays,
		};

		dispatch(updateMerchantSchedule(data)).then(async (response) => {
			console.log('response: ', response);
			if (response?.error) {
				console.log(response.error);
				dispatch(
					showNotification({
						message: 'Error while updating the merchant workdays',
						status: 0,
					})
				);
			} else {
				dispatch(
					showNotification({
						message: 'Succefully updated the merchant workdays',
						status: 1,
					})
				);
				dispatch(closeModal());
			}
		});
	};

	return (
		<div
			className='w-full my-3'
			ref={mainContentRef}
		>
			<div className={`${isDelteWorkSchOpened ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
				<div className='modal-box'>
					<h3 className='font-bold text-lg'>
						Are you sure you want to delete the work day schedule with ID: <span className='text-primary'>{workDay?.id}</span>?
					</h3>

					<div className=''>
						<div className='divider'>Information</div>
						<p>
							Day: <span className='text-primary font-semibold lowercase'>{workDay?.day}</span>
						</p>
						<p>
							Interval: From <span className='text-primary font-semibold lowercase'>{workDay?.start_time}</span> To{' '}
							<span className='text-primary font-semibold lowercase'>{workDay?.end_time}</span>
						</p>
						<p>
							Status: <span className='text-primary font-semibold lowercase'>{workDay?.status}</span>
						</p>
						<p>
							Description: <span className='text-primary font-semibold lowercase'>{workDay?.description}</span>
						</p>
					</div>
					<div className='divider'>Actions</div>
					<div className='modal-action'>
						{/* {actionButton} */}
						<button
							className='btn btn-sm btn-outline btn-success'
							onClick={() => {
								enableScroll();
								setIsDelteWorkSchOpened((_) => false);
							}}
						>
							No, Cancel Action
						</button>
						<button
							className='btn btn-sm btn-outline btn-error'
							onClick={() => {
								if (workDay.day.length && workDay.status.length && workDay.start_time.length && workDay.end_time.length) {
									console.log('data:', workDay);
									const existingIndex = workDays.findIndex((obj) => obj.id === workDay.id);
									console.log('existingIndex: ', existingIndex);
									if (existingIndex !== -1) {
										setWorkDays((oldData) => oldData.filter((elt) => elt?.id !== workDays[existingIndex]?.id));
									}

									// setWorkDays((oldValues) => {
									// 	let existingIndex = -1;
									// 	if (workDay?.id?.length) {
									// 		existingIndex = workDays.findIndex((obj) => obj.id === workDay.id);
									// 	}

									// 	console.log('existingIndex', existingIndex);

									// 	// if (existingIndex !== -1) {
									// 	// 	workDays[existingIndex] = workDay;
									// 	// 	return workDays;
									// 	// } else {
									// 	// 	return [{ ...workDay, id: uuidv4() }, ...oldValues];
									// 	// }
									// 	return oldValues;
									// });
									setWorkDay(INITIAL_OBJ);
									setAddNew((old) => !old);
									setIsUpdate(false);
								}
								enableScroll();
								setIsDelteWorkSchOpened((_) => false);
							}}
						>
							PROCEED
						</button>
					</div>
				</div>
			</div>
			<div className='flex items-center justify-between'>
				<div className='flex  justify-normal gap-2 sm:gap-4'>
					<p className='font-semibold text-xl w-48'>
						{moment(firstDayOfMonth).format('MMMM yyyy').toString()}
						<span className='text-xs ml-2 '>Street</span>
					</p>
				</div>
				<div>
					<button
						className='btn  btn-sm btn-ghost btn-outline normal-case'
						onClick={() => setAddNew(true)}
					>
						Add New Work Day
					</button>
				</div>
			</div>
			<div className='mb-0 divider' />
			{addNew ? (
				<>
					<div className='w-full grid grid-cols-1 md:grid-cols-7 gap-2'>
						<InputAsyncSelect
							type='text'
							updateType='day'
							containerStyle='mt-3 md:col-span-2'
							labelTitle='Day'
							updateFormValue={updateFormValue}
							loadOptions={weekDaysPromiseOptions}
							defaultValue={
								workDay.id
									? {
											label: workDay.day,
											value: workDay.day,
									  }
									: {
											...week_days_options[0],
									  }
							}
						/>
						<InputText
							type='time'
							defaultValue={workDay.start_time}
							updateType='start_time'
							placeholder='From'
							containerStyle='mt-3'
							labelTitle='From'
							updateFormValue={updateFormValue}
						/>
						<InputText
							type='time'
							defaultValue={workDay.end_time}
							updateType='end_time'
							placeholder='To'
							containerStyle='mt-3'
							labelTitle='To'
							updateFormValue={updateFormValue}
						/>
						<InputAsyncSelect
							type='text'
							updateType='status'
							containerStyle='mt-3'
							labelTitle='Status'
							updateFormValue={updateFormValue}
							loadOptions={statusPromiseOptions}
							defaultValue={
								workDay.id
									? {
											label: workDay.status,
											value: workDay.status,
									  }
									: {
											...status_options[0],
									  }
							}
						/>
						<InputText
							type='text'
							defaultValue={workDay.description}
							updateType='description'
							placeholder='Description'
							containerStyle='mt-3 md:col-span-2'
							labelTitle='Description'
							updateFormValue={updateFormValue}
						/>
					</div>
					<div className='flex items-center justify-center my-3 gap-3'>
						{isUpdate && (
							<button
								className='btn btn-sm border-red-800 bg-white text-red-800 hover:border-white hover:bg-red-800 hover:text-white'
								onClick={() => {
									disableScroll();
									setIsDelteWorkSchOpened((_) => true);
								}}
							>
								<AiOutlineDelete className='w-6 h-6' />
							</button>
						)}
						<button
							className='btn btn-outline btn-sm btn-secondary w-1/4'
							onClick={() => {
								setAddNew((old) => !old);
								setIsUpdate(false);
								setWorkDay(INITIAL_OBJ);
							}}
						>
							Cancel
						</button>
						<button
							className={`btn btn-outline btn-sm ${isUpdate ? 'btn-ghost' : 'btn-primary'} w-1/4`}
							onClick={() => {
								console.log(workDay);

								if (workDay.day.length && workDay.status.length && workDay.start_time.length && workDay.end_time.length) {
									console.log('data:', workDay);
									if (isUpdate) {
										console.log('isUpdate:', isUpdate);
										if (moment(workDay?.end_time, 'HH:mm').isBefore(moment(workDay?.start_time, 'HH:mm'))) {
											dispatch(
												showNotification({
													message: 'Start time can not be after end time',
													status: 0,
												})
											);
										} else {
											console.log('isUpdate else:', isUpdate);
											let tempWorkDays = [];
											const existingIndex = workDays.findIndex((obj) => obj.id === workDay.id);
											console.log('existingIndex: ', existingIndex);
											if (existingIndex !== -1) {
												tempWorkDays = [...workDays.filter((elt) => elt?.id !== workDays[existingIndex]?.id)];
											}
											console.log('tempWorkDays: ', tempWorkDays);
											const clash = tempWorkDays.some((obj) => {
												console.log(
													'tempWorkDays: ',
													moment(obj.start_time, 'HH:mm').isSameOrBefore(moment(workDay.start_time, 'HH:mm')) &&
														moment(obj.end_time, 'HH:mm').isSameOrAfter(moment(workDay.start_time, 'HH:mm'))
												);
												return (
													obj.day === workDay.day &&
													((moment(obj.start_time, 'HH:mm').isSameOrBefore(moment(workDay.start_time, 'HH:mm')) &&
														moment(obj.end_time, 'HH:mm').isSameOrAfter(moment(workDay.start_time, 'HH:mm'))) ||
														(moment(obj.start_time, 'HH:mm').isSameOrBefore(moment(workDay.end_time, 'HH:mm')) &&
															moment(obj.end_time, 'HH:mm').isSameOrAfter(moment(workDay.end_time, 'HH:mm'))))
												);
											});
											console.log('clash', clash);

											if (clash) {
												dispatch(
													showNotification({
														message: 'Could not add this schedule as it clashes with an existing one',
														status: 0,
													})
												);
											} else {
												console.log('here');
												// setWorkDays((oldData) => oldData.filter((elt) => elt?.id !== workDays[existingIndex]?.id));
												setWorkDays((oldValues) => {
													return [{ ...workDay, id: uuidv4() }, ...tempWorkDays];
												});
												setWorkDay((_) => INITIAL_OBJ);
												setAddNew((old) => !old);
												setIsUpdate((_) => false);
											}
										}
									} else {
										if (moment(workDay?.end_time, 'HH:mm').isBefore(moment(workDay?.start_time, 'HH:mm'))) {
											dispatch(
												showNotification({
													message: 'Start time can not be after end time',
													status: 0,
												})
											);
										} else {
											// Check if there's a clash for the selected day
											// const clash = workDays.some((obj) => {
											// 	return (
											// 		obj.day === workDay.day &&
											// 		((obj.start_time <= workDay.start_time && obj.end_time >= workDay.start_time) ||
											// 			(obj.start_time <= workDay.end_time && obj.end_time > workDay.end_time))
											// 	);
											// });
											const clash = workDays.some((obj) => {
												return (
													obj.day === workDay.day &&
													((moment(obj.start_time, 'HH:mm').isSameOrBefore(moment(workDay.start_time, 'HH:mm')) &&
														moment(obj.end_time, 'HH:mm').isSameOrAfter(moment(workDay.start_time, 'HH:mm'))) ||
														(moment(obj.start_time, 'HH:mm').isSameOrBefore(moment(workDay.end_time, 'HH:mm')) &&
															moment(obj.end_time, 'HH:mm').isSameOrAfter(moment(workDay.end_time, 'HH:mm'))))
												);
											});
											console.log('clash', clash);

											if (clash) {
												dispatch(
													showNotification({
														message: 'Could not add this schedule as it clashes with an existing one',
														status: 0,
													})
												);
											} else {
												setWorkDays((oldValues) => {
													let existingIndex = -1;
													if (workDay?.id?.length) {
														existingIndex = workDays.findIndex((obj) => obj.id === workDay.id);
													}

													console.log('existingIndex', existingIndex);

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
							}}
						>
							{isUpdate ? 'Update' : 'Add'}
						</button>
					</div>
				</>
			) : (
				<></>
			)}
			<div className='w-full  bg-base-100 p-4 rounded-lg'>
				<FullCalendar
					timeZone='UTC'
					eventTimeFormat={({ start, end }) => {
						return `From ${moment(start).format('HH:mm')} to ${moment(end).format('HH:mm')}`;
					}}
					plugins={[timeGridPlugin, interactionPlugin]}
					initialView='timeGridWeek'
					firstDay={1}
					headerToolbar={{
						left: 'title',
						right: 'timeGridWeek',
					}}
					// titleFormat'dddd, MMMM D, YYYY'
					titleFormat={(args) => {
						return moment().format('dddd');
					}}
					dayHeaderFormat={(args) => {
						return moment(args.date).format('ddd');
					}}
					// dateClick={handleDateClick}
					eventClick={handleDateClick}
					events={workDays.map((weekDay) => {
						return {
							id: weekDay.id,
							title: `(${weekDay.status}) - ${weekDay.description}`,
							start: transformTime(weekDatesNamesVsDates[weekDay.day], weekDay.start_time),
							end: transformTime(weekDatesNamesVsDates[weekDay.day], weekDay.end_time),
							backgroundColor: weekDay.status === 'OPENED' ? '#0c8599' : weekDay.status === 'CLOSED' ? '#fd7e14' : '#e3e3e3',
							// backgroundColor: weekDay.status === 'OPENED' ? '#049407' : weekDay.status === 'CLOSED' ? '#940404' : '#e3e3e3',
						};
					})}
				/>
			</div>
			{/* </TitleCard> */}

			{isEditCustomerSchedule ? (
				<div className='grid grid-cols-3'>
					<button
						className='btn btn-outline btn-primary btn-sm col-start-2'
						onClick={handleSubmit}
					>
						Save Schedule
					</button>
				</div>
			) : (
				<div className='flex flex-row-reverse mt-6 mb-2 mx-4 gap-3'>
					<button
						className='btn btn-outline btn-primary btn-sm'
						onClick={() => clickAction((old) => old + 1)}
					>
						Next
					</button>
					<button
						className=' btn btn-outline btn-ghost btn-sm'
						onClick={() => clickAction((old) => old - 1)}
					>
						Back
					</button>
				</div>
			)}
		</div>
	);
};

export default WorkSchedule;

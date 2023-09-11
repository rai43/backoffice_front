import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import TitleCard from '../../../../components/Cards/TitleCard';
import InputText from '../../../../components/Input/InputText';

import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon';
import moment, { weekdays } from 'moment';
import InputAsyncSelect from '../../../../components/Input/InputAsyncSelect';
import { getWeekDateRange } from '../../../../utils/functions/getWeekDateRange';
import { isNaN } from 'lodash';

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
	console.log(_date + ' ' + _time);
	const datetime = moment(_date + ' ' + _time);

	return datetime.toDate();
};

const WorkSchedule = ({ clickAction, workDays, setWorkDays }) => {
	console.log(workDays);
	const mainContentRef = useRef(null);
	const [addNew, setAddNew] = useState(false);
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
		// bind with an arrow function
		console.log(event);
		console.log(event.id);
		console.log(event.title);
		console.log(typeof event.id);
		const weekEvent = workDays.find((wd) => {
			let response = wd.id === event.id;
			if (!response) {
				response = wd.id === parseInt(event.id);
			}
			return response;
		});
		if (weekEvent) {
			setWorkDay(weekEvent);
			setAddNew(true);
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

	return (
		<div
			className='w-full my-3'
			ref={mainContentRef}
		>
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
						<button
							className='btn btn-outline btn-sm btn-error w-1/4'
							onClick={() => {
								setAddNew((old) => !old);
							}}
						>
							Cancel
						</button>
						<button
							className='btn btn-outline btn-sm btn-ghost w-1/4'
							onClick={() => {
								console.log(workDay);
								if (workDay.day.length && workDay.description.length && workDay.status.length && workDay.start_time.length && workDay.end_time.length) {
									console.log('data:', workDay);
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
								}
							}}
						>
							Add
						</button>
					</div>
				</>
			) : (
				<></>
			)}
			<div className='w-full  bg-base-100 p-4 rounded-lg'>
				<FullCalendar
					timeZone='UTC'
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
							backgroundColor: weekDay.status === 'OPENED' ? '#049407' : weekDay.status === 'CLOSED' ? '#940404' : '#e3e3e3',
						};
					})}
				/>
			</div>
			{/* </TitleCard> */}

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
		</div>
	);
};

export default WorkSchedule;

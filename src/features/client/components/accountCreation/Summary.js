import React from 'react';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';

import PlusSmallIcon from '@heroicons/react/24/outline/PlusSmallIcon';
import ImageUpload from '../../../../components/Input/ImageUpload';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { getWeekDateRange } from '../../../../utils/functions/getWeekDateRange';
import { useDispatch } from 'react-redux';
import { createMerchantClientAccount, createPersonalClientAccount } from '../../clientSlice';
import { showNotification } from '../../../common/headerSlice';
import { closeModal } from '../../../common/modalSlice';

const transformTime = (_date, _time) => {
	const datetime = moment(_date + ' ' + _time);

	return datetime.toDate();
};

const { weekDatesNamesVsDates } = getWeekDateRange();

const Summary = ({ registrationInfo, locationsInfo, workDaysInfo, clickAction, actionTypeBool }) => {
	const dispatch = useDispatch();

	const handleSubmit = async () => {
		if (registrationInfo.accountType === 'PERSO') {
			const data = {
				registration: registrationInfo,
			};

			dispatch(createPersonalClientAccount(data)).then(async (response) => {
				console.log('response: ', response);
				if (response?.error) {
					console.log(response.error);
					dispatch(
						showNotification({
							message: 'Error while creating the client account',
							status: 0,
						})
					);
				} else {
					dispatch(
						showNotification({
							message: 'Succefully created the client account',
							status: 1,
						})
					);
					dispatch(closeModal());
				}
			});
		} else if (registrationInfo.accountType === 'MARCH') {
			const data = {
				registration: registrationInfo,
				locations: locationsInfo,
				workDays: workDaysInfo,
			};

			dispatch(createMerchantClientAccount(data)).then(async (response) => {
				console.log('response: ', response);
				if (response?.error) {
					console.log(response.error);
					dispatch(
						showNotification({
							message: 'Error while creating the client account',
							status: 0,
						})
					);
				} else {
					dispatch(
						showNotification({
							message: 'Succefully created the client account',
							status: 1,
						})
					);
					dispatch(closeModal());
				}
			});
		}
	};

	return (
		<>
			<div
				tabIndex={0}
				className='collapse collapse-open border border-base-300 bg-base-100 rounded-box mx-5 mt-5'
			>
				<div className='collapse-title text-xl font-medium'>Basic Account Info</div>
				<div className='collapse-content mx-3'>
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
						<div className='inline-flex items-baseline'>
							<PlusSmallIcon className='h-3 w-3 mx-3' />
							<span className='font-semibold'>Account Type</span>
						</div>
						<div className='sm:col-span-2'>
							<span className='font-semibold text-primary'>{registrationInfo.accountType === 'PERSO' ? 'PERSONAL ACCOUNT' : 'MERCHANT ACCOUNT'}</span>
						</div>

						<div className='inline-flex items-baseline'>
							<PlusSmallIcon className='h-3 w-3 mx-3' />
							<span className='font-semibold'>Phone Number</span>
						</div>
						<div className='sm:col-span-2'>
							<span className='font-semibold text-primary'>{registrationInfo.phone_number}</span>
						</div>
						{registrationInfo.accountType === 'MARCH' && (
							<>
								<div className='inline-flex items-baseline'>
									<PlusSmallIcon className='h-3 w-3 mx-3' />
									<span className='font-semibold'>Merchant Name</span>
								</div>
								<div className='sm:col-span-2'>
									<span className='font-semibold text-primary'>{registrationInfo.merchant_name}</span>
								</div>

								<div className='inline-flex items-baseline'>
									<PlusSmallIcon className='h-3 w-3 mx-3' />
									<span className='font-semibold'>Position (Latitude, Longitude)</span>
								</div>
								<div className='sm:col-span-2'>
									<span className='font-semibold text-primary'>
										{registrationInfo.latitude}, {registrationInfo.longitude}
									</span>
								</div>
								{/* <div className='inline-flex items-baseline'>
									<PlusSmallIcon className='h-3 w-3 mx-3' />
									<span className='font-semibold'>Profile Picture</span>
								</div> */}
								<div className='sm:col-span-3'>
									<ImageUpload
										id='image'
										name='picture'
										defaultValue={registrationInfo.profile_picture}
										updateType='profile_picture'
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
						className='collapse collapse-open border border-base-300 bg-base-100 rounded-box mx-5 mt-5'
					>
						<div className='collapse-title text-xl font-medium'>Locations Info</div>
						<div className='collapse-content mx-3'>
							{locationsInfo.map((location) => (
								<div
									key={location.id}
									className='alert shadow-lg my-4'
								>
									<div>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='stroke-current flex-shrink-0 h-6 w-6'
											fill='none'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth='2'
												d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
										<div>
											<h3 className='font-bold'>
												{location.name} - ({location.details})
											</h3>
											<div className='text-xs'>
												Latitude: <span className='font-semibold text-primary'>{location.latitude}</span>, Longitude:{' '}
												<span className='font-semibold text-primary'>{location.longitude}</span>, Radius:{' '}
												<span className='font-semibold text-primary'>{location.radius} meter(s)</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
					<div
						tabIndex={0}
						className='collapse collapse-open border border-base-300 bg-base-100 rounded-box mx-5 mt-5'
					>
						<div className='collapse-title text-xl font-medium'>Work Days Info</div>
						<div className='collapse-content mx-3'>
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
									return 'The work days';
								}}
								dayHeaderFormat={(args) => {
									return moment(args.date).format('ddd');
								}}
								// dateClick={handleDateClick}
								events={workDaysInfo.map((weekDay) => {
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
					</div>
				</>
			)}

			<div className='flex flex-row-reverse mt-6 mb-2 mx-4 gap-3'>
				<button
					className='btn btn-outline btn-primary btn-sm'
					onClick={handleSubmit}
				>
					{actionTypeBool ? 'Modify Account' : 'Create Account'}
				</button>
				<button
					className=' btn btn-outline btn-ghost btn-sm'
					onClick={() => clickAction((old) => old - 1)}
				>
					Back
				</button>
			</div>
		</>
	);
};

export default Summary;

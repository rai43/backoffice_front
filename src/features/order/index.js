import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Datepicker from 'react-tailwindcss-datepicker';

import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';

import InputText from '../../components/Input/InputText';
import SelectBox from '../../components/Input/SelectBox';
import ClientOrdres from './components/ClientOrdres';
import InfoText from '../../components/Typography/InfoText';
import moment from 'moment';
import { useFormik } from 'formik';
import { generateStatistics, getOrders, resetForm } from './orderSlice';
import _ from 'lodash';

const ordersStatusTypeOptions = [
	{ name: 'ALL', value: 'ALL' },
	{ name: 'PENDING', value: 'PENDING' },
	{ name: 'REGISTERED', value: 'REGISTERED' },
	{ name: 'INDELIVERY', value: 'INDELIVERY' },
	{ name: 'DELIVERED', value: 'DELIVERED' },
	{ name: 'CANCELED', value: 'CANCELED' },
];

const paymentMethodOptions = [
	{ name: 'ALL', value: 'ALL' },
	{ name: 'STREET', value: 'STREET' },
	{ name: 'CASH', value: 'CASH' },
];

const INITIAL_FILTER_OBJ = {
	orderStatus: 'ALL',
	paymentMethod: 'ALL',
	from: moment().subtract(1, 'd').format('YYYY-MM-DD'),
	to: moment().add(1, 'days').format('YYYY-MM-DD'),
	minAmount: 0,
	maxAmount: 0,
	searchPattern: '',
};

const Orders = () => {
	const [statistics, setsStatistics] = useState({
		totalOrders: 0,
		totalPaid: 0,
		totalDiscount: 0,
		totalDeliveryAmount: 0,
		cash: 0,
		street: 0,
		InProgressState: 0,
		InPendingState: 0,
		InRegisteredState: 0,
		InInDeliveryState: 0,
		InDeliveredState: 0,
		InCanceledState: 0,
		InInProcessState: 0,
	});

	const [openFilter, setOpenFilter] = useState(false);
	const { orders, skip, isLoading, noMoreQuery } = useSelector((state) => state.order);

	const formik = useFormik({
		initialValues: INITIAL_FILTER_OBJ,
	});
	const dispatch = useDispatch();
	const pageNumberRef = useRef(0);

	const [dateValue, setDateValue] = useState({
		startDate: formik.values.from,
		endDate: formik.values.to,
	});

	const applyFilter = async (dispatchParams) => {
		await dispatch(getOrders(dispatchParams)).then(async (res) => {
			console.log(res);
			if (res?.payload?.orders) {
				try {
					const { payload } = await dispatch(generateStatistics({ data: [...orders, ...res?.payload?.orders] }));
					setsStatistics((oldStats) => {
						return {
							...oldStats,
							...payload,
						};
					});
				} catch (e) {
					console.log('Could not fetch the statistics');
				}
			}
		});
	};

	const onFetchOrders = async () => {
		dispatch(resetForm());
		console.log(formik.values);
		updateFormValue({ key: 'searchPattern', value: '' });
		const dispatchParams = {
			orderStatus: formik.values.orderStatus,
			paymentMethod: formik.values.paymentMethod,
			from: formik.values.from,
			to: formik.values.to,
			minAmount: formik.values.minAmount,
			maxAmount: formik.values.maxAmount,
			searchPattern: '',
			skip: 0,
		};
		await applyFilter(dispatchParams);
	};

	const onSearchOrders = async () => {
		dispatch(resetForm());

		const dispatchParams = {
			orderStatus: formik.values.orderStatus,
			paymentMethod: formik.values.paymentMethod,
			from: formik.values.from,
			to: formik.values.to,
			minAmount: formik.values.minAmount,
			maxAmount: formik.values.maxAmount,
			searchPattern: JSON.stringify(''),
			skip: 0,
		};
		await applyFilter(dispatchParams);
	};

	const handleLoadOrders = async (prevPage) => {
		if (!noMoreQuery && !isLoading) {
			const dispatchParams = {
				orderStatus: formik.values.orderStatus,
				paymentMethod: formik.values.paymentMethod,
				from: formik.values.from,
				to: formik.values.to,
				minAmount: formik.values.minAmount,
				maxAmount: formik.values.maxAmount,
				searchPattern: formik.values.searchPattern,
				skip: skip,
			};
			console.log(dispatchParams);

			await applyFilter(dispatchParams);
		}

		pageNumberRef.current = prevPage;
	};

	const updateFormValue = useCallback(
		({ key, value }) => {
			console.log('key, value', key, value);
			formik.setValues({
				...formik.values,
				[key]: value,
			});
		},
		[formik]
	);

	var fetchOrdersOnSearch = _.debounce(async ({ key, value }) => {
		console.log('oldState', formik.values);
		console.log('oldState', key, value);

		formik.setValues({
			...formik.values,
			[key]: value,
		});

		dispatch(resetForm());

		console.log('State', formik.values);

		const dispatchParams = {
			...formik.values,
			searchPatternId: value,
			skip: 0,
		};
		console.log('dispatchParams', dispatchParams);

		await applyFilter(dispatchParams);
	}, 1000);

	const handleDatePickerValueChange = (newValue) => {
		setDateValue(newValue);
		formik.setValues({
			...formik.values,
			from: newValue.startDate,
			to: newValue.endDate,
		});
	};

	useEffect(() => {
		onFetchOrders();
	}, [formik.values.from, formik.values.to]);

	return (
		<>
			{!isLoading && (
				<>
					<div className='mb-4 hidden sm:block'>
						<h3 className='text-sm font-light'>
							Orders History from <span className='font-semibold'>{moment(formik.values.from).format('LL')}</span> to{' '}
							<span className='font-semibold'>{moment(formik.values.to).format('LL')}</span>
						</h3>

						<div className='divider m-0'></div>
						<div className='w-full stats stats-vertical sm:stats-horizontal shadow mt-2'>
							<div className='stat'>
								<div className='stat-title'>Total Orders</div>
								<div className={`stat-value text-[1.8rem]`}>
									<span className='text-info'>{statistics.totalOrders}</span>
								</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Total Payment(s)</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.totalPaid} FCFA</div>
								<div className={`stat-desc`}>
									<span>
										Street: <span className='text-info'>{statistics.street} </span> | Cash: <span className='text-error'>{statistics.cash} </span>
									</span>
								</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Total Discount(s)</div>
								<div className='stat-value text-[1.8rem] text-error'>{statistics.totalDiscount} FCFA</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Total Deliveries Amount</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.totalDeliveryAmount} FCFA</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Pending Orders</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.InPendingState}</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Registered Orders</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.InRegisteredState}</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>In Progress Orders</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.InProgressState}</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>In Delivery Orders</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.InInDeliveryState}</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Delivered Orders</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.InDeliveredState}</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Processed Orders</div>
								<div className='stat-value text-[1.8rem] text-info'>{statistics.InInProcessState}</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Canceled Orders</div>
								<div className='stat-value text-[1.8rem] text-error'>{statistics.InCanceledState}</div>
							</div>
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
						<Datepicker
							containerClassName='w-full'
							value={dateValue}
							theme={'light'}
							inputClassName='input input-bordered w-full'
							popoverDirection={'down'}
							toggleClassName='invisible'
							onChange={handleDatePickerValueChange}
							showShortcuts={true}
							primaryColor={'white'}
						/>
						{/* <div className='md:col-span-2'>
							<div className='grid grid-cols-8 gap-2'>
								<InputText
									type='text'
									defaultValue={formik.values.searchPattern}
									updateType='searchPattern'
									placeholder='Type to search'
									containerStyle='col-start-2 col-span-6'
									labelTitle='Search Pattern'
									updateFormValue={updateFormValue}
									showLabel={false}
								/>
								<div className='flex items-center justify-center'>
									<button
										className='btn btn-outline w-2/3 btn-sm btn-ghost'
										onClick={onSearchOrders}
									>
										<MagnifyingGlassIcon className='w-6 h-6' />
									</button>
								</div>
							</div>
						</div> */}
					</div>

					<div
						tabIndex={0}
						className={`collapse rounded-lg collapse-plus border bg-white ${openFilter ? 'collapse-open' : 'collapse-close'}`}
					>
						<div
							className='collapse-title text-xl font-medium'
							onClick={() => setOpenFilter((oldVal) => !oldVal)}
						>
							Filters
						</div>
						<div className='collapse-content'>
							<div className='grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-x-5 lg:gap-y-3'>
								<SelectBox
									options={ordersStatusTypeOptions}
									labelTitle='Status'
									updateType='orderStatus'
									placeholder='Select the order status'
									defaultValue={formik.values.orderStatus}
									updateFormValue={updateFormValue}
								/>
								<SelectBox
									options={paymentMethodOptions}
									labelTitle='Payment Method'
									updateType='paymentMethod'
									placeholder='Select the payment method'
									defaultValue={formik.values.paymentMethod}
									updateFormValue={updateFormValue}
								/>
								<InputText
									type='number'
									defaultValue={formik.values.minAmount}
									updateType='minAmount'
									containerStyle=''
									labelTitle='Min Amount'
									updateFormValue={updateFormValue}
								/>
								<InputText
									type='number'
									defaultValue={formik.values.maxAmount}
									updateType='maxAmount'
									containerStyle=''
									labelTitle='Max Amount'
									updateFormValue={updateFormValue}
								/>
								<button
									className='btn btn-outline btn-ghost md:col-start-2 md:col-span-2'
									onClick={onFetchOrders}
								>
									Apply Filters
								</button>
							</div>
						</div>
					</div>

					{orders.length ? (
						<ClientOrdres
							orders={orders}
							currPage={pageNumberRef.current}
							onLoad={handleLoadOrders}
							updateFormValue={fetchOrdersOnSearch}
						/>
					) : (
						<InfoText styleClasses={'md:grid-cols-2'}>No order found ...</InfoText>
					)}
				</>
			)}
		</>
	);
};

export default Orders;

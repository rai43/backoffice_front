import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import { useFormik } from 'formik';
import * as _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TitleCard from '../../components/Cards/TitleCard';
import FilterLg from '../../components/Filters/FilterLg';
import FilterSm from '../../components/Filters/FilterSm';
import InputCheckbox from '../../components/Input/InputCheckbox';
import Search from '../../components/Input/Search';
import InfoText from '../../components/Typography/InfoText';
import Subtitle from '../../components/Typography/Subtitle';
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';
import User from '../user/components/User';
import { getClientsContent, resetFrom } from './clientSlice';
import Clients from './components/Clients';
import ClientsTable from './components/ClientsTable';
import SelectBox from '../../components/Input/SelectBox';

const INITIAL_CUSTOMER_FILTER_OBJ = {
	personal: true,
	merchant: true,
	active: true,
	deleted: false,
	direction: 'DESC',
	limit: '500',
	searchPattern: '',
};

const orderOptions = [
	{ name: 'Most recent', value: 'ASC' },
	{ name: 'Oldest', value: 'DESC' },
];

const fetchLimitOptions = [
	{ name: '250', value: '250' },
	{ name: '500', value: '500' },
	{ name: '1000', value: '1000' },
	{ name: '1500', value: '1500' },
];

const Customers = () => {
	const dispatch = useDispatch();

	const { clients, skip, isLoading, noMoreQuery } = useSelector((state) => state.client);

	const formik = useFormik({
		initialValues: INITIAL_CUSTOMER_FILTER_OBJ,
	});

	const [searchPattern, setSearchPattern] = useState('');
	const [openFilter, setOpenFilter] = useState(false);

	const TopSideButtons = ({ extraClasses, containerStyle }) => {
		const dispatch = useDispatch();

		const openAddNewClientModal = () => {
			dispatch(
				openModal({
					title: 'Creation a new customer',
					bodyType: MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT,
					size: 'lg',
					extraObject: {
						type: CONFIRMATION_MODAL_CLOSE_TYPES.CLIENT_CLIENTS_OR_EDIT,
					},
				})
			);
		};

		return (
			<div className={`${containerStyle ? containerStyle : ''}`}>
				<button
					className={`btn px-6 normal-case btn-primary btn-outline w-full ${extraClasses}`}
					onClick={() => openAddNewClientModal()}
				>
					Add New Customer
				</button>
			</div>
		);
	};

	const applyFilter = async (dispatchParams) => {
		await dispatch(getClientsContent(dispatchParams));
	};

	const handleLoadClients = async (prevPage) => {
		pageNumberRef.current = prevPage;
		if (
			!noMoreQuery &&
			!isLoading
			// scrollHeight - scrollTop <= clientHeight + 100 &&
		) {
			const dispatchParams = {
				skip: skip,
				personal: formik.values.personal,
				merchant: formik.values.merchant,
				active: formik.values.active,
				deleted: formik.values.deleted,
				limit: formik.values.limit,
				direction: formik.values.direction,
				searchPattern: formik.values.searchPattern,
			};

			await applyFilter(dispatchParams);
		}
	};

	const onFetchClients = async () => {
		dispatch(resetFrom());
		const dispatchParams = {
			skip: 0,
			personal: formik.values.personal,
			merchant: formik.values.merchant,
			active: formik.values.active,
			deleted: formik.values.deleted,
			limit: formik.values.limit,
			direction: formik.values.direction,
			searchPattern: formik.values.searchPattern,
		};
		applyFilter(dispatchParams);
	};

	useEffect(() => {
		onFetchClients();
	}, []);

	const updateFormValue = useCallback(
		({ key, value }) => {
			// this update will cause useEffect to get executed as there is a lookup on 'formik.values'
			formik.setValues({
				...formik.values,
				[key]: value,
			});
		},
		[formik]
	);

	const handleClientEdit = (client) => {
		console.log(client);
		dispatch(
			openModal({
				title: 'Creation a new customer',
				bodyType: MODAL_BODY_TYPES.CLIENTS_ADD_OR_EDIT,
				size: 'lg',
				extraObject: {
					client,
				},
			})
		);
	};

	const handleClientDelete = (client) => {
		console.log(client);
	};

	// const getUpdateFormValue = async (value) => {
	// 	setSearchPattern(value);
	// 	dispatch(resetFrom());
	// 	const dispatchParams = {
	// 		skip: 0,
	// 		personal: formik.values.personal,
	// 		merchant: formik.values.merchant,
	// 		active: formik.values.active,
	// 		deleted: formik.values.deleted,
	// 		searchPattern: value,
	// 	};

	// 	await applyFilter(dispatchParams);
	// 	// }
	// };

	// const setScrollPosition = (newPosition) => {
	// 	setTimeout(() => {
	// 		document.getElementById('clientsContainer')?.scrollTo(0, newPosition);
	// 	}, 0);
	// };

	// const openSwitchClientAccountStatusModal = (client) => {
	// 	dispatch(
	// 		openModal({
	// 			title: client?.is_deleted ? 'Confirmation to activate client account' : 'Confirmation to delete client account',
	// 			bodyType: MODAL_BODY_TYPES.CONFIRMATION,
	// 			extraObject: {
	// 				message: `Are you sure you want to ${client?.is_deleted ? 'activate' : 'delete'} the client with the following phone number: ${
	// 					client?.country?.prefix + ' ' ? client.country.prefix : '+225 '
	// 				} ${client?.phone_number} ?`,
	// 				type: CONFIRMATION_MODAL_CLOSE_TYPES.CLIENT_DELETE,
	// 				id: client.id,
	// 			},
	// 		})
	// 	);
	// };

	const pageNumberRef = useRef(0);

	return (
		<>
			{!isLoading && (
				<div className=''>
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
							<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 lg:gap-x-5 lg:gap-y-3'>
								<div className=''>
									<p className='inline-block'>Account Type</p>
									<div className='divider m-0'></div>
									<div className='grid grid-cols-1 md:grid-cols-3 gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
										<InputCheckbox
											defaultValue={formik.values.personal}
											updateType='personal'
											containerStyle='md:col-span-2 mt-1'
											inputStyle='checkbox-sm'
											labelTitle='PERSONAL'
											updateFormValue={updateFormValue}
										/>
										<InputCheckbox
											defaultValue={formik.values.merchant}
											updateType='merchant'
											containerStyle='md:col-span-2 mt-1'
											inputStyle='checkbox-sm'
											labelTitle='MERCHANT'
											updateFormValue={updateFormValue}
										/>
									</div>
								</div>
								<div>
									<p className={'inline-block'}>Account Status</p>
									<div className='divider m-0'></div>
									<div className='grid grid-cols-1 md:grid-cols-3 gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
										<InputCheckbox
											defaultValue={formik.values.active}
											updateType='active'
											containerStyle='md:col-span-2 mt-1'
											inputStyle='checkbox-sm'
											labelTitle='ACTIVE'
											updateFormValue={updateFormValue}
										/>
										<InputCheckbox
											defaultValue={formik.values.deleted}
											updateType='deleted'
											containerStyle='md:col-span-2 mt-1'
											inputStyle='checkbox-sm'
											labelTitle='DELETED'
											updateFormValue={updateFormValue}
										/>
									</div>
								</div>
								<div>
									<p className={'inline-block'}>Direction</p>
									<div className='divider m-0'></div>
									<div className='grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
										<SelectBox
											options={orderOptions}
											labelTitle='Period'
											updateType='direction'
											placeholder='Select desired direction'
											labelStyle='hidden'
											defaultValue={formik.values.direction}
											updateFormValue={updateFormValue}
										/>
									</div>
								</div>
								<div>
									<p className={'inline-block'}>Fetch Limit</p>
									<div className='divider m-0'></div>
									<div className='grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
										<SelectBox
											options={fetchLimitOptions}
											labelTitle='Period'
											updateType='limit'
											placeholder='Select desired limit'
											labelStyle='hidden'
											defaultValue={formik.values.limit}
											updateFormValue={updateFormValue}
										/>
									</div>
								</div>
								<button
									onClick={() => onFetchClients()}
									className='btn btn-outline btn-primary w-full sm:col-span-2 md:col-start-2 my-2'
								>
									Apply Filters
								</button>
							</div>
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-x-5 lg:gap-y-3 my-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
							<div className='w-full flex items-center justify-center'>
								<TopSideButtons extraClasses='btn-sm' />
							</div>
						</div>
						<div className='md:col-end-3'></div>
					</div>
					{clients.length ? (
						<Clients
							currPage={pageNumberRef.current}
							onLoadClients={handleLoadClients}
							updateFormValue={updateFormValue}
							handleClientEdit={handleClientEdit}
							handleClientDelete={handleClientDelete}
						/>
					) : (
						<InfoText styleClasses={'md:grid-cols-2'}>No client found ...</InfoText>
					)}
				</div>
			)}
		</>
	);
};

export default Customers;
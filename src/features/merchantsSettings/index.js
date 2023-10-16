import React, { useCallback, useEffect, useRef, useState } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';

import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';

import InputText from '../../components/Input/InputText';
import { useDispatch, useSelector } from 'react-redux';
import { getMerchantsContent, resetFrom } from './merchantsSettingsSlice';
import { useFormik } from 'formik';
import InputCheckbox from '../../components/Input/InputCheckbox';
import SelectBox from '../../components/Input/SelectBox';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';
import MerchantsList from './components/MerchantsList';
import InfoText from '../../components/Typography/InfoText';

const INITIAL_MERCHANTS_FILTER_OBJ = {
	active: true,
	deleted: false,
	direction: 'DESC',
	limit: '50',
	searchPattern: '',
	merchantId: '',
	merchantName: '',
};

const orderOptions = [
	{ name: 'Most recent', value: 'DESC' },
	{ name: 'Oldest', value: 'ASC' },
];

const fetchLimitOptions = [
	{ name: '50', value: '50' },
	{ name: '100', value: '100' },
	{ name: '250', value: '250' },
	{ name: '500', value: '500' },
	{ name: '1000', value: '1000' },
	{ name: '1500', value: '1500' },
];

const MerchantsMenu = () => {
	const dispatch = useDispatch();
	const pageNumberRef = useRef(0);

	const { merchants, skip, isLoading, noMoreQuery } = useSelector((state) => state.merchant);

	const formik = useFormik({
		initialValues: INITIAL_MERCHANTS_FILTER_OBJ,
	});

	const [openFilter, setOpenFilter] = useState(false);

	const applyFilter = async (dispatchParams) => {
		await dispatch(getMerchantsContent(dispatchParams)).then(async (res) => {
			console.log(res);
			// if (res?.payload?.orders) {
			// 	try {
			// 		const { payload } = await dispatch(generateStatistics({ data: [...orders, ...res?.payload?.orders] }));
			// 		setsStatistics((oldStats) => {
			// 			return {
			// 				...oldStats,
			// 				...payload,
			// 			};
			// 		});
			// 	} catch (e) {
			// 		console.log('Could not fetch the statistics');
			// 	}
			// }
		});
	};

	const onFetchMerchants = async () => {
		dispatch(resetFrom());
		const dispatchParams = {
			skip: 0,
			active: formik.values.active,
			deleted: formik.values.deleted,
			limit: formik.values.limit,
			direction: formik.values.direction,
			searchPattern: formik.values.searchPattern,
			merchantId: formik.values.merchantId,
			merchantName: formik.values.merchantName,
		};
		applyFilter(dispatchParams);
	};

	const handleLoadMerchants = async (prevPage) => {
		pageNumberRef.current = prevPage;
		if (!noMoreQuery && !isLoading) {
			const dispatchParams = {
				skip: 0,
				active: formik.values.active,
				deleted: formik.values.deleted,
				limit: formik.values.limit,
				direction: formik.values.direction,
				searchPattern: formik.values.searchPattern,
				merchantId: formik.values.merchantId,
				merchantName: formik.values.merchantName,
			};

			await applyFilter(dispatchParams);
		}
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

	useEffect(() => {
		onFetchMerchants();
	}, []);

	const TopSideButtons = ({ extraClasses, containerStyle }) => {
		const dispatch = useDispatch();

		const openMerchantDetailsModal = () => {
			dispatch(
				openModal({
					title: 'Creation a new customer',
					bodyType: MODAL_BODY_TYPES.MERCHANT_DETAILS,
					size: 'lg',
					extraObject: {},
				})
			);
		};

		return (
			<div className={`${containerStyle ? containerStyle : ''}`}>
				<button
					className={`btn px-6 normal-case btn-primary btn-outline w-full ${extraClasses}`}
					onClick={() => openMerchantDetailsModal()}
				>
					Add New Customer
				</button>
			</div>
		);
	};

	return (
		<div>
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
					<div className='sm:col-span-2 md:col-span-4 divider my-1'>General Filters</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-x-5 lg:gap-y-3'>
						<div>
							<p className={'inline-block'}>Account Status</p>
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
							<div className='grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
								<SelectBox
									options={orderOptions}
									labelTitle='Period'
									updateType='direction'
									placeholder='Select desired direction'
									labelStyle='hidden'
									selectStyle={'select-sm'}
									defaultValue={formik.values.direction}
									updateFormValue={updateFormValue}
								/>
							</div>
						</div>
						<div>
							<p className={'inline-block'}>Fetch Limit</p>
							<div className='grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
								<SelectBox
									options={fetchLimitOptions}
									labelTitle='Period'
									updateType='limit'
									placeholder='Select desired limit'
									labelStyle='hidden'
									selectStyle={'select-sm'}
									defaultValue={formik.values.limit}
									updateFormValue={updateFormValue}
								/>
							</div>
						</div>
						<div className='sm:col-span-2 md:col-span-4 divider my-1'>Extra Filters</div>
						<div className='sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-x-5 lg:gap-y-3'>
							<InputText
								type='text'
								defaultValue={formik.values.merchantName}
								updateType='merchantName'
								containerStyle=''
								inputStyle='input-sm'
								labelTitle='Merchant Name'
								updateFormValue={updateFormValue}
							/>
							<InputText
								type='number'
								defaultValue={formik.values.merchantId}
								updateType='merchantId'
								containerStyle=''
								inputStyle='input-sm'
								labelTitle='Merchant ID'
								updateFormValue={updateFormValue}
							/>
						</div>
						<button
							onClick={() => onFetchMerchants()}
							className='btn btn-outline btn-primary w-full sm:col-span-1 md:col-start-2 my-2'
						>
							Apply Filters
						</button>
					</div>
				</div>
			</div>

			{merchants.length ? (
				<MerchantsList
					firstActionButton={<TopSideButtons extraClasses='btn-sm' />}
					currPage={pageNumberRef.current}
					onLoadMerchants={handleLoadMerchants}
					updateFormValue={updateFormValue}
					// handleClientEdit={handleClientEdit}
					// handleClientDelete={handleClientDelete}
				/>
			) : (
				<InfoText styleClasses={'md:grid-cols-2'}>No client found ...</InfoText>
			)}
		</div>
	);
};

export default MerchantsMenu;

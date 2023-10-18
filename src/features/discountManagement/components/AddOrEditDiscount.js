import { useFormik } from 'formik';
import axios from 'axios';
import moment from 'moment';
import AsyncSelect from 'react-select/async';
import { FaBowlFood } from 'react-icons/fa6';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useDispatch } from 'react-redux';
import { saveDiscounts, updateDiscount } from '../discountManagementSlice';
import { showNotification } from '../../common/headerSlice';

const customStyles = {
	control: (base) => ({
		...base,
		// height: '3rem',
	}),
	menu: (base) => ({
		...base,
		marginBottom: '2rem',
	}),
};

const AddOrEditDiscount = ({ extraObject, closeModal }) => {
	const dispatch = useDispatch();
	const datePickerFrom = useRef();
	const datePickerTo = useRef();
	console.log('extra object', extraObject);

	const INITIAL_FILTER_OBJ = {
		type: extraObject?.discountObject ? extraObject?.discountObject?.value_type?.toLocaleLowerCase() : 'price',
		value: extraObject?.discountObject ? parseInt(extraObject?.discountObject?.value) : 0,
		description: extraObject?.discountObject ? extraObject?.discountObject?.description : '',
		searchPattern: '',
		articles: [],
	};

	const [dateInterval, setDateInterval] = useState({
		from: extraObject?.discountObject ? moment(extraObject?.discountObject?.start_date).format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD HH:mm'),
		to: extraObject?.discountObject ? moment(extraObject?.discountObject?.end_date).format('YYYY-MM-DD HH:mm') : moment().add(1, 'days').format('YYYY-MM-DD HH:mm'),
	});

	const inputRefFrom = useCallback((node) => {
		if (node !== null) {
			datePickerFrom.current = flatpickr(node, {
				enableTime: true,
				defaultDate: dateInterval.from,
				dateFormat: 'Y-m-d H:i',
				time_24hr: true,
				onChange: (date) => {
					setDateInterval((oldValues) => {
						return { ...oldValues, from: moment(date[0]) };
					});
				},
			});
		}
	}, []);

	const inputRefTo = useCallback((node) => {
		if (node !== null) {
			datePickerTo.current = flatpickr(node, {
				enableTime: true,
				defaultDate: dateInterval.to,
				dateFormat: 'Y-m-d H:i',
				time_24hr: true,
				onChange: (date) => {
					setDateInterval((oldValues) => {
						return { ...oldValues, to: moment(date[0]) };
					});
				},
			});
		}
	}, []);

	const formik = useFormik({
		initialValues: INITIAL_FILTER_OBJ,
	});

	useEffect(() => {
		console.log(datePickerFrom.current);
	}, [datePickerFrom.current]);

	const [articles, setArticles] = useState([]);

	const updateForm = useCallback(({ key, value }) => {
		return setArticles((oldValues) => [...oldValues, value]);
	}, []);

	const articlesLoadOptions = (inputValue) =>
		new Promise((resolve) => {
			if (inputValue?.length >= 3) {
				axios
					.get('/api/articles/get-articles-by-search', {
						params: {
							searchPattern: inputValue,
						},
					})
					.then((response) =>
						resolve(
							(response?.data?.articles || []).map((article) => {
								return {
									value: article?.id,
									label: `${article?.title} (${article?.id}) - ${article?.merchant?.name?.toLocaleUpperCase()}`,
								};
							})
						)
					)
					.catch((error) => {
						console.log(error.message);
					});
			} else {
				resolve([]);
			}
		});

	return (
		<div>
			<div className='grid md:grid-cols-4 gap-3 mb-[10rem]'>
				<div className={`form-control w-full`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Start From</span>
					</label>
					<input
						type='date'
						className='input input-bordered w-full'
						ref={inputRefFrom}
					/>
				</div>
				<div className={`form-control w-full`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Upto</span>
					</label>
					<input
						type='date'
						className='input input-bordered w-full'
						ref={inputRefTo}
					/>
				</div>
				<div className={`form-control w-full`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Discount Type</span>
					</label>
					<select
						className='select select-bordered w-full max-w-xs'
						value={formik.values.type}
						onChange={(e) => {
							formik.setValues({
								...formik.values,
								type: e.target.value || 'price',
							});
						}}
					>
						<option value={'price'}>Price</option>
						<option value={'percentage'}>Percentage</option>
					</select>
				</div>
				<div className={`form-control w-full`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Value</span>
					</label>
					<input
						type='number'
						value={formik.values.value}
						className='input input-bordered w-full'
						onChange={(e) => {
							formik.setValues({
								...formik.values,
								value: e.target.value,
							});
						}}
					/>
				</div>
				<div className={`form-control col-span-4 w-full`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Description</span>
					</label>
					<input
						type='text'
						value={formik.values.description}
						className='input input-bordered w-full'
						onChange={(e) => {
							formik.setValues({
								...formik.values,
								description: e.target.value,
							});
						}}
					/>
				</div>
				<div className={`form-control w-full col-span-4`}>
					<label className='label'>
						<span className={'label-text text-base-content '}>Articles</span>
					</label>
					{extraObject?.discountObject ? (
						<>
							<div className='alert shadow-lg'>
								<div>
									<FaBowlFood className='h-5 w-6' />
									<span>{`${extraObject?.discountObject?.article?.title} (${
										extraObject?.discountObject?.article?.id
									}) - ${extraObject?.discountObject?.article?.merchant?.name?.toLocaleUpperCase()}`}</span>
								</div>
							</div>
						</>
					) : (
						<AsyncSelect
							isMulti
							maxMenuHeight={100}
							cacheOptions
							defaultOptions
							defaultValue={() => {
								// if (defaultValue) {
								// 	return {
								// 		label: defaultValue.label,
								// 		value: defaultValue.value,
								// 	};
								// }
							}}
							loadOptions={articlesLoadOptions}
							styles={customStyles}
							updateFormValue={(e) =>
								formik.setValues({
									...formik.values,
									searchPattern: e.target.value,
								})
							}
							onChange={(e) => {
								formik.setValues({
									...formik.values,
									articles: [...e.map((article) => article.value)],
								});
							}}
						/>
					)}
				</div>
			</div>
			<div className='md:grid md:grid-cols-3 gap-3'>
				<button
					className='md:col-start-2 w-full btn btn-outline btn-primary'
					onClick={async () => {
						if (extraObject?.discountObject) {
							// FOR UPDATE
							if (
								!dateInterval.from ||
								!dateInterval.to ||
								!formik.values.description ||
								(formik.values.type !== 'price' && formik.values.type !== 'percentage') ||
								parseInt(formik.values.value) === 0
							) {
								dispatch(
									showNotification({
										message: 'Could not proceed as some values are not correctly set',
										status: 0,
									})
								);
							} else {
								await dispatch(
									updateDiscount({
										from: dateInterval.from,
										to: dateInterval.to,
										type: formik.values.type,
										value: parseInt(formik.values.value),
										description: formik.values.description,
										discount: extraObject?.discountObject?.id,
									})
								).then(async (response) => {
									if (response?.error) {
										dispatch(
											showNotification({
												message: 'Error while update the discount',
												status: 0,
											})
										);
									} else {
										dispatch(
											showNotification({
												message: response?.payload?.rejectedArticles?.length
													? `A discount already exists for the article for the specified date range`
													: 'Succefully created the discounts',
												status: 1,
											})
										);
										closeModal();
									}
								});
							}
						} else {
							// FOR NEW INSERTION
							if (
								!dateInterval.from ||
								!dateInterval.to ||
								!formik.values.description ||
								(formik.values.type !== 'price' && formik.values.type !== 'percentage') ||
								parseInt(formik.values.value) === 0 ||
								formik.values.articles?.length === 0
							) {
								dispatch(
									showNotification({
										message: 'Could not proceed as some values are not correctly set',
										status: 0,
									})
								);
							} else {
								console.log(formik.values.articles);
								await dispatch(
									saveDiscounts({
										fromDisplay: extraObject?.dateValue?.startDate,
										toDisplay: extraObject?.dateValue?.endDate,
										from: dateInterval.from,
										to: dateInterval.to,
										type: formik.values.type,
										value: parseInt(formik.values.value),
										description: formik.values.description,
										articles: formik.values.articles,
									})
								).then(async (response) => {
									if (response?.error) {
										dispatch(
											showNotification({
												message: 'Error while creating the discounts',
												status: 0,
											})
										);
									} else {
										dispatch(
											showNotification({
												message: response?.payload?.rejectedArticles?.length
													? `Succefully created some discounts but the following items are already associated to existing discounts (${response?.payload?.rejectedArticles?.reduce(
															(ac, cur, ind) => ac + ` ` + cur,
															''
													  )})`
													: 'Succefully created the discounts',
												status: 1,
											})
										);
										closeModal();
									}
								});
							}
						}
					}}
				>
					{extraObject?.discountObject ? 'Update Discount' : 'Save Discount'}
				</button>
			</div>
		</div>
	);
};

export default AddOrEditDiscount;

import { useFormik } from 'formik';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import { generateStatistics, getClientsTransactions, resetForm } from './transactionSlice';
import Datepicker from 'react-tailwindcss-datepicker';
import SelectBox from '../../components/Input/SelectBox';
import InputText from '../../components/Input/InputText';
import InfoText from '../../components/Typography/InfoText';
import UsersTransactions from './components/UsersTransactions';

const INITIAL_WALLET_FILTER_OBJ = {
	transactionType: 'ALL',
	from: moment().subtract(30, 'd').format('YYYY-MM-DD'),
	to: moment().add(1, 'days').format('YYYY-MM-DD'),
	minAmount: 0,
	maxAmount: 0,
	searchPattern: '',
};

const transactionTypeOptionsTransactions = [
	{ name: 'ALL', value: 'ALL' },
	{ name: 'BONUS', value: 'BONUS' },
	{ name: 'PAYMENT', value: 'PAYMENT' },
	{ name: 'RECHARGEMENT', value: 'RECHARGEMENT' },
	{ name: 'RECHARGEMENT_MOBILE_MONEY', value: 'RECHARGEMENT_MOBILE_MONEY' },
	{ name: 'RECHARGEMENT_STREET', value: 'RECHARGEMENT_STREET' },
	{ name: 'RETRAIT', value: 'RETRAIT' },
];

const Transactions = () => {
	const [statistics, setsStatistics] = useState({
		transactionsInCount: 0,
		transactionsOutCount: 0,
		transactionsInAmount: 0,
		transactionsOutAmount: 0,
		paymentsCount: 0,
		paymentsAmount: 0,
		topupsCount: 0,
		topupsAmount: 0,
		withdrawalsCount: 0,
		withdrawalsAmount: 0,
		bonusCount: 0,
		bonusAmount: 0,
	});

	const formik = useFormik({
		initialValues: INITIAL_WALLET_FILTER_OBJ,
	});
	const dispatch = useDispatch();
	const pageNumberRef = useRef(0);
	const [openFilter, setOpenFilter] = useState(false);

	const [dateValue, setDateValue] = useState({
		startDate: formik.values.from,
		endDate: formik.values.to,
	});

	const { transactions, skip, isLoading, noMoreQuery } = useSelector((state) => state.transaction);

	const applyFilter = async (dispatchParams) => {
		dispatch(getClientsTransactions(dispatchParams)).then(async (res) => {
			if (res?.payload?.transactions) {
				try {
					const { payload } = await dispatch(generateStatistics({ data: [...transactions, ...res?.payload?.transactions], clientPhoneNumber: '' }));
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

	const onFetchTransactions = async () => {
		dispatch(resetForm());
		console.log(formik.values);
		updateFormValue({ key: 'searchPattern', value: '' });
		const dispatchParams = {
			transactionType: formik.values.transactionType,
			from: formik.values.from,
			to: formik.values.to,
			minAmount: formik.values.minAmount,
			maxAmount: formik.values.maxAmount,
			searchPattern: '',
			skip: 0,
		};
		await applyFilter(dispatchParams);
	};

	const onSearchTransactions = async () => {
		dispatch(resetForm());

		const dispatchParams = {
			transactionType: formik.values.transactionType,
			from: formik.values.from,
			to: formik.values.to,
			minAmount: formik.values.minAmount,
			maxAmount: formik.values.maxAmount,
			searchPattern: formik.values.searchPattern,
			skip: 0,
		};
		console.log(dispatchParams);
		await applyFilter(dispatchParams);
	};

	useEffect(() => {
		onFetchTransactions();
	}, [formik.values.from, formik.values.to]);

	const handleLoadTransactions = async (prevPage) => {
		if (!noMoreQuery && !isLoading) {
			const dispatchParams = {
				transactionType: formik.values.transactionType,
				from: formik.values.from,
				to: formik.values.to,
				minAmount: formik.values.minAmount,
				maxAmount: formik.values.maxAmount,
				searchPattern: formik.values.searchPattern,
				skip: skip,
			};

			await applyFilter(dispatchParams);
		}

		pageNumberRef.current = prevPage;
	};

	const handleDatePickerValueChange = (newValue) => {
		setDateValue(newValue);
		formik.setValues({
			...formik.values,
			from: newValue.startDate,
			to: newValue.endDate,
		});
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

	return (
		<>
			{!isLoading && (
				<>
					<div className='mb-4'>
						<h3 className='text-sm font-light'>
							Transactions History from <span className='font-semibold'>{moment(formik.values.from).format('LL')}</span> to{' '}
							<span className='font-semibold'>{moment(formik.values.to).format('LL')}</span>
						</h3>

						<div className='divider m-0'></div>
						<div className='w-full stats stats-vertical lg:stats-horizontal shadow mt-2'>
							<div className='stat'>
								<div className='stat-title'>Transactions (In/Out)</div>
								<div className={`stat-value text-[1.1rem]`}>
									<span className='text-info'>{statistics.transactionsInAmount} FCFA </span> <span className='text-error font-normal'>({statistics.transactionsOutAmount} FCFA)</span>
								</div>
								<div className={`stat-desc`}>
									Count:{' '}
									<span>
										<span className='text-info'>{statistics.transactionsInCount} </span> | <span className='text-error'>{statistics.transactionsOutCount} </span>
									</span>
								</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Payment(s)</div>
								<div className='stat-value text-[1.5rem] text-info'>{statistics.paymentsAmount} FCFA</div>
								<div className='stat-desc'>
									Count: <span className='text-info'>{statistics.paymentsCount}</span>
								</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Top up(s)</div>
								<div className='stat-value text-[1.5rem] text-info'>{statistics.topupsAmount} FCFA</div>
								<div className='stat-desc'>
									Count: <span className='text-info'>{statistics.topupsCount}</span>
								</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Withdrawal(s)</div>
								<div className='stat-value text-[1.5rem] text-info'>{statistics.withdrawalsAmount} FCFA</div>
								<div className='stat-desc'>
									Count: <span className='text-info'>{statistics.withdrawalsCount}</span>
								</div>
							</div>
							<div className='stat'>
								<div className='stat-title'>Bonus</div>
								<div className='stat-value text-[1.5rem] text-info'>{statistics.bonusAmount} FCFA</div>
								<div className='stat-desc'>
									Count <span className='text-info'>{statistics.bonusCount}</span>
								</div>
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
						<div className='md:col-span-2'>
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
										onClick={onSearchTransactions}
									>
										<MagnifyingGlassIcon className='w-6 h-6' />
									</button>
								</div>
							</div>
						</div>
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
							<div className='grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-x-5 lg:gap-y-3'>
								<SelectBox
									options={transactionTypeOptionsTransactions}
									labelTitle='Transaction Type'
									updateType='transactionType'
									placeholder='Select the transaction type'
									defaultValue={formik.values.transactionType}
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
									className='btn btn-outline btn-ghost md:col-start-2'
									onClick={onFetchTransactions}
								>
									Apply Filters
								</button>
							</div>
						</div>
					</div>

					{transactions.length ? (
						// <div
						//   // className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 md:p-5 h-screen md:h-[39rem] overflow-auto"
						//   id={"clientsContainer"}
						// >

						<UsersTransactions
							transactions={transactions}
							currPage={pageNumberRef.current}
							onLoad={handleLoadTransactions}
							updateFormValue={() => {}}
						/>
					) : (
						// </div>
						<InfoText styleClasses={'md:grid-cols-2'}>No client found ...</InfoText>
					)}
				</>
			)}
		</>
	);
};

export default Transactions;

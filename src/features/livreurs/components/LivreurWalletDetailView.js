import React, { useCallback, useEffect, useRef, useState } from 'react';

import ArrowLeftOnRectangleIcon from '@heroicons/react/24/outline/ArrowLeftOnRectangleIcon';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon';
import DashboardStats from '../../dashboard/components/DashboardStats';
import Datepicker from 'react-tailwindcss-datepicker';
import moment from 'moment';
import SelectBox from '../../../components/Input/SelectBox';
import { useFormik } from 'formik';

import { useDispatch, useSelector } from 'react-redux';
import { creditAccountToServer, debitAccountToServer, generateStatistics, getClientTransactions, resetForm, switchWalletStatus } from '../../transaction/transactionSlice';

import { getClientRechargements } from '../../rechargement/rechargementSlice';
import InputText from '../../../components/Input/InputText';
import { openModal } from '../../common/modalSlice';
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { showNotification } from '../../common/headerSlice';

import { getClientRetraits } from '../../retrait/retraitSlice';

import PersonalCardTransactionsNav from '../../client/containers/PersonalCardTransactionsNav';
import ClientTransactionsTable from '../../client/components/ClientTransactionsTable';
import ClientRechargementsTable from '../../client/components/ClientRechargementsTable';
import ClientRequetesTable from '../../client/components/ClientRequetesTable';
import { replaceLivreurObjectByUpdatedOne } from '../livreursSlice';

const INITIAL_WALLET_FILTER_OBJ = {
	transactionType: 'ALL',
	from: moment().subtract(30, 'd').format('YYYY-MM-DD'),
	to: moment().add(1, 'days').format('YYYY-MM-DD'),
};

const transactionTypeOptionsTransactions = [
	{ name: 'ALL', value: 'ALL' },
	{ name: 'PAYMENT', value: 'PAYMENT' },
	{ name: 'RECHARGEMENT', value: 'RECHARGEMENT' },
	{ name: 'RECHARGEMENT_STREET', value: 'RECHARGEMENT_STREET' },
	{ name: 'RETRAIT', value: 'RETRAIT' },
	{ name: 'RECHARGEMENT_MOBILE_MONEY', value: 'RECHARGEMENT_MOBILE_MONEY' },
	{ name: 'BONUS', value: 'BONUS' },
];
// const transactionTypeOptionsRechargements = [
// 	{ name: 'ALL', value: 'ALL' },
// 	{ name: 'RECHARGEMENT', value: 'RECHARGEMENT' },
// 	{ name: 'RECHARGEMENT_STREET', value: 'RECHARGEMENT_STREET' },
// 	{ name: 'RECHARGEMENT_MOBILE_MONEY', value: 'RECHARGEMENT_MOBILE_MONEY' },
// 	{ name: 'BONUS', value: 'BONUS' },
// ];

const LivreurWalletDetailView = ({ extraObject }) => {
	useEffect(() => console.log('extraObject', extraObject), []);
	const clientPhoneNumber = extraObject?.client?.phone_number;
	const pageNumberRef = useRef(0);
	const dispatch = useDispatch();

	const [walletStatus, setWalletStatus] = useState({ balance: extraObject?.wallet?.balance, bonus: extraObject?.wallet?.bonus });
	const [modalObj, setModalObj] = useState({ isOpened: false, amount: 0, actionType: 'principal', action: '' });
	const [isActive, setIsActive] = useState(extraObject?.wallet?.wallet_status?.code === 'ACTIVATED');

	const [activePage, setActivePage] = useState('/my-wallet/transactions');
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
	const { transactions, skip, isLoading, noMoreQuery, totalCount } = useSelector((state) => state.transaction);

	const formik = useFormik({
		initialValues: INITIAL_WALLET_FILTER_OBJ,
	});

	const [dateValue, setDateValue] = useState({
		startDate: formik.values.from,
		endDate: formik.values.to,
	});

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
			// this update will cause useEffect to get executed as there is a lookup on 'formik.values'
			formik.setValues({
				...formik.values,
				[key]: value,
			});
		},
		[formik]
	);

	const applyFilter = async (dispatchParams) => {
		if (activePage === '/my-wallet/transactions') {
			dispatch(getClientTransactions(dispatchParams)).then(async (res) => {
				if (res?.payload?.transactions) {
					try {
						const { payload } = await dispatch(generateStatistics({ data: res?.payload?.transactions, clientPhoneNumber }));
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
		} else if (activePage === '/personal-wallet/rechargements') {
			dispatch(getClientRechargements(dispatchParams));
		} else if (activePage === '/marchant-wallet/requests') {
			dispatch(getClientRetraits(dispatchParams));
		}
	};

	const onFetchTransactions = async () => {
		dispatch(resetForm());
		const dispatchParams = {
			transactionType: formik.values.transactionType,
			from: formik.values.from,
			to: formik.values.to,
			wallet: extraObject?.wallet?.id,
			skip: 0,
		};
		await applyFilter(dispatchParams);
	};
	// setClientPhoneNumber(clientPhoneNumber);

	useEffect(() => {
		onFetchTransactions();
	}, [formik.values.from, formik.values.to, formik.values.transactionType, activePage]);

	const handleLoadTransactions = async (prevPage) => {
		pageNumberRef.current = prevPage;
		if (!noMoreQuery && !isLoading) {
			const dispatchParams = {
				transactionType: formik.values.transactionType,
				from: formik.values.from,
				to: formik.values.to,
				wallet: extraObject?.wallet?.id,
				skip: skip,
			};

			await applyFilter(dispatchParams);
		}
	};

	return (
		<>
			{!isLoading && (
				<div className='w-full my-2'>
					<div className='w-full'>
						<h3 className='text-sm font-light'>Filters</h3>
						{/* Divider */}
						<div className='divider mt-0 my-1'></div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
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
							{activePage === '/my-wallet/transactions' ? (
								<SelectBox
									options={transactionTypeOptionsTransactions}
									labelTitle='Transaction Type'
									updateType='transactionType'
									placeholder='Select the transaction type'
									labelStyle='hidden'
									defaultValue={formik.values.transactionType}
									updateFormValue={updateFormValue}
								/>
							) : (
								<></>
							)}
						</div>
					</div>
					<div className='w-full'>
						<h3 className='text-sm font-light'>
							Actions on{' '}
							{/* <span className='mx-2 text-primary'>
						{extraObject?.client?.country?.prefix ? extraObject?.client?.country?.prefix + ' ' : '+225 '} {extraObject?.client?.phone_number}
					</span> */}
							{extraObject?.wallet?.wallet_type?.libelle ? extraObject?.wallet?.wallet_type?.libelle?.toLocaleLowerCase() : ''} wallet
						</h3>
						{/* Divider */}
						<div className='divider mt-0 mb-1'></div>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
							<button
								className='btn btn-sm btn-outline btn-success w-full'
								onClick={() =>
									setModalObj((old) => {
										return {
											...old,
											action: 'credit',
											isOpened: true,
										};
									})
								}
							>
								<ArrowRightOnRectangleIcon className='h-4 w-4 mr-3' />
								Credit
							</button>
							<button
								className='btn btn-sm btn-outline btn-warning w-full'
								onClick={() =>
									setModalObj((old) => {
										return {
											...old,
											action: 'debit',
											isOpened: true,
										};
									})
								}
							>
								<ArrowLeftOnRectangleIcon className='h-4 w-4 mr-3' />
								Debit
							</button>
							<button
								className={`btn btn-sm btn-outline w-full ${isActive ? 'btn-error' : 'btn-secondary'}`}
								onClick={() =>
									setModalObj((old) => {
										return {
											...old,
											action: 'block',
											isOpened: true,
										};
									})
								}
							>
								<LockClosedIcon className='h-4 w-4 mr-3' />
								{isActive ? 'Block' : 'Unblock'}
							</button>
						</div>
					</div>

					<div className='my-2'>
						<h3 className='text-sm font-light mt-6'>
							{/* <span className='mx-2 text-primary'>
						{extraObject?.client?.country?.prefix ? extraObject?.client?.country?.prefix + ' ' : '+225 '} {extraObject?.client?.phone_number}
					</span> */}
							Balance & History
						</h3>
						<div className='w-full stats stats-vertical lg:stats-horizontal shadow mt-2'>
							<div className='stat'>
								<div className='stat-title'>Account Balance</div>
								<div className={`stat-value text-[1.8rem]`}>
									<span className='text-info'>{walletStatus.balance} FCFA </span>
								</div>
								<div className={`stat-desc`}>
									Bonus:{' '}
									<span>
										<span className='text-info'>{walletStatus.bonus} FCFA</span>
									</span>
								</div>
							</div>
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
					{/* Divider */}
					<div className='divider mt-0'></div>
					<PersonalCardTransactionsNav
						activePage={activePage}
						setActivePage={setActivePage}
						accountType={extraObject?.wallet?.wallet_type?.code}
					/>

					{activePage === '/my-wallet/transactions' && (
						<>
							<ClientTransactionsTable
								currPage={pageNumberRef.current}
								onLoad={handleLoadTransactions}
								updateFormValue={() => {}}
								client={extraObject.client}
							/>
						</>
					)}
					{activePage === '/personal-wallet/rechargements' && (
						<>
							<ClientRechargementsTable
								currPage={pageNumberRef.current}
								onLoad={handleLoadTransactions}
								updateFormValue={() => {}}
							/>
						</>
					)}
					{activePage === '/marchant-wallet/requests' && (
						<>
							<ClientRequetesTable
								currPage={pageNumberRef.current}
								onLoad={handleLoadTransactions}
								updateFormValue={() => {}}
							/>
						</>
					)}
				</div>
			)}

			{/* TODO: make a component for this */}
			<div className={`modal modal-bottom sm:modal-middle ${modalObj?.isOpened && modalObj.action !== 'block' ? 'modal-open' : ''}`}>
				<div className='modal-box'>
					<h3 className='font-bold text-lg'>{modalObj.action === 'credit' ? <span>Credit Account</span> : modalObj.action === 'debit' ? <span>Debit Account</span> : ''}</h3>
					{modalObj.action === 'credit' || modalObj.action === 'debit' ? (
						<div className='py-4'>
							<InputText
								type='number'
								labelTitle={'Amount'}
								defaultValue={0}
								updateType={''}
								containerStyle=''
								updateFormValue={({ key, value }) =>
									setModalObj((old) => {
										console.log(value);
										return {
											...old,
											amount: value,
										};
									})
								}
							/>
						</div>
					) : (
						<></>
					)}
					{extraObject?.wallet?.wallet_type?.code === 'PERSO' ? (
						<>
							<label className='label cursor-pointer'>
								<span className='label-text'>Principal Account</span>
								<input
									type='radio'
									name='radio-10'
									className='radio checked:bg-blue-500'
									onChange={(_) =>
										setModalObj((old) => {
											return {
												...old,
												actionType: 'principal',
											};
										})
									}
									checked={modalObj?.actionType === 'principal'}
								/>
							</label>
							<label className='label cursor-pointer'>
								<span className='label-text'>Bonus Account</span>
								<input
									type='radio'
									name='radio-10'
									className='radio checked:bg-red-500'
									onChange={(_) =>
										setModalObj((old) => {
											return {
												...old,
												actionType: 'bonus',
											};
										})
									}
									checked={modalObj?.actionType === 'bonus'}
								/>
							</label>
						</>
					) : (
						<></>
					)}
					<div className='modal-action'>
						<label
							htmlFor='my-modal-6'
							className='btn btn-outline btn-ghost'
							onClick={() =>
								setModalObj({
									action: '',
									amount: 0,
									isOpened: false,
									actionType: 'principal',
								})
							}
						>
							close
						</label>
						<label
							htmlFor='my-modal-6'
							className='btn btn-outline btn-primary'
							onClick={async () => {
								if (modalObj.action === 'credit') {
									console.log('credit');

									const response = await dispatch(creditAccountToServer({ wallet: extraObject?.wallet?.id, amount: modalObj.amount, accountType: modalObj?.actionType }));

									if (response?.error) {
										console.log(response.error);
										dispatch(
											showNotification({
												message: 'Error while crediting the client account',
												status: 0,
											})
										);
									} else {
										setModalObj((old) => {
											return { ...old, action: '', amount: 0, isOpened: false, actionType: 'principal' };
										});

										dispatch(
											showNotification({
												message: 'Successfully credited the client account',
												status: 1,
											})
										);

										try {
											const { payload } = await dispatch(generateStatistics({ data: [response?.payload?.transaction, ...transactions], clientPhoneNumber }));
											console.log(payload);
											setsStatistics((oldStats) => {
												return {
													...oldStats,
													...payload,
												};
											});

											if (response?.payload?.isPrincipalAccount) {
												setWalletStatus((old) => {
													return {
														...old,
														balance: old.balance + response?.payload?.transaction?.amount,
													};
												});
											} else {
												setWalletStatus((old) => {
													return {
														...old,
														bonus: old.bonus + response?.payload?.transaction?.amount,
													};
												});
											}
										} catch (e) {
											console.log('Could not fetch the statistics');
										}

										try {
											const { payload } = await dispatch(replaceLivreurObjectByUpdatedOne({ livreur: response?.payload?.livreur }));
											console.log(payload);
										} catch (e) {
											console.log('Could not update the informations');
										}
									}
								} else if (modalObj.action === 'debit') {
									console.log('debit');

									const response = await dispatch(debitAccountToServer({ wallet: extraObject?.wallet?.id, amount: modalObj.amount, accountType: modalObj?.actionType }));

									if (response?.error) {
										console.log(response.error);
										dispatch(
											showNotification({
												message: 'Error while debiting the client account',
												status: 0,
											})
										);
									} else {
										setModalObj((old) => {
											return { ...old, action: '', amount: 0, isOpened: false, actionType: 'principal' };
										});

										dispatch(
											showNotification({
												message: 'Successfully debited the client account',
												status: 1,
											})
										);

										try {
											const { payload } = await dispatch(generateStatistics({ data: [response?.payload?.transaction, ...transactions], clientPhoneNumber }));
											console.log(payload);
											setsStatistics((oldStats) => {
												return {
													...oldStats,
													...payload,
												};
											});

											if (response?.payload?.isPrincipalAccount) {
												setWalletStatus((old) => {
													return {
														...old,
														balance: old.balance - response?.payload?.transaction?.amount,
													};
												});
											} else {
												setWalletStatus((old) => {
													return {
														...old,
														bonus: old.bonus - response?.payload?.transaction?.amount,
													};
												});
											}
										} catch (e) {
											console.log('Could not fetch the statistics');
										}

										try {
											const { payload } = await dispatch(replaceLivreurObjectByUpdatedOne({ livreur: response?.payload?.livreur }));
											console.log(payload);
										} catch (e) {
											console.log('Could not update the informations');
										}
									}
								}
							}}
						>
							{modalObj.action === 'credit' ? <span>Credit Now</span> : modalObj.action === 'debit' ? <span>Debit Now</span> : ''}
						</label>
					</div>
				</div>
			</div>

			<div className={`modal modal-bottom sm:modal-middle ${modalObj?.isOpened && modalObj.action === 'block' ? 'modal-open' : ''}`}>
				<div className='modal-box'>
					<h3 className='font-bold text-lg'>{isActive ? 'Are you sure you want to block this client?' : 'Are you sure you want to unblock this client?'}</h3>
					<div className='modal-action'>
						<label
							htmlFor='my-modal-6'
							className='btn btn-outline btn-ghost'
							onClick={() =>
								setModalObj({
									action: '',
									amount: 0,
									isOpened: false,
									actionType: 'principal',
								})
							}
						>
							No, Cancel Action
						</label>
						<label
							htmlFor='my-modal-6'
							className='btn btn-outline btn-error'
							onClick={async () => {
								const response = await dispatch(switchWalletStatus({ wallet: extraObject?.wallet?.id }));

								if (response?.error) {
									console.log(response.error);
									dispatch(
										showNotification({
											message: 'Error while switching the wallet status',
											status: 0,
										})
									);
								} else {
									setModalObj((old) => {
										return { ...old, action: '', amount: 0, isOpened: false, actionType: 'principal' };
									});

									dispatch(
										showNotification({
											message: 'Successfully switched the wallet status account',
											status: 1,
										})
									);

									if (response?.payload?.wallet?.wallet_status_id === 1) {
										setIsActive(true);
									} else if (response?.payload?.wallet?.wallet_status_id === 3) {
										setIsActive(false);
									}

									try {
										const { payload } = await dispatch(replaceLivreurObjectByUpdatedOne({ livreur: response?.payload?.livreur }));
										console.log(payload);
									} catch (e) {
										console.log('Could not update the informations');
									}
								}

								setModalObj({
									action: '',
									amount: 0,
									isOpened: false,
									actionType: 'principal',
								});
							}}
						>
							Yes, Proceed
						</label>
					</div>
				</div>
			</div>
		</>
	);
};

export default LivreurWalletDetailView;

import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import { useFormik } from 'formik';
import * as _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InputCheckbox from '../../components/Input/InputCheckbox';
import InfoText from '../../components/Typography/InfoText';
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';
import Livreurs from './components/Livreurs';
import SelectBox from '../../components/Input/SelectBox';
import { getLivreursContent, resetFrom } from './livreursSlice';
import InputText from '../../components/Input/InputText';

const INITIAL_LIVREURS_FILTER_OBJ = {
	active: true,
	deleted: false,
	direction: 'DESC',
	limit: '500',
	searchPattern: '',
	livreurInfo: '',
};

const orderOptions = [
	{ name: 'Most recent', value: 'DESC' },
	{ name: 'Oldest', value: 'ASC' },
];

const fetchLimitOptions = [
	{ name: '250', value: '250' },
	{ name: '500', value: '500' },
	{ name: '1000', value: '1000' },
	{ name: '1500', value: '1500' },
];

const Livreur = () => {
	const dispatch = useDispatch();

	const { livreurs, skip, isLoading, noMoreQuery } = useSelector((state) => state.livreur);

	const formik = useFormik({
		initialValues: INITIAL_LIVREURS_FILTER_OBJ,
	});

	const [openFilter, setOpenFilter] = useState(false);

	const TopSideButtons = ({ extraClasses, containerStyle }) => {
		const dispatch = useDispatch();

		const openAddNewClientModal = () => {
			dispatch(
				openModal({
					title: 'Creation type',
					bodyType: MODAL_BODY_TYPES.CONFIRMATION_WITH_BODY,
					extraObject: {
						message: `Which kind of client de you want to create ?`,
						type: CONFIRMATION_MODAL_CLOSE_TYPES.CLIENT_DELETE,
						// proceedFunction: () => console.log("act1"),
						// cancelFunction: () => console.log("act2"),
					},
				})
			);
			// dispatch(
			//   openModal({
			//     title: "Add Client",
			//     size: "lg",
			//     bodyType: MODAL_BODY_TYPES.CLIENT_PERSONAL_ADD_OR_EDIT,
			//   }),
			// );
		};

		return (
			<div className={`${containerStyle ? containerStyle : 'my-4'}`}>
				<button
					className={`btn px-6 normal-case btn-primary btn-outline w-full ${extraClasses}`}
					onClick={() => openAddNewClientModal()}
				>
					Add New Client
				</button>
			</div>
		);
	};

	const applyFilter = async (dispatchParams) => {
		await dispatch(getLivreursContent(dispatchParams));
	};

	const handleLoadLivreurs = async (prevPage) => {
		pageNumberRef.current = prevPage;
		if (
			!noMoreQuery &&
			!isLoading
			// scrollHeight - scrollTop <= clientHeight + 100 &&
		) {
			const dispatchParams = {
				skip: skip,
				active: formik.values.active,
				deleted: formik.values.deleted,
				limit: formik.values.limit,
				direction: formik.values.direction,
				searchPattern: formik.values.searchPattern,
				livreurInfo: formik.values.livreurInfo,
			};

			await applyFilter(dispatchParams);
		}
	};

	const onFetchLivreurs = async () => {
		dispatch(resetFrom());
		const dispatchParams = {
			skip: 0,
			active: formik.values.active,
			deleted: formik.values.deleted,
			limit: formik.values.limit,
			direction: formik.values.direction,
			searchPattern: formik.values.searchPattern,
			livreurInfo: formik.values.livreurInfo,
		};
		await applyFilter(dispatchParams);
	};

	useEffect(() => {
		onFetchLivreurs();
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
							<div className='sm:col-span-2 md:col-span-4 divider my-1'>General Filters</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 lg:gap-x-5 lg:gap-y-3'>
								<div className='mt-2'>
									<p className={'inline-block'}>Account Status</p>
									<div className='grid grid-cols-1 md:grid-cols-3 gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
										<InputCheckbox
											defaultValue={formik.values.active}
											updateType='active'
											containerStyle='md:col-span-2 mt-1'
											inputStyle='checkbox-sm checkbox-secondary '
											labelTitle='ACTIVE'
											updateFormValue={updateFormValue}
										/>
										<InputCheckbox
											defaultValue={formik.values.deleted}
											updateType='deleted'
											containerStyle='md:col-span-2 mt-1'
											inputStyle='checkbox-sm checkbox-secondary '
											labelTitle='DELETED'
											updateFormValue={updateFormValue}
										/>
									</div>
								</div>
								<div className='mt-2'>
									<p className={'inline-block'}>Direction</p>
									<div className='grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
										<SelectBox
											options={orderOptions}
											labelTitle='Period'
											updateType='direction'
											placeholder='Select desired direction'
											labelStyle='hidden'
											defaultValue={formik.values.direction}
											updateFormValue={updateFormValue}
											selectStyle={'select-sm mt-1'}
										/>
									</div>
								</div>
								<div className='mt-2'>
									<p className={'inline-block'}>Fetch Limit</p>
									<div className='grid grid-cols-1  gap-1 lg:gap-x-5 lg:gap-y-1 font-thin'>
										<SelectBox
											options={fetchLimitOptions}
											labelTitle='Period'
											updateType='limit'
											placeholder='Select desired limit'
											labelStyle='hidden'
											defaultValue={formik.values.limit}
											updateFormValue={updateFormValue}
											selectStyle={'select-sm mt-1'}
										/>
									</div>
								</div>
								<InputText
									type='text'
									defaultValue={formik.values.livreurInfo}
									updateType='livreurInfo'
									containerStyle=''
									inputStyle='input-sm'
									labelTitle='Livreur Info'
									updateFormValue={updateFormValue}
								/>
								<button
									onClick={() => onFetchLivreurs()}
									className='btn btn-outline btn-sm btn-secondary w-full sm:col-span-2 md:col-start-2 my-2'
								>
									Apply Filters
								</button>
							</div>
						</div>
					</div>
					{livreurs.length ? (
						<Livreurs
							currPage={pageNumberRef.current}
							onLoadLivreurs={handleLoadLivreurs}
							updateFormValue={updateFormValue}
						/>
					) : (
						<InfoText styleClasses={'md:grid-cols-2'}>No client found ...</InfoText>
					)}
				</div>
			)}
		</>
	);
};

export default Livreur;

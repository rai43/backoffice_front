import React, { useEffect, useState } from 'react';
import InputText from '../../components/Input/InputText';
import Datepicker from 'react-tailwindcss-datepicker';
import moment from 'moment';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../common/modalSlice';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { getDiscounts } from './discountManagementSlice';
import InfoText from '../../components/Typography/InfoText';
import DiscountList from './components/DiscountList';

const INITIAL_WALLET_FILTER_OBJ = {
	from: moment().subtract(7, 'd').format('YYYY-MM-DD'),
	to: moment().add(1, 'days').format('YYYY-MM-DD'),
	type: '',
	status: '',
};

function DiscountManagement() {
	const dispatch = useDispatch();
	const { discounts, isLoading } = useSelector((state) => state.discount);

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

	const applyFilter = async (dispatchParams) => {
		await dispatch(getDiscounts(dispatchParams));
	};

	const onFetchClients = async () => {
		const dispatchParams = {
			to: formik.values.to,
			from: formik.values.from,
		};
		applyFilter(dispatchParams);
	};

	useEffect(() => {
		const dispatchParams = {
			to: formik.values.to,
			from: formik.values.from,
		};
		applyFilter(dispatchParams);
	}, [formik.values.to]);

	return (
		<div>
			<h4>
				Discount from <span className='font-semibold'>{moment(dateValue.startDate).format('DD/MM/YYYY')}</span> to{' '}
				<span className='font-semibold'>{moment(dateValue.endDate).format('DD/MM/YYYY')}</span>
			</h4>
			<div className='divider m-0'></div>
			<div className='grid sm:grid-cols-3 gap-3 mt-2'>
				<div className=''>
					<Datepicker
						containerClassName='w-full'
						value={dateValue}
						theme={'light'}
						inputClassName='input input-bordered w-full input-sm'
						popoverDirection={'down'}
						toggleClassName='invisible'
						onChange={handleDatePickerValueChange}
						showShortcuts={true}
						primaryColor={'white'}
					/>
				</div>
				<div className='md:col-start-3'>
					<button
						className='btn btn-sm btn-outline btn-primary w-full'
						onClick={() => {
							dispatch(
								openModal({
									title: 'Add Discount',
									size: 'lg',
									bodyType: MODAL_BODY_TYPES.DISCOUNT_ADD_OR_EDIT,
									extraObject: { dateValue },
								})
							);
						}}
					>
						New Discount
					</button>
				</div>
			</div>

			{discounts.length ? (
				<>
					<DiscountList dateValue={dateValue} />
				</>
			) : (
				<InfoText styleClasses={'md:grid-cols-2'}>
					No client found from <span className='font-semibold'>{moment(dateValue.startDate).format('DD/MM/YYYY')}</span> to{' '}
					<span className='font-semibold'>{moment(dateValue.endDate).format('DD/MM/YYYY')}</span>
				</InfoText>
			)}
		</div>
	);
}

export default DiscountManagement;

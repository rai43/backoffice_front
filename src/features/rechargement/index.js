// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { resetForm } from './rechargementSlice';
// import moment from 'moment';

// const INITIAL_RECHARGEMENT_FILTER_OBJ = {
// 	transactionType: 'ALL',
// 	from: moment.utc().subtract(30, 'd').format('YYYY-MM-DD'),
// 	to: moment.utc().add(1, 'days').format('YYYY-MM-DD'),
// 	minAmount: 0,
// 	maxAmount: 0,
// 	searchPattern: '',
// };

// const Rechargements = () => {
//     const dispatch = useDispatch();
// 	const { rechargements, skip, isLoading, noMoreQuery } = useSelector((state) => state.rechargement);

//     const updateFormValue = useCallback(
// 		({ key, value }) => {
// 			console.log('key, value', key, value);
// 			formik.setValues({
// 				...formik.values,
// 				[key]: value,
// 			});
// 		},
// 		[formik]
// 	);

// 	useEffect(() => {
//         dispatch(resetForm());
//     }, []);

// 	return <div>Rechargements</div>;
// };

// export default Rechargements;

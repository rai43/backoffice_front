import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { openModal } from '../../common/modalSlice';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { classNames } from '../../../components/Common/UtilsClassNames';
import moment from 'moment';
import { COMMANDE_NUMBERS_VS_STATUS_CODE } from '../../../utils/globalConstantUtil';
import { COMMANDE_STATUS_CODE_VS_NUMBERS } from '../../../utils/globalConstantUtil';
import { setOrderStatus } from '../orderSlice';
import { showNotification } from '../../common/headerSlice';

const containFilterParams = {
	filterOptions: ['contains', 'notContains'],
	debounceMs: 200,
	maxNumConditions: 1,
};

const ClientOrdres = ({ currPage, onLoad, updateFormValue, client }) => {
	const dispatch = useDispatch();
	const { orders, skip, isLoading, noMoreQuery } = useSelector((state) => state.order);

	useEffect(() => {
		localStorage.setItem('currentPage', 0);
	}, []);

	const onDetailsClicked = (data) => {
		dispatch(
			openModal({
				title: 'Order Details',
				size: 'lg',
				extraObject: data,
				bodyType: MODAL_BODY_TYPES.ORDERS_DETAILS,
			})
		);
	};

	const onChangeLivreur = (data) => {
		dispatch(
			openModal({
				title: 'Choose the livreur',
				extraObject: { orderId: data?.id, isChangeLivreur: true },
				bodyType: MODAL_BODY_TYPES.ASSIGN_LIVREUR,
			})
		);
	};

	const onChangeStatusClicked = async (data) => {
		const status = data?.commande_commande_statuses[data?.commande_commande_statuses?.length - 1]?.commande_status?.code;
		if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] >= 5) return;
		console.log(data);
		console.log(status);
		if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] === 2) {
			dispatch(
				openModal({
					title: 'Choose the livreur',
					extraObject: { orderId: data?.id },
					bodyType: MODAL_BODY_TYPES.ASSIGN_LIVREUR,
				})
			);
		} else {
			await dispatch(setOrderStatus({ commandId: data.id })).then(async (response) => {
				if (response?.error) {
					console.log(response.error);
					dispatch(
						showNotification({
							message: 'Error while changing the order status',
							status: 0,
						})
					);
				} else {
					dispatch(
						showNotification({
							message: 'Succefully changed the order status',
							status: 1,
						})
					);
				}
			});
		}
	};

	const onCancelClicked = async (data) => {
		await dispatch(setOrderStatus({ commandId: data.id, isDelete: true })).then(async (response) => {
			if (response?.error) {
				console.log(response.error);
				dispatch(
					showNotification({
						message: 'Error while changing the order status',
						status: 0,
					})
				);
			} else {
				dispatch(
					showNotification({
						message: 'Succefully changed the order status',
						status: 1,
					})
				);
			}
		});
	};

	const columnDefs = useMemo(() => [
		{
			field: 'id',
			headerName: 'Command ID',
			width: 110,
			pinned: true,
			filterParams: 'agNumberColumnFilter',
			// filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'client.phone_number',
			headerName: 'Client',
			width: 150,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className={classNames('px-3 py-1 uppercase leading-wide font-bold')}>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'merchant.name',
			headerName: 'Merchant Name',
			width: 170,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className={classNames('p-1 uppercase leading-wide')}>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'merchant.whatsapp',
			headerName: 'Merchant Number',
			width: 150,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className={classNames('px-3 py-1 uppercase leading-wide font-bold')}>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'total',
			headerName: 'Total Paid',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{parseInt(value) || 'N/A'}</div>;
			},
		},
		{
			field: 'balance_share',
			headerName: 'Balance Share',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{parseInt(value)}</div>;
			},
		},
		{
			field: 'bonus_share',
			headerName: 'Bonus Share',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{parseInt(value)}</div>;
			},
		},
		{
			field: 'delivery_fee',
			headerName: 'Delivery Fee',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{parseInt(value)}</div>;
			},
		},
		{
			field: 'payment_method',
			headerName: 'Payment Method',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{value}</div>;
			},
		},
		{
			field: 'total_articles',
			headerName: 'Total Article',
			width: 120,
			// pinned: 'left',
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{parseInt(value) || 'N/A'}</div>;
			},
		},
		{
			field: 'commande_commande_statuses',
			headerName: 'Status',
			width: 150,
			pinned: 'right',
			filter: 'agDateColumnFilter',
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				const status = value[value?.length - 1]?.commande_status?.code;
				return (
					<span
						className={classNames(
							'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3',
							status === 'PENDING'
								? 'bg-lime-100 text-lime-700'
								: status === 'REGISTERED'
								? 'bg-yellow-100 text-yellow-700'
								: status === 'INPROCESS'
								? 'bg-blue-100 text-blue-700'
								: status === 'INDELIVERY'
								? 'bg-orange-100 text-orange-700'
								: status === 'DELIVERED'
								? 'bg-green-100 text-green-700'
								: status === 'CANCELED'
								? 'bg-red-100 text-red-700'
								: null
						)}
					>
						{status}
					</span>
				);
			},
		},
		{
			field: 'livreur',
			headerName: 'Livreur',
			width: 170,
			// pinned: 'right',
			filterParams: containFilterParams,
			onCellClicked: (params) => onChangeLivreur(params.data),
			cellRenderer: ({ value }) => {
				return (
					<>
						{value && (
							<div className='grid grid-row-2 text-xs font-semibold hover:cursor-pointer'>
								<p className={classNames('p-1 uppercase leading-wide')}>{`${value?.last_name} ${value?.first_name}`}</p>
								<p className={classNames('p-1 uppercase leading-wide')}>{`${value?.whatsapp}`}</p>
							</div>
						)}
					</>
				);
			},
		},
		{
			field: 'created_at',
			headerName: 'Registration Date',
			width: 130,
			filter: 'agDateColumnFilter',
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: (value) => {
				let formattedValue = value ? value : 'N/A';

				if (formattedValue !== 'N/A') {
					formattedValue = moment(value).format('DD/MM/YYY');
				}

				return (
					<div className='grid row-span-2 text-xs'>
						<p>
							<span className=' text-sm mr-2'>{formattedValue}</span>
						</p>
						<span className=' text-sm'>{moment(value).format('LT')}</span>
					</div>
				);
			},
		},
		{
			field: 'commande_commande_statuses',
			headerName: 'Action',
			width: 190,
			pinned: 'right',
			onCellClicked: (params) => onChangeStatusClicked(params.data),
			cellRenderer: ({ value }) => {
				const status = value[value?.length - 1]?.commande_status?.code;
				if (COMMANDE_STATUS_CODE_VS_NUMBERS[status] >= 5)
					return (
						<span
							className={classNames(
								'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3'
								// status === 'PENDING'
								// 	? 'bg-yellow-100 text-yellow-700'
								// 	: status === 'INPROCESS'
								// 	? 'bg-lime-100 text-lime-700'
								// 	: status === 'REGISTERED'
								// 	? 'bg-blue-100 text-blue-700'
								// 	: status === 'INDELIVERY'
								// 	? 'bg-orange-100 text-orange-700'
								// 	: status === 'DELIVERED'
								// 	? 'bg-green-100 text-green-700'
								// 	: status === 'CANCELED'
								// 	? 'bg-red-100 text-red-700'
								// 	: null
							)}
						>
							{status}
						</span>
					);
				return <button className='btn btn-outline btn-xs btn-primary'>MARK AS {COMMANDE_NUMBERS_VS_STATUS_CODE[(COMMANDE_STATUS_CODE_VS_NUMBERS[status] || 0) + 1]}</button>;
			},
		},
		{
			field: 'commande_commande_statuses',
			headerName: 'Cancel',
			width: 130,
			pinned: 'right',
			onCellClicked: (params) => onCancelClicked(params.data),
			cellRenderer: ({ value }) => {
				const status = value[value?.length - 1]?.commande_status?.code;
				return (
					<div className='flex items-center justify-center '>
						{status === 'CANCELED' || status === 'DELIVERED' ? (
							<span className='px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3'>N/A</span>
						) : (
							<button className='btn btn-outline btn-xs btn-error mt-2'>X</button>
						)}
					</div>
				);
			},
		},
	]);

	const columnDefsSm = useMemo(() => [
		{
			field: 'id',
			headerName: 'Command ID',
			width: 110,
			pinned: true,
			filterParams: 'agNumberColumnFilter',
			// filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>{value}</p>
					// </div>
				);
			},
		},

		{
			field: 'total',
			headerName: 'Total Paid',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => onDetailsClicked(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{parseInt(value) || 'N/A'}</div>;
			},
		},

		{
			field: 'livreur',
			headerName: 'Livreur',
			width: 170,
			// pinned: 'right',
			filterParams: containFilterParams,
			onCellClicked: (params) => onChangeLivreur(params.data),
			cellRenderer: ({ value }) => {
				return (
					<>
						{value && (
							<div className='grid grid-row-2 text-xs font-semibold hover:cursor-pointer'>
								<p className={classNames('p-1 uppercase leading-wide')}>{`${value?.last_name} ${value?.first_name}`}</p>
								<p className={classNames('p-1 uppercase leading-wide')}>{`${value?.whatsapp}`}</p>
							</div>
						)}
					</>
				);
			},
		},
	]);

	return (
		<div>
			<div className='overflow-hidden mt-3'>
				{!isLoading && (
					<>
						<div className='ag-theme-alpine h-[40rem] hidden md:block'>
							<AgGridReact
								columnDefs={columnDefs}
								rowData={orders}
								defaultColDef={AG_GRID_DEFAULT_COL_DEF}
								pagination={true}
								paginationPageSize={20}
								rowHeight={50}
								on
								onPaginationChanged={async (params) => {
									let currentPage = params.api.paginationGetCurrentPage();
									let totalPages = params.api.paginationGetTotalPages();
									console.log(currentPage, totalPages);
									if (params.newPage) {
										localStorage.setItem('currentPage', JSON.stringify(currentPage));
										localStorage.removeItem('oldPage');
									}
									if (currentPage === totalPages - 1 && currentPage !== 0 && currentPage !== 0) {
										localStorage.setItem('oldPage', JSON.stringify(currentPage));
										await onLoad();
										const pageToNavigate = JSON.parse(localStorage.getItem('oldPage'));
										params.api.paginationGoToPage(pageToNavigate);
									}
								}}
								onFirstDataRendered={(params) => {
									const pageToNavigate = JSON.parse(localStorage.getItem('currentPage'));
									const oldPageToNavigate = JSON.parse(localStorage.getItem('oldPage'));
									params.api.paginationGoToPage(oldPageToNavigate ? oldPageToNavigate : pageToNavigate);
									// params.api.paginationGoToPage(pageToNavigate);
								}}
								onFilterChanged={function (gridOptions) {
									console.log(gridOptions);

									const searchedField = gridOptions?.columns[0]?.colId;

									if (searchedField === 'id') {
										const filterInstanceId = gridOptions.api.getFilterInstance('id');
										const filterValueId = filterInstanceId ? filterInstanceId.getModel() : null;

										console.log('searchedField', searchedField);
										if (filterValueId) {
											const searchPattern = filterValueId?.filter; // Access the filter value
											console.log('Search pattern1:', searchPattern);
											updateFormValue({ key: 'searchPatternId', value: searchPattern });
											// Perform your search or update logic here with searchPattern
										}
									} else if (searchedField === 'client.phone_number') {
										const filterInstanceMerchantNumber = gridOptions.api.getFilterInstance('client.phone_number');
										const filterValueMerchantNumber = filterInstanceMerchantNumber ? filterInstanceMerchantNumber.getModel() : null;

										if (filterValueMerchantNumber) {
											const searchPattern = filterValueMerchantNumber?.filter; // Access the filter value
											console.log('Search pattern1:', searchPattern);
											// updateFormValue({ key: 'searchPattern', value: searchPattern });
											// Perform your search or update logic here with searchPattern
										}
									}

									// filterValue will contain the current filter value
								}}
								// onSelectionChanged={(val) => {
								// 	const selectedObject = val.api.getSelectedRows()[0];
								// 	openModal({
								// 		...annualCheckupModalConfig,
								// 		title: selectedObject.label,
								// 		extraObject: {
								// 			data: selectedObject,
								// 			config: { openInReadOnlyMode: true },
								// 		},
								// 	});
								// }}
								rowSelection='single'
							/>
						</div>
						<div className='ag-theme-alpine h-[40rem] md:hidden'>
							<AgGridReact
								columnDefs={columnDefsSm}
								rowData={orders}
								defaultColDef={AG_GRID_DEFAULT_COL_DEF}
								pagination={true}
								paginationPageSize={20}
								rowHeight={50}
								on
								onPaginationChanged={async (params) => {
									let currentPage = params.api.paginationGetCurrentPage();
									let totalPages = params.api.paginationGetTotalPages();
									console.log(currentPage, totalPages);
									if (params.newPage) {
										localStorage.setItem('currentPage', JSON.stringify(currentPage));
										localStorage.removeItem('oldPage');
									}
									if (currentPage === totalPages - 1 && currentPage !== 0 && currentPage !== 0) {
										localStorage.setItem('oldPage', JSON.stringify(currentPage));
										await onLoad();
										const pageToNavigate = JSON.parse(localStorage.getItem('oldPage'));
										params.api.paginationGoToPage(pageToNavigate);
									}
								}}
								onFirstDataRendered={(params) => {
									const pageToNavigate = JSON.parse(localStorage.getItem('currentPage'));
									const oldPageToNavigate = JSON.parse(localStorage.getItem('oldPage'));
									params.api.paginationGoToPage(oldPageToNavigate ? oldPageToNavigate : pageToNavigate);
									// params.api.paginationGoToPage(pageToNavigate);
								}}
								onFilterChanged={function (gridOptions) {
									console.log(gridOptions);

									const searchedField = gridOptions?.columns[0]?.colId;

									if (searchedField === 'id') {
										const filterInstanceId = gridOptions.api.getFilterInstance('id');
										const filterValueId = filterInstanceId ? filterInstanceId.getModel() : null;

										console.log('searchedField', searchedField);
										if (filterValueId) {
											const searchPattern = filterValueId?.filter; // Access the filter value
											console.log('Search pattern1:', searchPattern);
											updateFormValue({ key: 'searchPatternId', value: searchPattern });
											// Perform your search or update logic here with searchPattern
										}
									} else if (searchedField === 'client.phone_number') {
										const filterInstanceMerchantNumber = gridOptions.api.getFilterInstance('client.phone_number');
										const filterValueMerchantNumber = filterInstanceMerchantNumber ? filterInstanceMerchantNumber.getModel() : null;

										if (filterValueMerchantNumber) {
											const searchPattern = filterValueMerchantNumber?.filter; // Access the filter value
											console.log('Search pattern1:', searchPattern);
											// updateFormValue({ key: 'searchPattern', value: searchPattern });
											// Perform your search or update logic here with searchPattern
										}
									}

									// filterValue will contain the current filter value
								}}
								// onSelectionChanged={(val) => {
								// 	const selectedObject = val.api.getSelectedRows()[0];
								// 	openModal({
								// 		...annualCheckupModalConfig,
								// 		title: selectedObject.label,
								// 		extraObject: {
								// 			data: selectedObject,
								// 			config: { openInReadOnlyMode: true },
								// 		},
								// 	});
								// }}
								rowSelection='single'
							/>
						</div>
						{/* <Table
							columns={columns}
							data={orders}
							currPage={currPage}
							onLoad={onLoad}
							updateFormValue={updateFormValue}
						/> */}
					</>
				)}
			</div>
		</div>
	);
};

export default ClientOrdres;

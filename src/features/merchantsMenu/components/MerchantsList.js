import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../../common/modalSlice';
import { MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { AvatarCell, AvatarCellForMerchant, DateCell, MerchantArticlesAndAccompagnementPill } from '../../../components/Table/Table';
import Table from '../../../components/Table/Table';
import { AG_GRID_DEFAULT_COL_DEF } from '../../../utils/globalConstantUtil';
import { classNames } from '../../../components/Common/UtilsClassNames';
import moment from 'moment';

const containFilterParams = {
	filterOptions: ['contains', 'notContains'],
	debounceMs: 200,
	maxNumConditions: 1,
};

const MerchantsList = ({ onLoadMerchants, currPage, updateFormValue }) => {
	const dispatch = useDispatch();
	const { articles, from, isLoading, noMoreQuery } = useSelector((state) => state.article);

	const defaultColDef = useMemo(() => {
		return {
			flex: 1,
			minWidth: 150,
			filter: true,
			sortable: true,
		};
	}, []);

	// Opening right sidebar for user details
	const openMerchantDetails = (menu) => {
		dispatch(
			openModal({
				title: `Menu Details View - ${menu?.id}`,
				size: 'lg',
				bodyType: MODAL_BODY_TYPES.MERCHANT_DETAILS,
				extraObject: menu,
			})
		);
	};

	const columnDefs = useMemo(() => [
		{
			field: 'id',
			headerName: 'Article ID',
			width: 120,
			pinned: true,
			// filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className={classNames('px-3 py-1 uppercase leading-wide font-bold text-primary')}>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'title',
			headerName: 'Title',
			width: 170,
			filterParams: containFilterParams,
			pinned: true,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return (
					// <div className='flex items-center justify-center'>
					<p className='uppercase break-all overflow-hidden'>{value}</p>
					// </div>
				);
			},
		},
		{
			field: 'price',
			headerName: 'Price',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center font-semibold'>{parseInt(value) || 'N/A'}</div>;
			},
		},
		{
			field: 'category.name',
			headerName: 'Category',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return <div className='flex items-center justify-center uppercase'>{value || 'N/A'}</div>;
			},
		},
		{
			field: 'merchant.name',
			headerName: 'Merchant Name',
			// width: 120,
			filter: 'agTextColumnFilter',
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			// cellRenderer: ({ value }) => {
			// 	return <div className='uppercase overflow-auto'>{value || 'N/A'}</div>;
			// },
		},
		{
			field: 'merchant.client.phone_number',
			headerName: 'Merchant Phone',
			width: 150,
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return <div className='uppercase overflow-auto'>{value || 'N/A'}</div>;
			},
		},
		{
			field: 'merchant.whatsapp',
			headerName: 'WhatsApp',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return <div className='uppercase overflow-auto'>{value || 'N/A'}</div>;
			},
		},
		{
			field: 'status',
			headerName: 'Status',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return <div className='font-semibold uppercase overflow-auto'>{value || 'N/A'}</div>;
			},
		},
		{
			field: 'discount',
			headerName: 'Discount',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return <div className='uppercase overflow-auto'>{value}</div>;
			},
		},
		{
			field: 'available',
			headerName: 'Availability',
			width: 120,
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return <div className='uppercase overflow-auto'>{value ? 'available' : 'not available'}</div>;
			},
		},
		{
			field: 'created_at',
			headerName: 'Registration Date',
			width: 130,
			filter: 'agDateColumnFilter',
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				let formattedValue = value ? value : 'N/A';

				if (formattedValue !== 'N/A') {
					formattedValue = moment(value).format('DD/MM/YYYY');
				}

				return (
					<div className='grid row-span-2 text-xs'>
						<p>
							<span className=' text-sm mr-2'>{formattedValue}</span>
						</p>
						<span className=' text-sm'>{moment(value).format('HH:mm')}</span>
					</div>
				);
			},
		},
		{
			field: 'image',
			headerName: 'Image',
			width: 90,
			pinned: 'right',
			filterParams: containFilterParams,
			onCellClicked: (params) => openMerchantDetails(params.data),
			cellRenderer: ({ value }) => {
				return (
					<div className='avatar'>
						<div className='w-12 rounded-full'>
							<img
								src={value}
								alt='food'
							/>
						</div>
					</div>
				);
			},
		},
	]);

	return (
		<div className='overflow-hidden mt-2'>
			{!isLoading && (
				<>
					<div className='ag-theme-alpine h-[40rem]'>
						<AgGridReact
							columnDefs={columnDefs}
							rowData={articles}
							defaultColDef={AG_GRID_DEFAULT_COL_DEF}
							// defaultColDef={defaultColDef}
							pagination={true}
							paginationPageSize={20}
							rowHeight={50}
							sideBar={'filters'}
							// Add the onFilterChanged event handler
							onFilterChanged={function (gridOptions) {
								const filterInstanceId = gridOptions.api.getFilterInstance('id');
								const filterValueId = filterInstanceId ? filterInstanceId.getModel() : null;
								const filterInstanceTitle = gridOptions.api.getFilterInstance('title');
								const filterValueTitle = filterInstanceTitle ? filterInstanceTitle.getModel() : null;

								// filterValue will contain the current filter value
								if (filterValueId || filterValueTitle) {
									const searchPattern1 = filterValueId?.filter; // Access the filter value
									const searchPattern2 = filterValueTitle?.filter; // Access the filter value
									console.log('Search pattern1:', searchPattern1);
									console.log('Search pattern:', searchPattern2);
									// Perform your search or update logic here with searchPattern
								}
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
						data={articles}
						currPage={currPage}
						onLoad={onLoadMerchants}
						updateFormValue={updateFormValue}
						// showFilter
					/> */}
				</>
			)}
		</div>
	);
};

export default MerchantsList;

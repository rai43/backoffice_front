import React, { useMemo } from 'react';
import Table, { AmountCell, CashFlowCell, DateCell, IndeterminateCheckbox, ReferenceAndPaymentTypeCell } from '../../../components/Table/Table';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';

import { openModal } from '../../common/modalSlice';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import moment from 'moment';
import { classNames } from '../../../components/Common/UtilsClassNames';

const containFilterParams = {
	filterOptions: ['contains', 'notContains'],
	debounceMs: 200,
	maxNumConditions: 1,
};

const STREET_NUMBERS = ['0700000000', '0700000001', '0700000002'];

const UsersTransactions = ({ transactions, currPage, onLoad, updateFormValue, client }) => {
	const dispatch = useDispatch();

	const onDetailsClicked = (data) => {
		dispatch(
			openModal({
				title: 'Transaction Details',
				size: 'lg',
				extraObject: data,
				bodyType: MODAL_BODY_TYPES.TRANSACTIONS_DETAILS,
			})
		);
	};

	const { skip, isLoading, noMoreQuery } = useSelector((state) => state.transaction);

	const columnDefs = useMemo(
		() => [
			{
				field: 'transaction_type.libelle',
				headerName: 'Transaction Type',
				width: 140,
				pinned: true,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value }) => {
					return (
						// <div className='flex items-center justify-center'>
						<p className={classNames('px-3 py-1 uppercase leading-wide font-bold  ')}>{value}</p>
						// </div>
					);
				},
			},
			{
				field: 'reference',
				headerName: 'Reference',
				width: 150,
				pinned: true,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value }) => {
					return (
						// <div className='flex items-center justify-center'>
						<p className={classNames('px-3 py-1 uppercase leading-wide font-bold  text-blue-700')}>{value}</p>
						// </div>
					);
				},
			},
			{
				field: 'sender_wallet.client.phone_number',
				headerName: 'Sender',
				width: 130,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value }) => {
					return (
						// <div className='flex items-center justify-center'>
						<p className={classNames('px-3 py-1 uppercase leading-wide font-bold ')}>{!STREET_NUMBERS.includes(value) && value}</p>
						// </div>
					);
				},
			},
			{
				field: 'sender_wallet.wallet_type.libelle',
				headerName: 'Sender Type',
				width: 140,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value, data }) => {
					const phone_number = data?.sender_wallet?.client?.phone_number;
					return (
						<div className='flex items-center justify-center'>
							<span
								className={classNames(
									'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3',
									!STREET_NUMBERS.includes(phone_number)
										? 'bg-green-100 text-green-700'
										: value === 'PERSONAL'
										? 'bg-violet-100 text-violet-700'
										: value === 'MERCHANT'
										? 'bg-blue-100 text-blue-700'
										: null
								)}
							>
								{!STREET_NUMBERS.includes(phone_number) ? value : 'STREET'}
							</span>
						</div>
					);
				},
			},
			{
				field: 'amount',
				headerName: 'Amount',
				width: 110,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value }) => {
					return <div className='flex items-center justify-center font-semibold'>{value}</div>;
				},
			},
			{
				field: 'receiver_wallet.client.phone_number',
				headerName: 'Receiver',
				width: 130,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value }) => {
					return (
						// <div className='flex items-center justify-center'>
						<p className={classNames('px-3 py-1 uppercase leading-wide font-bold ')}>{value}</p>
						// </div>
					);
				},
			},
			{
				field: 'receiver_wallet.wallet_type.libelle',
				headerName: 'Receiver Type',
				width: 140,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value, data }) => {
					const phone_number = data?.sender_wallet?.client?.phone_number;
					return (
						<div className='flex items-center justify-center'>
							<span
								className={classNames(
									'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm mt-3',
									!STREET_NUMBERS.includes(phone_number)
										? 'bg-green-100 text-green-700'
										: value === 'PERSONAL'
										? 'bg-violet-100 text-violet-700'
										: value === 'MERCHANT'
										? 'bg-blue-100 text-blue-700'
										: null
								)}
							>
								{!STREET_NUMBERS.includes(phone_number) ? value : 'STREET'}
							</span>
						</div>
					);
				},
			},
			{
				field: 'commande.balance_share',
				headerName: 'Balance Shared',
				width: 140,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value }) => {
					return <div className='flex items-center justify-center font-semibold'>{value}</div>;
				},
			},
			{
				field: 'commande.bonus_share',
				headerName: 'Bonus Shared',
				width: 140,
				filterParams: containFilterParams,
				onCellClicked: (params) => onDetailsClicked(params.data),
				cellRenderer: ({ value }) => {
					return <div className='flex items-center justify-center font-semibold'>{value}</div>;
				},
			},
			{
				field: 'created_at',
				headerName: 'Registration Date',
				width: 130,
				// pinned: 'right',
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
								<span className='font-semibold text-sm mr-2'>{formattedValue}</span>
							</p>
							<span className='font-semibold text-sm'>{moment(value).format('LT')}</span>
						</div>
					);
				},
			},
		],
		[]
	);


	return (
		<div>
			<div className='overflow-hidden mt-2'>
				{!isLoading && (
					<>
						<div className='ag-theme-alpine h-[40rem]'>
							<AgGridReact
								columnDefs={columnDefs}
								rowData={transactions}
								defaultColDef={AG_GRID_DEFAULT_COL_DEF}
								pagination={true}
								paginationPageSize={20}
								rowHeight={50}
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
					</>
				)}
			</div>
		</div>
	);
};

export default UsersTransactions;

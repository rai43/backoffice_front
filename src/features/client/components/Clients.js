import React, { useMemo } from 'react';
import cliTruncate from 'cli-truncate';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import streetLogo from '../../../assets/street_logo.jpeg';

import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { openModal } from '../../common/modalSlice';

import { classNames } from '../../../components/Common/UtilsClassNames';
import moment from 'moment';

const Clients = ({ onLoadClients, currPage, updateFormValue, firstActionButton, handleClientEdit, handleClientDelete }) => {
	const dispatch = useDispatch();
	const { clients, from, isLoading, noMoreQuery } = useSelector((state) => state.client);
	console.log('clients', clients);
	// Opening right sidebar for user details
	const openClientDetails = (client) => {
		dispatch(
			openModal({
				title: `Details View - ${client.phone_number}`,
				size: 'lg',
				bodyType: MODAL_BODY_TYPES.CLIENT_DETAILS,
				extraObject: client,
			})
		);
		// dispatch(
		//   openRightDrawer({
		//     header: `Details View - ${client.phone_number}`,
		//     bodyType: RIGHT_DRAWER_TYPES.CLIENT_DETAILS,
		//     extraObject: client,
		//   }),
		// );
	};

	const containFilterParams = {
		filterOptions: ['contains', 'notContains'],
		debounceMs: 200,
		maxNumConditions: 1,
	};

	const columnDefs = useMemo(
		() => [
			{
				field: 'phone_number',
				headerName: 'Client',
				width: 250,
				// pinned: true,
				filterParams: containFilterParams,
				cellRenderer: ({ value, data }) => {
					const TYPE_OBJ = data.client_type;
					const NAME = data.name;
					const MERCHANT_NAME = data.merchant_name;
					return (
						<div className='flex items-center cursor-pointer'>
							{TYPE_OBJ['code'] === 'MARCH' && (
								<div className='flex-shrink-0 h-10 w-10'>
									<img
										className='h-10 w-10 rounded-full'
										src={data?.photo && data?.photo?.startsWith('http') ? data?.photo : streetLogo}
										// src={row.original[column.imgAccessor]}
										alt='The merchant logo'
									/>
								</div>
							)}
							<div className='ml-4 text-sm'>
								<div className='font-medium text-gray-900'>
									{value} {NAME ? `(${NAME})` : ''}
								</div>
								<div className={`${TYPE_OBJ['code'] === 'MARCH' ? 'text-primary' : 'text-gray-500'}`}>
									{MERCHANT_NAME ? cliTruncate(MERCHANT_NAME.toLocaleUpperCase(), 30) : data?.client_type?.libelle || 'N/A'}
								</div>
							</div>
						</div>
					);
				},
				// cellRenderer: AgTableClickComponent,
				// cellClass: cellClass,
				onCellClicked: (params) => openClientDetails(params.data),
			},
			{
				field: 'wallets',
				headerName: 'Personal Wallet',
				width: 160,
				filterParams: containFilterParams,
				onCellClicked: (params) => openClientDetails(params.data),
				cellRenderer: ({ value, data }) => {
					const wallets = data.wallets;
					const personalWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'PERSO');
					return (
						<div className='flex items-center justify-center'>
							<p
								className={classNames(
									'px-3 py-1 uppercase leading-wide font-bold text-md',
									personalWallet?.balance >= 0 ? ' text-blue-700' : null,
									!personalWallet ? 'text-red-700' : null
								)}
							>
								{personalWallet?.balance >= 0 ? personalWallet?.balance : 'N/A'}
							</p>
						</div>
					);
				},
			},
			{
				field: 'wallets',
				headerName: 'Bonus Wallet',
				width: 150,
				filterParams: containFilterParams,
				onCellClicked: (params) => openClientDetails(params.data),
				cellRenderer: ({ value, data }) => {
					const wallets = data.wallets;
					const personalWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'PERSO');
					return (
						<div className='flex items-center justify-center'>
							<p
								className={classNames(
									'px-3 py-1 uppercase leading-wide font-bold text-md',
									personalWallet?.bonus >= 0 ? ' text-blue-700' : null,
									!personalWallet ? 'text-red-700' : null
								)}
							>
								{personalWallet?.bonus >= 0 ? personalWallet?.bonus : 'N/A'}
							</p>
						</div>
					);
				},
			},
			{
				field: 'wallets',
				headerName: 'Merchant Wallet',
				width: 170,
				filterParams: containFilterParams,
				onCellClicked: (params) => openClientDetails(params.data),
				cellRenderer: ({ value, data }) => {
					const wallets = data.wallets;
					const marchantWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'MARCH');
					console.log(marchantWallet);
					return (
						<div className='flex items-center justify-center'>
							<p
								className={classNames(
									'px-3 py-1 uppercase leading-wide font-bold text-md',
									marchantWallet?.balance >= 0 ? ' text-green-700' : null,
									!marchantWallet ? 'text-neutral' : null
								)}
							>
								{marchantWallet?.balance >= 0 ? marchantWallet?.balance : 'N/A'}
							</p>
						</div>
					);
				},
			},
			{
				field: 'created_at',
				headerName: 'Registration Date',
				width: 200,
				// pinned: 'right',
				filter: 'agDateColumnFilter',
				onCellClicked: (params) => openClientDetails(params.data),
				cellRenderer: (value) => {
					let formattedValue = value ? value : 'N/A';

					if (formattedValue !== 'N/A') {
						formattedValue = moment(value).format('LLL');
					}

					return <span className='font-semibold text-md'>{formattedValue}</span>;
				},
			},
		],
		[]
	);

	return (
		<div className='overflow-hidden mt-2'>
			{!isLoading && (
				<>
					<div className='ag-theme-alpine h-[40rem]'>
						<AgGridReact
							columnDefs={columnDefs}
							rowData={clients}
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
	);
};

export default Clients;

import React, { useMemo } from 'react';
import cliTruncate from 'cli-truncate';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';

import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { openModal } from '../../common/modalSlice';
import moment from 'moment';
import { classNames } from '../../../components/Common/UtilsClassNames';

const containFilterParams = {
	filterOptions: ['contains', 'notContains'],
	debounceMs: 200,
	maxNumConditions: 1,
};

const Livreurs = ({ onLoadLivreurs, currPage, updateFormValue }) => {
	const dispatch = useDispatch();
	const { livreurs, from, isLoading, noMoreQuery } = useSelector((state) => state.livreur);

	// Opening right sidebar for user details
	const openLivreurDetails = (livreur) => {
		dispatch(
			openModal({
				title: `Details View - ${livreur.phone_number}`,
				size: 'lg',
				bodyType: MODAL_BODY_TYPES.CLIENT_DETAILS,
				extraObject: livreur,
			})
		);
	};

	const columnDefs = useMemo(
		() => [
			{
				field: 'phone_number',
				headerName: 'Client',
				width: 210,
				// pinned: true,
				filterParams: containFilterParams,
				cellRenderer: ({ value, data }) => {
					const TYPE_OBJ = data.client_type;
					const NAME = data.name;
					const MERCHANT_NAME = data.merchant_name;
					return (
						<div className='flex items-center cursor-pointer'>
							<div className='ml-4'>
								<div className='text-md font-medium text-gray-900'>
									{value} {NAME ? `(${NAME})` : ''}
								</div>
								<div className={`text-md  ${TYPE_OBJ['code'] === 'MARCH' ? 'text-primary' : 'text-gray-500'}`}>LIVREUR</div>
							</div>
						</div>
					);
				},
				// cellRenderer: AgTableClickComponent,
				// cellClass: cellClass,
				onCellClicked: (params) => openLivreurDetails(params.data),
			},
			{
				field: 'wallets.0.balance',
				headerName: 'Livreur Wallet',
				width: 210,
				filterParams: containFilterParams,
				onCellClicked: (params) => openLivreurDetails(params.data),
				cellRenderer: ({ value, data }) => {
					const wallets = data.wallets;
					const personalWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'LIVREUR');
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
				field: 'wallets.0.bonus',
				headerName: 'Livreur Bonus Wallet',
				width: 210,
				filterParams: containFilterParams,
				onCellClicked: (params) => openLivreurDetails(params.data),
				cellRenderer: ({ value, data }) => {
					const wallets = data.wallets;
					const personalWallet = wallets.find((wallet) => wallet?.wallet_type?.code === 'LIVREUR');
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
				field: 'created_at',
				headerName: 'Registration Date',
				width: 200,
				// pinned: 'right',
				filter: 'agDateColumnFilter',
				onCellClicked: (params) => openLivreurDetails(params.data),
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
							rowData={livreurs}
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

export default Livreurs;

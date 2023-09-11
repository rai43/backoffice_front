import React from 'react';
import Table, { AmountCell, CashFlowCell, DateCell, OperatorPill, RechargementPreviousBalance, ReferenceAndPaymentTypeCell, StatusRechargementPill } from '../../../components/Table/Table';
import { useDispatch, useSelector } from 'react-redux';

const ClientRechargementsTable = ({ currPage, onLoad, updateFormValue, client }) => {
	const dispatch = useDispatch();
	const { rechargements, skip, isLoading, noMoreQuery } = useSelector((state) => state.rechargement);
	const columns = React.useMemo(
		() => [
			{
				Header: 'Rechargement Reference',
				accessor: 'reference',
				Cell: (props) => <ReferenceAndPaymentTypeCell {...props} />,
				paymentTypeObjAccessor: 'type',
			},
			{
				Header: 'Operator',
				accessor: 'operator.code',
				operatorObj: 'operator',
				Cell: (props) => <OperatorPill {...props} />,
			},
			// {
			// 	Header: 'Previous Wallet Status',
			// 	accessor: 'previous_balance',
			// 	previousAmountAccessor: 'previous_balance',
			// 	previousBonusAccessor: 'previous_bonus',
			// 	Cell: (props) => <RechargementPreviousBalance {...props} />,
			// },
			{
				Header: 'Top Up Amount',
				accessor: 'amount',
				amountAccessor: 'amount',
				Cell: (props) => <RechargementPreviousBalance {...props} />,
			},
			{
				Header: 'Wallet Status',
				accessor: 'wallet.balance',
				walletAccessor: 'wallet',
				Cell: (props) => <RechargementPreviousBalance {...props} />,
			},
			// {
			// 	Header: 'Wallet Status',
			// 	accessor: 'wallet.balance',
			// 	walletAccessor: 'wallet',
			// 	Cell: (props) => <RechargementPreviousBalance {...props} />,
			// },

			{
				Header: 'Status',
				accessor: 'status',
				Cell: (props) => <StatusRechargementPill {...props} />,
			},
			{
				Header: 'Date',
				accessor: 'created_at',
				Cell: DateCell,
			},
		],
		[]
	);

	return (
		<div>
			<div className='overflow-hidden mt-2'>
				{!isLoading && (
					<Table
						columns={columns}
						data={rechargements}
						currPage={currPage}
						onLoad={onLoad}
						updateFormValue={updateFormValue}
					/>
				)}
			</div>
		</div>
	);
};

export default ClientRechargementsTable;

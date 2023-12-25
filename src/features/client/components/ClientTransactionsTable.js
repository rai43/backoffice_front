import React from 'react';
import Table, {
  AmountCell,
  CashFlowCell,
  DateCell,
  IndeterminateCheckbox,
  ReferenceAndPaymentTypeCell
} from '../../../components/Table/Table';
import { useDispatch, useSelector } from 'react-redux';

const ClientTransactionsTable = ({ currPage, onLoad, updateFormValue, client }) => {
  const dispatch = useDispatch();
  const { transactions, skip, isLoading, noMoreQuery } = useSelector((state) => state.transaction);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Transaction Reference',
        accessor: 'reference',
        Cell: (props) => <ReferenceAndPaymentTypeCell {...props} onDetailsClicked={() => {}} />,
        paymentTypeObjAccessor: 'transaction_type'
      },
      {
        Header: 'Cash Flow',
        accessor: 'id',
        Cell: (props) => <CashFlowCell {...props} />,
        SenderObjAccessor: 'sender_wallet',
        ReceiverObjAccessor: 'receiver_wallet',
        transactionTypeObjAccessor: 'transaction_type'
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        SenderObjAccessor: 'sender_wallet',
        Cell: (props) => <AmountCell {...props} client={client} />
      },
      {
        Header: 'Transaction Date',
        accessor: 'created_at',
        Cell: DateCell
      }
    ],
    []
  );

  return (
    <div>
      <div className="overflow-hidden mt-2">
        {!isLoading && (
          <Table
            columns={columns}
            data={transactions}
            currPage={currPage}
            onLoad={onLoad}
            updateFormValue={updateFormValue}
          />
        )}
      </div>
    </div>
  );
};

export default ClientTransactionsTable;

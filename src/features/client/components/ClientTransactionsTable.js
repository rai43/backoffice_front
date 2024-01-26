import React from 'react';

import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { IoReload } from 'react-icons/io5';

/**
 * A functional component that renders a table displaying client transactions.
 *
 * @param {Function} onLoad - A callback function that is called when the load more button is clicked.
 * @returns {JSX.Element} The table component with the transactions listed.
 */
const ClientTransactionsTable = ({ onLoad }) => {
  const dispatch = useDispatch();
  // Accessing transactions from the Redux store's transaction state.
  const { transactions, noMoreQuery } = useSelector((state) => state.transaction);

  // Handler for the load more button.
  const handleLoadMore = () => {
    // onLoad is expected to be an action creator or a dispatchable function
    dispatch(onLoad);
  };

  return (
    <>
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{tx.status}</td>
                  <td>{tx.type}</td>
                  <td
                    className={`font-semibold ${tx.credited ? 'text-green-700' : 'text-red-700'}`}>
                    {tx.credited ? `+ ${tx.credited}` : `- ${tx.debited}`}
                  </td>
                  <td>{moment.utc(tx.created_at).format('DD-MM-YYYY HH:mm')}</td>
                  <td className="uppercase">{tx.description}</td>
                  <td className="uppercase">{tx.status_description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center font-semibold text-primary">No transaction found</div>
      )}
      {transactions.length > 0 && !noMoreQuery && (
        <div className="flex justify-center my-4">
          <button className="btn btn-outline" onClick={handleLoadMore}>
            <IoReload className="w-5 h-5 mr-2" />
            Load More
          </button>
        </div>
      )}
    </>
  );
};

export default ClientTransactionsTable;

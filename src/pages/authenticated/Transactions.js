import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Transactions from '../../features/transaction';
import { resetTableTransactionSettings } from '../../features/common/transactionsTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableTransactionSettings());
    dispatch(setPageTitle({ title: 'Transactions' }));
  }, []);

  return <Transactions />;
}

export default InternalPage;

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Customers from '../../features/client';
import { resetTableCustomerSettings } from '../../features/common/CustomersTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableCustomerSettings());
    dispatch(setPageTitle({ title: 'Customers' }));
  }, []);

  return <Customers />;
}

export default InternalPage;

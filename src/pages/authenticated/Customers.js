import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import CustomersManager from '../../features/client';
import { resetTableCustomerSettings } from '../../features/common/CustomersTableSlice';
import { setPageTitle } from '../../features/common/headerSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableCustomerSettings());
    dispatch(setPageTitle({ title: 'Customers' }));
  }, []);

  return <CustomersManager />;
}

export default InternalPage;

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Order from '../../features/order';
import { resetTableOrdersSettings } from '../../features/common/ordersTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableOrdersSettings());
    dispatch(setPageTitle({ title: 'Orders' }));
  }, []);

  return <Order />;
}

export default InternalPage;

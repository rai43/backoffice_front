import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import DynamicAssignment from '../../features/DynamicAssignment/index';
import { resetTableDiscountManagementSettings } from '../../features/common/discountManagementTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableDiscountManagementSettings());
    dispatch(setPageTitle({ title: 'Dynamic Livreurs Assignment' }));
  }, []);

  return <DynamicAssignment />;
}

export default InternalPage;

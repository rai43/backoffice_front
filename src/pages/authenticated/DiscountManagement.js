import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import DiscountManagement from '../../features/discountManagement';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Discount Management' }));
  }, []);

  return <DiscountManagement />;
}

export default InternalPage;

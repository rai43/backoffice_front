import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { setPageTitle } from '../../features/common/headerSlice';
import Partnership from '../../features/partnership';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Partnership' }));
  }, []);

  return <Partnership />;
}

export default InternalPage;

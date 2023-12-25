import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Livreur from '../../features/livreurs';
import { resetTableLivreurSettings } from '../../features/common/livreursTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableLivreurSettings());
    dispatch(setPageTitle({ title: 'Livreurs' }));
  }, []);

  return <Livreur />;
}

export default InternalPage;

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ParcelsManagement from '../../features/colis';
import { setPageTitle } from '../../features/common/headerSlice';
import { resetTableParcelsManagementSettings } from '../../features/common/parcelsManagementTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableParcelsManagementSettings());
    dispatch(setPageTitle({ title: 'Parcels Management' }));
  }, []);

  return <ParcelsManagement />;
}

export default InternalPage;

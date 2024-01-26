import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import ReturnParcelsManagement from '../../features/colis/ReturnParcels';
import { setPageTitle } from '../../features/common/headerSlice';
import { resetTableParcelsManagementSettings } from '../../features/common/returnParcelsManagementTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableParcelsManagementSettings());
    dispatch(setPageTitle({ title: 'Return Parcels Management' }));
  }, []);

  return <ReturnParcelsManagement />;
}

export default InternalPage;

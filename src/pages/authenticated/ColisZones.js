import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import ColisZones from '../../features/colis/colisZones';
import { setPageTitle } from '../../features/common/headerSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Colis Zones' }));
  }, []);

  return <ColisZones />;
}

export default InternalPage;

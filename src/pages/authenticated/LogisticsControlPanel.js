import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { resetTableControlPanelSettings } from '../../features/common/colisControlPanelTableSlice';
import { setPageTitle } from '../../features/common/headerSlice';
import ColisControlPanel from '../../features/colis/controlPanel';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableControlPanelSettings());
    dispatch(setPageTitle({ title: 'Logistics Control Panel' }));
  }, []);

  return <ColisControlPanel />;
}

export default InternalPage;

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import MerchantsSettings from '../../features/merchantsSettings';
import { resetTableMerchantSettingsSettings } from '../../features/common/merchantSettingsTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableMerchantSettingsSettings());
    dispatch(setPageTitle({ title: 'Merchants Settings' }));
  }, []);

  return <MerchantsSettings />;
}

export default InternalPage;

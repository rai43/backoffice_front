import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import MerchantsMenu from '../../features/merchantsMenu';
import { resetTableMerchantMenuSettings } from '../../features/common/merchantMenuTableSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableMerchantMenuSettings());
    dispatch(setPageTitle({ title: 'Merchants Menu' }));
  }, []);

  return <MerchantsMenu />;
}

export default InternalPage;

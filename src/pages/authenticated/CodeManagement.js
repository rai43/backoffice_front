import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import CodeManagement from '../../features/codeManagement';
import { resetTableCodeManagementSettings } from '../../features/common/codeManagementTableSlice';
import { setPageTitle } from '../../features/common/headerSlice';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetTableCodeManagementSettings());
    dispatch(setPageTitle({ title: 'Code Management' }));
  }, []);

  return <CodeManagement />;
}

export default InternalPage;

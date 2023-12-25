import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import LiveLocations from '../../features/liveLocations';

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Live Locations' }));
  }, []);

  return <LiveLocations />;
}

export default InternalPage;

import { lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import FaceFrownIcon from '@heroicons/react/24/solid/FaceFrownIcon';

import { setPageTitle } from '../../features/common/headerSlice';

const AuthenticatedRoute = lazy(() => import('../../utils/containers/AuthenticatedRoute'));

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: '' }));
  }, []);

  return (
    <AuthenticatedRoute>
      <div className="hero h-4/5 bg-base-200">
        <div className="hero-content text-accent text-center">
          <div className="max-w-md">
            <FaceFrownIcon className="h-48 w-48 inline-block" />
            <h1 className="text-5xl  font-bold">404 - Not Found</h1>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  );
}

export default InternalPage;

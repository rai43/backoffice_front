import { Suspense, lazy, useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Header from './Header';
import SuspenseContent from './SuspenseContent';
import routes from '../routes';

const Page404 = lazy(() => import('../pages/authenticated/404'));

function PageContent() {
  const mainContentRef = useRef(null);
  const { pageTitle } = useSelector((state) => state.header);

  // Scroll back to top on new page load
  useEffect(() => {
    mainContentRef.current.scroll({
      top: 0,
      behavior: 'smooth'
    });
  }, [pageTitle]);

  return (
    <div className="drawer-content flex flex-col ">
      <Header />
      <main className="flex-1 overflow-y-auto p-2 md:pt-5 md:px-5 bg-base-200" ref={mainContentRef}>
        <Suspense fallback={<SuspenseContent />}>
          <Routes>
            {routes.map((route, key) => {
              return (
                <Route
                  key={key}
                  exact={true}
                  path={`${route.path}`}
                  element={<route.component />}
                />
              );
            })}

            {/* Redirecting unknown url to 404 page */}
            <Route path="*" element={<Page404 />} />
          </Routes>
        </Suspense>
        {/*<div className="h-16"></div>*/}
      </main>
    </div>
  );
}

export default PageContent;

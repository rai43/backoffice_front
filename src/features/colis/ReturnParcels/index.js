import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { BiHide, BiShow } from 'react-icons/bi';
import { FaAmazonPay } from 'react-icons/fa';

import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';

import InfoText from '../../../components/Typography/InfoText';
import { STATUS_ICON_NAMES } from '../../../utils/colisUtils';
import {
  resetTableParcelsManagementSettings,
  setPaginationSize
} from '../../common/returnParcelsManagementTableSlice';
import ReturnColisList from '../components/ReturnColisList';
import { getReturnedColis } from '../parcelsManagementSlice';

const gridOptions = {
  paginationPageSize: 20,
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const ParcelsManagement = () => {
  const dispatch = useDispatch();
  const [showStats, setShowStats] = useState(true);

  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.returnParcelsManagementTable
  );
  const {
    returnedColis,
    totalCount,

    pendingCount,
    registeredCount,
    articleToReturnCount,
    deliveredCount
  } = useSelector((state) => state.parcelsManagement);

  const onFetchColis = async () => {
    dispatch(resetTableParcelsManagementSettings());

    if (!returnedColis?.length) {
      await dispatch(getReturnedColis());
    }
  };

  useEffect(() => {
    onFetchColis();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          {returnedColis?.length ? (
            <button className="btn btn-sm btn-success btn-outline normal-case gap-2 mx-2">
              <FaAmazonPay className="w-4" />
              Count:
              <div className="badge badge-sm badge-success badge-outline">
                {returnedColis?.length}
              </div>
            </button>
          ) : (
            <></>
          )}
        </div>
        <div className="text-right sm:mb-2">
          <button
            className="btn btn-ghost btn-sm normal-case"
            onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-4 mr-2" />
            Refresh Data
          </button>
          <button
            className="btn btn-ghost btn-sm normal-case"
            onClick={() => {
              setShowStats((oldValue) => !oldValue);
            }}>
            {showStats ? <BiHide className="w-4 mr-2" /> : <BiShow className="w-4 mr-2" />}
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          {returnedColis.length ? (
            <select
              className="select select-ghost select-sm normal-case align-top"
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                gridOptions.api.paginationSetPageSize(newSize);
                dispatch(setPaginationSize({ paginationSize: newSize || 20 }));
              }}
              defaultValue={paginationSize}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          ) : (
            <></>
          )}
        </div>
      </div>

      {showStats ? (
        <div className="grid lg:grid-cols-4 mb-3 md:grid-cols-2 grid-cols-1 gap-6">
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {/*<AiOutlineFileDone className="w-6 h-6" />*/}
                {STATUS_ICON_NAMES['PENDING']}
              </div>
              <div className="stat-title dark:text-slate-300">Pending</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>{pendingCount}</div>
              <div className={'stat-desc  '}>
                {((pendingCount * 100) / totalCount).toFixed(2)} % of total orders
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['REGISTERED']}
              </div>
              <div className="stat-title dark:text-slate-300">Registered</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>
                {registeredCount}
              </div>
              <div className={'stat-desc  '}>
                {((registeredCount * 100) / totalCount).toFixed(2)} % of total orders
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['ARTICLE_TO_RETURN']}
              </div>
              <div className="stat-title dark:text-slate-300">Article To Return</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>
                {articleToReturnCount}
              </div>
              <div className={'stat-desc  '}>
                {((articleToReturnCount * 100) / totalCount).toFixed(2)} % of total orders
              </div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className={`stat-figure dark:text-slate-300 text-secondary`}>
                {STATUS_ICON_NAMES['DELIVERED']}
              </div>
              <div className="stat-title dark:text-slate-300">Delivered</div>
              <div className={`stat-value dark:text-slate-300 text-secondary`}>
                {deliveredCount}
              </div>
              <div className={'stat-desc '}>
                {((deliveredCount * 100) / totalCount).toFixed(2)} % of total orders
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {returnedColis.length ? (
        <ReturnColisList gridOptions={gridOptions} />
      ) : (
        <InfoText styleClasses={'md:grid-cols-2'}>No return colis found</InfoText>
      )}
    </div>
  );
};

export default ParcelsManagement;

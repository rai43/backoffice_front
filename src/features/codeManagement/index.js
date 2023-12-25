import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { BiHide, BiShow } from 'react-icons/bi';
import { IoAdd } from 'react-icons/io5';

import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';

import { getCodes } from './codeManagementSlice';
import CodeList from './components/CodeList';
import InfoText from '../../components/Typography/InfoText';
import { MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { setPaginationSize } from '../common/codeManagementTableSlice';
import { openModal } from '../common/modalSlice';

const gridOptions = {
  paginationPageSize: 20,
  suppressExcelExport: true,
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const CodeManagement = () => {
  const dispatch = useDispatch();
  const [showStats, setShowStats] = useState(true);

  const { codes } = useSelector((state) => state.code);
  const { paginationSize } = useSelector((state) => state.codeManagementTable);

  const applyFilter = async (dispatchParams) => {
    await dispatch(getCodes(dispatchParams));
  };

  useEffect(() => {
    const dispatchParams = {};
    applyFilter(dispatchParams);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center ">
          There {codes?.length > 1 ? 'are ' : 'is '}
          <span className="text-secondary font-bold mx-2">{codes?.length}</span> active code
          {codes?.length > 1 ? 's' : ''}
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
          {codes.length ? (
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

          <div className="dropdown dropdown-bottom dropdown-end  ml-2">
            <label tabIndex={0} className="btn btn-ghost btn-sm normal-case btn-square ">
              <EllipsisVerticalIcon className="w-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-compact  p-2 shadow bg-base-100 rounded-box w-52">
              <li
                onClick={() => {
                  dispatch(
                    openModal({
                      title: 'Add Code',
                      size: 'lg',
                      bodyType: MODAL_BODY_TYPES.CODE_ADD_OR_EDIT,
                      extraObject: {}
                    })
                  );
                }}>
                <span>
                  <IoAdd className="w-4" />
                  Generate Code
                </span>
              </li>
              <li>
                <span>
                  <ArrowDownTrayIcon className="w-4" />
                  Download
                </span>
              </li>
              <li>
                <span>
                  <EnvelopeIcon className="w-4" />
                  Email Digests
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div>
        {codes.length ? (
          <>
            <CodeList gridOptions={gridOptions} />
          </>
        ) : (
          <InfoText styleClasses={'md:grid-cols-2'}>No Code found</InfoText>
        )}
      </div>
    </>
  );
};

export default CodeManagement;

import React, { useMemo, useRef, useState } from 'react';

import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { AiOutlineDelete } from 'react-icons/ai';

import { classNames } from '../../../components/Common/UtilsClassNames';
import { adjustGridHeight } from '../../../utils/functions/adjustGridHeight';
import { handleCopyClick } from '../../../utils/functions/handleCopyClick';
import { disableScroll, enableScroll } from '../../../utils/functions/preventAndAllowScroll';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import {
  setFilters,
  setPaginationCurrentPage,
  setPaginationSize
} from '../../common/discountManagementTableSlice';
import { showNotification } from '../../common/headerSlice';
import { openModal } from '../../common/modalSlice';
import {
  deleteCode,
  deleteDiscount,
  toggleCodeStatus,
  toggleDiscountStatus
} from '../codeManagementSlice';

const containFilterParams = {
  filterOptions: ['contains', 'notContains'],
  debounceMs: 200,
  maxNumConditions: 1
};

const CodeList = ({ gridOptions }) => {
  const dispatch = useDispatch();
  const gridRef = useRef(null);

  const { codes, isLoading } = useSelector((state) => state.code);

  const { paginationCurrentPage, filters, paginationSize } = useSelector(
    (state) => state.codeManagementTable
  );

  const [disableDiscount, setDisableDiscount] = useState(false);
  const [ToBedeletedDiscount, setToBeDeletedDiscount] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState({});

  const onDefaultColClicked = async (data) => {
    dispatch(
      openModal({
        title: 'Add Code',
        size: 'lg',
        bodyType: MODAL_BODY_TYPES.CODE_ADD_OR_EDIT,
        extraObject: { discountObject: data }
      })
    );
  };

  const toggleStatus = async (data) => {
    disableScroll();
    setDisableDiscount((_) => true);
    setSelectedDiscount(data);
  };

  const deleteDiscountById = async (data) => {
    disableScroll();
    setToBeDeletedDiscount((_) => true);
    setSelectedDiscount(data);
  };

  const columnDefs = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      // pinned: true,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className={classNames('px-3 uppercase leading-wide')}>{value}</p>;
      }
    },
    {
      field: 'code',
      headerName: 'Code',
      width: 150,
      pinned: true,
      filterParams: containFilterParams,
      onCellClicked: (params) => handleCopyClick(params?.data?.code, dispatch),
      // onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p
            className={classNames(
              'className="px-3 py-1 uppercase leading-wide  font-bold text-secondary cursor-copy flex items-center justify-center gap-2"'
            )}>
            {value}
          </p>
        );
      }
    },
    {
      field: 'discount_type',
      headerName: 'Discount Type',
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'discount',
      headerName: 'Discount Value',
      width: 170,
      filterParams: containFilterParams,
      // pinned: 'right',
      onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'min_amount',
      headerName: 'Min Amount',
      width: 130,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value}</p>;
      }
    },
    {
      valueGetter: ({ data }) => {
        return data?.one_time_code ? 'YES' : 'NO';
      },
      headerName: 'Is One Time Use?',
      width: 150,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return <p className="uppercase break-all overflow-hidden">{value}</p>;
      }
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      width: 155,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className="uppercase break-all overflow-hidden">
            {moment.utc(value).format('DD/MM/YYYY HH:mm')}
          </p>
        );
      }
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      width: 155,
      filterParams: containFilterParams,
      onCellClicked: (params) => onDefaultColClicked(params.data),
      cellRenderer: ({ value }) => {
        return (
          <p className="uppercase break-all overflow-hidden">
            {moment.utc(value).format('DD/MM/YYYY HH:mm')}
          </p>
        );
      }
    },
    {
      field: 'id',
      headerName: 'Status',
      width: 100,
      filterParams: containFilterParams,
      onCellClicked: (params) => toggleStatus(params.data),
      cellRenderer: ({ data }) => {
        return (
          <div className="form-control w-52">
            <label className="cursor-pointer label">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={data?.active}
                onChange={() => {}}
              />
            </label>
          </div>
        );
      }
    },
    {
      field: 'id',
      headerName: 'Delete',
      width: 90,
      filterParams: containFilterParams,
      onCellClicked: (params) => deleteDiscountById(params.data),
      cellRenderer: () => {
        return (
          <div className="flex items-center justify-center ">
            <button className="btn btn-outline btn-xs btn-error mt-2">
              <AiOutlineDelete />
            </button>
          </div>
        );
      }
    }
  ]);

  return (
    <div className="overflow-hidden mt-2">
      <div
        className={`${ToBedeletedDiscount ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Delete the discount with code:{' '}
            <span className="text-primary">{selectedDiscount?.code}</span>?
          </h3>

          <div className="">
            <div className="divider">Information</div>
            <p>
              Value:{' '}
              <span className="text-primary font-semibold lowercase">
                {selectedDiscount?.discount}
              </span>
            </p>
            <p>
              Type:{' '}
              <span className="text-primary font-semibold lowercase">
                {selectedDiscount?.discount_type}
              </span>
            </p>
            <p>
              Interval: From{' '}
              <span className="text-primary font-semibold lowercase">
                {moment.utc(selectedDiscount?.start_date).format('DD-MM-YYYY HH:mm')}
              </span>{' '}
              To{' '}
              <span className="text-primary font-semibold lowercase">
                {moment.utc(selectedDiscount?.end_date).format('DD-MM-YYYY HH:mm')}
              </span>
            </p>
          </div>
          <div className="divider">Actions</div>
          <div className="modal-action">
            <button
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => {
                enableScroll();
                setToBeDeletedDiscount((_) => false);
                setSelectedDiscount((_) => {});
              }}>
              No, Cancel Action
            </button>
            <button
              className="btn btn-sm btn-outline btn-secondary"
              onClick={async () => {
                await dispatch(
                  deleteCode({
                    code_id: selectedDiscount?.id
                  })
                ).then(async (response) => {
                  if (response?.error) {
                    dispatch(
                      showNotification({
                        message: 'Error while deleting the discount code',
                        status: 0
                      })
                    );
                  } else {
                    dispatch(
                      showNotification({
                        message: 'Successfully deleted the discount code',
                        status: 1
                      })
                    );
                    setToBeDeletedDiscount((_) => false);
                    setSelectedDiscount((_) => {});
                    enableScroll();
                  }
                });
              }}>
              PROCEED
            </button>
          </div>
        </div>
      </div>

      <div className={`${disableDiscount ? 'modal-open' : ''} modal modal-bottom sm:modal-middle`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Disable the discount with code:
            <span className="text-primary">{' ' + selectedDiscount?.code}</span>?
          </h3>

          <div className="">
            <div className="divider">Information</div>
            <p>
              Value:{' '}
              <span className="text-primary font-semibold lowercase">
                {selectedDiscount?.discount}
              </span>
            </p>
            <p>
              Type:{' '}
              <span className="text-primary font-semibold lowercase">
                {selectedDiscount?.discount_type}
              </span>
            </p>
            <p>
              Interval: From{' '}
              <span className="text-primary font-semibold lowercase">
                {moment.utc(selectedDiscount?.start_date).format('DD-MM-YYYY HH:mm')}
              </span>{' '}
              To{' '}
              <span className="text-primary font-semibold lowercase">
                {moment.utc(selectedDiscount?.end_date).format('DD-MM-YYYY HH:mm')}
              </span>
            </p>
          </div>
          <div className="divider">Actions</div>
          <div className="modal-action">
            <button
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => {
                enableScroll();
                setDisableDiscount((_) => false);
                setSelectedDiscount((_) => {});
              }}>
              No, Cancel Action
            </button>
            <button
              className="btn btn-sm btn-outline btn-secondary"
              onClick={async () => {
                await dispatch(
                  toggleCodeStatus({
                    code_id: selectedDiscount?.id
                  })
                ).then(async (response) => {
                  if (response?.error) {
                    dispatch(
                      showNotification({
                        message: 'Error while toggling the discount status',
                        status: 0
                      })
                    );
                  } else {
                    dispatch(
                      showNotification({
                        message: "Successfully changed the discount code's status",
                        status: 1
                      })
                    );
                    enableScroll();
                    setDisableDiscount((_) => false);
                    setSelectedDiscount((_) => {});
                  }
                });
              }}>
              PROCEED
            </button>
          </div>
        </div>
      </div>

      {!isLoading && (
        <>
          <div className="ag-theme-alpine h-[40rem]">
            <AgGridReact
              ref={gridRef}
              columnDefs={columnDefs}
              rowData={codes}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              gridOptions={gridOptions}
              pagination={true}
              rowHeight={50}
              rowSelection="single"
              paginationPageSize={paginationSize || 20}
              onPaginationChanged={async (params) => {
                adjustGridHeight(params.api);
                let currentPage = params.api.paginationGetCurrentPage();
                await dispatch(
                  setPaginationCurrentPage({
                    paginationCurrentPage: currentPage
                  })
                );
              }}
              onFirstDataRendered={(params) => {
                adjustGridHeight(params.api); // Adjust height
                params.api.paginationGoToPage(
                  paginationCurrentPage !== null
                    ? paginationCurrentPage
                    : params.api.paginationGetCurrentPage()
                );
                params.api.setFilterModel(filters);
              }}
              onFilterChanged={async (params) => {
                await dispatch(
                  setFilters({
                    filters: params?.api?.getFilterModel() || {}
                  })
                );
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CodeList;

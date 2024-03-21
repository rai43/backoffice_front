import React, { useEffect, useMemo } from 'react';

import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';

import { getSmsProviders, resetFrom } from './smsPorviderSlide';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil';
import { openModal } from '../common/modalSlice';

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};

const SmsProvider = () => {
  const dispatch = useDispatch();
  const { providers, isLoading } = useSelector((state) => state.smsPorvider);

  // Opening right sidebar for user details
  const changeProvider = (provider) => {
    dispatch(
      openModal({
        title: `Change ${provider?.sms_operator?.name}'s Provider`,
        bodyType: MODAL_BODY_TYPES.CHANGE_PROVIDER,
        extraObject: { provider }
      })
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: 'sms_operator.name',
      headerName: 'Sms Operator',
      // width: 200,
      flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    },
    {
      field: 'provider',
      headerName: 'Sms Provider',
      // width: 200,
      flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => changeProvider(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    }
  ]);

  const onFetchOperators = async () => {
    dispatch(resetFrom());

    await dispatch(getSmsProviders());
  };

  useEffect(() => {
    onFetchOperators();
  }, []);

  return (
    <>
      <div className="overflow-hidden mt-2">
        {!isLoading && (
          <div className="ag-theme-alpine h-[40rem]">
            <AgGridReact
              columnDefs={columnDefs}
              rowData={providers}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              pagination={true}
              paginationPageSize={20}
              rowHeight={50}
              gridOptions={gridOptions}
              paginationPageSizeOptions={[10, 20, 50]}
              // onSelectionChanged={(val) => {
              // 	const selectedObject = val.api.getSelectedRows()[0];
              // 	openModal({
              // 		...annualCheckupModalConfig,
              // 		title: selectedObject.label,
              // 		extraObject: {
              // 			data: selectedObject,
              // 			config: { openInReadOnlyMode: true },
              // 		},
              // 	});
              // }}
              rowSelection="single"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SmsProvider;

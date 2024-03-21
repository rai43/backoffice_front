import React, { useEffect, useMemo } from 'react';

import { AgGridReact } from 'ag-grid-react';
import { useDispatch, useSelector } from 'react-redux';

import { getColisZones, resetFrom } from './colisZonesSlide';
import { AG_GRID_DEFAULT_COL_DEF, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil';
import { openModal } from '../../common/modalSlice';

const gridOptions = {
  paginationPageSize: 20, // Initial page size
  defaultColDef: {
    sortable: true,
    resizable: true
  }
};
const ColisZones = () => {
  const dispatch = useDispatch();

  const { colisZones, isLoading } = useSelector((state) => state.colisZones);

  const changeFirstZoneLivreur = (data) => {
    dispatch(
      openModal({
        title: `Change ${data.zone} first round livreur`,
        bodyType: MODAL_BODY_TYPES.CHANGE_ZONE_LIVREUR,
        extraObject: { ...data, group: 1 }
      })
    );
  };

  const changeSecondZoneLivreur = (data) => {
    dispatch(
      openModal({
        title: `Change ${data.zone} second round livreur`,
        bodyType: MODAL_BODY_TYPES.CHANGE_ZONE_LIVREUR,
        extraObject: { ...data, group: 2 }
      })
    );
  };

  const columnDefs = useMemo(() => [
    {
      field: 'zone',
      headerName: 'Zone Name',
      // width: 200,
      flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      cellRenderer: ({ value }) => {
        return (
          <span className="font-semibold text-md">
            {(value === 'AbidjanSud' ? 'Abidjan Sud' : value)?.toUpperCase()}
          </span>
        );
      }
    },
    {
      field: 'group1',
      headerName: 'Group 1',
      valueGetter: ({ data }) => {
        console.log(data);
        return data?.group1
          ? `${data?.group1?.first_name} ${data?.group1?.last_name}`?.toUpperCase()
          : 'N/A';
      },
      flex: 1,
      // pinned: 'right',
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => changeFirstZoneLivreur(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    },
    {
      field: 'group1',
      headerName: 'Group 2',
      valueGetter: ({ data }) => {
        console.log(data);
        return data?.group2
          ? `${data?.group2?.first_name} ${data?.group2?.last_name}`?.toUpperCase()
          : 'N/A';
      },
      flex: 1,
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => changeSecondZoneLivreur(params.data),
      cellRenderer: ({ value }) => {
        return <span className="font-semibold text-md">{value}</span>;
      }
    }
  ]);

  const onFetchZones = async () => {
    dispatch(resetFrom());

    await dispatch(getColisZones());
  };

  useEffect(() => {
    onFetchZones();
  }, []);

  return (
    <>
      <div className="overflow-hidden mt-2">
        {!isLoading && (
          <div className="ag-theme-alpine h-[40rem]">
            <AgGridReact
              columnDefs={columnDefs}
              rowData={colisZones}
              defaultColDef={AG_GRID_DEFAULT_COL_DEF}
              pagination={true}
              paginationPageSize={20}
              rowHeight={50}
              gridOptions={gridOptions}
              paginationPageSizeOptions={[10, 20, 50]}
              rowSelection="single"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ColisZones;

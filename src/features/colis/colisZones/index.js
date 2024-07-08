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

const colisData = [
  { value: '', label: 'Select a Zone' },
  { value: 'zone_a', label: 'Abobo & Anyama & Angre' },
  { value: 'zone_b', label: 'II plateaux & Cocody Centre & Plateau & Adjame ' },
  { value: 'zone_c', label: 'Yopougon' },
  { value: 'zone_d', label: 'Abidjan Sud' },
  { value: 'zone_e', label: 'Riviera & Bingerville' },
  { value: 'zone_f', label: 'Gonzagville & Modeste & Bassam' }
];

const filterZones = (data) => {
  const result = {};

  for (const group in data) {
    result[group] = {};
    for (const zone in data[group]) {
      if (zone.toLowerCase().startsWith('zone')) {
        result[group][zone] = data[group][zone];
      }
    }
    // Remove group if it has no zones
    if (Object.keys(result[group]).length === 0) {
      delete result[group];
    }
  }

  return result;
};

const ColisZones = () => {
  const dispatch = useDispatch();

  const { colisZones, isLoading } = useSelector((state) => state.colisZones);
  console.log(colisZones);

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

  const changeThirdZoneLivreur = (data) => {
    dispatch(
      openModal({
        title: `Change ${data.zone} third round livreur`,
        bodyType: MODAL_BODY_TYPES.CHANGE_ZONE_LIVREUR,
        extraObject: { ...data, group: 3 }
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
        console.log({ value });
        const zone = colisData?.find(
          (z) => z?.value?.toLocaleLowerCase() === value?.toLocaleLowerCase()
        );
        return <span className="font-semibold text-md">{zone?.label?.toUpperCase()}</span>;
      }
    },
    {
      field: 'group1',
      headerName: 'Group 1',
      valueGetter: ({ data }) => {
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
      field: 'group2',
      headerName: 'Group 2',
      valueGetter: ({ data }) => {
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
    },
    {
      field: 'group3',
      headerName: 'Group 3',
      valueGetter: ({ data }) => {
        return data?.group3
          ? `${data?.group3?.first_name} ${data?.group3?.last_name}`?.toUpperCase()
          : 'N/A';
      },
      flex: 1,
      filter: 'agDateColumnFilter',
      onCellClicked: (params) => {
        if (!params?.data?.group3?.id) {
          return;
        }
        changeThirdZoneLivreur(params.data);
      },
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
              rowData={colisZones?.filter((z) => z?.zone?.includes('zone'))}
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

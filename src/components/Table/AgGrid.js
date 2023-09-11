import React from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

const AgGrid = ({ theme, columnDefs, rowData, defaultColDef, pagination, paginationPageSize, rowSelection = 'multiple', animateRows = true }) => {
	return (
		<div
			className={`${theme ? theme : 'ag-theme-alpine'}`}
			// style={{ width: 500, height: 500 }}
		>
			<AgGridReact
				// ref={gridRef} // Ref for accessing Grid's API
				rowData={rowData} // Row Data for Rows
				columnDefs={columnDefs} // Column Defs for Columns
				defaultColDef={defaultColDef} // Default Column Properties
				animateRows={animateRows} // Optional - set to 'true' to have rows animate when sorted
				rowSelection={rowSelection} // Options - allows click selection of rows
				pagination={pagination}
				paginationPageSize={paginationPageSize}
				// onCellClicked={cellClickedListener} // Optional - registering for Grid Event
			/>
		</div>
	);
};

export default AgGrid;

export const adjustGridHeight = (api) => {
  const rowHeight = 50; // Assuming rowHeight is 50 based on your provided code
  // const rowHeight = api.getDisplayedRowAtIndex(0).rowHeight;
  const headerHeight = document.querySelector('.ag-header').offsetHeight;
  // const headerHeight = 50; // Assuming headerHeight is 50 based on a typical AG-Grid UI
  // api.getDisplayedRowCount() => returns the count of all the rows
  const pageSize =
    api.paginationProxy.pageSize > api.getDisplayedRowCount()
      ? api.getDisplayedRowCount()
      : api.paginationProxy.pageSize + 0.1;
  const totalRowsHeight = pageSize * rowHeight;
  const newHeight = totalRowsHeight + headerHeight + 52 + 'px';

  // Now, set this height to the grid container
  document.querySelector('.ag-theme-alpine').style.height = newHeight;
};

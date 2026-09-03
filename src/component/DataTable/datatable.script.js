class DataTables {
  constructor(
    columns,
    dataCount,
    setdataCount,
    data,
    setData,
    isLoading,
    setisLoading,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    isSwitchPageFilter,
    setisSwitchPageFilter,
    searchValue,
    setsearchValue,
    hasLoadedBefore,
    
  ) {
    this.columns = columns;
    this.dataCount = dataCount;
    this.setdataCount = setdataCount;
    this.data = data;
    this.setData = setData;
    this.isLoading = isLoading;
    this.setisLoading = setisLoading;
    this.pageSize = pageSize;
    this.setPageSize = setPageSize;
    this.currentPage = currentPage;
    this.setCurrentPage = setCurrentPage;
    this.isSwitchPageFilter = isSwitchPageFilter;
    this.setisSwitchPageFilter = setisSwitchPageFilter;
    this.searchValue = searchValue;
    this.setsearchValue = setsearchValue;
    this.hasLoadedBefore = hasLoadedBefore;
  }

  handlePageChange = (newPage, pageSize) => {

    this.setPageSize(pageSize);
    this.setCurrentPage(newPage);
  };

  handleSearchChange = (event) => {
    // if (!this.hasLoadedBefore.current) {
    //   this.hasLoadedBefore.current = true;
    // }
    this.setPageSize(10);
    this.setCurrentPage(1);
    this.setisSwitchPageFilter(true);
    this.setisLoading(true);
    this.setsearchValue(event);
  };

  // Only For API No pagiantion
  // Custom Mode
  dataCustomPaignation(data, currentPage, pageSize) {
    // Calculate the index range for the current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Slice the data array based on the current page and page size
    const paginatedData = data.slice(startIndex, endIndex);

    return paginatedData;
  }
}

export default DataTables;

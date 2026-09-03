import React, { useState, useEffect } from "react";
import "./font/battambong.css";
import "./font/moul.css";
import "./font/siemreap.css";
import CustomCheckBox from "../CheckBox/CustomCheckBoxForTable.component";
import Version from "../../page/dasboard/version/version.script";
import DataTable from "react-data-table-component";
import "./datatable.style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit } from "react-icons/fa";
import { BiColumns } from "react-icons/bi";
import { GrTrash } from "react-icons/gr";
import { FaFilter } from "react-icons/fa";
import { FaDatabase } from "react-icons/fa6";
import { ClipLoader, RingLoader, SyncLoader, MoonLoader } from "react-spinners";
import { FaEye } from "react-icons/fa";
import { Switch, FormControlLabel } from "@mui/material";
import { IoMdCreate } from "react-icons/io";
import { GrSearchAdvanced } from "react-icons/gr";
import { MdOutlineAdd } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { GoDotFill } from "react-icons/go";
function DatatableCustom(propReceived) {
  // Declaration
  const version = new Version();

  // ============================================================
  // ✅ SINGLE CACHE KEY FOR ALL TABLE DATA
  // ============================================================
  const cacheKey = propReceived.props?.cache_name || 'default_table_cache';
  const fullCacheKey = `datatable_${cacheKey}`;

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(fullCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        // Cache expires after 24 hours
        if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed;
        }
        // Cache expired - remove it
        localStorage.removeItem(fullCacheKey);
        return null;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const saveToCache = (data) => {
    try {
      const cacheData = {
        data: data.data || [],
        count: data.count || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 10,
        timestamp: Date.now(),
      };
      localStorage.setItem(fullCacheKey, JSON.stringify(cacheData));
    } catch (error) {
      // Silent fail
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(fullCacheKey);
    } catch (error) {
      // Silent fail
    }
  };
  // ============================================================

  const [advanceSearchIsOpen, setadvanceSearchIsOpen] = useState(false);
  const [advanceSearchIsShow_Status, setadvanceSearchIsShow_Status] = useState(true);
  const [advanceSearchIsShow_Action, setadvanceSearchIsShow_Action] = useState(true);

  const advanceSearch = propReceived.advanceSearch;
  const props = propReceived.props;

  // ✅ Load from cache
  const cachedData = loadFromCache();

  // ✅ Initialize state from cache or props
  const [currentPage, setCurrentPage] = useState(() => {
    if (cachedData) return cachedData.page;
    return props.pagination?.currentPage || 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    if (cachedData) return cachedData.pageSize;
    return props.pagination?.rowsPerPage || 10;
  });

  const [displayData, setDisplayData] = useState(() => {
    if (cachedData && cachedData.data && cachedData.data.length > 0) {
      return cachedData.data;
    }
    return props.data || [];
  });

  const [displayCount, setDisplayCount] = useState(() => {
    if (cachedData) return cachedData.count;
    return props.pagination?.count || 0;
  });

  const [isDataFromCache, setIsDataFromCache] = useState(
    cachedData && cachedData.data && cachedData.data.length > 0
  );
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasSyncedWithParent, setHasSyncedWithParent] = useState(false);
  const [isCacheExpired, setIsCacheExpired] = useState(false);

  // ✅ Check if cache is expired on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(fullCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        if (now - parsed.timestamp >= 24 * 60 * 60 * 1000) {
          setIsCacheExpired(true);
          clearCache();
        }
      }
    } catch (error) {
      // Silent fail
    }
  }, []);

  // ✅ SYNC WITH PARENT - Send cached values to parent on mount
  useEffect(() => {
    const cached = loadFromCache();
    const pageVal = cached?.page || props.pagination?.currentPage || 1;
    const sizeVal = cached?.pageSize || props.pagination?.rowsPerPage || 10;

    if (typeof propReceived.onChangePage === "function") {
      propReceived.onChangePage(pageVal, sizeVal);
    }
    if (typeof propReceived.onChangePageOption === "function") {
      propReceived.onChangePageOption(pageVal, sizeVal);
    }
    setHasSyncedWithParent(true);
  }, []);

  // ✅ Save data to cache when props.data changes
  useEffect(() => {
    if (props.data && props.data.length > 0) {
      // Save to cache
      saveToCache({
        data: props.data,
        count: props.pagination?.count || props.data.length,
        page: props.pagination?.currentPage || currentPage,
        pageSize: props.pagination?.rowsPerPage || pageSize,
      });

      // Update display
      setDisplayData(props.data);
      setDisplayCount(props.pagination?.count || props.data.length);
      setIsDataFromCache(false);
      setIsLoadingData(false);
      setIsCacheExpired(false);

      if (props.pagination?.currentPage && props.pagination.currentPage !== currentPage) {
        setCurrentPage(props.pagination.currentPage);
      }
    } else if (props.data && props.data.length === 0 && !props.show_loading) {
      // ✅ API returned empty data - clear cache and show empty
      if (isDataFromCache) {
        clearCache();
        setDisplayData([]);
        setDisplayCount(0);
        setIsDataFromCache(false);
        setIsCacheExpired(false);
      }
    }
  }, [props.data, props.pagination?.count]);

  // Handle loading state
  useEffect(() => {
    if (props.show_loading) {
      setIsLoadingData(true);
    } else if (props.data && props.data.length > 0) {
      setIsLoadingData(false);
    } else if (!props.show_loading && props.data && props.data.length === 0) {
      // ✅ Loading finished but no data - if we have cache, keep it
      if (isDataFromCache && displayData.length > 0) {
        // Keep cached data
      } else {
        setIsLoadingData(false);
      }
    }
  }, [props.show_loading, props.data]);

  // ✅ Update local state when props change
  useEffect(() => {
    const cached = loadFromCache();
    const cachedPage = cached?.page;
    if (props.pagination?.currentPage !== currentPage && props.pagination?.currentPage !== cachedPage) {
      setCurrentPage(props.pagination.currentPage);
    }
  }, [props.pagination?.currentPage]);

  useEffect(() => {
    const cached = loadFromCache();
    const cachedSize = cached?.pageSize;
    if (props.pagination?.rowsPerPage !== pageSize && props.pagination?.rowsPerPage !== cachedSize) {
      setPageSize(props.pagination.rowsPerPage);
    }
  }, [props.pagination?.rowsPerPage]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const cached = loadFromCache() || {};
    saveToCache({
      data: cached.data || displayData,
      count: cached.count || displayCount,
      page: newPage,
      pageSize: pageSize,
    });

    if (typeof propReceived.onChangePage === "function") {
      propReceived.onChangePage(newPage, pageSize);
    }
    if (typeof propReceived.onChangePageOption === "function") {
      propReceived.onChangePageOption(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    const cached = loadFromCache() || {};
    saveToCache({
      data: cached.data || displayData,
      count: cached.count || displayCount,
      page: 1,
      pageSize: newPageSize,
    });

    if (typeof propReceived.onChangePage === "function") {
      propReceived.onChangePage(1, newPageSize);
    }
  };

  // ✅ Force refresh - clear cache and reload from parent
  const forceRefresh = () => {
    clearCache();
    setDisplayData([]);
    setDisplayCount(0);
    setIsDataFromCache(false);
    setIsCacheExpired(false);
    if (typeof propReceived.onForceRefresh === "function") {
      propReceived.onForceRefresh();
    }
  };

  // ✅ Use cached values for display
  const displayCurrentPage = (() => {
    const cached = loadFromCache();
    if (cached?.page) return cached.page;
    if (currentPage) return currentPage;
    return props.pagination?.currentPage || 1;
  })();

  const displayPageSize = (() => {
    const cached = loadFromCache();
    if (cached?.pageSize) return cached.pageSize;
    if (pageSize) return pageSize;
    return props.pagination?.rowsPerPage || 10;
  })();

  const totalPages = Math.ceil(displayCount / displayPageSize);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  function toKhmerNumber(number) {
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    return number
      .toString()
      .padStart(2, "")
      .split("")
      .map((d) => khmerDigits[+d] || d)
      .join("");
  }

  function paginationCustomNumber() {
    const currentPage = displayCurrentPage;
    const pageLimit = 5;
    const pagesToShow = [];

    pagesToShow.push(1);

    for (
      let i = Math.max(currentPage - 2, 2);
      i <= Math.min(currentPage + 2, totalPages - 1);
      i++
    ) {
      pagesToShow.push(i);
    }

    if (!pagesToShow.includes(totalPages) && totalPages > pageLimit) {
      pagesToShow.push(totalPages);
    } else {
      pagesToShow.push(totalPages);
    }

    if (totalPages > pageLimit && !pagesToShow.includes(totalPages)) {
      pagesToShow.push(totalPages);
    }

    if (pagesToShow.length == 2 && pagesToShow[0] == pagesToShow[1]) {
      pagesToShow.length = 0;
      pagesToShow.push(1);
    }

    const paginationButtons = [];
    let lastPage = null;

    pagesToShow.forEach((page, index) => {
      if (lastPage && page - lastPage > 1) {
        paginationButtons.push(
          <div key={`ellipsis-${index}`} style={{ marginTop: "10px" }}>
            <label style={{ marginLeft: "10px", marginRight: "10px" }}>...</label>
          </div>,
        );
      }

      paginationButtons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          type="button"
          className={`btn ${
            currentPage === page ? "btn-success" : "btn-outline-success"
          }`}
        >
          {toKhmerNumber(page)}
        </button>,
      );
      lastPage = page;
    });

    return <div style={{ display: "flex" }}>{paginationButtons}</div>;
  }

  function columnCheck() {
    const currentPage = displayCurrentPage;
    const pageSize = displayPageSize;
    var col = [];

    // Add the serial number column
    if (!props.is_hide_number) {
      col.push({
        width: "120px",
        name: (
          <div style={{ width: "100px", textAlign: "center" }}>
            <label>ល.រ</label>
          </div>
        ),
        selector: (row, index) => (
          <div style={{ width: "100px", textAlign: "center" }}>
            <label>
              {toKhmerNumber((currentPage - 1) * pageSize + index + 1)}
            </label>
          </div>
        ),
      });
    }

    props.columns.map((row, i) => {
      if (
        row.hidden == undefined ||
        row.hidden == false ||
        row.hidden == null
      ) {
        col.push(row);
      }
    });

    // Add Status
    if (props.show_status) {
      if (advanceSearchIsShow_Status) {
        col.push({
          width: "130px",
          name: (
            <div style={{ width: "100%", textAlign: "center" }}>
              <label>ស្ថានភាព</label>
            </div>
          ),
          selector: (row) => (
            <div style={{ width: "130px", textAlign: "center" }}>
              <label>
                <FormControlLabel
                  control={
                    <Switch
                      checked={row.status}
                      onChange={(e) => propReceived.onChangeStatus(row, e)}
                      color="success"
                    />
                  }
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontFamily: "Siemreap, sans-serif",
                      fontSize: "0.9rem",
                    },
                  }}
                  label={row.status == true ? "ប្រើប្រាស់" : "បានផ្អាក"}
                />
              </label>
            </div>
          ),
        });
      }
    }

    // Action Button
    var isShowAction = true;
    if (
      props.actionButton.show_view.show == false &&
      props.actionButton.show_edit.show == false &&
      props.actionButton.show_delete.show == false
    ) {
      isShowAction = false;
    }
    if (isShowAction) {
      if (advanceSearchIsShow_Action) {
        var widthChecker = 0;

        if (props.actionButton.show_view.show) {
          widthChecker += 49;
        }
        if (props.actionButton.show_edit.show) {
          widthChecker += 49;
        }
        if (props.actionButton.show_delete.show) {
          widthChecker += 49;
        }
        col.push({
          width: widthChecker + (widthChecker <= 49 ? 37 : 28) + "px",
          name: (
            <div style={{ width: widthChecker + "px", textAlign: "center" }}>
              <label>សកម្មភាព</label>
            </div>
          ),
          selector: (row) => (
            <div
              className="data-table-button"
              style={{
                width: widthChecker + (widthChecker <= 49 ? 20 : 0) + "px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <a
                hidden={!props.actionButton.show_view.show}
                href={props.actionButton.show_view.link}
                onClick={() =>
                  propReceived.onClick({
                    action: "view",
                    data: row,
                  })
                }
              >
                <label style={{ cursor: "pointer" }} className="text-secondary">
                  <FaEye className="icon" size={27} />
                </label>
              </a>
              <a
                hidden={!props.actionButton.show_edit.show}
                href={props.actionButton.show_edit.link}
                onClick={() =>
                  propReceived.onClick({
                    action: "edit",
                    data: row,
                  })
                }
              >
                <label style={{ cursor: "pointer" }} className="text-primary">
                  <FaEdit className="icon" size={20} />
                </label>
              </a>
              <a
                hidden={!props.actionButton.show_delete.show}
                href={props.actionButton.show_delete.link}
                onClick={() =>
                  propReceived.onClick({
                    action: "delete",
                    data: row,
                  })
                }
              >
                <label style={{ cursor: "pointer" }} className="text-danger">
                  <GrTrash className="icon" size={20} />
                </label>
              </a>
            </div>
          ),
        });
      }
    }

    return col;
  }

  function loading() {
    return (
      <div style={{ width: "100%", minHeight: "400px", padding: "0" }}>
        {[...Array(8)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 16px",
              backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa",
              borderBottom: "0.5px solid #e8e8e8",
              gap: "12px",
              animation: "pulse 1.5s ease-in-out infinite",
              width: "100%",
            }}
          >
            <div style={{ width: "50px", minWidth: "50px", height: "18px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            <div style={{ flex: 2, height: "25px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            <div style={{ flex: 1.5, height: "25px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            <div style={{ flex: 1.5, height: "25px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            <div style={{ flex: 1, height: "25px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            <div style={{ flex: 1, height: "25px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            <div style={{ flex: 1, height: "25px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            <div style={{ flex: 0.8, display: "flex", gap: "8px", justifyContent: "center" }}>
              <div style={{ width: "28px", height: "28px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
              <div style={{ width: "28px", height: "28px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
              <div style={{ width: "28px", height: "28px", backgroundColor: "#e0e0e0", borderRadius: "4px" }} />
            </div>
          </div>
        ))}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 0.4; }
            }
          `}
        </style>
      </div>
    );
  }

  function noData() {
    if (isDataFromCache && displayData.length > 0) {
      return null;
    }

    return (
      <div
        style={{
          height: "300px",
          marginTop: "130px",
          padding: "20px",
          fontSize: "16px",
          color: "gray",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {props.errorGetData?.status == true ? errorGetData() : ""}
        <br />
        📁 មិនមានទ័ន្នន័យទាញយក!
      </div>
    );
  }

  function errorGetData() {
    return (
      <div style={{ color: "red" }}>
        <FaDatabase style={{ width: "70px", height: "70px" }} />
        <br />
        <label>Error: {props.errorGetData?.message?.message || props.errorGetData?.message}</label>
      </div>
    );
  }

  const customStyles = {
    table: {
      style: {
        border: "solid #d1d1d1",
        borderRadius: "2px",
        overflow: "hidden",
        borderWidth: props.show_loading == true ? "0px" : "0px",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#025e44",
        color: "white",
        fontFamily: "Siemreap",
        padding: "10px",
        fontSize: "0.9rem",
        borderBottom: "1px solid darkgreen",
        borderLeft: "0px solid #d1d1d1",
        borderRight: "0.5px solid #d1d1d1",
      },
    },
    cells: {
      style: {
        padding: "8px",
        fontFamily: "Siemreap",
        borderBottom: "0.5px solid rgb(246, 246, 246)",
        borderLeft: "0.5px solid rgb(246, 246, 246)",
        borderRight: "0.5px solid #d1d1d1",
      },
    },
    rows: {
      style: {
        backgroundColor: "#f8f9fa",
        borderBottom: "0.5px solid #d1d1d1",
        borderLeft: "0.2px solid #d1d1d1",
        borderRight: "0.2px solid #d1d1d1",
        fontSize: "0.9rem",
        "&:nth-child(odd)": {
          backgroundColor: "white",
        },
        "&:nth-child(even)": {
          backgroundColor: "solidrgb(235, 235, 235)",
        },
        "&:hover": {
          backgroundColor: "#a1eaad6f",
          cursor: "pointer",
        },
      },
    },
  };

  //=================================================
  // View
  return (
    <div className="custom-table" style={{ fontFamily: "Siemreap" }}>
      <div className="container-fluid p-0">
        <div className="row holder-header align-items-center">
          {/* Right side: Page size select and create button */}
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-md-end gap-3 order-1 order-md-2">
            <label className="mb-0 mt-3" htmlFor="pageSizeSelect">
              បង្ហាញ
            </label>
            <select
              id="pageSizeSelect"
              className="form-select w-auto mt-3"
              disabled={props.header?.readonly_select_row}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              value={displayPageSize}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {toKhmerNumber(size)}
                </option>
              ))}
            </select>

            <label className="mb-0 mt-3">ជួរ</label>

            {props.header?.show_create && (
              <button
                type="button"
                className="btn btn-success p-1 mt-3"
                style={{ minWidth: "100px" }}
                onClick={() =>
                  propReceived.onClick({
                    action: "create",
                    data: null,
                  })
                }
              >
                <MdOutlineAdd /> បង្កើត
              </button>
            )}
          </div>

          {/* Left side: Search and filter toggle */}
          <div
            className="col-12 col-md-6 d-flex align-items-center gap-2 order-2 order-md-1 mb-3 mb-md-0"
            style={{ justifyContent: "space-between" }}
          >
            <div style={{ display: "flex" }}>
              <div
                hidden={props.hide_search}
                className="flex-grow-1"
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  marginRight: "10px",
                }}
              >
                <input
                  type="search"
                  onChange={(e) => propReceived.onSearch(e.target.value)}
                  placeholder="🔍 ស្វែងរក..."
                  style={{
                    borderRadius: "3px",
                    paddingLeft: "10px",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    transition: "border-color 0.3s ease",
                    height: "36px",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#9ca3af";
                    e.target.style.boxShadow = "0 0 0 3px rgba(156, 163, 175, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                hidden={props.hide_advance_search}
                type="button"
                className="btn btn-link text-success p-1"
                onClick={() => setadvanceSearchIsOpen(!advanceSearchIsOpen)}
              >
                <FaFilter size={20} className="mt-2" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="row"
          style={{
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingBottom: "15px",
            display: advanceSearchIsOpen ? "block" : "none",
          }}
        >
          <div className="col-md-12">
            <AnimatePresence>
              {advanceSearchIsOpen && (
                <motion.div
                  className="row"
                  style={{
                    paddingLeft: "3px",
                    paddingRight: "3px",
                    overflow: "hidden",
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="col-md-12"
                    hidden={!advanceSearchIsOpen}
                    style={{
                      backgroundColor: "#FAFAFA",
                      borderRadius: "3px",
                      padding: "10px",
                    }}
                  >
                    <div hidden={!advanceSearch}>
                      <h5 className="battambang-bold pt-2">
                        <GrSearchAdvanced /> ស្វែងរកពិសេស (Advance Search)
                      </h5>
                      <hr />
                      <div style={{ marginTop: "-10px" }} className="p-0">
                        {propReceived.advanceComponent}
                      </div>
                    </div>

                    <div className="container-fluid p-0">
                      <div className="row">
                        <div className="col-md-12">
                          <h5 className="battambang-bold">
                            <BiColumns style={{ marginRight: "5px" }} />
                            បង្ហាញបន្ថែម
                          </h5>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12 d-flex flex-wrap">
                          {props.columns.map((row, i) => (
                            <div
                              hidden={row.advance_hidden == true ? true : false}
                              key={row.name + i}
                              className="me-2 mt-2"
                              style={{ minWidth: "200px" }}
                            >
                              <CustomCheckBox
                                onChange={(e) =>
                                  propReceived.advanceSearchChange("column", e)
                                }
                                blockChange={row.defualt}
                                check={!row.omit}
                                id={row.name}
                                title={
                                  row.defualt === true ? (
                                    <>
                                      {row.name}
                                      <span
                                        style={{
                                          color: "gray",
                                          marginLeft: "5px",
                                        }}
                                      >
                                        (ត្រូវបង្ហាញ)
                                      </span>
                                    </>
                                  ) : (
                                    row.name
                                  )
                                }
                                mode="create"
                              />
                            </div>
                          ))}

                          {props.show_status && (
                            <div
                              className="me-2 mt-2"
                              style={{ minWidth: "200px" }}
                            >
                              <CustomCheckBox
                                onChange={(e) => {
                                  if (e.id === "status") {
                                    setadvanceSearchIsShow_Status(
                                      !advanceSearchIsShow_Status,
                                    );
                                  }
                                }}
                                blockChange={false}
                                check={advanceSearchIsShow_Status}
                                id="status"
                                title="ស្ថានភាព"
                                mode="create"
                              />
                            </div>
                          )}

                          <div
                            className="me-2 mt-2"
                            style={{ minWidth: "200px" }}
                          >
                            <CustomCheckBox
                              onChange={(e) => {
                                if (e.id === "action") {
                                  setadvanceSearchIsShow_Action(
                                    !advanceSearchIsShow_Action,
                                  );
                                }
                              }}
                              blockChange={false}
                              check={advanceSearchIsShow_Action}
                              id="action"
                              title="សកម្មភាព"
                              mode="create"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <DataTable
              columns={columnCheck()}
              data={displayData}
              progressPending={props.show_loading && !isDataFromCache}
              progressComponent={loading()}
              noDataComponent={noData()}
              customStyles={customStyles}
              fixedHeader
            />
          </div>
        </div>

        <div
          hidden={displayData.length > 0 ? false : true}
          className="row table-data-pagination-holder"
        >
          <div className="col-md-6">
            <div style={{ paddingTop: "8px" }}>
              <label className="result">
                បង្ហាញ {toKhmerNumber(displayCurrentPage)} នៃ{" "}
                {toKhmerNumber(totalPages)} ទំព័រ ក្នុងលិទ្ធផលសរុប{" "}
                {toKhmerNumber(displayCount)}
                {isDataFromCache && (
                  <span style={{ color: "green", marginLeft: "10px", fontSize: "11px" }}>
                     <GoDotFill color="green"/> កំពុងធ្វើបច្ចុប្បន្នភាព ...
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="col-md-6 text-end" style={{ paddingTop: "0px" }}>
            <div className="btn-group">
              <button
                onClick={() => handlePageChange(1)}
                disabled={displayCurrentPage === 1}
                type="button"
                className="btn btn-light"
                hidden
              >
                ដំបូងគេ
              </button>
              <button
                onClick={() => handlePageChange(displayCurrentPage - 1)}
                disabled={displayCurrentPage === 1}
                type="button"
                className={
                  displayCurrentPage === 1
                    ? '"btn btn-success"'
                    : "btn btn-outline-success"
                }
                style={{
                  borderTopLeftRadius: "5px",
                  borderBottomLeftRadius: "5px",
                }}
              >
                ក្រោយ
              </button>

              {paginationCustomNumber()}
              <button
                onClick={() => handlePageChange(displayCurrentPage + 1)}
                disabled={displayCurrentPage === totalPages}
                type="button"
                className={
                  displayCurrentPage === totalPages
                    ? '"btn btn-success"'
                    : "btn btn-outline-success"
                }
                style={{
                  borderTopRightRadius: "5px",
                  borderBottomRightRadius: "5px",
                }}
              >
                បន្ទាប់
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={displayCurrentPage === totalPages}
                type="button"
                className="btn btn-light"
                hidden
              >
                ចុងក្រោយ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatatableCustom;
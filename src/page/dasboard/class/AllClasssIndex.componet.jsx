import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Component
import Title from "../../../component/Title/Title.component.jsx";
import DataTableCustom from "../../../component/DataTable/datatable.component.jsx";
import RowBreaker from "../../../component/Boostramp/RowBreaker.component.jsx";

// Script
import DatatableScript from "../../../component/DataTable/datatable.script.js";
import { getAllRequest } from "../../../util/request_api.js";
import SwalToast from "../../../component/SwalToast/SwalToast.js";

// Icon
import { MdClass } from "react-icons/md";

const TABLE_CACHE_KEY = "all_classes_teacher_cache";

function AllClasssIndex({ auth }) {
  //===============================================
  // Declaration
  const swalToast = new SwalToast();
  const navigate = useNavigate();

  const logindata = auth?.getClientLogin()?.data || {};
  const teacher_id = logindata?._id;
  const access_token = logindata?.access_token;

  // Track previous teacher_id to detect account change
  const prevTeacherIdRef = useRef(teacher_id);

  const api = teacher_id
    ? `${process.env.REACT_APP_API_HOST}/api/admin/academic/class-get-all-class-by-id-teacher/${teacher_id}`
    : null;

  //**************************************/
  // Table Setup
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dataCount, setDataCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [errorGetData, setErrorGetData] = useState({
    status: false,
    message: "",
  });
  const [isSwitchPageFilter, setIsSwitchPageFilter] = useState(false);
  const [cacheKey, setCacheKey] = useState("");

  //===============================================
  // CLEAR CACHE ON ACCOUNT CHANGE
  //===============================================
  useEffect(() => {
    // Check if teacher_id changed (account switch)
    if (prevTeacherIdRef.current && prevTeacherIdRef.current !== teacher_id) {
      // Clear cache for this table
      clearTableCache();
    }
    prevTeacherIdRef.current = teacher_id;
    
    // Generate unique cache key for this teacher
    if (teacher_id) {
      const newCacheKey = `all_classes_${teacher_id}`;
      setCacheKey(newCacheKey);
    }
  }, [teacher_id]);

  const clearTableCache = () => {
    try {
      // Remove all cache keys related to this table
      const keysToRemove = [
        `${TABLE_CACHE_KEY}_page`,
        `${TABLE_CACHE_KEY}_pageSize`,
        `${TABLE_CACHE_KEY}_data`,
        `${TABLE_CACHE_KEY}_count`,
      ];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      console.log("✅ Table cache cleared on account change");
    } catch (error) {
      console.error("❌ Error clearing cache:", error);
    }
  };

  // Columns
  const [columns, setColumns] = useState([
    {
      defualt: true,
      omit: false,
      name: "កូដ",
      selector: (row) => row.code,
      sortable: true,
    },
    {
      defualt: true,
      omit: false,
      name: "ជំនាញ",
      selector: (row) => row.major_id?.name || "-",
      sortable: true,
    },
    {
      defualt: true,
      omit: false,
      name: "កម្រិត",
      selector: (row) => {
        return row.degree_level_id?.name;
      },
      sortable: true,
    },
    {
      width: '120px',
      defualt: true,
      omit: false,
      name: <div style={{ width: '100px', textAlign: 'center' }}>វេន</div>,
      selector: (row) => {
        return <div style={{ textAlign: 'center', width: '100px' }}>{row.shift_id?.name}</div>
      },
      sortable: false,
    },
    {
      width: '120px',
      defualt: true,
      omit: false,
      name: <div style={{ width: '100px', textAlign: 'center' }}>ស្ថានភាព</div>,
      selector: (row) => {
        const labels = {
          start: "កំពុងបង្រៀន",
          pending: "មិនទាន់ចាប់ផ្តើម",
          closed: "បានបញ្ចប់",
        };
        const colors = {
          start: "#0dc25e",
          pending: "#f59e0b",
          closed: "#ef4444",
        };
        return (
          <span
            className="siemreap-regular"
            style={{
              width: '100px',
              textAlign: 'center',
              background: colors[row.class_status] || "#6b7280",
              color: "white",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "500",
              display: "inline-block",
            }}
          >
            {labels[row.class_status] || row.class_status}
          </span>
        );
      },
      sortable: false,
    },
    {
      defualt: false,
      omit: true,
      name: "ឆ្នាំសិក្សា",
      selector: (row) => `${row.year_study_from} - ${row.year_study_to}`,
      sortable: true,
    },
    {
      defualt: false,
      omit: true,
      name: "កាលបរិច្ឆេទបង្កើត",
      selector: (row) => {
        if (!row.created_date) return "-";
        const date = new Date(row.created_date);
        return date.toLocaleDateString("km-KH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
      sortable: true,
    },
  ]);

  function columnClicked(setColumns, e) {
    setColumns((prev) =>
      prev.map((col) =>
        col.name === e.title ? { ...col, omit: !e.value } : col,
      ),
    );
  }

  const script = new DatatableScript(
    columns,
    dataCount,
    setDataCount,
    logindata,
    setData,
    isLoading,
    setIsLoading,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    isSwitchPageFilter,
    setIsSwitchPageFilter,
    searchValue,
    setSearchValue,
  );

  //===============================================
  // Load Data
  //===============================================
  useEffect(() => {
    if (teacher_id && access_token && api) {
      loadData();
    } else if (!teacher_id || !access_token) {
      swalToast.toastError("មិនអាចកំណត់អត្តសញ្ញាណគ្រូបង្រៀន ឬ Token មិនត្រឹមត្រូវ!", 3000);
      setIsLoading(false);
    }
  }, [teacher_id, access_token, currentPage, pageSize, searchValue]);

  async function loadData() {
    if (!api || !access_token) return;
    setIsLoading(true);
    try {
      let params = {
        page: currentPage,
        limit: pageSize,
      };

      // Search filter
      if (searchValue) {
        params.q = searchValue;
        params.q_key = JSON.stringify(["code", "major_id.name", "room_id.name"]);
      }

      const result = await getAllRequest(api, access_token, params);
      if (result.success) {
        const resultData = result?.data?.data || [];
        const paginationData = result?.data?.pagination || result?.pagination || null;

        if (paginationData) {
          setDataCount(paginationData.total || resultData.length);
          if (paginationData.currentPage !== currentPage) {
            setCurrentPage(paginationData.currentPage || 1);
          }
          if (paginationData.pageSize) {
            setPageSize(paginationData.pageSize);
          }
        } else {
          setDataCount(resultData.length);
          setCurrentPage(1);
        }

        setData(resultData);
        setErrorGetData({ status: false, message: "" });
      } else {
        setErrorGetData({
          status: true,
          message: result.message || "មិនអាចទាញយកទិន្នន័យបានទេ!",
        });
        // Clear data on error
        setData([]);
        setDataCount(0);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setErrorGetData({
        status: true,
        message: "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!",
      });
      setData([]);
      setDataCount(0);
    }
    setIsLoading(false);
  }

  //===============================================
  // Action - Navigate to View Detail
  //===============================================
  function actionButtonDataTable(e) {
    if (e.action == "view") {
      navigate(`/admin/academic-management/class/${e.data._id}`);
    }
  }

  //===============================================
  // View
  if (!teacher_id || !access_token) {
    return (
      <div className="container defualt_White_Shadow_Theme" style={{ padding: "40px", textAlign: "center" }}>
        <h4>⛔ មិនអាចកំណត់អត្តសញ្ញាណគ្រូបង្រៀន</h4>
        <p>សូមប្រាកដថាអ្នកបានចូលប្រើប្រាស់ជាគ្រូបង្រៀន។</p>
      </div>
    );
  }

  return (
    <div>
      <div className="container defualt_White_Shadow_Theme">
        <RowBreaker />
        <div className="row">
          <div className="col-md-12">
            <Title mode={"list"} title={"ថ្នាក់ទាំងអស់"} />
          </div>
        </div>

        <RowBreaker />

        {/* Data Table - Only Table, No Filters */}
        <div className="row">
          <div className="col-md-12">
            <DataTableCustom
              advanceSearchChange={(action, e) => {
                columnClicked(setColumns, e);
              }}
              advanceSearch={false}
              onChangePage={script.handlePageChange}
              onSearch={script.handleSearchChange}
              onClick={(e, data) => {
                actionButtonDataTable(e);
              }}
              props={{
                errorGetData: errorGetData,
                show_loading: isLoading,
                header: {
                  show_create: false,
                  title: "បញ្ជីថ្នាក់ទាំងអស់",
                },
                columns: columns,
                data: data,
                pagination: {
                  currentPage: currentPage,
                  rowsPerPage: pageSize,
                  count: dataCount,
                },
                show_status: false,
                cache_name: `all_classes_${teacher_id}`, // ✅ Unique cache key per teacher
                actionButton: {
                  show_view: { show: true, link: null },
                  show_edit: { show: false, link: "#" },
                  show_delete: { show: false, link: "#" },
                },
              }}
            />
          </div>
        </div>

        <RowBreaker break={2} />
      </div>
    </div>
  );
}

export default AllClasssIndex;
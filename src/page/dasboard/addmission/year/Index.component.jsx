import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Component
import CustomSelect from "../../../../component/Select/CustomSelect.component.jsx";
import Title from "../../../../component/Title/Title.component.jsx";
import DataTableCustom from "../../../../component/DataTable/datatable.component.jsx";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component.jsx";
import Loading from "../../../../component/Loading/Loading.component.jsx";

// Script
import CustomInputHelper from "../../../../component/Input/CustomInputHelper.script.js";
import CustomSelectScript from "../../../../component/Select/CustomSelect.script.js";
import DatatableScript from "../../../../component/DataTable/datatable.script.js";
import RouteScript from "../../../../route/route.script.js";
import { getAllRequest } from "../../../../util/request_api.js";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";

// Icon
import {
  FaUsers,
  FaCalendarAlt,
  FaBookOpen,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";
import { MdClass } from "react-icons/md";

// Colors
const COLORS = [
  "#0dc25e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

// Cache keys - only for stats
const CACHE_KEYS = {
  STATUS_COUNTS: "class_dashboard_status_counts",
  STATS: "class_dashboard_stats",
  TIMESTAMP: "class_dashboard_timestamp",
};

// Cache expiration (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

function Index({ auth }) {
  //===============================================
  // Declaration
  const swalToast = new SwalToast();
  const navigate = useNavigate();


  const logindata = auth?.getClientLogin()?.data || {};
  const teacher_id = logindata?._id;        
  const access_token = logindata?.access_token;


  const api = teacher_id
    ? `${process.env.REACT_APP_API_HOST}/api/admin/academic/class-get-all-class-by-id-teacher/${teacher_id}`
    : null;


  //**************************************/
  // Table Setup
  const customSelectScript = new CustomSelectScript();
  const [isLoading, setisLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dataCount, setdataCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setsearchValue] = useState("");
  const [query, setquery] = useState("");
  const [errorGetData, seterrorGetData] = useState({
    status: false,
    message: "",
  });
  const [isSwitchPageFilter, setisSwitchPageFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedYear, setSelectedYear] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    start: 0,
    pending: 0,
    closed: 0,
    shifts: [],
    degrees: [],
    majors: [],
    yearly: [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    start: 0,
    pending: 0,
    closed: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [isAdvancedSearchActive, setIsAdvancedSearchActive] = useState(false);

  // Advanced Search States
  const [searchShift, setsearchShift] = useState({
    title: "វេនសិក្សា",
    id: "",
    required: false,
    is_correct: true,
    error: "សូមជ្រើសរើសវេន",
    data: [
      { value: "1", label: "ព្រឹក" },
      { value: "2", label: "រសៀល" },
      { value: "3", label: "ល្ងាច" },
      { value: "4", label: "សៅរ៍-អាទិត្យ" },
    ],
    value: "",
    defualtValue: "",
    defualtTitle: "ជ្រើសរើសវេន",
    display: "flex",
  });

  const [searchDegree, setsearchDegree] = useState({
    title: "កម្រិតសិក្សា",
    id: "",
    required: false,
    is_correct: true,
    error: "សូមជ្រើសរើសកម្រិត",
    data: [
      { value: "certificate", label: "វិញ្ញាបនបត្រ" },
      { value: "associate", label: "បរិញ្ញាបត្ររង" },
      { value: "bachelor", label: "បរិញ្ញាបត្រ" },
      { value: "master", label: "បរិញ្ញាបត្រជាន់ខ្ពស់" },
      { value: "phd", label: "បណ្ឌិត" },
    ],
    value: "",
    defualtValue: "",
    defualtTitle: "ជ្រើសរើសកម្រិត",
    display: "flex",
  });

  const [searchMajor, setsearchMajor] = useState({
    title: "ជំនាញ",
    id: "",
    required: false,
    is_correct: true,
    error: "សូមជ្រើសរើសជំនាញ",
    data: [],
    value: "",
    defualtValue: "",
    defualtTitle: "ជ្រើសរើសជំនាញ",
    display: "flex",
  });

  const [searchAcademicYear, setsearchAcademicYear] = useState({
    title: "ឆ្នាំសិក្សា",
    id: "",
    required: false,
    is_correct: true,
    error: "សូមជ្រើសរើសឆ្នាំសិក្សា",
    data: [],
    value: "",
    defualtValue: "",
    defualtTitle: "ជ្រើសរើសឆ្នាំសិក្សា",
    display: "flex",
  });

  // Columns
  const [columns, setcolumns] = useState([
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
        const map = {
          certificate: "វិញ្ញាបនបត្រ",
          associate: "បរិញ្ញាបត្ររង",
          bachelor: "បរិញ្ញាបត្រ",
          master: "បរិញ្ញាបត្រជាន់ខ្ពស់",
          phd: "បណ្ឌិត",
        };
        return map[row.degree_level] || row.degree_level || "-";
      },
      sortable: true,
    },
    {
      defualt: true,
      omit: false,
      name: "វេន",
      selector: (row) => {
        const map = {
          1: "ព្រឹក",
          2: "រសៀល",
          3: "ល្ងាច",
          4: "សៅរ៍-អាទិត្យ",
        };
        return map[row.shift] || row.shift || "-";
      },
      sortable: true,
    },

    {
      defualt: true,
      omit: false,
      name: "ស្ថានភាព",
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
      sortable: true,
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

  function columnClicked(setcolumns, e) {
    setcolumns((prev) =>
      prev.map((col) =>
        col.name === e.title ? { ...col, omit: !e.value } : col,
      ),
    );
  }

  const script = new DatatableScript(
    columns,
    dataCount,
    setdataCount,
    logindata,
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
  );

  // Year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    yearOptions.push(year);
  }

  // Status options with their API query values
  const statusOptions = [
    { value: "all", label: "ទាំងអស់", icon: <FaUsers />, query: "" },
    {
      value: "start",
      label: "កំពុងបង្រៀន",
      icon: <FaCheckCircle />,
      query: "start",
    },
    {
      value: "pending",
      label: "មិនទាន់ចាប់ផ្តើម",
      icon: <FaHourglassHalf />,
      query: "pending",
    },
    {
      value: "closed",
      label: "បានបញ្ចប់",
      icon: <FaTimesCircle />,
      query: "closed",
    },
  ];

  //===============================================
  // Cache Helper Functions - Only for stats
  //===============================================
  const loadStatsFromCache = () => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age > CACHE_EXPIRY) {
          // Cache expired
          localStorage.removeItem(CACHE_KEYS.STATUS_COUNTS);
          localStorage.removeItem(CACHE_KEYS.STATS);
          localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
          return null;
        }
      }

      const cachedCounts = localStorage.getItem(CACHE_KEYS.STATUS_COUNTS);
      const cachedStats = localStorage.getItem(CACHE_KEYS.STATS);

      if (cachedCounts && cachedStats) {
        return {
          statusCounts: JSON.parse(cachedCounts),
          stats: JSON.parse(cachedStats),
        };
      }
      return null;
    } catch (error) {
      console.error("Error loading stats from cache:", error);
      return null;
    }
  };

  const saveStatsToCache = (statusCounts, statsData) => {
    try {
      localStorage.setItem(
        CACHE_KEYS.STATUS_COUNTS,
        JSON.stringify(statusCounts),
      );
      localStorage.setItem(CACHE_KEYS.STATS, JSON.stringify(statsData));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error("Error saving stats to cache:", error);
    }
  };

  //===============================================
  // Loading - Initial load with stats cache only
  //===============================================
  useEffect(() => {
    // Only load if we have a teacher ID and access token
    if (teacher_id && access_token && api) {
      loadAllStats();
      loadMajorOptions();
      loadAcademicYearOptions();
    } else {
      // Show error if missing authentication
      swalToast.toastError("មិនអាចកំណត់អត្តសញ្ញាណគ្រូបង្រៀន ឬ Token មិនត្រឹមត្រូវ!", 3000);
      setisLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher_id, access_token]); // Re-run if teacher_id or token changes

  async function loadMajorOptions() {
    if (!access_token) return;
    try {
      const result = await getAllRequest(
        `${process.env.REACT_APP_API_HOST}/api/admin/academic/major-filter-all`,
        access_token,
        { page: 1, limit: 10000 }
      );
      if (result.success) {
        const majors = result?.data?.data || [];
        setsearchMajor(prev => ({
          ...prev,
          data: majors.map(m => ({ value: m._id, label: m.name }))
        }));
      }
    } catch (error) {
      console.error("Error loading majors:", error);
    }
  }

  function loadAcademicYearOptions() {
    const years = [];
    const startYear = 2015;
    const endYear = currentYear + 5;
    
    for (let year = startYear; year <= endYear; year++) {
      const fromYear = year;
      const toYear = year + 1;
      const displayValue = `${fromYear} - ${toYear}`;
      years.push({ 
        value: `${fromYear}-${toYear}`, 
        label: displayValue,
        from: fromYear,
        to: toYear
      });
    }
    
    setsearchAcademicYear(prev => ({
      ...prev,
      data: years
    }));
  }

  async function loadAllStats() {
    setIsStatsLoading(true);

    // 🔥 Try to load stats from cache first
    const cachedStats = loadStatsFromCache();
    if (cachedStats) {
      // Use cached stats immediately
      setStatusCounts(cachedStats.statusCounts);
      setStats(cachedStats.stats);
      setIsCached(true);
      setIsStatsLoading(false);

      // 🔥 Load fresh table data from API
      await fetchTableData();
      return;
    }

    // No cache - load everything from API
    await fetchInitialData();
  }

  async function fetchTableData() {
    if (!api || !access_token) return;
    try {
      // Load first page with pagination
      const allResult = await getAllRequest(api, access_token, {
        page: currentPage,
        limit: pageSize,
      });

      const allData = allResult?.data?.data || [];
      const paginationData =
        allResult?.data?.pagination || allResult?.pagination || null;

      setData(allData);
      setFilteredData(allData);

      if (paginationData) {
        setdataCount(paginationData.total || allData.length);
        setCurrentPage(paginationData.currentPage || 1);
        if (paginationData.pageSize) {
          setPageSize(paginationData.pageSize);
        }
      } else {
        setdataCount(allData.length);
        setCurrentPage(1);
      }

      setisLoading(false);
      setIsAllLoaded(true);
    } catch (error) {
      console.error("❌ Error loading table data:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យតារាង!", 3000);
      setisLoading(false);
    }
  }

  async function fetchInitialData() {
    if (!api || !access_token) return;
    try {
      // Load first page with pagination
      const allResult = await getAllRequest(api, access_token, {
        page: 1,
        limit: pageSize,
      });

      const allData = allResult?.data?.data || [];
      const paginationData =
        allResult?.data?.pagination || allResult?.pagination || null;

      setData(allData);
      setFilteredData(allData);

      if (paginationData) {
        setdataCount(paginationData.total || allData.length);
        setCurrentPage(paginationData.currentPage || 1);
        if (paginationData.pageSize) {
          setPageSize(paginationData.pageSize);
        }
      } else {
        setdataCount(allData.length);
        setCurrentPage(1);
      }

      const statsData = calculateStatsData(allData);
      setStats(statsData);
      setisLoading(false);

      // Get total count for stats card
      const totalCountResult = await getAllRequest(api, access_token, {
        page: 1,
        limit: 10000,
      });
      const totalAllData = totalCountResult?.data?.data || [];

      const counts = {
        all: totalAllData.length,
        start: 0,
        pending: 0,
        closed: 0,
      };

      // Load status counts
      const [startResult, pendingResult, closedResult] = await Promise.all([
        getAllRequest(api, access_token, {
          q: "start",
          q_key: JSON.stringify(["class_status"]),
          page: 1,
          limit: 10000,
        }),
        getAllRequest(api, access_token, {
          q: "pending",
          q_key: JSON.stringify(["class_status"]),
          page: 1,
          limit: 10000,
        }),
        getAllRequest(api, access_token, {
          q: "closed",
          q_key: JSON.stringify(["class_status"]),
          page: 1,
          limit: 10000,
        }),
      ]);

      counts.start = startResult?.data?.data?.length || 0;
      counts.pending = pendingResult?.data?.data?.length || 0;
      counts.closed = closedResult?.data?.data?.length || 0;

      setStatusCounts(counts);

      // Save stats to cache only
      saveStatsToCache(counts, statsData);

      setIsAllLoaded(true);
    } catch (error) {
      console.error("❌ Error loading stats:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 3000);
      setisLoading(false);
    } finally {
      setIsStatsLoading(false);
    }
  }

  function calculateStatsData(resultData) {
    const total = resultData.length;
    const start = resultData.filter((c) => c.class_status === "start").length;
    const pending = resultData.filter(
      (c) => c.class_status === "pending",
    ).length;
    const closed = resultData.filter((c) => c.class_status === "closed").length;

    const shiftMap = {};
    resultData.forEach((cls) => {
      const shiftLabels = {
        1: "ព្រឹក",
        2: "រសៀល",
        3: "ល្ងាច",
        4: "សៅរ៍-អាទិត្យ",
      };
      const label = shiftLabels[cls.shift] || cls.shift || "N/A";
      shiftMap[label] = (shiftMap[label] || 0) + 1;
    });
    const shifts = Object.entries(shiftMap).map(([name, count]) => ({
      name,
      count,
    }));

    const degreeMap = {};
    const degreeLabels = {
      certificate: "វិញ្ញាបនបត្រ",
      associate: "បរិញ្ញាបត្ររង",
      bachelor: "បរិញ្ញាបត្រ",
      master: "បរិញ្ញាបត្រជាន់ខ្ពស់",
      phd: "បណ្ឌិត",
    };
    resultData.forEach((cls) => {
      const degree =
        degreeLabels[cls.degree_level] || cls.degree_level || "N/A";
      degreeMap[degree] = (degreeMap[degree] || 0) + 1;
    });
    const degrees = Object.entries(degreeMap).map(([name, count]) => ({
      name,
      count,
    }));

    const majorMap = {};
    resultData.forEach((cls) => {
      const major = cls.major_id?.name || "N/A";
      majorMap[major] = (majorMap[major] || 0) + 1;
    });
    const majors = Object.entries(majorMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const yearMap = {};
    resultData.forEach((cls) => {
      if (cls.created_date) {
        const year = new Date(cls.created_date).getFullYear();
        yearMap[year] = (yearMap[year] || 0) + 1;
      }
    });
    const yearly = Object.entries(yearMap)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);

    return { total, start, pending, closed, shifts, degrees, majors, yearly };
  }

  //===============================================
  // Load Data based on filter
  //===============================================
  useEffect(() => {
    if (isAllLoaded && api && access_token) {
      loadData();
    }
  }, [selectedStatus, selectedYear, currentPage, pageSize, searchValue, 
      searchShift.value, searchDegree.value, searchMajor.value, searchAcademicYear.value]);

  async function loadData() {
    if (!api || !access_token) return;
    setisLoading(true);
    try {
      let params = {
        page: currentPage,
        limit: pageSize,
      };

      // Build query for search
      const queryConditions = [];
      const queryKeys = [];

      // Status filter
      if (selectedStatus !== "all") {
        queryConditions.push(selectedStatus);
        queryKeys.push("class_status");
      }

      // Shift filter
      if (searchShift.value) {
        queryConditions.push(searchShift.value);
        queryKeys.push("shift");
      }

      // Degree filter
      if (searchDegree.value) {
        queryConditions.push(searchDegree.value);
        queryKeys.push("degree_level");
      }

      // Major filter
      if (searchMajor.value) {
        queryConditions.push(searchMajor.value);
        queryKeys.push("major_id");
      }

      // Academic Year filter - using year_study_from and year_study_to
      // Pass numbers, not strings to avoid CastError
      if (searchAcademicYear.value) {
        const yearData = searchAcademicYear.data.find(item => item.value === searchAcademicYear.value);
        if (yearData) {
          queryConditions.push(yearData.from);
          queryKeys.push("year_study_from");
          queryConditions.push(yearData.to);
          queryKeys.push("year_study_to");
        }
      }

      // Search value filter (from main search)
      if (searchValue) {
        queryConditions.push(searchValue);
        queryKeys.push("code");
        queryKeys.push("major_id.name");
        queryKeys.push("room_id.name");
      }

      // Apply query if there are conditions
      if (queryConditions.length > 0) {
        params.q = queryConditions.join(",");
        params.q_key = JSON.stringify(queryKeys);
      }

      // Year filter (from year select - this is a separate filter)
      if (selectedYear) {
        params.page = 1;
        params.limit = 10000;
      }

      const result = await getAllRequest(api, access_token, params);
      if (result.success) {
        let resultData = result?.data?.data || [];
        let paginationData =
          result?.data?.pagination || result?.pagination || null;

        // Apply additional year filter if selected (from the year dropdown)
        if (selectedYear) {
          resultData = resultData.filter((cls) => {
            const year = new Date(cls.created_date).getFullYear();
            return year === parseInt(selectedYear);
          });
          setdataCount(resultData.length);
          setCurrentPage(1);
        } 
        // Apply academic year filter (from advanced search) - client-side filtering
        else if (searchAcademicYear.value) {
          const yearData = searchAcademicYear.data.find(item => item.value === searchAcademicYear.value);
          if (yearData) {
            resultData = resultData.filter((cls) => {
              const from = parseInt(cls.year_study_from);
              const to = parseInt(cls.year_study_to);
              return from === yearData.from && to === yearData.to;
            });
            setdataCount(resultData.length);
            setCurrentPage(1);
          }
        } 
        else if (paginationData) {
          setdataCount(paginationData.total || resultData.length);
          if (paginationData.currentPage !== currentPage) {
            setCurrentPage(paginationData.currentPage || 1);
          }
          if (paginationData.pageSize) {
            setPageSize(paginationData.pageSize);
          }
        } else {
          setdataCount(resultData.length);
          setCurrentPage(1);
        }

        setData(resultData);
        setFilteredData(resultData);
        setStats(calculateStatsData(resultData));
        seterrorGetData({ status: false, message: "" });
      } else {
        seterrorGetData({
          status: true,
          message: result.message || "មិនអាចទាញយកទិន្នន័យបានទេ!",
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      seterrorGetData({
        status: true,
        message: "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!",
      });
    }
    setisLoading(false);
  }

  function handleStatusChange(status) {
    setSelectedStatus(status);
    setCurrentPage(1);
    if (status === "closed") {
      setSelectedYear("");
    }
  }

  function handleYearChange(year) {
    setSelectedYear(year);
    setCurrentPage(1);
  }

  // Clear all advanced search filters
  function clearAdvancedSearch() {
    setsearchShift(prev => ({ ...prev, value: "" }));
    setsearchDegree(prev => ({ ...prev, value: "" }));
    setsearchMajor(prev => ({ ...prev, value: "" }));
    setsearchAcademicYear(prev => ({ ...prev, value: "" }));
    setCurrentPage(1);
  }

  //===============================================
  // Action - Navigate to View Detail
  //===============================================
  function actionButtonDataTable(e) {
    if (e.action == "create") {
      // Navigate to create class page
      navigate("/admin/academic/class/create");
    } else if (e.action == "view") {
      navigate(`/admin/academic-management/class/${e.data._id}`);
    }
  }

  function advancedSearch() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <CustomSelect
              props={{ select: searchShift, mode: 'create' }}
              event={(action, e) => {
                customSelectScript.OnchangeTriggerChangeToAutoCorrection(
                  e,
                  setsearchShift,
                  true,
                );
              }}
            />
          </div>
          <div className="col-md-3">
            <CustomSelect
              props={{ select: searchDegree, mode: 'create' }}
              event={(action, e) => {
                customSelectScript.OnchangeTriggerChangeToAutoCorrection(
                  e,
                  setsearchDegree,
                  true,
                );
              }}
            />
          </div>
          <div className="col-md-3">
            <CustomSelect
              props={{ select: searchMajor, mode: 'create' }}
              event={(action, e) => {
                customSelectScript.OnchangeTriggerChangeToAutoCorrection(
                  e,
                  setsearchMajor,
                  true,
                );
              }}
            />
          </div>
          <div className="col-md-3">
            <CustomSelect
              props={{ select: searchAcademicYear, mode: 'create' }}
              event={(action, e) => {
                customSelectScript.OnchangeTriggerChangeToAutoCorrection(
                  e,
                  setsearchAcademicYear,
                  true,
                );
              }}
            />
          </div>
        </div>
  
        <RowBreaker />
      </div>
    );
  }

  //===============================================
  // View
  // If teacher_id is missing, show error
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
            <Title mode={"list"} title={"វគ្គសិក្សារបស់ខ្ញុំ"} />
          </div>
        </div>

        <div className="row" style={{ marginBottom: "24px" }}>
          <div className="col-md-3">
            <div
              className="siemreap-regular"
              style={{
                background: "linear-gradient(135deg, #0dc25e, #02a33d)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(13, 194, 94, 0.3)",
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onClick={() => handleStatusChange("all")}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", opacity: 0.8 }}>
                    ថ្នាក់សរុប
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700" }}>
                    {statusCounts.all}
                  </div>
                </div>
                <MdClass style={{ fontSize: "40px", opacity: 0.5 }} />
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="siemreap-regular"
              style={{
                background: "linear-gradient(135deg, #0dc25e, #02a33d)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(13, 194, 94, 0.3)",
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onClick={() => handleStatusChange("start")}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", opacity: 0.8 }}>
                    កំពុងបង្រៀន
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700" }}>
                    {statusCounts.start}
                  </div>
                </div>
                <FaChalkboardTeacher
                  style={{ fontSize: "40px", opacity: 0.5 }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="siemreap-regular"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onClick={() => handleStatusChange("pending")}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", opacity: 0.8 }}>
                    មិនទាន់ចាប់ផ្តើម
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700" }}>
                    {statusCounts.pending}
                  </div>
                </div>
                <FaClock style={{ fontSize: "40px", opacity: 0.5 }} />
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="siemreap-regular"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(239, 68, 68, 0.3)",
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onClick={() => handleStatusChange("closed")}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", opacity: 0.8 }}>
                    បានបញ្ចប់
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "700" }}>
                    {statusCounts.closed}
                  </div>
                </div>
                <FaGraduationCap style={{ fontSize: "40px", opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row" style={{ marginBottom: "24px" }}>
          <div className="col-md-12">
            <div className="filter-group">
              <label
                className="siemreap-regular"
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                <FaBookOpen style={{ marginRight: "6px" }} /> ស្ថានភាព
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    className="siemreap-regular"
                    onClick={() => handleStatusChange(status.value)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border:
                        selectedStatus === status.value
                          ? "2px solid #0dc25e"
                          : "2px solid #e5e7eb",
                      background:
                        selectedStatus === status.value
                          ? "rgba(13, 194, 94, 0.1)"
                          : "transparent",
                      color:
                        selectedStatus === status.value ? "#0dc25e" : "#6b7280",
                      fontSize: "13px",
                      fontFamily: "'Siemreap', sans-serif",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {status.icon} {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="row">
          <div className="col-md-12">
            <DataTableCustom
              advanceSearchChange={(action, e) => {
                columnClicked(setcolumns, e);
              }}
              advanceSearch={true}
              advanceComponent={advancedSearch()}
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
                  title: "បញ្ជីថ្នាក់",
                },
                columns: columns,
                data: filteredData,
                pagination: {
                  currentPage: currentPage,
                  rowsPerPage: pageSize,
                  count: dataCount,
                },
                show_status: false,
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

export default Index;
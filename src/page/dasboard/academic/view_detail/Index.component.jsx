import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getByIdRequest,
  updateRequest,
  deleteRequest,
} from "../../../../util/request_api";
import { FaGraduationCap } from "react-icons/fa6";
import { MdClass, MdAnalytics } from "react-icons/md";
import { FaCalendarAlt, FaUsers, FaChartBar, FaPlus, FaUserCheck, FaCheckCircle } from "react-icons/fa";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import Loading from "../../../../component/Loading/LoadingFit.component.jsx";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";
import AttendanceTab from "./AttendanceTab.component.jsx";
import AcademicTableCreate from "./AcademicTableCreate.component.jsx";
import StudentInClassCreate from "./StudentInClassCreate.jsx";
// Import tabs
import ClassDetailTab from "./ClassDetailTab";
import TimetableTab from "./TimetableTab";
import StudentsTab from "./StudentsTab";
import AnalyticsTab from "./AnalyticsTab";
import ScoreTab from "./ScoreTab";
import ResultTab from "./ResultTab";
import { FaArrowLeft } from "react-icons/fa";
import { AiOutlineNumber } from "react-icons/ai";
import StatisticsTab from "./StatisticsTab.jsx";
// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// ==========================================
// Skeleton Loading Components
// ==========================================
const SkeletonHeader = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="row"
  >
    <div className="col-md-12">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            background: "#e5e7eb",
            borderRadius: "4px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        ></div>
        <div
          style={{
            width: "50%",
            height: "24px",
            background: "#e5e7eb",
            borderRadius: "4px",
            animation: "pulse 1.5s ease-in-out infinite 0.2s",
          }}
        ></div>
      </div>
      <hr />
    </div>
  </motion.div>
);

const SkeletonButton = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    style={{
      width: "150px",
      height: "38px",
      background: "#e5e7eb",
      borderRadius: "6px",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

const SkeletonStatusBadge = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    style={{
      width: "120px",
      height: "36px",
      background: "#e5e7eb",
      borderRadius: "20px",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

const SkeletonProgressBar = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    style={{
      background: "#f8f9fa",
      borderRadius: "8px",
      padding: "15px 20px",
      border: "1px solid #e9ecef",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <div
          style={{
            width: "150px",
            height: "16px",
            background: "#e5e7eb",
            borderRadius: "4px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        ></div>
        <div
          style={{
            width: "100px",
            height: "14px",
            background: "#e5e7eb",
            borderRadius: "4px",
            animation: "pulse 1.5s ease-in-out infinite 0.2s",
          }}
        ></div>
        <div
          style={{
            width: "100px",
            height: "14px",
            background: "#e5e7eb",
            borderRadius: "4px",
            animation: "pulse 1.5s ease-in-out infinite 0.3s",
          }}
        ></div>
        <div
          style={{
            width: "100px",
            height: "14px",
            background: "#e5e7eb",
            borderRadius: "4px",
            animation: "pulse 1.5s ease-in-out infinite 0.4s",
          }}
        ></div>
      </div>
      <div
        style={{
          width: "50px",
          height: "16px",
          background: "#e5e7eb",
          borderRadius: "4px",
          animation: "pulse 1.5s ease-in-out infinite 0.5s",
        }}
      ></div>
    </div>
    <div
      style={{
        width: "100%",
        height: "10px",
        background: "#e5e7eb",
        borderRadius: "5px",
        animation: "pulse 1.5s ease-in-out infinite 0.6s",
      }}
    ></div>
    <div
      style={{
        marginTop: "12px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid #e9ecef",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "12px",
              background: "#e5e7eb",
              borderRadius: "4px",
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
            }}
          ></div>
          <div
            style={{
              width: "40px",
              height: "6px",
              background: "#e5e7eb",
              borderRadius: "3px",
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.15}s`,
            }}
          ></div>
          <div
            style={{
              width: "30px",
              height: "11px",
              background: "#e5e7eb",
              borderRadius: "4px",
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`,
            }}
          ></div>
        </div>
      ))}
    </div>
  </motion.div>
);

const SkeletonTab = ({ delay = 0 }) => (
  <motion.li
    className="nav-item"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
  >
    <div
      style={{
        padding: "12px 20px",
        background: "#e5e7eb",
        borderRadius: "4px 4px 0 0",
        width: "120px",
        height: "46px",
        animation: "pulse 1.5s ease-in-out infinite",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          background: "#d1d5db",
          borderRadius: "4px",
        }}
      ></div>
      <div
        style={{
          width: "60%",
          height: "14px",
          background: "#d1d5db",
          borderRadius: "4px",
        }}
      ></div>
    </div>
  </motion.li>
);

const SkeletonContent = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    style={{ padding: "10px 0" }}
  >
    <div
      style={{
        width: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          background: "#f3f4f6",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "16px",
              background: "#d1d5db",
              borderRadius: "4px",
              marginRight: i < 5 ? "8px" : 0,
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            padding: "12px 16px",
            borderBottom: i < 4 ? "1px solid #e5e7eb" : "none",
            animation: `pulse 1.5s ease-in-out infinite ${0.1 + i * 0.1}s`,
          }}
        >
          {[1, 2, 3, 4, 5].map((j) => (
            <div
              key={j}
              style={{
                flex: 1,
                height: "14px",
                background: "#e5e7eb",
                borderRadius: "4px",
                marginRight: j < 5 ? "8px" : 0,
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </motion.div>
);

// ==========================================
// Skeleton for Statistics Tab
// ==========================================
const SkeletonStatistics = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    style={{ padding: "10px 0" }}
  >
    {/* Statistics Cards Skeleton */}
    <div className="row g-3 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid #e9ecef",
              padding: "20px",
              background: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div
                  style={{
                    width: "100px",
                    height: "16px",
                    background: "#e5e7eb",
                    borderRadius: "4px",
                    animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
                  }}
                ></div>
                <div
                  style={{
                    width: "60px",
                    height: "32px",
                    background: "#e5e7eb",
                    borderRadius: "4px",
                    marginTop: "8px",
                    animation: `pulse 1.5s ease-in-out infinite ${i * 0.15}s`,
                  }}
                ></div>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#e5e7eb",
                  animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="row g-4">
      <div className="col-xl-6 col-lg-6 col-md-12">
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #e9ecef",
            padding: "20px",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "#e5e7eb",
              borderRadius: "4px",
              marginBottom: "16px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              width: "100%",
              height: "250px",
              background: "#f3f4f6",
              borderRadius: "8px",
              animation: "pulse 1.5s ease-in-out infinite 0.2s",
            }}
          ></div>
        </div>
      </div>
      <div className="col-xl-6 col-lg-6 col-md-12">
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #e9ecef",
            padding: "20px",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "#e5e7eb",
              borderRadius: "4px",
              marginBottom: "16px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              width: "100%",
              height: "250px",
              background: "#f3f4f6",
              borderRadius: "8px",
              animation: "pulse 1.5s ease-in-out infinite 0.3s",
            }}
          ></div>
        </div>
      </div>
    </div>

    {/* Student List Skeleton */}
    <div className="row g-4 mt-2">
      <div className="col-12">
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #e9ecef",
            padding: "20px",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "#e5e7eb",
              borderRadius: "4px",
              marginBottom: "16px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "#f3f4f6",
                padding: "12px 16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "16px",
                    background: "#d1d5db",
                    borderRadius: "4px",
                    marginRight: i < 6 ? "8px" : 0,
                    animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "12px 16px",
                  borderBottom: i < 4 ? "1px solid #e5e7eb" : "none",
                  animation: `pulse 1.5s ease-in-out infinite ${0.1 + i * 0.1}s`,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div
                    key={j}
                    style={{
                      flex: 1,
                      height: "14px",
                      background: "#e5e7eb",
                      borderRadius: "4px",
                      marginRight: j < 6 ? "8px" : 0,
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// ==========================================
// Skeleton for Result Tab
// ==========================================
const SkeletonResult = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    style={{ padding: "10px 0" }}
  >
    {/* 3 Circle Stats Skeleton */}
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#ffffff",
            padding: "8px 20px 8px 12px",
            borderRadius: "50px",
            border: "2px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#e5e7eb",
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
            }}
          ></div>
          <div>
            <div
              style={{
                width: "80px",
                height: "14px",
                background: "#e5e7eb",
                borderRadius: "4px",
                animation: `pulse 1.5s ease-in-out infinite ${i * 0.15}s`,
              }}
            ></div>
            <div
              style={{
                width: "60px",
                height: "16px",
                background: "#e5e7eb",
                borderRadius: "4px",
                marginTop: "4px",
                animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>

    {/* Table Skeleton */}
    <div
      style={{
        width: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          background: "#f3f4f6",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "16px",
              background: "#d1d5db",
              borderRadius: "4px",
              marginRight: i < 7 ? "8px" : 0,
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            padding: "12px 16px",
            borderBottom: i < 4 ? "1px solid #e5e7eb" : "none",
            animation: `pulse 1.5s ease-in-out infinite ${0.1 + i * 0.1}s`,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <div
              key={j}
              style={{
                flex: 1,
                height: "14px",
                background: "#e5e7eb",
                borderRadius: "4px",
                marginRight: j < 7 ? "8px" : 0,
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </motion.div>
);

// ==========================================
// Skeleton for Score Tab
// ==========================================
const SkeletonScore = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    style={{ padding: "10px 0" }}
  >
    {/* Header Skeleton */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <div
          style={{
            width: "300px",
            height: "24px",
            background: "#e5e7eb",
            borderRadius: "4px",
            marginBottom: "8px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        ></div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: "100px",
                height: "16px",
                background: "#e5e7eb",
                borderRadius: "4px",
                animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
      <div
        style={{
          width: "200px",
          height: "40px",
          background: "#e5e7eb",
          borderRadius: "8px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      ></div>
    </div>

    {/* Table Skeleton */}
    <div
      style={{
        width: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          background: "#f3f4f6",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "16px",
              background: "#d1d5db",
              borderRadius: "4px",
              marginRight: i < 6 ? "8px" : 0,
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            padding: "12px 16px",
            borderBottom: i < 4 ? "1px solid #e5e7eb" : "none",
            animation: `pulse 1.5s ease-in-out infinite ${0.1 + i * 0.1}s`,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <div
              key={j}
              style={{
                flex: 1,
                height: "14px",
                background: "#e5e7eb",
                borderRadius: "4px",
                marginRight: j < 6 ? "8px" : 0,
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </motion.div>
);

function Index({ auth, mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const swalToast = new SwalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showEnrollStudent, setShowEnrollStudent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class`;
  const access_token = auth?.getClientLogin()?.data?.access_token;

  // Cache key for this specific class
  const getCacheKey = useCallback(() => {
    return `class_detail_${id}`;
  }, [id]);

  const getCachedData = useCallback(() => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      if (cached && timestamp) {
        const isValid = Date.now() - parseInt(timestamp) < CACHE_DURATION;
        if (isValid) {
          return JSON.parse(cached);
        }
      }
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  }, [getCacheKey]);

  const saveToCache = useCallback(
    (data) => {
      try {
        const cacheKey = getCacheKey();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      } catch (error) {
        console.error("Error saving to cache:", error);
      }
    },
    [getCacheKey],
  );

  useEffect(() => {
    if (id) loadData(false);
  }, [id, refreshCounter]);

  async function loadData(forceRefresh = false) {
    // If forceRefresh is true, skip cache and fetch from API
    if (forceRefresh) {
      setIsLoading(true);
      setShowSkeleton(true);
      await fetchData(true);
      return;
    }

    // Check cache first
    const cachedData = getCachedData();

    if (cachedData) {
      // Use cached data immediately
      setClassData(cachedData);
      setShowSkeleton(false);
      setIsLoading(false);

      // Refresh in background silently
      setTimeout(() => {
        refreshDataInBackground();
      }, 500);
    } else {
      // No cache - show skeleton and load from API
      setShowSkeleton(true);
      setIsLoading(true);
      await fetchData(true);
    }
  }

  // Expose loadData to child components
  const handleLoadData = useCallback(async () => {
    // Force refresh from API
    await loadData(true);
    // Increment refresh counter to trigger re-render
    setRefreshCounter(prev => prev + 1);
  }, []);

  const refreshDataInBackground = async () => {
    try {
      await fetchData(false);
    } catch (error) {
      console.error("Background refresh error:", error);
    }
  };

  async function fetchData(showLoading = true) {
    if (showLoading) {
      setIsLoading(true);
      setShowSkeleton(true);
    }

    try {
      const result = await getByIdRequest(`${api}/${id}`, access_token);
      if (result.success) {
        setClassData(result.data);
        saveToCache(result.data);
        setShowSkeleton(false);
      } else {
        if (showLoading) {
          swalToast.toastError("មិនអាចទាញយកទិន្នន័យ!", 2000);
        }
        setShowSkeleton(false);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      if (showLoading) {
        swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 2000);
      }
      setShowSkeleton(false);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  const handleTableCreated = () => {
    setShowCreateTable(false);
    handleLoadData();
  };
  const handleStudentEnrolled = () => {
    setShowEnrollStudent(false);
    handleLoadData();
  };

  // ==========================================
  // Calculate Progress for All Subjects (Count Each Unique Subject Once)
  // ==========================================
  const calculateOverallProgress = () => {
    if (!classData?.schedule || classData.schedule.length === 0) {
      return {
        totalSessions: 0,
        taughtSessions: 0,
        remainingSessions: 0,
        progress: 0,
        totalPeriods: 0,
        uniqueSubjects: 0,
      };
    }

    // Use Set to track unique subjects
    const uniqueSubjects = new Set();
    let totalSessions = 0;
    let taughtSessions = 0;
    let totalPeriods = 0;

    // First pass: collect unique subject IDs
    classData.schedule.forEach((subject) => {
      const subjectId = subject.subject_id?._id || subject.subject_id;
      const key = subjectId?.toString() || "unknown";
      
      // Only add if this subject hasn't been counted yet
      if (!uniqueSubjects.has(key)) {
        uniqueSubjects.add(key);
        // Count this subject's sessions (use its own session_total)
        totalSessions += subject.session_total || 0;
        taughtSessions += subject.session_have_teach || 0;
      }
      
      // Always count periods (these are the actual class sessions)
      totalPeriods += subject.periods?.length || 0;
    });

    const remainingSessions = totalSessions - taughtSessions;
    const progress = totalSessions > 0 ? (taughtSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      taughtSessions,
      remainingSessions,
      progress: Math.round(progress * 10) / 10,
      totalPeriods,
      uniqueSubjects: uniqueSubjects.size,
    };
  };

  // ==========================================
  // Calculate Progress for Each Subject (Merged Duplicates)
  // ==========================================
  const getMergedSubjectProgress = () => {
    if (!classData?.schedule || classData.schedule.length === 0) {
      return [];
    }

    const subjectMap = new Map();

    classData.schedule.forEach((subject) => {
      const subjectId = subject.subject_id?._id || subject.subject_id;
      const subjectName = subject.subject_id?.name || "N/A";
      const key = subjectId?.toString() || subjectName;

      // Only add if this subject hasn't been seen before
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          subjectId: subjectId,
          name: subjectName,
          // Use the FIRST occurrence's values (not sum)
          totalSessions: subject.session_total || 0,
          taughtSessions: subject.session_have_teach || 0,
          count: 1,
          // Store all occurrences for reference
          occurrences: [subject],
        });
      } else {
        // Subject already exists - just increment count
        const existing = subjectMap.get(key);
        existing.count += 1;
        existing.occurrences.push(subject);
        // DO NOT add to totalSessions or taughtSessions
        // We keep the original values from the first occurrence
      }
    });

    const mergedSubjects = Array.from(subjectMap.values()).map((subject) => {
      const total = subject.totalSessions; // From first occurrence only
      const taught = subject.taughtSessions; // From first occurrence only
      const remaining = total - taught;
      const progress = total > 0 ? (taught / total) * 100 : 0;

      // Get all unique teachers for this subject
      const teacherNames = [];
      const teacherNameSet = new Set();
      subject.occurrences.forEach((occ) => {
        const name = occ.teacher_id 
          ? `${occ.teacher_id?.info_firstname_kh || ""} ${occ.teacher_id?.info_lastname_kh || ""}`.trim() 
          : "N/A";
        if (name && name !== "N/A" && !teacherNameSet.has(name)) {
          teacherNameSet.add(name);
          teacherNames.push(name);
        }
      });

      // Get all days for this subject
      const days = subject.occurrences.map((occ) => {
        const dayMap = {
          Monday: "ច័ន្ទ",
          Tuesday: "អង្គារ",
          Wednesday: "ពុធ",
          Thursday: "ព្រហស្បតិ៍",
          Friday: "សុក្រ",
          Saturday: "សៅរ៍",
          Sunday: "អាទិត្យ",
        };
        return dayMap[occ.day] || occ.day || "N/A";
      });

      return {
        subjectId: subject.subjectId,
        name: subject.name,
        totalSessions: total, // Only from first occurrence
        taughtSessions: taught, // Only from first occurrence
        total: total,
        taught: taught,
        remaining: remaining,
        progress: Math.round(progress * 10) / 10,
        duplicateCount: subject.count > 1 ? `(${subject.count} វគ្គ)` : "",
        teacherNames: teacherNames.length > 0 ? teacherNames.join(", ") : "N/A",
        days: days,
        occurrences: subject.occurrences.length,
      };
    });

    return mergedSubjects;
  };

  const progressData = calculateOverallProgress();
  const mergedSubjects = getMergedSubjectProgress();

  // ==========================================
  // Tabs Definition
  // ==========================================
  const tabs = [
    { key: "detail", label: "ព័ត៌មានថ្នាក់", icon: <MdClass /> },
    { key: "timetable", label: "កាលវិភាគ", icon: <FaCalendarAlt /> },
    { key: "students", label: "និស្សិត", icon: <FaUsers /> },
    { key: "attendance", label: "វត្តមាន", icon: <FaUserCheck /> },
    { key: "scores", label: "ពិន្ទុ", icon: <FaChartBar /> },
    { key: "result", label: "លទ្ធផល", icon: <FaCheckCircle /> },
    { key: "statistics", label: "ស្ថិតិ", icon: <FaChartBar /> },
  ];

  const getStatusLabel = (status) => {
    const map = {
      start: "កំពុងបង្រៀន",
      closed: "ថ្នាក់បានបញ្ចប់",
      pending: "ថ្នាក់មិនទាន់ចាប់ផ្តើម",
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const map = { start: "#028621", closed: "#ae0919", pending: "#b18606" };
    return map[status] || "#6c757d";
  };

  const getDegreeLabel = (level) => {
    const map = {
      certificate: "វិញ្ញាបនបត្រ",
      associate: "បរិញ្ញាបត្ររង",
      bachelor: "បរិញ្ញាបត្រ",
      master: "បរិញ្ញាបត្រជាន់ខ្ពស់",
      phd: "បណ្ឌិត",
      other: "ផ្សេងៗ",
    };
    return map[level] || level;
  };

  // Analytics functions
  const getGenderStats = () => {
    if (!classData?.students) return { male: 0, female: 0, other: 0 };
    const stats = { male: 0, female: 0, other: 0 };
    classData.students.forEach((s) => {
      const gender = s.student_id?.gender || "other";
      stats[gender] = (stats[gender] || 0) + 1;
    });
    return stats;
  };

  const getGradeStats = () => {
    if (!classData?.students) return { A: 0, B: 0, C: 0, D: 0, F: 0, "N/A": 0 };
    const stats = { A: 0, B: 0, C: 0, D: 0, F: 0, "N/A": 0 };
    classData.students.forEach((s) => {
      const total =
        s.scores?.reduce((acc, sc) => acc + (sc.total || 0), 0) || 0;
      let grade = "N/A";
      if (total >= 90) grade = "A";
      else if (total >= 80) grade = "B";
      else if (total >= 70) grade = "C";
      else if (total >= 60) grade = "D";
      else if (total > 0) grade = "F";
      stats[grade] = (stats[grade] || 0) + 1;
    });
    return stats;
  };

  const getHighAbsentStudents = () => {
    if (!classData?.students) return [];
    return classData.students.filter((s) => (s.total_absent_session || 0) >= 8);
  };

  const getSubjectScores = () => {
    if (!classData?.students) return [];
    const subjectMap = {};
    classData.students.forEach((s) => {
      s.scores?.forEach((sc) => {
        const name = sc.subject_id?.name || "Unknown";
        if (!subjectMap[name]) subjectMap[name] = { total: 0, count: 0 };
        subjectMap[name].total += sc.total || 0;
        subjectMap[name].count += 1;
      });
    });
    return Object.keys(subjectMap).map((name) => ({
      name,
      average:
        subjectMap[name].count > 0
          ? (subjectMap[name].total / subjectMap[name].count).toFixed(1)
          : 0,
    }));
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return "#28a745";
    if (progress >= 50) return "#ffc107";
    if (progress >= 25) return "#fd7e14";
    return "#dc3545";
  };

  const khmerFontStyle = {
    cursor: 'pointer',
    fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', 'Times New Roman', sans-serif",
  };

  // ==========================================
  // Render with Skeleton Loading
  // ==========================================
  if (showSkeleton && !classData) {
    return (
      <div className="container defualt_White_Shadow_Theme">
        <RowBreaker />
        <SkeletonHeader delay={0} />
        <RowBreaker />

        {/* Buttons Skeleton */}
        <div className="row">
          <div className="col-md-6">
            <SkeletonButton delay={0.1} />
          </div>
          <div
            className="col-md-6 d-flex justify-content-end"
            style={{ gap: "10px" }}
          >
            <SkeletonButton delay={0.15} />
            <SkeletonButton delay={0.2} />
            <SkeletonButton delay={0.25} />
          </div>
        </div>
        <RowBreaker />

        {/* Status Badge Skeleton */}
        <div className="row">
          <div className="col-md-12">
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  width: "200px",
                  height: "20px",
                  background: "#e5e7eb",
                  borderRadius: "4px",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              ></div>
              <SkeletonStatusBadge delay={0.1} />
            </div>
          </div>
        </div>
        <RowBreaker />

        {/* Progress Bar Skeleton */}
        <SkeletonProgressBar delay={0.2} />
        <RowBreaker />

        {/* Tabs Skeleton */}
        <div className="row">
          <div className="col-md-12">
            <ul
              className="nav nav-tabs"
              style={{ borderBottom: "2px solid #1a3c2a" }}
            >
              {tabs.map((tab, index) => (
                <SkeletonTab key={tab.key} delay={0.05 * index} />
              ))}
            </ul>
          </div>
        </div>
        <RowBreaker />

        {/* Content Skeleton based on active tab */}
        {activeTab === "statistics" && <SkeletonStatistics delay={0.3} />}
        {activeTab === "result" && <SkeletonResult delay={0.3} />}
        {activeTab === "scores" && <SkeletonScore delay={0.3} />}
        {!["statistics", "result", "scores"].includes(activeTab) && <SkeletonContent delay={0.3} />}

        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="container defualt_White_Shadow_Theme">
      {/* <Loading is_loading={isLoading} /> */}
      <RowBreaker />

      <div className="row">
        <div className="col-md-6">
          <button
            className="btn btn-sm"
            style={{ 
              background: "#6c757d", 
              color: "white", 
              ...khmerFontStyle,
              fontSize: "1.1rem",
              padding: "8px 20px",
            }}
            onClick={() => navigate(-1)}
            disabled={isUpdating}
          >
            <FaArrowLeft />{" "}
            <label style={{ cursor: "pointer", ...khmerFontStyle }}>
              ត្រឡប់ក្រោយ
            </label>
          </button>
        </div>
      </div>

      {classData && (
        <>
          <div className="row">
            <div className="col-md-12">
              <hr />
            </div>
          </div>

          <div className="row">
            <div
              className="col-md-12"
              style={{ display: "flex", ...khmerFontStyle }}
            >
              <h5
                className="siemreap-regular"
                style={{
                  marginTop: "7px",
                  marginRight: "10px",
                  ...khmerFontStyle,
                  fontSize: "1.3rem",
                }}
              >
                <FaGraduationCap /> {classData.major_id?.name || "N/A"}{" "}
                {getDegreeLabel(
                  classData.degree_level_id?.name || classData.degree_level,
                )}{" "}
                - {classData?.semester_id?.name} - {classData?.shift_id?.name}
              </h5>

              <h5>
                <span
                  className="badge siemreap-regular"
                  style={{
                    background: "transparent",
                    color: getStatusColor(classData.class_status),
                    padding: "12px 20px",
                    borderRadius: "20px",
                    border: `2px solid ${getStatusColor(classData.class_status)}`,
                    fontWeight: "600",
                    fontSize: "1rem",
                    ...khmerFontStyle,
                  }}
                >
                  {getStatusLabel(classData.class_status)}
                </span>
              </h5>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <label style={{
                color: 'gray', 
                marginLeft: '20px', 
                ...khmerFontStyle,
                fontSize: "1.05rem",
              }}>
                <AiOutlineNumber/> {`កូដថ្នាក់: ${classData?.code ?? ""} | ឆ្នាំសិក្សា  ${classData.year_study_from} - ${classData.year_study_to}  (${classData?.year_study_id?.name})`}
              </label>
            </div>
          </div>

          {/* ====== PROGRESS BAR UNDER TITLE ====== */}
          <RowBreaker />
          <div className="row">
            <div className="col-md-12">
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: "10px",
                  padding: "18px 24px",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  ...khmerFontStyle,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#1a3c2a",
                        fontSize: "1.1rem",
                        ...khmerFontStyle,
                      }}
                    >
                      <FaCalendarAlt style={{ marginRight: "5px" }} />
                      <label style={khmerFontStyle}>វឌ្ឍនភាពបង្រៀនសរុប</label>
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#6c757d",
                        ...khmerFontStyle,
                      }}
                    >
                      <label style={khmerFontStyle}>
                        វគ្គសិក្សាសរុប:{" "}
                        <strong>{progressData.totalSessions}</strong> វគ្គ (Session)
                      </label>
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#28a745",
                        ...khmerFontStyle,
                      }}
                    >
                      <label style={khmerFontStyle}>
                        បានបង្រៀន:{" "}
                        <strong>{progressData.taughtSessions} </strong> វគ្គ (Session)
                      </label>
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#dc3545",
                        ...khmerFontStyle,
                      }}
                    >
                      <label style={khmerFontStyle}>
                        នៅសល់: <strong>{progressData.remainingSessions}</strong>{" "}
                        វគ្គ (Session)
                      </label>
                    </span>
                  </div>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "1.2rem",
                      color: getProgressColor(progressData.progress),
                      ...khmerFontStyle,
                    }}
                  >
                    {progressData.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "6px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${progressData.progress}%`,
                      height: "100%",
                      backgroundColor: getProgressColor(progressData.progress),
                      borderRadius: "6px",
                      transition: "width 0.5s ease-in-out",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        animation: "shimmer 2s infinite",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                </div>

                {/* Subject-wise progress */}
                {mergedSubjects.length > 0 && (
                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    {mergedSubjects.map((subject, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "white",
                          padding: "6px 16px",
                          borderRadius: "20px",
                          border: "1px solid #e9ecef",
                          fontSize: "0.95rem",
                          ...khmerFontStyle,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "500",
                            color: "#1a3c2a",
                            ...khmerFontStyle,
                            fontSize: "0.95rem",
                          }}
                        >
                          {subject.name}
                          {subject.duplicateCount && (
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "#6c757d",
                                marginLeft: "4px",
                              }}
                            >
                              {subject.duplicateCount }  
                            </span>
                          )}
                        </span>
                        <div
                          style={{
                            width: "80px",
                            height: "8px",
                            backgroundColor: "#e9ecef",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${subject.progress}%`,
                              height: "100%",
                              backgroundColor: getProgressColor(
                                subject.progress,
                              ),
                              borderRadius: "4px",
                              transition: "width 0.5s ease-in-out",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            color: getProgressColor(subject.progress),
                            ...khmerFontStyle,
                          }}
                        >
                          {subject.progress}% 
                        </span>
                        <span
                          style={{
                            color: "#6c757d",
                            fontSize: "0.85rem",
                            ...khmerFontStyle,
                          }}
                        >
                          ({subject.taught}/{subject.total}) 
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <RowBreaker />

          {/* ====== TABS ====== */}
          <div className="row">
            <div className="col-md-12">
              <ul
                className="nav nav-tabs"
                style={{ borderBottom: "2px solid #1a3c2a" }}
              >
                {tabs.map((tab) => {
                  return (
                    <li
                      key={tab.key}
                      className="nav-item"
                      style={{ position: "relative", cursor: 'pointer' }}
                    >
                      <button
                        className={`nav-link siemreap-regular ${activeTab === tab.key ? "active" : ""}`}
                        style={{
                          color: activeTab === tab.key ? "#1a3c2a" : "#6c757d",
                          fontWeight: activeTab === tab.key ? "600" : "400",
                          borderBottom:
                            activeTab === tab.key
                              ? "3px solid #1a3c2a"
                              : "none",
                          background: "transparent",
                          borderTop: "none",
                          borderLeft: "none",
                          borderRight: "none",
                          padding: "14px 24px",
                          cursor: "pointer",
                          position: "relative",
                          fontSize: "1.1rem",
                          ...khmerFontStyle,
                        }}
                        onClick={() => {
                          setActiveTab(tab.key);
                          if (tab.key !== "timetable")
                            setShowCreateTable(false);
                          if (tab.key !== "students")
                            setShowEnrollStudent(false);
                        }}
                      >
                        {tab.icon}{" "}
                        <label style={khmerFontStyle}>{tab.label}</label>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <RowBreaker />

          {/* ====== TAB CONTENT ====== */}
          <div className="row">
            <div className="col-md-12">
              {activeTab === "detail" && (
                <ClassDetailTab classData={classData} />
              )}

              {activeTab === "timetable" && (
                <div>
                  {!showCreateTable ? (
                    <TimetableTab
                      classData={classData}
                      navigate={navigate}
                      setShowCreateTable={setShowCreateTable}
                    />
                  ) : (
                    <AcademicTableCreate
                      class_id={id}
                      auth={auth}
                      onSuccess={handleTableCreated}
                      onCancel={() => setShowCreateTable(false)}
                      existingData={classData}
                    />
                  )}
                </div>
              )}

              {activeTab === "students" && (
                <div>
                  {!showEnrollStudent ? (
                    <StudentsTab
                      classData={classData}
                      navigate={navigate}
                      setShowEnrollStudent={setShowEnrollStudent}
                      loadData={handleLoadData}
                      auth={auth}
                      classId={id}
                    />
                  ) : (
                    <StudentInClassCreate
                      auth={auth}
                      onSuccess={handleStudentEnrolled}
                      onCancel={() => setShowEnrollStudent(false)}
                      classId={id}
                    />
                  )}
                </div>
              )}

              {/* ====== ATTENDANCE TAB ====== */}
              {activeTab === "attendance" && (
                <AttendanceTab classData={classData} />
              )}

              {activeTab === "analytics" && (
                <AnalyticsTab
                  classData={classData}
                  genderStats={getGenderStats()}
                  gradeStats={getGradeStats()}
                  highAbsentStudents={getHighAbsentStudents()}
                  subjectScores={getSubjectScores()}
                />
              )}

              {activeTab === "scores" && <ScoreTab classData={classData} />}

              {/* ====== RESULT TAB ====== */}
              {activeTab === "result" && (
                <ResultTab 
                  classData={classData} 
                  navigate={navigate} 
                  auth={auth}
                  loadData={handleLoadData}
                />
              )}

              {activeTab === "statistics" && (
                <StatisticsTab 
                  classData={classData} 
                  auth={auth} 
                />
              )}
            </div>
          </div>
          <RowBreaker break={2} />
        </>
      )}

      <style jsx="true">{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export default Index;
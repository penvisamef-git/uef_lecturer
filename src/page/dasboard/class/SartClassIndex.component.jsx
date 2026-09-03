import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRequest } from "../../../util/request_api.js";
import SwalToast from "../../../component/SwalToast/SwalToast.js";
import Loading from "../../../component/Loading/Loading.component.jsx";
import RowBreaker from "../../../component/Boostramp/RowBreaker.component.jsx";
import Title from "../../../component/Title/Title.component.jsx";

// Icons
import { FaGraduationCap, FaUsers, FaChalkboardTeacher, FaBookOpen } from "react-icons/fa";
import { MdClass, MdRoom, MdAccessTime, MdDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";

// ============================================================
// SKELETON LOADING COMPONENT - GRAY COLOR
// ============================================================
const SkeletonCard = () => (
  <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
    <div style={{
      background: "#f3f4f6",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid #e5e7eb",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
        animation: "shimmer 1.5s infinite",
        zIndex: 1,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
        <div style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          background: "#d1d5db",
          flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            height: "18px",
            width: "80%",
            background: "#d1d5db",
            borderRadius: "4px",
            marginBottom: "6px",
          }} />
          <div style={{
            height: "14px",
            width: "60%",
            background: "#d1d5db",
            borderRadius: "4px",
          }} />
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px 16px",
        padding: "14px 0",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
        marginBottom: "14px",
      }}>
        <div style={{ height: "16px", background: "#d1d5db", borderRadius: "4px" }} />
        <div style={{ height: "16px", background: "#d1d5db", borderRadius: "4px" }} />
        <div style={{ height: "16px", background: "#d1d5db", borderRadius: "4px" }} />
        <div style={{ height: "16px", background: "#d1d5db", borderRadius: "4px" }} />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <div style={{ height: "24px", width: "80px", background: "#d1d5db", borderRadius: "12px" }} />
          <div style={{ height: "24px", width: "100px", background: "#d1d5db", borderRadius: "12px" }} />
          <div style={{ height: "24px", width: "60px", background: "#d1d5db", borderRadius: "12px" }} />
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "10px",
        borderTop: "1px solid #e5e7eb",
      }}>
        <div style={{ height: "16px", width: "80px", background: "#d1d5db", borderRadius: "4px" }} />
        <div style={{ height: "32px", width: "80px", background: "#d1d5db", borderRadius: "20px" }} />
      </div>
    </div>
  </div>
);

const SkeletonStats = () => (
  <div className="row g-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="col-md-4 col-sm-6">
        <div style={{
          borderRadius: "16px",
          padding: "20px 24px",
          background: "#d1d5db",
          height: "80px",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      </div>
    ))}
  </div>
);

// ============================================================
// CACHE HELPERS
// ============================================================
const CACHE_KEY = "teacher_classes_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      if (now - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error reading cache:", error);
    return null;
  }
}

function setCachedData(data, stats) {
  try {
    const cacheData = {
      data: data,
      stats: stats,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("❌ Error saving cache:", error);
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function ClassCardDashboard({ auth }) {
  const navigate = useNavigate();
  const swalToast = new SwalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalStudents: 0,
    totalSubjects: 0,
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCache, setHasCache] = useState(false);

  const loginData = auth?.getClientLogin()?.data || {};
  const teacherId = loginData?._id;
  const access_token = loginData?.access_token;

  const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class-get-all-class-by-id-teacher-only-start/${teacherId}`;

  // ============================================================
  // UPDATE UI FUNCTION
  // ============================================================
  function updateUI(data, stats) {
    setClasses([...data]);
    setStats({ ...stats });
  }

  // ============================================================
  // GET UNIQUE SUBJECTS WITH PERIOD COUNTS (GROUP DUPLICATES)
  // ============================================================
  const getUniqueSubjects = (schedule) => {
    if (!schedule || schedule.length === 0) return [];

    const subjectMap = {};

    schedule.forEach(item => {
      const name = item.subject_id?.name || "N/A";
      if (!subjectMap[name]) {
        subjectMap[name] = {
          name: name,
          count: 0,
          sessionTotal: 0,
          sessionHaveTeach: 0,
          periods: []
        };
      }
      subjectMap[name].count += 1;
      // Use the session_total from the FIRST occurrence only
      if (subjectMap[name].sessionTotal === 0) {
        subjectMap[name].sessionTotal = item.session_total || 0;
        subjectMap[name].sessionHaveTeach = item.session_have_teach || 0;
      }
      if (item.periods) {
        subjectMap[name].periods.push(...item.periods);
      }
    });

    return Object.values(subjectMap).sort((a, b) => b.count - a.count);
  };

  // ============================================================
  // GET TOTAL SESSIONS - COUNT UNIQUE SUBJECTS ONLY (NOT DUPLICATES)
  // ============================================================
  const getTotalSessions = (schedule) => {
    if (!schedule || schedule.length === 0) return 0;
    
    // Count UNIQUE subjects only (each subject once)
    const uniqueSubjects = new Map();
    schedule.forEach(item => {
      const subjectId = item.subject_id?._id || item.subject_id;
      if (subjectId) {
        const key = subjectId.toString();
        if (!uniqueSubjects.has(key)) {
          uniqueSubjects.set(key, {
            sessionTotal: item.session_total || 0,
            sessionHaveTeach: item.session_have_teach || 0,
          });
        }
      }
    });
    
    let total = 0;
    let taught = 0;
    uniqueSubjects.forEach(subject => {
      total += subject.sessionTotal;
      taught += subject.sessionHaveTeach;
    });
    
    return total;
  };

  // ============================================================
  // GET TAUGHT SESSIONS
  // ============================================================
  const getTaughtSessions = (schedule) => {
    if (!schedule || schedule.length === 0) return 0;
    
    const uniqueSubjects = new Map();
    schedule.forEach(item => {
      const subjectId = item.subject_id?._id || item.subject_id;
      if (subjectId) {
        const key = subjectId.toString();
        if (!uniqueSubjects.has(key)) {
          uniqueSubjects.set(key, {
            sessionTotal: item.session_total || 0,
            sessionHaveTeach: item.session_have_teach || 0,
          });
        }
      }
    });
    
    let taught = 0;
    uniqueSubjects.forEach(subject => {
      taught += subject.sessionHaveTeach;
    });
    
    return taught;
  };

  // ============================================================
  // CALCULATE STATS - COUNT UNIQUE SUBJECTS (NOT DUPLICATES)
  // ============================================================
  function calculateStats(data) {
    let totalStudents = 0;
    let totalUniqueSubjects = 0;

    data.forEach(cls => {
      totalStudents += cls.students?.length || 0;
      
      // Count UNIQUE subjects (not duplicates)
      if (cls.schedule && cls.schedule.length > 0) {
        const uniqueSubjectNames = new Set();
        cls.schedule.forEach(item => {
          if (item.subject_id?.name) {
            uniqueSubjectNames.add(item.subject_id.name);
          }
        });
        totalUniqueSubjects += uniqueSubjectNames.size;
      }
    });

    return {
      total: data.length,
      totalStudents,
      totalSubjects: totalUniqueSubjects,
    };
  }

  // ============================================================
  // LOAD DATA FROM CACHE OR API
  // ============================================================
  async function loadData() {
    const cached = getCachedData();

    if (cached) {
      updateUI(cached.data, cached.stats);
      setHasCache(true);
      setIsFirstLoad(false);
      refreshDataSilently();
      return;
    }

    setIsLoading(true);
    setIsFirstLoad(true);

    try {
      const result = await getAllRequest(api, access_token);
      if (result.success) {
        const data = result.data?.data || [];
        const calculatedStats = calculateStats(data);
        setCachedData(data, calculatedStats);
        updateUI(data, calculatedStats);
        setHasCache(true);
      } else {
        swalToast.toastError(result.message || "មិនអាចទាញយកទិន្នន័យ!", 2000);
      }
    } catch (error) {
      console.error("❌ Error loading classes:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 2000);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }

  // ============================================================
  // SILENT BACKGROUND REFRESH
  // ============================================================
  async function refreshDataSilently() {
    setIsRefreshing(true);
    try {
      const result = await getAllRequest(api, access_token);
      if (result.success) {
        const data = result.data?.data || [];
        const calculatedStats = calculateStats(data);
        const cached = getCachedData();
        const hasChanged = cached && JSON.stringify(data) !== JSON.stringify(cached.data);
        setCachedData(data, calculatedStats);
        if (hasChanged || !cached) {
          updateUI(data, calculatedStats);
        }
      }
    } catch (error) {
      console.error("❌ Silent refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    if (teacherId && access_token) {
      loadData();
    } else if (!access_token) {
      swalToast.toastError("មិនមានសិទ្ធិចូលប្រើ! សូមចូលប្រើប្រាស់ឡើងវិញ", 2000);
    }
  }, [teacherId, access_token]);

  // ============================================================
  // HELPERS
  // ============================================================
  const handleCardClick = (classId) => {
    navigate(`/admin/academic-management/class/${classId}`);
  };

  // ============================================================
  // RENDER - SKELETON LOADING (GRAY)
  // ============================================================
  if (isFirstLoad && isLoading) {
    return (
      <div className="container-fluid defualt_White_Shadow_Theme" style={{ padding: "20px 30px" }}>
        <RowBreaker />
        <div className="row">
          <div className="col-12">
            <div style={{
              height: "40px",
              width: "300px",
              background: "#d1d5db",
              borderRadius: "8px",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          </div>
        </div>
        <RowBreaker />
        <SkeletonStats />
        <RowBreaker break={2} />
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - MAIN
  // ============================================================
  return (
    <div className="container-fluid defualt_White_Shadow_Theme" style={{ padding: "20px 30px" }}>
      {isLoading && !isFirstLoad && <Loading is_loading={isLoading} />}

      <RowBreaker />

      {/* Header */}
      <div className="row">
        <div className="col-12">
          <Title
            mode="custom"
            icons={<FaChalkboardTeacher />}
            title="ថ្នាក់ដែលកំពុងបង្រៀនរបស់ខ្ញុំ"
            subtitle={`គ្រូបង្រៀន: ${loginData?.info_firstname_kh || ''} ${loginData?.info_lastname_kh || ''}`}
          />
        </div>
      </div>

      <RowBreaker />

      {/* Statistics Cards - Only 3 */}
      <div className="row g-4">
        <div className="col-md-4 col-sm-6">
          <div className="stat-card" style={{
            background: "linear-gradient(135deg, #047857, #10b981)",
            borderRadius: "16px",
            padding: "20px 24px",
            color: "white",
            boxShadow: "0 8px 30px rgba(4, 120, 87, 0.3)",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{
                  fontSize: "14px",
                  opacity: 0.85,
                  lineHeight: "1.6",
                  letterSpacing: "0.3px",
                }}>
                  ចំនួនថ្នាក់សរុប
                </div>
                <div style={{
                  fontSize: "34px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  marginTop: "4px",
                }}>
                  {stats.total}
                </div>
              </div>
              <div style={{ fontSize: "40px", opacity: 0.3 }}>
                <MdClass />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="stat-card" style={{
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            borderRadius: "16px",
            padding: "20px 24px",
            color: "white",
            boxShadow: "0 8px 30px rgba(37, 99, 235, 0.3)",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{
                  fontSize: "14px",
                  opacity: 0.85,
                  lineHeight: "1.6",
                  letterSpacing: "0.3px",
                }}>
                  និស្សិតសរុប
                </div>
                <div style={{
                  fontSize: "34px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  marginTop: "4px",
                }}>
                  {stats.totalStudents}
                </div>
              </div>
              <div style={{ fontSize: "40px", opacity: 0.3 }}>
                <FaUsers />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="stat-card" style={{
            background: "linear-gradient(135deg, #d97706, #f59e0b)",
            borderRadius: "16px",
            padding: "20px 24px",
            color: "white",
            boxShadow: "0 8px 30px rgba(217, 119, 6, 0.3)",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{
                  fontSize: "14px",
                  opacity: 0.85,
                  lineHeight: "1.6",
                  letterSpacing: "0.3px",
                }}>
                  មុខវិជ្ជាសរុប
                </div>
                <div style={{
                  fontSize: "34px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  marginTop: "4px",
                }}>
                  {stats.totalSubjects}
                </div>
              </div>
              <div style={{ fontSize: "40px", opacity: 0.3 }}>
                <FaBookOpen />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RowBreaker break={2} />

      {/* Class Cards Grid */}
      {classes.length === 0 ? (
        <div className="text-center" style={{ padding: "60px 20px" }}>
          <div style={{ fontSize: "60px", color: "#d1d5db" }}>
            <MdClass />
          </div>
          <h5 style={{
            color: "#6b7280",
            marginTop: "16px",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
            lineHeight: "1.6",
          }}>
            មិនមានថ្នាក់រៀនសកម្មទេ
          </h5>
          <p style={{
            color: "#9ca3af",
            fontSize: "14px",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
            lineHeight: "1.6",
          }}>
            អ្នកមិនទាន់មានថ្នាក់រៀនដែលកំពុងបង្រៀននៅឡើយទេ
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {classes.map((cls) => {
            const uniqueSubjects = getUniqueSubjects(cls.schedule);
            const displaySubjects = uniqueSubjects.slice(0, 3);
            const totalSessions = getTotalSessions(cls.schedule);
            const taughtSessions = getTaughtSessions(cls.schedule);

            return (
              <div key={cls._id} className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                <div
                  className="class-card"
                  onClick={() => handleCardClick(cls._id)}
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f4f0",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.12)";
                    e.currentTarget.style.borderColor = "#10b981";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                    e.currentTarget.style.borderColor = "#f0f4f0";
                  }}
                >
             
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      color: "#047857",
                      flexShrink: 0,
                    }}>
                      <FaGraduationCap />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h6 style={{
                        margin: 0,
                        fontWeight: "700",
                        color: "#1a2e1a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                        lineHeight: "1.8",
                      }}>
                        {cls.major_id?.name || "N/A"}
                      </h6>
                      <div style={{
                        color: "#6b7a6b",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                        lineHeight: "1.8",
                        marginTop: "2px",
                      }}>
                        <span>{cls.degree_level_id?.name}</span>
                        <span style={{ opacity: 0.3 }}>•</span>
                        <span>{cls.code || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 16px",
                    padding: "14px 0",
                    borderTop: "1px solid #f0f4f0",
                    borderBottom: "1px solid #f0f4f0",
                    marginBottom: "14px",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#374a37",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                      lineHeight: "1.5",
                    }}>
                      <MdDateRange style={{ color: "#047857", fontSize: "15px" }} />
                      <span>{cls.year_study_from} - {cls.year_study_to}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#374a37",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                      lineHeight: "1.5",
                    }}>
                      <MdAccessTime style={{ color: "#047857", fontSize: "15px" }} />
                      <span>{cls.shift_id?.name}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#374a37",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                      lineHeight: "1.5",
                    }}>
                      <MdRoom style={{ color: "#047857", fontSize: "15px" }} />
                      <span>{cls.room_id?.name || "N/A"}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#374a37",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                      lineHeight: "1.5",
                    }}>
                      <FaUsers style={{ color: "#047857", fontSize: "15px" }} />
                      <span>{cls.students?.length || 0} នាក់</span>
                    </div>
                  </div>

                  {/* Subjects Preview - Grouped Unique Subjects */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}>
                      {displaySubjects.map((subject, idx) => (
                        <span key={idx} style={{
                          background: "#ecfdf5",
                          color: "#047857",
                          padding: "3px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                          lineHeight: "1.8",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          maxWidth: "100%",
                        }}>
                          {subject.name}
                          {subject.count > 1 && (
                            <span style={{
                              marginLeft: "4px",
                              background: "#047857",
                              color: "white",
                              padding: "0px 6px",
                              borderRadius: "10px",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}>
                              {subject.count}
                            </span>
                          )}
                        </span>
                      ))}
                      {uniqueSubjects.length > 3 && (
                        <span style={{
                          background: "#f3f4f6",
                          color: "#6b7280",
                          padding: "3px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                          lineHeight: "1.8",
                        }}>
                          +{uniqueSubjects.length - 3} ទៀត
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer - Fixed: Shows unique subject sessions only */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "10px",
                    borderTop: "1px solid #f0f4f0",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#6b7a6b",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                      lineHeight: "1.5",
                    }}>
                      <IoTimeOutline />
                      <span>
                        {taughtSessions}/{totalSessions} វគ្គ (Session)
                      </span>
                    </div>
                    <div style={{
                      background: "#047857",
                      color: "white",
                      padding: "6px 18px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
                      lineHeight: "1.5",
                    }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#065f46";
                        e.target.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#047857";
                        e.target.style.transform = "scale(1)";
                      }}>
                      ចូលមើល
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RowBreaker break={3} />

      {/* Small indicator for silent refresh */}
      {isRefreshing && !isLoading && (
        <div className="row" style={{
          color: "#047857",
          padding: "8px 16px",
          fontSize: "12px",
          fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
          zIndex: 9999,
          animation: "fadeInUp 0.3s ease",
        }}>
          <div className="col-md-12" style={{ textAlign: 'right' }}>
            កំពុងធ្វើបច្ចុប្បន្នភាព ...
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassCardDashboard;
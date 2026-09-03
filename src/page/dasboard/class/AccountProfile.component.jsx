import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getByIdRequest } from "../../../util/request_api.js";
import SwalToast from "../../../component/SwalToast/SwalToast.js";
import Loading from "../../../component/Loading/Loading.component.jsx";
import RowBreaker from "../../../component/Boostramp/RowBreaker.component";
import Title from "../../../component/Title/Title.component";
import { FaArrowLeft, FaEdit, FaChalkboardTeacher } from "react-icons/fa";

// Import Tabs
import TeacherDetailTab from "./tab/teacherDetailTab.jsx";
import ClassTeacherTeach from "./tab/classTeacherTeach.jsx";

// ============================================================
// SKELETON LOADING COMPONENT
// ============================================================
const SkeletonProfileHeader = () => (
  <div className="row">
    <div className="col-md-12">
      <div
        className="card shadow-sm"
        style={{ borderRadius: "15px", border: "none", overflow: "hidden" }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1a3c2a 0%, #2d5a3d 100%)",
            padding: "30px",
            color: "white",
          }}
        >
          <div className="row align-items-center">
            <div className="col-md-2 text-center">
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "#d1d5db",
                  margin: "0 auto",
                  border: "5px solid white",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
            <div className="col-md-10">
              <div
                style={{
                  height: "32px",
                  width: "250px",
                  background: "#d1d5db",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: "18px",
                  width: "180px",
                  background: "#d1d5db",
                  borderRadius: "4px",
                  animation: "pulse 1.5s ease-in-out infinite 0.3s",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonTabs = () => (
  <div className="row">
    <div className="col-md-12">
      <ul className="nav nav-tabs" style={{ borderBottom: "2px solid #1a3c2a" }}>
        {[1, 2].map((i) => (
          <li key={i} className="nav-item">
            <div
              style={{
                padding: "12px 20px",
                width: i === 1 ? "180px" : "140px",
                height: "44px",
                background: "#d1d5db",
                borderRadius: "4px 4px 0 0",
                animation: "pulse 1.5s ease-in-out infinite",
                marginRight: "8px",
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const SkeletonContent = () => (
  <div className="row">
    <div className="col-md-12">
      <div
        className="card shadow-sm"
        style={{ borderRadius: "10px", border: "none", padding: "20px" }}
      >
        {/* Skeleton content rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: i < 5 ? "1px solid #f0f0f0" : "none",
            }}
          >
            <div
              style={{
                height: "16px",
                width: "120px",
                background: "#d1d5db",
                borderRadius: "4px",
                flexShrink: 0,
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
            <div
              style={{
                height: "16px",
                width: "60%",
                background: "#e5e7eb",
                borderRadius: "4px",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1 + 0.15}s`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================
// CACHE HELPERS
// ============================================================
const CACHE_KEY = "teacher_profile_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedData(id) {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${id}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      if (now - parsed.timestamp < CACHE_DURATION) {
        return parsed.data;
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error reading cache:", error);
    return null;
  }
}

function setCachedData(id, data) {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY}_${id}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error("❌ Error saving cache:", error);
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function AccountProfile({ auth }) {
  const logindata = auth?.getClientLogin()?.data || {};
  const id = logindata?._id;
  const access_token = logindata?.access_token;

  const navigate = useNavigate();
  const swalToast = new SwalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const api = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/teacher`;

  const tabs = [
    { key: "profile", label: "ព័ត៌មានផ្ទាល់ខ្លួន" },
    // { key: "classes", label: "ថ្នាក់បង្រៀន" },
  ];

  // ============================================================
  // LOAD DATA WITH CACHE
  // ============================================================
  async function loadData(forceRefresh = false) {
    if (!id || !access_token) return;

    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedData(id);
      if (cached) {
        setTeacherData(cached);
        setIsFirstLoad(false);
        // Silent refresh in background
        refreshDataSilently();
        return;
      }
    }

    // No cache or force refresh - show loading
    setIsLoading(true);
    try {
      const result = await getByIdRequest(`${api}/${id}`, access_token);
      if (result.success) {
        const data = result.data;
        setTeacherData(data);
        // Save to cache
        setCachedData(id, data);
      } else {
        swalToast.toastError("មិនអាចទាញយកទិន្នន័យ!", 2000);
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error("❌ Error:", error);
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
    if (!id || !access_token) return;
    setIsRefreshing(true);
    try {
      const result = await getByIdRequest(`${api}/${id}`, access_token);
      if (result.success) {
        const data = result.data;
        // Check if data changed
        const cached = getCachedData(id);
        const hasChanged = cached && JSON.stringify(data) !== JSON.stringify(cached);
        // Update cache
        setCachedData(id, data);
        if (hasChanged) {
          setTeacherData(data);
          swalToast.toastSuccess("ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាព!", 2000);
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
    if (id && access_token) {
      loadData();
    }
  }, [id, access_token]);

  // ============================================================
  // HELPERS
  // ============================================================
  const getInitials = (firstname, lastname) => {
    const first = firstname?.charAt(0) || "";
    const last = lastname?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "T";
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
    return map[level] || level || "N/A";
  };

  // ============================================================
  // RENDER - SKELETON LOADING (First Load Only)
  // ============================================================
  if (isFirstLoad && isLoading) {
    return (
      <div className="container defualt_White_Shadow_Theme">
        <RowBreaker />
        <div className="row">
          <div className="col-md-12">
            <div
              style={{
                height: "40px",
                width: "250px",
                background: "#d1d5db",
                borderRadius: "8px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
        <RowBreaker />
        <SkeletonProfileHeader />
        <RowBreaker />
        <SkeletonTabs />
        <RowBreaker />
        <SkeletonContent />
        <RowBreaker break={2} />
      </div>
    );
  }

  // ============================================================
  // RENDER - MAIN
  // ============================================================
  if (!teacherData) return null;

  return (
    <div className="container defualt_White_Shadow_Theme">
      {/* Show loading spinner for background refresh */}
      {isLoading && !isFirstLoad && <Loading is_loading={isLoading} />}

     

      <RowBreaker />

      {/* Title */}
      <div className="row">
        <div className="col-md-12">
          <Title
            mode="custom"
            icons={<FaChalkboardTeacher />}
            title="ព័ត៌មានគ្រូបង្រៀន"
          />
        </div>
      </div>

      {/* Profile Header */}
      <div className="row">
        <div className="col-md-12">
          <div
            className="card shadow-sm"
            style={{ borderRadius: "15px", border: "none", overflow: "hidden" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a3c2a 0%, #2d5a3d 100%)",
                padding: "30px",
                color: "white",
              }}
            >
              <div className="row align-items-center">
                <div className="col-md-2 text-center">
                  <div
                    style={{
                      width: "90px",
                      height: "90px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "40px",
                      fontWeight: "bold",
                      color: "white",
                      margin: "0 auto",
                      border: "5px solid white",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                      fontFamily:
                        "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                    }}
                  >
                    {getInitials(
                      teacherData.info_firstname_kh,
                      teacherData.info_lastname_kh,
                    )}
                  </div>
                </div>
                <div className="col-md-10">
                  <h2
                    className="siemreap-regular"
                    style={{ fontWeight: "bold", marginBottom: "5px" }}
                  >
                    {teacherData.info_firstname_kh || ""}{" "}
                    {teacherData.info_lastname_kh || ""}
                  </h2>
                  <div style={{ opacity: 0.8, fontSize: "14px" }}>
                    {teacherData.info_teacher_uef_id || "UEF ID: N/A"} •{" "}
                    {getDegreeLabel(teacherData.degree_level)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RowBreaker />

      {/* Tabs */}
      <div hidden className="row">
        <div className="col-md-12">
          <ul
            className="nav nav-tabs"
            style={{ borderBottom: "2px solid #1a3c2a" }}
          >
            {tabs.map((tab) => (
              <li key={tab.key} className="nav-item">
                <button
                  className={`nav-link siemreap-regular ${activeTab === tab.key ? "active" : ""}`}
                  style={{
                    color: activeTab === tab.key ? "#1a3c2a" : "#6c757d",
                    fontWeight: activeTab === tab.key ? "bold" : "normal",
                    borderBottom:
                      activeTab === tab.key ? "3px solid #1a3c2a" : "none",
                    background: "transparent",
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    padding: "12px 20px",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <RowBreaker />

      {/* Tab Content */}
      <div className="row">
        <div className="col-md-12">
          {activeTab === "profile" && (
            <div
              className="card shadow-sm"
              style={{ borderRadius: "10px", border: "none", padding: "20px" }}
            >
              <TeacherDetailTab
                teacherData={teacherData}
                onEdit={() =>
                  navigate(`/admin/student-management/teacher/edit/${id}`)
                }
                onBack={() => navigate(-1)}
              />
            </div>
          )}
          {activeTab === "classes" && (
            <div
              className="card shadow-sm"
              style={{ borderRadius: "10px", border: "none", padding: "20px" }}
            >
              <ClassTeacherTeach teacherId={id} auth={auth} />
            </div>
          )}
        </div>
      </div>

      <RowBreaker break={1} />



       {/* Silent refresh indicator */}
      {isRefreshing && !isLoading && (
        <div
          style={{
            color: "#047857",
            padding: "8px 16px",
            fontSize: "12px",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Siemreap', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
            animation: "fadeInUp 0.3s ease",
          }}
        >
         <label> កំពុងធ្វើបច្ចុប្បន្នភាព...</label>
        </div>
      )}

      <RowBreaker break={2} />
    </div>
  );
}

export default AccountProfile;
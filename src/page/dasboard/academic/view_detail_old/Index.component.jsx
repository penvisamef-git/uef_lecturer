import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getByIdRequest } from "../../../../util/request_api.js";
import { FaGraduationCap } from "react-icons/fa6";
import { MdClass } from "react-icons/md";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import Loading from "../../../../component/Loading/Loading.component.jsx";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component.jsx";
import Title from "../../../../component/Title/Title.component.jsx";
import ClassDetailTab from "./ClassDetailTab.jsx";
import TimetableTab from "./TimetableTab.js";
import StudentsTab from "./StudentsTab.js";
import AttendanceTab from "../../../attendancesession/check_attendance/AttendanceSession.jsx";

// ✅ Use auth as a prop – no useContext
function Index({ auth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const swalToast = new SwalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");

  const loginData = auth?.getClientLogin()?.data || {};
  const access_token = loginData?.access_token;

  const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class/${id}`;

  useEffect(() => {
    if (id && access_token) {
      loadData();
    } else if (!access_token) {
      swalToast.toastError("មិនមានសិទ្ធិចូលប្រើ! សូមចូលប្រើប្រាស់ឡើងវិញ", 2000);
      navigate(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, access_token]);

  async function loadData() {
    setIsLoading(true);
    try {
      const result = await getByIdRequest(api, access_token);
      if (result.success) {
        setClassData(result.data);
        setActiveTab("detail");
      } else {
        swalToast.toastError(result.message || "មិនអាចទាញយកទិន្នន័យ!", 2000);
        if (result.status === 401) navigate("/login");
      }
    } catch (error) {
      console.error("❌ Error loading class data:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 2000);
    } finally {
      setIsLoading(false);
    }
  }

  // ----------------- Helper functions (unchanged) -----------------
  const getTabs = () => {
    const baseTabs = [
      { key: "detail", label: "ព័ត៌មានថ្នាក់", icon: <MdClass /> },
      { key: "timetable", label: "កាលវិភាគ", icon: <FaCalendarAlt /> },
      { key: "students", label: "និស្សិត", icon: <FaUsers /> },
    ];
    if (classData?.class_status === "start" || classData?.class_status === "closed") {
      baseTabs.push({ key: "attendance", label: "វត្តមាន", icon: <FaCheckCircle /> });
    }
    return baseTabs;
  };

  const tabs = getTabs();

  const getShiftLabel = (shift) => {
    const map = { 1: "ព្រឹក (Morning)", 2: "រសៀល (Afternoon)", 3: "ល្ងាច (Evening)", 4: "សៅរ៍-អាទិត្យ (Weekend)" };
    return map[shift] || shift;
  };

  const getStatusLabel = (status) => {
    const map = { start: "កំពុងបង្រៀន", closed: "ថ្នាក់បានបញ្ចប់", pending: "ថ្នាក់មិនទាន់ចាប់ផ្តើម" };
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
      other: "ផ្សេងៗ"
    };
    return map[level] || level;
  };

  const handleTimetableButtonClick = () => navigate(`/admin/timetable/schedule/${id}`);
  const handleStudentsButtonClick = () => navigate(`/admin/students/class/${id}`);

  const renderActionButton = () => {
    if (activeTab === "timetable") {
      return (
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleTimetableButtonClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "8px",
            fontFamily: "'Khmer OS Siemreap'",
            fontWeight: "500",
            fontSize: "14px",
            backgroundColor: "#1a3c2a",
            borderColor: "#1a3c2a"
          }}
        >
          <IoMdAdd size={18} /> ពិនិត្យកាលវិភាគ
        </button>
      );
    }
    if (activeTab === "students") {
      return (
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleStudentsButtonClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "8px",
            fontFamily: "'Khmer OS Siemreap'",
            fontWeight: "500",
            fontSize: "14px",
            backgroundColor: "#1a3c2a",
            borderColor: "#1a3c2a"
          }}
        >
          <FaUsers size={16} /> ពិនិត្យនិស្សិត
        </button>
      );
    }
    return null;
  };

  if (!classData) {
    return <Loading is_loading={isLoading} />;
  }

  return (
    <div className="container defualt_White_Shadow_Theme">
      <Loading is_loading={isLoading} />
      <RowBreaker />
      {/* Header */}
      <div className="row">
        <div className="col-md-12">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Khmer OS', 'Siemreap', sans-serif" }}>
            <button type="button" className="btn btn-success" onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "8px", fontFamily: "'Khmer OS Siemreap", fontWeight: "500", fontSize: "14px" }}>
              <span style={{ fontSize: "18px" }}>←</span> ត្រលប់
            </button>
            <Title mode="custom" icons={null} title={`ឆ្នាំសិក្សា ${classData.year_study_from} - ${classData.year_study_to}`} />
          </div>
        </div>
      </div>
      <RowBreaker />

      {/* Class Info */}
      <div className="row">
        <div className="col-md-6" style={{ display: "flex" }}>
          <h5 className="siemreap-regular" style={{ marginTop: "7px", marginRight: "10px" }}>
            <FaGraduationCap /> {classData.major_id?.name || "N/A"} - {getDegreeLabel(classData.degree_level)}
          </h5>
          <h5>
            <span className="badge siemreap-regular" style={{ background: "transparent", color: getStatusColor(classData.class_status), padding: "10px", borderRadius: "20px", border: `2px solid ${getStatusColor(classData.class_status)}`, fontWeight: "500", fontSize: "14px" }}>
              {getStatusLabel(classData.class_status)}
            </span>
          </h5>
        </div>
      </div>
      <RowBreaker />

      {/* Tabs */}
      <div className="row">
        <div className="col-md-12">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #1a3c2a", paddingBottom: "0" }}>
            <ul className="nav nav-tabs" style={{ borderBottom: "none", marginBottom: "-2px" }}>
              {tabs.map((tab) => (
                <li key={tab.key} className="nav-item">
                  <button
                    className={`nav-link siemreap-regular ${activeTab === tab.key ? "active" : ""}`}
                    style={{
                      color: activeTab === tab.key ? "#1a3c2a" : "#6c757d",
                      fontWeight: activeTab === tab.key ? "bold" : "normal",
                      borderBottom: activeTab === tab.key ? "3px solid #1a3c2a" : "none",
                      background: "transparent",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      padding: "12px 20px",
                      cursor: "pointer",
                      fontFamily: "Khmer OS Siemreap",
                      transition: "all 0.3s ease"
                    }}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.icon} {tab.label}
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>
      <RowBreaker />

      {/* Tab Content */}
      <div className="row">
        <div className="col-md-12">
          {activeTab === "detail" && (
            <ClassDetailTab
              classData={classData}
              getShiftLabel={getShiftLabel}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
              getDegreeLabel={getDegreeLabel}
            />
          )}
          {activeTab === "timetable" && <TimetableTab classData={classData} />}
          {activeTab === "students" && <StudentsTab classData={classData} loadData={loadData} />}
          {activeTab === "attendance" && (
            <AttendanceTab
              classData={classData}
              auth={auth}
            />
          )}
        </div>
      </div>
      <RowBreaker break={2} />
    </div>
  );
}

export default Index;
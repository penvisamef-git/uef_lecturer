import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RowBreaker from "../../../component/Boostramp/RowBreaker.component.jsx";
import Loading from "../../../component/Loading/Loading.component.jsx";
import SwalToast from "../../../component/SwalToast/SwalToast.js";
import DataTableCustom from "../../../component/DataTable/datatable.component.jsx";
import { getByIdRequest } from "../../../util/request_api.js";
import { FaCheckCircle, FaUserCheck, FaEdit, FaEye } from "react-icons/fa";

function AttendanceTab({ auth, setIsGlobalLoading, classData: propClassData }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const swalToast = new SwalToast();

  const [isLoading, setIsLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataCount, setDataCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [teacherStats, setTeacherStats] = useState([]);

  const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class-time-table-and-student`;
  const access_token = auth?.getClientLogin()?.data?.access_token;

  const getLoggedInTeacherId = () => {
    const user = auth?.getClientLogin()?.data;
    return user?._id || null;
  };

  useEffect(() => {
    if (propClassData) {
      processClassData(propClassData);
      return;
    }
    if (id) loadClassData();
    else setIsLoading(false);
  }, [id, propClassData]);

  const loadClassData = async () => {
    setIsLoading(true);
    if (setIsGlobalLoading) setIsGlobalLoading(true);

    if (!access_token) {
      swalToast.toastError("សូមចូលប្រើប្រាស់ឡើងវិញ", 2000);
      setIsLoading(false);
      if (setIsGlobalLoading) setIsGlobalLoading(false);
      return;
    }

    try {
      const result = await getByIdRequest(`${api}/${id}`, access_token);
      if (!result?.success) {
        swalToast.toastError(result?.message || "ទាញយកទិន្នន័យបរាជ័យ", 2000);
        return;
      }
      processClassData(result.data);
    } catch (error) {
      console.error(error);
      swalToast.toastError("មានបញ្ហាបច្ចេកទេស", 2000);
    } finally {
      setIsLoading(false);
      if (setIsGlobalLoading) setIsGlobalLoading(false);
    }
  };

  const processClassData = (data) => {
    const classes = data?._id ? [data] : [];
    if (!classes.length) {
      swalToast.toastInfo("មិនមានថ្នាក់សម្រាប់បង្ហាញ", 2000);
      setAttendanceData([]);
      setFilteredData([]);
      setDataCount(0);
      setTeacherStats([]);
      setIsLoading(false);
      return;
    }

    const allSessions = generateSessions(classes);
    const loggedTeacherId = getLoggedInTeacherId();
    let sessionsForTeacher = allSessions;
    if (loggedTeacherId) {
      sessionsForTeacher = allSessions.filter((s) => s.teacher_id === loggedTeacherId);
    }

    const numbered = assignGlobalNumbers(sessionsForTeacher);

    setAttendanceData(numbered);
    setFilteredData(numbered);
    setDataCount(numbered.length);
    setCurrentPage(1);
    setTeacherStats(buildStats(classes));
    setIsLoading(false);
  };

  const generateSessions = (classes) => {
    const sessions = [];
    const dayMap = {
      Monday: "ចន្ទ",
      Tuesday: "អង្គារ",
      Wednesday: "ពុធ",
      Thursday: "ព្រហស្បតិ៍",
      Friday: "សុក្រ",
      Saturday: "សៅរ៍",
      Sunday: "អាទិត្យ",
    };

    classes.forEach((cls) => {
      const classId = cls._id;
      const code = cls.code || "N/A";
      cls.schedule?.forEach((sub) => {
        const total = Number(sub.session_total) || 0;
        const taught = Number(sub.session_have_teach) || 0;
        const periods = sub.periods || [];
        const periodCount = periods.length;

        for (let i = 1; i <= total; i++) {
          let dateDisplay = `វគ្គ ${i}`;
          let dayEn = "";
          let timeFrom = "";
          if (periodCount) {
            const p = periods[(i - 1) % periodCount];
            dayEn = p.day || "";
            timeFrom = p.time_from || "";
            dateDisplay = `${dayMap[dayEn] || dayEn} ${timeFrom}`;
          }
          sessions.push({
            _id: `${classId}-${sub._id}-session-${i}`,
            class_id: classId,
            class_code: code,
            subject_id: sub._id,
            teacher_id: sub.teacher_id?._id || null,
            teacher_name: sub.teacher_id?.fullName_kh || sub.teacher_id?.fullName_en || "N/A",
            session_number: i,
            subject_name: sub.subject_id?.name || "មុខវិជ្ជា",
            date: dateDisplay,
            dayEn,
            timeFrom,
            status: i <= taught ? "completed" : "pending",
            session_total: total,
          });
        }
      });
    });
    return sessions;
  };

  const assignGlobalNumbers = (sessions) => {
    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
    const sorted = [...sessions].sort((a, b) => {
      if (a.session_number !== b.session_number) return a.session_number - b.session_number;
      return (dayOrder[a.dayEn] || 99) - (dayOrder[b.dayEn] || 99);
    });
    sorted.forEach((s, idx) => (s.global_session_number = idx + 1));
    return sorted;
  };

  const buildStats = (classes) => {
    const map = {};
    classes.forEach((cls) => {
      cls.schedule?.forEach((sub) => {
        const t = sub.teacher_id;
        if (t?._id) {
          if (!map[t._id]) {
            map[t._id] = {
              teacher_id: t._id,
              teacher_name: t.fullName_kh || t.fullName_en || "N/A",
              classIds: new Set(),
            };
          }
          map[t._id].classIds.add(cls._id);
        }
      });
    });
    return Object.values(map).map((t) => ({
      ...t,
      class_count: t.classIds.size,
    }));
  };

  const isClickablePending = useCallback((row) => {
    if (row.status === "completed") return false;
    const sameSubject = attendanceData.filter(
      (s) => s.class_id === row.class_id && s.subject_id === row.subject_id
    );
    sameSubject.sort((a, b) => a.session_number - b.session_number);
    const idx = sameSubject.findIndex((s) => s._id === row._id);
    if (idx === -1) return false;
    // Check if all previous sessions are completed
    const allPreviousCompleted = sameSubject.slice(0, idx).every((s) => s.status === "completed");
    // Check if this is the first pending session (the one right after all completed ones)
    const isFirstPending = sameSubject.slice(0, idx).every(s => s.status === "completed") && 
                           (idx === 0 || sameSubject[idx - 1].status === "completed");
    return allPreviousCompleted && isFirstPending;
  }, [attendanceData]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    applyFilters(status, attendanceData);
  };

  const handleSearchChange = (value) => {
    setCurrentPage(1);
    if (value.trim() === "") {
      applyFilters(selectedStatus, attendanceData);
      return;
    }
    const searchLower = value.toLowerCase();
    const filtered = attendanceData.filter(
      (item) =>
        item.subject_name.toLowerCase().includes(searchLower) ||
        item.class_code?.toLowerCase().includes(searchLower) ||
        item.session_number.toString().includes(searchLower) ||
        item.global_session_number?.toString().includes(searchLower) ||
        item.teacher_name?.toLowerCase().includes(searchLower)
    );
    setFilteredData(filtered);
    setDataCount(filtered.length);
  };

  const applyFilters = (status, data) => {
    if (status === "all") {
      setFilteredData(data);
      setDataCount(data.length);
    } else {
      const filtered = data.filter((item) => item.status === status);
      setFilteredData(filtered);
      setDataCount(filtered.length);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAttendanceCheck = (row) => {
    if (!access_token) {
      swalToast.toastError("សូមចូលប្រើប្រាស់ឡើងវិញ", 2000);
      return;
    }
    
    // Only allow if it's the clickable pending session
    if (!isClickablePending(row)) {
      swalToast.toastWarning(
        row.status === "completed" ? "វគ្គនេះបានចុះរួចហើយ" : "សូមចុះវគ្គមុនៗជាមុន",
        2000
      );
      return;
    }
    
    // Navigate to check attendance page with mode=edit via query param
    navigate(`/admin/check-attendance/${row.class_id}/${row.subject_id}/${row.session_number}?mode=edit`);
  };

  const handleViewAttendance = (row) => {
    // Navigate to check attendance page with mode=view via query param
    navigate(`/admin/check-attendance/${row.class_id}/${row.subject_id}/${row.session_number}?mode=view`);
  };

  const handleEditAttendance = (row) => {
    // Navigate to check attendance page with mode=edit via query param
    navigate(`/admin/check-attendance/${row.class_id}/${row.subject_id}/${row.session_number}?mode=edit`);
  };

  const columns = [
    {
      name: "លេខថ្នាក់",
      selector: (row) => row.class_code,
      sortable: true,
    },
    {
      name: "វគ្គ",
      selector: (row) => `វគ្គទី ${row.global_session_number || row.session_number}`,
      sortable: true,
    },
    {
      name: "មុខវិជ្ជា",
      selector: (row) => row.subject_name,
      sortable: true,
    },
    {
      name: "ថ្ងៃ/ម៉ោង",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "ពិនិត្យវត្តមាន",
      selector: (row) => {
        const completed = row.status === "completed";
        const clickable = isClickablePending(row);
        
        return (
          <div
            className="siemreap-regular"
            onClick={() => clickable && handleAttendanceCheck(row)}
            tabIndex={clickable ? 0 : -1}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && clickable) {
                e.preventDefault();
                handleAttendanceCheck(row);
              }
            }}
            style={{
              cursor: clickable ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              width: "80px"
            }}
          >
            <FaUserCheck size={14} />
            <span
              style={{
                color: completed ? "#0dc25e" : (clickable ? "#f59e0b" : "#d1d5db"),
                fontWeight: "bold",
              }}
            >
              {completed ? "រួចរាល់" : "បន្តិចទៀត"}
            </span>
          </div>
        );
      },
    },
    {
      name: "សកម្មភាព",
      selector: (row) => {
        const completed = row.status === "completed";
        const clickable = isClickablePending(row);
        
        return (
          <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "nowrap" }}>
            
            {completed ? (
              <>
                <button
                  className="siemreap-regular"
                  onClick={() => handleViewAttendance(row)}
                  style={{
                    background: "#0dc25e",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <FaEye size={12} />
                  មើលវត្តមាន
                </button>
                <button
                  className="siemreap-regular"
                  onClick={() => handleEditAttendance(row)}
                  style={{
                    background: "#1a3c2a",
                    color: "white",
                    padding: "6px 8px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "32px",
                  }}
                  title="កែប្រែ"
                >
                  <FaEdit size={20} />
                </button>
              </>
            ) : clickable ? (
              // Edit mode for pending clickable
              <button
                className="siemreap-regular"
                onClick={() => handleAttendanceCheck(row)}
                style={{
                  background: "#f59e0b",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap"
                }}
              >
                <FaUserCheck size={12} />
                ពិនិត្យវត្តមាន
              </button>
            ) : (
              // Disabled for non-clickable pending
              <button
                className="siemreap-regular"
                disabled
                style={{
                  background: "#d1d5db",
                  color: "#6b7280",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  cursor: "not-allowed",
                  opacity: 0.6,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap"
                }}
              >
                <FaUserCheck size={12} />
                ពិនិត្យវត្តមាន
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const rowsPerPage = dataCount || 9999;
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  if (isLoading) return <Loading is_loading={isLoading} />;

  return (
    <div>
      <div className="container defualt_White_Shadow_Theme">
        <RowBreaker />

        <div className="row">
          <div className="col-md-12">
            <DataTableCustom
              onChangePage={handlePageChange}
              onSearch={handleSearchChange}
              props={{
                show_loading: false,
                header: {
                  show_create: false,
                  title: "បញ្ជីវត្តមាន",
                },
                columns,
                data: paginatedData,
                pagination: {
                  currentPage,
                  rowsPerPage,
                  count: dataCount,
                },
                show_status: false,
                actionButton: {
                  show_view: false,
                  show_edit: false,
                  show_delete: false,
                },
                errorGetData: {
                  status: false,
                  message: "",
                },
              }}
            />
          </div>
        </div>

        {showComingSoon && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              background: "linear-gradient(135deg, #1a3c2a, #0dc25e)",
              color: "white",
              padding: "16px 24px",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              zIndex: 9999,
              fontFamily: "'Khmer OS Siemreap', sans-serif",
              fontSize: "14px",
            }}
          >
            <FaCheckCircle style={{ marginRight: "10px" }} />
            កំពុងដំណើរការ... សូមរង់ចាំ!
          </div>
        )}

        <RowBreaker break={2} />
      </div>
    </div>
  );
}

export default AttendanceTab;
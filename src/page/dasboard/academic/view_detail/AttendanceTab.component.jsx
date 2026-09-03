import React, { useEffect, useState } from "react";
import SwalToast from "../../../../component/SwalToast/SwalToast";
import {
  FaCheck,
  FaTimes,
  FaCalendarDay,
  FaClock,
  FaLock,
  FaPlay,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaSave,
  FaClock as FaClockIcon,
  FaFileSignature,
  FaBan,
} from "react-icons/fa";
import Auth from "../../../../util/auth";

function AttendanceTab({ classData }) {
  const swalToast = new SwalToast();
  const auth = new Auth();
  const [currentScheduleList, setCurrentScheduleList] = useState([]);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const DAY_ORDER = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const DAY_MAP = {
    Monday: "ច័ន្ទ",
    Tuesday: "អង្គារ",
    Wednesday: "ពុធ",
    Thursday: "ព្រហស្បតិ៍",
    Friday: "សុក្រ",
    Saturday: "សៅរ៍",
    Sunday: "អាទិត្យ",
  };

  useEffect(() => {
    checkingCurrentWorkSchedule();
  }, []);

  useEffect(() => {
    if (currentScheduleList.length > 0) {
      generateSessionsForSubject(selectedScheduleIndex);
    }
  }, [currentScheduleList, selectedScheduleIndex]);

  function checkingCurrentWorkSchedule() {
    const teacherId = auth.getClientLogin()?.data?._id;
    const list = [];

    if (!classData?.schedule) return;

    classData.schedule?.forEach((row) => {
      if (row?.teacher_id?._id === teacherId) {
        list.push(row);
      }
    });

    const groupedMap = new Map();

    list.forEach((entry) => {
      const subjectId = entry.subject_id?._id || entry.subject_id;
      const key = subjectId?.toString();

      if (key) {
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            subjectId: subjectId,
            subjectName: entry.subject_id?.name || "N/A",
            subjectCode: entry.subject_id?.code || "N/A",
            teacher_id: entry.teacher_id,
            room_id: entry.room_id,
            session_total: entry.session_total || 0,
            session_have_teach: entry.session_have_teach || 0,
            periods: [],
          });
        }

        const existing = groupedMap.get(key);
        if (entry.periods) {
          existing.periods.push(...entry.periods);
        }
        if (entry.session_total > existing.session_total) {
          existing.session_total = entry.session_total;
        }
        if (entry.session_have_teach > existing.session_have_teach) {
          existing.session_have_teach = entry.session_have_teach;
        }
      }
    });

    const groupedList = Array.from(groupedMap.values());
    setCurrentScheduleList(groupedList);

    if (groupedList.length > 0) {
      setSelectedScheduleIndex(0);
    }
  }

  // ==========================================
  // FIXED: generateSessionsForSubject
  // ==========================================
  function generateSessionsForSubject(index) {
    const schedule = currentScheduleList[index];
    if (!schedule) return;

    const total = schedule.session_total || 0;
    const taught = schedule.session_have_teach || 0;

    // Get unique periods (one per day)
    const uniquePeriods = [];
    const seenDays = new Set();

    const sortedPeriods = [...(schedule.periods || [])].sort((a, b) => {
      return DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
    });

    sortedPeriods.forEach((period) => {
      if (!seenDays.has(period.day)) {
        seenDays.add(period.day);
        uniquePeriods.push(period);
      }
    });

    const sessionList = [];
    for (let i = 1; i <= total; i++) {
      const periodIndex = (i - 1) % uniquePeriods.length;
      const period = uniquePeriods[periodIndex] || null;

      let status = "pending";
      let isLocked = true;

      // ==========================================
      // FIXED: Current session is taught + 1 (next to teach)
      // ==========================================
      const isCurrent = i === taught + 1;
      const isPast = i <= taught;
      const isFuture = i > taught + 1;

      // Allow editing for current session only (not past)
      const canEdit = isCurrent;

      if (isPast) {
        status = "completed";
        isLocked = true;
      } else if (isCurrent) {
        status = "pending";
        isLocked = false;
      } else if (isFuture) {
        status = "pending";
        isLocked = true;
      }

      // If taught is 0, session 1 is the current session
      if (taught === 0 && i === 1) {
        isLocked = false;
        status = "pending";
      }

      sessionList.push({
        session_number: i,
        status: status,
        day: period?.day || "N/A",
        time_from: period?.time_from || "N/A",
        time_to: period?.time_to || "N/A",
        isPresent: false,
        isAbsent: false,
        note: "",
        cycle: periodIndex + 1,
        isLocked: isLocked,
        isCurrent: isCurrent || (taught === 0 && i === 1),
        isEditable: canEdit || (taught === 0 && i === 1),
        isPast: isPast,
        isFuture: isFuture,
      });
    }

    setSessions(sessionList);
    // Reset expanded session when switching subjects
    setExpandedSession(null);
    setStudentAttendance({});
  }

  const handleAttendanceMark = (sessionNumber, status) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.session_number === sessionNumber) {
          return {
            ...session,
            status: status,
            isPresent: status === "present",
            isAbsent: status === "absent",
          };
        }
        return session;
      }),
    );
  };

  // ==========================================
  // EXPANDABLE ROW FUNCTIONS
  // ==========================================
  const getStudentsForSession = () => {
    return classData?.students || [];
  };

  // ==========================================
  // SORT STUDENTS BY NAME A-Z
  // ==========================================
  const getSortedStudents = () => {
    const students = getStudentsForSession();
    return [...students].sort((a, b) => {
      const nameA = a.student_id
        ? `${a.student_id.firstname || ""} ${a.student_id.lastname || ""}`.trim()
        : "";
      const nameB = b.student_id
        ? `${b.student_id.firstname || ""} ${b.student_id.lastname || ""}`.trim()
        : "";
      return nameA.localeCompare(nameB, "km");
    });
  };

  const toggleExpand = (sessionNumber) => {
    if (expandedSession === sessionNumber) {
      setExpandedSession(null);
      setStudentAttendance({});
    } else {
      setExpandedSession(sessionNumber);
      // Initialize attendance for students
      const students = getSortedStudents();
      const initialAttendance = {};
      students.forEach((student) => {
        const studentId = student.student_id?._id || student._id;
        if (studentId) {
          const key = `${sessionNumber}_${studentId}`;
          initialAttendance[key] = {
            present: false,
            late: false,
            absent: false,
            absentReport: false,
          };
        }
      });
      setStudentAttendance(initialAttendance);
    }
  };

  const toggleStudentAttendance = (sessionNumber, studentId, type) => {
    const key = `${sessionNumber}_${studentId}`;
    setStudentAttendance((prev) => {
      const current = prev[key] || {
        present: false,
        late: false,
        absent: false,
        absentReport: false,
      };
      return {
        ...prev,
        [key]: {
          present: type === "present" ? !current.present : false,
          late: type === "late" ? !current.late : false,
          absent: type === "absent" ? !current.absent : false,
          absentReport: type === "absentReport" ? !current.absentReport : false,
        },
      };
    });
  };

  const markAllPresent = (sessionNumber) => {
    const students = getSortedStudents();
    const updates = {};
    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      if (studentId) {
        const key = `${sessionNumber}_${studentId}`;
        updates[key] = {
          present: true,
          late: false,
          absent: false,
          absentReport: false,
        };
      }
    });
    setStudentAttendance((prev) => ({ ...prev, ...updates }));
  };

  const markAllLate = (sessionNumber) => {
    const students = getSortedStudents();
    const updates = {};
    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      if (studentId) {
        const key = `${sessionNumber}_${studentId}`;
        updates[key] = {
          present: false,
          late: true,
          absent: false,
          absentReport: false,
        };
      }
    });
    setStudentAttendance((prev) => ({ ...prev, ...updates }));
  };

  const markAllAbsent = (sessionNumber) => {
    const students = getSortedStudents();
    const updates = {};
    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      if (studentId) {
        const key = `${sessionNumber}_${studentId}`;
        updates[key] = {
          present: false,
          late: false,
          absent: true,
          absentReport: false,
        };
      }
    });
    setStudentAttendance((prev) => ({ ...prev, ...updates }));
  };

  const markAllAbsentReport = (sessionNumber) => {
    const students = getSortedStudents();
    const updates = {};
    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      if (studentId) {
        const key = `${sessionNumber}_${studentId}`;
        updates[key] = {
          present: false,
          late: false,
          absent: false,
          absentReport: true,
        };
      }
    });
    setStudentAttendance((prev) => ({ ...prev, ...updates }));
  };

  // ==========================================
  // SAVE ATTENDANCE WITH API INTEGRATION
  // ==========================================
  const saveAttendance = async (sessionNumber) => {
    // Collect attendance data for this session
    const studentsData = [];
    const students = getSortedStudents();

    // Get the current schedule for this session
    const currentSchedule = currentScheduleList[selectedScheduleIndex];
    const subjectId = currentSchedule?.subjectId;
    const teacherId =
      currentSchedule?.teacher_id?._id || auth.getClientLogin()?.data?._id;

    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      if (studentId) {
        const key = `${sessionNumber}_${studentId}`;
        const att = studentAttendance[key] || {
          present: false,
          late: false,
          absent: false,
          absentReport: false,
        };

        // Determine attendance status
        let attendace_status = "pending";
        if (att.present) attendace_status = "present";
        else if (att.late) attendace_status = "late";
        else if (att.absent) attendace_status = "absent";
        else if (att.absentReport) attendace_status = "absent-report";

        studentsData.push({
          student_id: studentId,
          attendace_status: attendace_status,
        });
      }
    });

    // Count present/late/absent/absentReport
    const presentCount = studentsData.filter(
      (s) => s.attendace_status === "present",
    ).length;
    const lateCount = studentsData.filter(
      (s) => s.attendace_status === "late",
    ).length;
    const absentCount = studentsData.filter(
      (s) => s.attendace_status === "absent",
    ).length;
    const absentReportCount = studentsData.filter(
      (s) => s.attendace_status === "absent-report",
    ).length;

    setIsSaving(true);

    try {
      // Get current date for schedule_session
      const now = new Date();
      const scheduleSession = now.toISOString();

      // Prepare payload
      const payload = {
        class_id: classData?._id,
        teacher_id: teacherId,
        student_id_as_list: studentsData,
        subject_id: subjectId,
        current_session: sessionNumber.toString(),
        schedule_session: scheduleSession,
        note: `Attendance for session ${sessionNumber}`,
        status: true,
      };

      // API Call
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const apiUrl = `${process.env.REACT_APP_API_HOST}/api/admin/logs/class-group-of-student`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        swalToast.toastSuccess(
          `✅ បានរក្សាទុកវត្តមានដោយជោគជ័យ!\n\nមករៀន: ${presentCount} នាក់\nមកយឺត: ${lateCount} នាក់\nអវត្តមាន: ${absentCount} នាក់\nអវត្តមាន(មានច្បាប់): ${absentReportCount} នាក់`,
        );

        // Update session status
        handleAttendanceMark(sessionNumber, "present");

        // Close expanded row
        setExpandedSession(null);
        setStudentAttendance({});

        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        swalToast.toastError(
          `❌ បរាជ័យ: ${result.message || "មានបញ្ហាក្នុងការរក្សាទុក!"}`,
        );
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      swalToast.toastError("❌ មានបញ្ហាក្នុងប្រព័ន្ធ! សូមព្យាយាមម្តងទៀត");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status, isCurrent = false) => {
    if (isCurrent) {
      return (
        <span
          style={{
            background: "#eff6ff",
            color: "#3b82f6",
            padding: "8px 22px",
            borderRadius: "20px",
            fontSize: "1.1rem",
            fontWeight: "600",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
            display: "inline-block",
            minWidth: "130px",
            textAlign: "center",
            border: "2px solid #3b82f6",
          }}
        >
          🔵 បច្ចុប្បន្ន
        </span>
      );
    }

    const styles = {
      pending: { color: "#f59e0b", bg: "#fef3c7", label: "⏳ រង់ចាំ" },
      completed: { color: "#22c55e", bg: "#f0fdf4", label: "✅ បានបង្រៀន" },
      present: { color: "#22c55e", bg: "#f0fdf4", label: "✅ មករៀន" },
      late: { color: "#f59e0b", bg: "#fef3c7", label: "🕐 មកយឺត" },
      absent: { color: "#ef4444", bg: "#fef2f2", label: "❌ អវត្តមាន" },
      absentReport: {
        color: "#8b5cf6",
        bg: "#f3e8ff",
        label: "📋 អវត្តមាន(មានចំណាំ)",
      },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        style={{
          background: style.bg,
          color: style.color,
          padding: "8px 22px",
          borderRadius: "20px",
          fontSize: "1.1rem",
          fontWeight: "600",
          fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
          display: "inline-block",
          minWidth: "130px",
          textAlign: "center",
        }}
      >
        {style.label}
      </span>
    );
  };

  const getDayLabel = (day) => {
    return DAY_MAP[day] || day;
  };

  // Calculate statistics
  const totalSessions = sessions.length;
  const taughtSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "present",
  ).length;
  const pendingSessions = sessions.filter(
    (s) => s.status === "pending" && !s.isCurrent,
  ).length;
  const currentSessionNumber =
    sessions.find((s) => s.isCurrent)?.session_number || 0;

  const currentSchedule = currentScheduleList[selectedScheduleIndex];
  const uniqueDays = [
    ...new Set(sessions.map((s) => s.day).filter((d) => d !== "N/A")),
  ];

  // ==========================================
  // CHECK CLASS STATUS - Only allow if "start"
  // ==========================================
  const isClassActive = classData?.class_status === "start";

  // No schedule found
  if (currentScheduleList.length === 0) {
    return (
      <div
        className="card shadow-sm"
        style={{ borderRadius: "10px", border: "none" }}
      >
        <div className="card-body text-center py-5">
          <h5
            style={{
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              fontSize: "1.3rem",
            }}
          >
            មិនមានមុខវិជ្ជាដែលអ្នកបង្រៀនទេ
          </h5>
        </div>
      </div>
    );
  }

  // ==========================================
  // NOT ALLOWED - Class is not "start" status
  // ==========================================
  if (!isClassActive) {
    const statusLabels = {
      pending: "មិនទាន់ចាប់ផ្តើម",
      closed: "បានបញ្ចប់",
    };
    const statusLabel =
      statusLabels[classData?.class_status] || classData?.class_status;

    return (
      <div
        className="card shadow-sm"
        style={{ borderRadius: "10px", border: "none" }}
      >
        <div className="card-body text-center py-5">
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <FaBan style={{ fontSize: "2.5rem", color: "#f59e0b" }} />
          </div>
          <h5
            style={{
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              fontSize: "1.3rem",
              color: "#0f172a",
            }}
          >
            មិនអាចចុះវត្តមានបានទេ
          </h5>
          <p
            style={{
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              fontSize: "1.05rem",
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            ថ្នាក់នេះស្ថិតក្នុងស្ថានភាព <strong>{statusLabel}</strong>
            <br />
            សូមរង់ចាំរហូតដល់ថ្នាក់ចាប់ផ្តើមបង្រៀន
          </p>
          <div
            style={{
              display: "inline-block",
              marginTop: "12px",
              padding: "6px 20px",
              background: "#fef3c7",
              color: "#f59e0b",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "600",
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
            }}
          >
            ⚠️ ស្ថានភាពបច្ចុប្បន្ន: {statusLabel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
        padding: "0",
      }}
    >
      {/* Subject Selector */}
      {currentScheduleList.length > 1 && (
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-2">
            {currentScheduleList.map((schedule, index) => (
              <button
                key={index}
                className="btn"
                style={{
                  background:
                    selectedScheduleIndex === index
                      ? "linear-gradient(135deg, #1a3c2a 0%, #2d6a4f 100%)"
                      : "#f1f5f9",
                  color: selectedScheduleIndex === index ? "white" : "#475569",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: "10px",
                  fontWeight: selectedScheduleIndex === index ? "600" : "400",
                  fontFamily:
                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                  fontSize: "1.1rem",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setSelectedScheduleIndex(index)}
              >
                <FaCheck className="me-2" />
                {schedule.subjectName || "N/A"}
                <span
                  style={{
                    fontSize: "0.95rem",
                    marginLeft: "10px",
                    opacity: 0.7,
                  }}
                >
                  ({schedule.session_have_teach || 0}/
                  {schedule.session_total || 0})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject Header */}
      {currentSchedule && (
        <div className="mb-3">
          <h4
            style={{
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "20px",
              fontSize: "1.4rem",
            }}
          >
            {currentSchedule.subjectName || "N/A"}
            <span
              style={{
                fontSize: "1.1rem",
                color: "#94a3b8",
                marginLeft: "12px",
              }}
            >
              ({currentSchedule.subjectCode || "N/A"})
            </span>
          </h4>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              fontSize: "1.1rem",
              color: "#64748b",
            }}
          >
            <span>
              <FaCalendarDay className="me-1" />
              {uniqueDays.map((day, idx) => (
                <span key={day}>
                  {getDayLabel(day)}
                  {idx < uniqueDays.length - 1 && <span>, </span>}
                </span>
              ))}
            </span>
            <span style={{ color: "#22c55e" }}>
              ✅ បានបង្រៀន: <strong>{taughtSessions}</strong> វគ្គ (Session)
            </span>
            
            <span style={{ color: "#f59e0b" }}>
              ⏳ នៅសល់: <strong>{pendingSessions}</strong> វគ្គ (Session)
            </span>
            <span style={{ color: "#64748b" }}>
              📚 សរុប: <strong>{totalSessions}</strong> វគ្គ (Session)
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {totalSessions > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              width: "100%",
              height: "10px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(taughtSessions / totalSessions) * 100}%`,
                height: "100%",
                backgroundColor: "#22c55e",
                borderRadius: "4px",
                transition: "width 0.5s ease-in-out",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "0.95rem",
              color: "#64748b",
              marginTop: "4px",
              textAlign: "right",
            }}
          >
            {Math.round((taughtSessions / totalSessions) * 100)}%
          </div>
        </div>
      )}

      {/* Sessions Table - with Expandable Rows */}
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered mb-0"
          style={{
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
            minWidth: "750px",
            borderColor: "#d1d5db",
            fontSize: "1.1rem",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "white",
            }}
          >
            <tr>
              <th
                className="text-center"
                style={{
                  padding: "14px 16px",
                  fontWeight: "700",
                  fontSize: "1.15rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                }}
              >
                ល.រ
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 16px",
                  fontWeight: "700",
                  fontSize: "1.15rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                }}
              >
                ថ្ងៃ
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 16px",
                  fontWeight: "700",
                  fontSize: "1.15rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                }}
              >
                ម៉ោង
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 16px",
                  fontWeight: "700",
                  fontSize: "1.15rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                }}
              >
                ស្ថានភាព
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 16px",
                  fontWeight: "700",
                  fontSize: "1.15rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                }}
              >
                សកម្មភាព
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const isLocked = session.isLocked;
              const isCurrent = session.isCurrent;
              const isPast = session.isPast;
              const isEditable = session.isEditable;
              const isExpanded = expandedSession === session.session_number;

              return (
                <React.Fragment key={session.session_number}>
                  {/* Main Row */}
                  <tr
                    style={{
                      backgroundColor: isCurrent
                        ? "#eff6ff"
                        : isEditable && !isCurrent
                          ? "#fefce8"
                          : isPast
                            ? "#f0fdf4"
                            : session.status === "present"
                              ? "#f0fdf4"
                              : session.status === "absent"
                                ? "#fef2f2"
                                : "#ffffff",
                      transition: "all 0.2s ease",
                      fontSize: "1.1rem",
                      borderBottom: "1px solid #e5e7eb",
                      borderLeft: isCurrent
                        ? "4px solid #3b82f6"
                        : isEditable && !isCurrent
                          ? "4px solid #f59e0b"
                          : isPast
                            ? "4px solid #22c55e"
                            : "4px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLocked || isEditable) {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLocked || isEditable) {
                        e.currentTarget.style.backgroundColor = isCurrent
                          ? "#eff6ff"
                          : isEditable && !isCurrent
                            ? "#fefce8"
                            : isPast
                              ? "#f0fdf4"
                              : session.status === "present"
                                ? "#f0fdf4"
                                : session.status === "absent"
                                  ? "#fef2f2"
                                  : "#ffffff";
                      }
                    }}
                  >
                    <td
                      className="text-center"
                      style={{
                        verticalAlign: "middle",
                        fontWeight: "600",
                        fontSize: "1.2rem",
                        padding: "12px 12px",
                        color: isCurrent
                          ? "#3b82f6"
                          : isEditable && !isCurrent
                            ? "#f59e0b"
                            : isPast
                              ? "#22c55e"
                              : "#0f172a",
                      }}
                    >
                      {session.session_number}
                      {isLocked && !isEditable && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "0.9rem",
                            color: "#ef4444",
                          }}
                        >
                          🔒
                        </span>
                      )}
                      {isCurrent && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "0.9rem",
                            color: "#3b82f6",
                          }}
                        >
                          ▶
                        </span>
                      )}
                      {isEditable && !isCurrent && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "0.9rem",
                            color: "#f59e0b",
                          }}
                        >
                          ✎
                        </span>
                      )}
                      {isPast && !isEditable && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "0.9rem",
                            color: "#22c55e",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </td>
                    <td
                      className="text-center"
                      style={{ verticalAlign: "middle", padding: "12px 12px" }}
                    >
                      <span
                        style={{
                          fontSize: "1.15rem",
                          color: "#0f172a",
                          fontWeight: "500",
                        }}
                      >
                        <FaCalendarDay
                          className="me-2"
                          style={{ fontSize: "1rem", color: "#64748b" }}
                        />
                        {getDayLabel(session.day)}
                      </span>
                    </td>
                    <td
                      className="text-center"
                      style={{ verticalAlign: "middle", padding: "12px 12px" }}
                    >
                      <span
                        style={{
                          fontSize: "1.1rem",
                          color: "#64748b",
                          background: "#f1f5f9",
                          padding: "6px 16px",
                          borderRadius: "12px",
                          display: "inline-block",
                        }}
                      >
                        <FaClock
                          className="me-2"
                          style={{ fontSize: "0.95rem" }}
                        />
                        {session.time_from} - {session.time_to}
                      </span>
                    </td>
                    <td
                      className="text-center"
                      style={{ verticalAlign: "middle", padding: "12px 12px" }}
                    >
                      {isCurrent ? (
                        <span
                          style={{
                            background: "#eff6ff",
                            color: "#3b82f6",
                            padding: "8px 22px",
                            borderRadius: "20px",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            fontFamily:
                              "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                            display: "inline-block",
                            minWidth: "130px",
                            textAlign: "center",
                            border: "2px solid #3b82f6",
                          }}
                        >
                          🔵 បច្ចុប្បន្ន
                        </span>
                      ) : (
                        getStatusBadge(session.status)
                      )}
                    </td>
                    <td
                      className="text-center"
                      style={{ verticalAlign: "middle", padding: "12px 12px" }}
                    >
                      {!isEditable ? (
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn"
                            style={{
                              background: "#e5e7eb",
                              color: "#9ca3af",
                              border: "none",
                              padding: "8px 22px",
                              borderRadius: "8px",
                              fontSize: "1.05rem",
                              fontWeight: "500",
                              fontFamily:
                                "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                              cursor: "not-allowed",
                              opacity: 0.6,
                            }}
                            disabled
                          >
                            <FaLock className="me-2" /> ចាក់សោ
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn"
                            style={{
                              background: isExpanded ? "#ef4444" : "#22c55e",
                              color: "white",
                              border: "none",
                              padding: "8px 22px",
                              borderRadius: "8px",
                              fontSize: "1.05rem",
                              fontWeight: "500",
                              transition: "all 0.2s ease",
                              fontFamily:
                                "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                            }}
                            onClick={() => toggleExpand(session.session_number)}
                          >
                            {isExpanded ? (
                              <>
                                <FaChevronUp className="me-2" /> បិទ
                              </>
                            ) : (
                              <>
                                <FaUser className="me-2" /> ហៅវត្តមាន
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Row - Student List */}
                  {isExpanded && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{ padding: "0", background: "#f8fafc" }}
                      >
                        <div style={{ padding: "16px 24px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "12px",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                            <h6
                              style={{
                                marginTop: "10px",
                                marginBottom: "10px",
                                fontFamily:
                                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                fontWeight: "600",
                                margin: 0,
                                color: "#0f172a",
                                fontSize: "1.15rem",
                              }}
                            >
                              📋 បញ្ជីនិស្សិត - វគ្គ (Session) ទី{" "}
                              {session.session_number}
                              <span
                                style={{
                                  color: "#94a3b8",
                                  marginLeft: "8px",
                                  fontWeight: "400",
                                  fontSize: "1rem",
                                }}
                              >
                                (មាន {getSortedStudents().length} នាក់)
                              </span>
                            </h6>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                {/* Bulk action buttons removed as requested */}
                              </div>

                              <div>
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 20px",
                                    borderRadius: "6px",
                                    fontFamily:
                                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "0.95rem",
                                  }}
                                  onClick={() =>
                                    saveAttendance(session.session_number)
                                  }
                                  disabled={isSaving}
                                >
                                  <FaSave />
                                  {isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
                                </button>
                              </div>
                            </div>
                          </div>

                          <hr />

                          {/* Student List Table - SORTED A-Z */}
                          <div className="table-responsive">
                            <table
                              className="table table-sm"
                              style={{
                                fontFamily:
                                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                marginBottom: 0,
                                borderColor: "#e5e7eb",
                                fontSize: "1rem",
                              }}
                            >
                              <thead style={{ background: "#f1f5f9" }}>
                                <tr>
                                  <th
                                    style={{
                                      padding: "8px 10px",
                                      width: "50px",
                                      textAlign: "center",
                                    }}
                                  >
                                    ល.រ
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px 10px",
                                      fontSize: "1rem",
                                    }}
                                  >
                                    ឈ្មោះនិស្សិត
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px 10px",
                                      textAlign: "center",
                                      width: "220px",
                                    }}
                                  >
                                    ស្ថានភាព
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px 10px",
                                      textAlign: "center",
                                      width: "470px",
                                    }}
                                  >
                                    សកម្មភាព
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {getSortedStudents().map((student, idx) => {
                                  const studentId =
                                    student.student_id?._id || student._id;
                                  const key = `${session.session_number}_${studentId}`;
                                  const att = studentAttendance[key] || {
                                    present: false,
                                    late: false,
                                    absent: false,
                                    absentReport: false,
                                  };
                                  const studentName = student.student_id
                                    ? `${student.student_id.firstname || ""} ${student.student_id.lastname || ""}`.trim() ||
                                      "N/A"
                                    : "N/A";

                                  return (
                                    <tr key={key}>
                                      <td
                                        style={{
                                          padding: "8px 10px",
                                          textAlign: "center",
                                          fontWeight: "500",
                                          fontSize: "1rem",
                                        }}
                                      >
                                        {idx + 1}
                                      </td>
                                      <td style={{ padding: "8px 10px" }}>
                                        <div className="d-flex align-items-center gap-2">
                                          <div
                                            style={{
                                              width: "32px",
                                              height: "32px",
                                              borderRadius: "50%",
                                              background:
                                                "linear-gradient(135deg, #1a3c2a, #2d6a4f)",
                                              color: "white",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: "13px",
                                              fontWeight: "bold",
                                              flexShrink: 0,
                                            }}
                                          >
                                            {studentName.charAt(0) || "S"}
                                          </div>
                                          <span style={{ fontSize: "1rem" }}>
                                            {studentName}
                                          </span>
                                        </div>
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px 10px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {att.present ? (
                                          <span
                                            style={{
                                              background: "#f0fdf4",
                                              color: "#22c55e",
                                              padding: "4px 14px",
                                              borderRadius: "12px",
                                              fontWeight: "600",
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            ✅ មករៀន
                                          </span>
                                        ) : att.late ? (
                                          <span
                                            style={{
                                              background: "#fef3c7",
                                              color: "#f59e0b",
                                              padding: "4px 14px",
                                              borderRadius: "12px",
                                              fontWeight: "600",
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            🕐 មកយឺត
                                          </span>
                                        ) : att.absent ? (
                                          <span
                                            style={{
                                              background: "#fef2f2",
                                              color: "#ef4444",
                                              padding: "4px 14px",
                                              borderRadius: "12px",
                                              fontWeight: "600",
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            ❌ អវត្តមាន
                                          </span>
                                        ) : att.absentReport ? (
                                          <span
                                            style={{
                                              background: "#f3e8ff",
                                              color: "#8b5cf6",
                                              padding: "4px 14px",
                                              borderRadius: "12px",
                                              fontWeight: "600",
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            📋 អវត្តមាន(មានចំណាំ)
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              color: "#94a3b8",
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            ⏳ រង់ចាំ
                                          </span>
                                        )}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px 10px",
                                          textAlign: "center",
                                        }}
                                      >
                                        <div className="d-flex gap-1 justify-content-center flex-wrap">
                                          <button
                                            className="btn btn-sm"
                                            style={{
                                              background: att.present
                                                ? "#22c55e"
                                                : "#e5e7eb",
                                              color: att.present
                                                ? "white"
                                                : "#64748b",
                                              border: "none",
                                              padding: "4px 14px",
                                              borderRadius: "4px",
                                              transition: "all 0.2s ease",
                                              fontFamily:
                                                "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                              fontSize: "0.9rem",
                                            }}
                                            onClick={() =>
                                              toggleStudentAttendance(
                                                session.session_number,
                                                studentId,
                                                "present",
                                              )
                                            }
                                          >
                                            <FaCheck className="me-1" /> មក
                                          </button>
                                          <button
                                            className="btn btn-sm"
                                            style={{
                                              background: att.late
                                                ? "#f59e0b"
                                                : "#e5e7eb",
                                              color: att.late
                                                ? "white"
                                                : "#64748b",
                                              border: "none",
                                              padding: "4px 14px",
                                              borderRadius: "4px",
                                              transition: "all 0.2s ease",
                                              fontFamily:
                                                "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                              fontSize: "0.9rem",
                                            }}
                                            onClick={() =>
                                              toggleStudentAttendance(
                                                session.session_number,
                                                studentId,
                                                "late",
                                              )
                                            }
                                          >
                                            <FaClockIcon className="me-1" />{" "}
                                            មកយឺត
                                          </button>
                                          <button
                                            className="btn btn-sm"
                                            style={{
                                              background: att.absent
                                                ? "#ef4444"
                                                : "#e5e7eb",
                                              color: att.absent
                                                ? "white"
                                                : "#64748b",
                                              border: "none",
                                              padding: "4px 14px",
                                              borderRadius: "4px",
                                              transition: "all 0.2s ease",
                                              fontFamily:
                                                "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                              fontSize: "0.9rem",
                                            }}
                                            onClick={() =>
                                              toggleStudentAttendance(
                                                session.session_number,
                                                studentId,
                                                "absent",
                                              )
                                            }
                                          >
                                            <FaTimes className="me-1" />{" "}
                                            អវត្តមាន
                                          </button>
                                          <button
                                            className="btn btn-sm"
                                            style={{
                                              background: att.absentReport
                                                ? "#8b5cf6"
                                                : "#e5e7eb",
                                              color: att.absentReport
                                                ? "white"
                                                : "#64748b",
                                              border: "none",
                                              padding: "4px 14px",
                                              borderRadius: "4px",
                                              transition: "all 0.2s ease",
                                              fontFamily:
                                                "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                              fontSize: "0.9rem",
                                            }}
                                            onClick={() =>
                                              toggleStudentAttendance(
                                                session.session_number,
                                                studentId,
                                                "absentReport",
                                              )
                                            }
                                          >
                                            <FaFileSignature className="me-1" />{" "}
                                            អវត្តមាន(មានច្បាប់)
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <br />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTab;

import React, { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaUser, FaCheckCircle, FaTimesCircle, FaMinusCircle, FaSpinner, FaFilter } from "react-icons/fa";
import Loading from "../../../../component/Loading/Loading.component.jsx";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import Swal from "sweetalert2";

function ResultTab({ classData, navigate, auth, loadData }) {

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState(null);
  const [localStudents, setLocalStudents] = useState([]);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const swalToast = new SwalToast();

  const genderMap = { male: "ប្រុស", female: "ស្រី", other: "ផ្សេងទៀត" };

  // Get teacher ID from auth
  const teacherId = auth?.getClientLogin()?.data?._id;

  // Get subjects taught by this teacher
  const teacherSubjects = classData?.schedule?.filter(
    (schedule) => schedule?.teacher_id?._id === teacherId
  ) || [];

  // Get subject IDs taught by this teacher
  const teacherSubjectIds = teacherSubjects.map(
    (subject) => subject.subject_id?._id?.toString()
  ).filter(id => id);

  // Get current subject (first subject taught by this teacher)
  const currentSubject = teacherSubjects[0];
  const scoreOption = currentSubject?.score_option_id;
  const passScore = scoreOption?.pass_score || 60;

  // Check if class is active (start status)
  const isClassActive = classData?.class_status === "start";

  // Initialize local students - also when refreshKey changes
  useEffect(() => {
    if (classData?.students) {
      setLocalStudents([...classData.students]);
    }
  }, [classData, refreshKey]);

  // Calculate total score for a student from score_detail
  const calculateTotalScore = (student) => {
    if (!student?.score || student.score.length === 0) return 0;
    
    let totalScore = 0;
    student.score.forEach(score => {
      const subjectId = score.subject_id?._id?.toString() || score.subject_id?.toString();
      if (teacherSubjectIds.includes(subjectId) && score.score_detail && score.score_detail.total !== undefined) {
        totalScore += score.score_detail.total || 0;
      }
    });
    return totalScore;
  };

  // Get grade based on total score
  const getGrade = (totalScore) => {
    if (totalScore === 0) return { grade: "N/A", color: "#94a3b8", label: "មិនទាន់មានពិន្ទុ" };
    if (totalScore >= 90) return { grade: "A", color: "#22c55e", label: "ពូកែ" };
    if (totalScore >= 80) return { grade: "B", color: "#3b82f6", label: "ល្អ" };
    if (totalScore >= 70) return { grade: "C", color: "#f59e0b", label: "មធ្យម" };
    if (totalScore >= 60) return { grade: "D", color: "#f97316", label: "ខ្សោយ" };
    if (totalScore > 0) return { grade: "F", color: "#ef4444", label: "ធ្លាក់" };
    return { grade: "N/A", color: "#94a3b8", label: "មិនទាន់មានពិន្ទុ" };
  };

  const calculateTotalAbsence = (student) => {
    if (!student?.attendance || student.attendance.length === 0) return 0;
    let totalAbsence = 0;
    student.attendance.forEach(att => {
      const unreport = att.total_absence_unreport || 0;
      const report = att.total_absence_report || 0;
      totalAbsence += (unreport + report);
    });
    return totalAbsence;
  };

  // Check if student passed
  const getIsPassed = (student) => {
    if (student.is_passed !== undefined && student.is_passed !== null) {
      return student.is_passed;
    }
    const totalScore = calculateTotalScore(student);
    if (totalScore === 0) return null;
    return totalScore >= passScore;
  };

  const getSortedStudents = () => {
    const students = localStudents.length > 0 ? localStudents : (classData?.students || []);
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

  // Filter students by search term and grade
  const getFilteredStudents = () => {
    const students = getSortedStudents();
    
    return students.filter((student) => {
      // Search filter
      let matchesSearch = true;
      if (searchTerm) {
        const fullName = student.student_id
          ? `${student.student_id.firstname || ""} ${student.student_id.lastname || ""}`.trim().toLowerCase()
          : "";
        const email = (student.student_id?.email || "").toLowerCase();
        const idCard = (student.student_id?.id_card_number || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        matchesSearch = fullName.includes(search) || email.includes(search) || idCard.includes(search);
      }
      
      // Grade filter
      let matchesGrade = true;
      if (gradeFilter !== "all") {
        const totalScore = calculateTotalScore(student);
        const grade = getGrade(totalScore).grade;
        matchesGrade = grade === gradeFilter;
      }
      
      return matchesSearch && matchesGrade;
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    const students = getSortedStudents();
    let passed = 0;
    let failed = 0;
    let noScore = 0;
    let totalScores = 0;
    let scoreCount = 0;

    students.forEach(student => {
      const totalScore = calculateTotalScore(student);
      const isPassed = getIsPassed(student);
      
      if (totalScore === 0) {
        noScore++;
      } else {
        totalScores += totalScore;
        scoreCount++;
        if (isPassed === true) {
          passed++;
        } else {
          failed++;
        }
      }
    });

    const average = scoreCount > 0 ? (totalScores / scoreCount) : 0;
    return { passed, failed, noScore, average, totalStudents: students.length };
  };

  const stats = calculateStats();

  // Get grade counts for filter badges
  const getGradeCounts = () => {
    const students = getSortedStudents();
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0, "N/A": 0 };
    students.forEach(student => {
      const totalScore = calculateTotalScore(student);
      const grade = getGrade(totalScore).grade;
      if (counts[grade] !== undefined) {
        counts[grade]++;
      }
    });
    return counts;
  };

  const gradeCounts = getGradeCounts();

  // Show SweetAlert2 confirmation dialog before toggling
  const handleToggleClick = (student) => {
    const currentStatus = getIsPassed(student);
    if (currentStatus === null) return;
    
    const newStatus = !currentStatus;
    const statusText = newStatus ? "ជាប់" : "ធ្លាក់";
    const statusEmoji = newStatus ? "✅" : "❌";
    const studentName = student.student_id
      ? `${student.student_id.firstname || ""} ${student.student_id.lastname || ""}`.trim() || "N/A"
      : "N/A";

    Swal.fire({
      title: 'បញ្ជាក់ការផ្លាស់ប្តូរ',
      html: `
        <div style="text-align: left; font-family: 'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif;">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">
            <strong>សិស្ស:</strong> ${studentName}
          </p>
          <p style="font-size: 1.1rem; margin-bottom: 8px;">
            <strong>លទ្ធផលបច្ចុប្បន្ន:</strong> 
            <span style="color: ${currentStatus ? '#22c55e' : '#ef4444'}; font-weight: 700;">
              ${currentStatus ? 'ជាប់' : 'ធ្លាក់'}
            </span>
          </p>
          <p style="font-size: 1.1rem; margin-bottom: 0;">
            <strong>លទ្ធផលថ្មី:</strong> 
            <span style="color: ${newStatus ? '#22c55e' : '#ef4444'}; font-weight: 700;">
              ${statusEmoji} ${statusText}
            </span>
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a7431',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'កែប្រែ',
      cancelButtonText: 'បោះបង់',
      customClass: {
        popup: 'siemreap-bold',
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setPendingToggle({ student, newStatus });
        performToggle(student, newStatus);
      }
    });
  };

  // Perform the actual toggle
  const performToggle = async (student, newStatus) => {
    setUpdatingStudentId(student._id);
    setIsLoading(true);

    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const apiUrl = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class/${classData._id}/student-pass-status`;
      
      const payload = {
        student_id: student.student_id?._id || student._id,
        is_passed: newStatus
      };

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        swalToast.toastSuccess(`✅ បានកែប្រែលទ្ធផលដោយជោគជ័យ!`);
        
        // Update local state immediately
        const updatedStudents = localStudents.map(s => {
          if (s._id === student._id) {
            return { ...s, is_passed: newStatus };
          }
          return s;
        });
        setLocalStudents(updatedStudents);
        
        // Force refresh by incrementing refreshKey
        setRefreshKey(prev => prev + 1);
        
        // Also call loadData to refresh parent data
        if (loadData) {
          await loadData();
        }
        
        // Clear pending toggle
        setPendingToggle(null);
      } else {
        swalToast.toastError(`❌ ${result.message || "បរាជ័យក្នុងការកែប្រែ!"}`);
      }
    } catch (error) {
      console.error("Error updating pass status:", error);
      swalToast.toastError("❌ មានបញ្ហាក្នុងប្រព័ន្ធ! សូមព្យាយាមម្តងទៀត");
    } finally {
      setIsLoading(false);
      setUpdatingStudentId(null);
    }
  };

  const students = getFilteredStudents();
  const allStudents = getSortedStudents();

  // Grade filter options
  const gradeOptions = [
    { value: "all", label: "ទាំងអស់", color: "#64748b" },
    { value: "A", label: "A", color: "#22c55e" },
    { value: "B", label: "B", color: "#3b82f6" },
    { value: "C", label: "C", color: "#f59e0b" },
    { value: "D", label: "D", color: "#f97316" },
    { value: "F", label: "F", color: "#ef4444" },
    { value: "N/A", label: "N/A", color: "#94a3b8" },
  ];

  // Determine how many columns to show
  // If class is active: show 7 columns (including Result column)
  // If class is not active: show 6 columns (without Result column)
  const columns = isClassActive ? 7 : 6;

  return (
    <div
      style={{
        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
        padding: "0",
      }}
    >
      {/* ====== 3 CIRCLE STATISTICS ====== */}
      <div className="mb-4">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          {/* Title */}
          <h4
            style={{
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "0",
              fontSize: "1.4rem",
            }}
          >
            📊 លទ្ធផលសិស្ស
            <span
              style={{
                fontSize: "1rem",
                color: "#94a3b8",
                marginLeft: "12px",
                fontWeight: "400",
              }}
            >
              - {allStudents.length} នាក់
            </span>
            {!isClassActive && (
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#f59e0b",
                  marginLeft: "12px",
                  fontWeight: "500",
                  background: "#fffbeb",
                  padding: "2px 12px",
                  borderRadius: "12px",
                  border: "1px solid #fcd34d",
                }}
              >
                ⛔ ថ្នាក់មិនទាន់ចាប់ផ្តើម
              </span>
            )}
          </h4>

          {/* Search Field */}
          <div className="position-relative" style={{ minWidth: "200px" }}>
            <FaSearch 
              className="position-absolute" 
              style={{ 
                left: "12px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#94a3b8" 
              }} 
            />
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="ស្វែងរកនិស្សិត..."
              style={{ 
                borderRadius: "8px", 
                padding: "8px 16px 8px 36px",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                fontSize: "0.95rem",
                border: "2px solid #e2e8f0",
                background: "#f8fafc",
                minWidth: "200px",
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 3 Circle Stats */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "16px",
          justifyContent: "flex-start",
        }}>
          {/* Passed Circle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#ffffff",
            padding: "8px 20px 8px 12px",
            borderRadius: "50px",
            border: "2px solid #22c55e",
            boxShadow: "0 2px 8px rgba(34, 197, 94, 0.15)",
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.2rem",
              fontWeight: "700",
            }}>
              {stats.passed}
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#22c55e", fontWeight: "500" }}>✅ ជាប់</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                <strong>{stats.passed}</strong> នាក់
              </div>
            </div>
          </div>

          {/* Failed Circle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#ffffff",
            padding: "8px 20px 8px 12px",
            borderRadius: "50px",
            border: "2px solid #ef4444",
            boxShadow: "0 2px 8px rgba(239, 68, 68, 0.15)",
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.2rem",
              fontWeight: "700",
            }}>
              {stats.failed}
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: "500" }}>❌ ធ្លាក់</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                <strong>{stats.failed}</strong> នាក់
              </div>
            </div>
          </div>

          {/* Pass Score Circle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#ffffff",
            padding: "8px 20px 8px 12px",
            borderRadius: "50px",
            border: "2px solid #f59e0b",
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.15)",
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1rem",
              fontWeight: "700",
            }}>
              {passScore}%
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: "500" }}>🎯 ពិន្ទុជាប់</div>
              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#0f172a" }}>
                <strong>{passScore}%</strong>
              </div>
            </div>
          </div>

          {/* No Score - Small */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "30px",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
          }}>
            <FaMinusCircle size={16} color="#94a3b8" />
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              មិនទាន់មានពិន្ទុ: <strong>{stats.noScore}</strong> នាក់
            </span>
          </div>

          {/* Average - Small */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "30px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
          }}>
            <span style={{ fontSize: "0.85rem", color: "#3b82f6" }}>
              📊 មធ្យម: <strong>{stats.average.toFixed(1)}%</strong>
            </span>
          </div>
        </div>

        {/* Grade Filter */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "16px",
          alignItems: "center",
        }}>
          <span style={{ 
            fontSize: "0.9rem", 
            color: "#64748b", 
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginRight: "8px"
          }}>
            <FaFilter size={14} /> ចំណាត់ថ្នាក់:
          </span>
          {gradeOptions.map((option) => (
            <button
              key={option.value}
              style={{
                padding: "4px 14px",
                borderRadius: "20px",
                border: gradeFilter === option.value ? `2px solid ${option.color}` : "2px solid #e2e8f0",
                background: gradeFilter === option.value ? option.color : "#ffffff",
                color: gradeFilter === option.value ? "#ffffff" : "#64748b",
                fontWeight: gradeFilter === option.value ? "600" : "400",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              }}
              onClick={() => setGradeFilter(option.value)}
            >
              {option.label}
              {option.value !== "all" && (
                <span style={{
                  marginLeft: "4px",
                  fontSize: "0.7rem",
                  opacity: 0.7,
                  background: gradeFilter === option.value ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                  padding: "0 6px",
                  borderRadius: "10px",
                }}>
                  {gradeCounts[option.value] || 0}
                </span>
              )}
            </button>
          ))}
          {gradeFilter !== "all" && (
            <button
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#ef4444",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              }}
              onClick={() => setGradeFilter("all")}
            >
              ✕ លុបតម្រង
            </button>
          )}
        </div>

        {/* Show search results count */}
        {searchTerm && students.length !== allStudents.length && (
          <div style={{ 
            marginTop: "12px", 
            fontSize: "0.9rem", 
            color: "#64748b",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }}>
            បង្ហាញ <strong>{students.length}</strong> នាក់ ក្នុងចំណោម <strong>{allStudents.length}</strong> នាក់
          </div>
        )}
        {gradeFilter !== "all" && students.length !== allStudents.length && (
          <div style={{ 
            marginTop: "4px", 
            fontSize: "0.9rem", 
            color: "#64748b",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }}>
            <span style={{ color: gradeOptions.find(g => g.value === gradeFilter)?.color }}>
              ចំណាត់ថ្នាក់ {gradeFilter}: <strong>{students.length}</strong> នាក់
            </span>
          </div>
        )}
      </div>

      {/* Result Table */}
      <div className="table-responsive" style={{ overflowX: "auto", position: "relative" }}>
        {/* Table Loading Overlay */}
        {isLoading && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            borderRadius: "8px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}>
              <FaSpinner className="fa-spin" size={24} color="#1a3c2a" />
              <span style={{ fontSize: "1rem", color: "#1a3c2a", fontWeight: "500" }}>កំពុងរក្សាទុក...</span>
            </div>
          </div>
        )}

        <table
          className="table table-bordered"
          style={{
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
            minWidth: "600px",
            borderColor: "#d1d5db",
            fontSize: "1rem",
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
                  padding: "14px 12px",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                  minWidth: "50px",
                }}
              >
                ល.រ
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 12px",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                  minWidth: "200px",
                }}
              >
                <FaUser className="me-1" /> ឈ្មោះនិស្សិត
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 12px",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                  minWidth: "80px",
                }}
              >
                ភេទ
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 12px",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                  minWidth: "120px",
                }}
              >
                ពិន្ទុសរុប
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 12px",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                  minWidth: "120px",
                }}
              >
                អវត្តមានសរុប
              </th>
              <th
                className="text-center"
                style={{
                  padding: "14px 12px",
                  fontWeight: "700",
                  fontSize: "1.05rem",
                  borderBottom: "3px solid #22c55e",
                  letterSpacing: "0.5px",
                  minWidth: "100px",
                }}
              >
                ចំណាត់ថ្នាក់
              </th>
              {/* Only show "លទ្ធផល" column if class is active (start) */}
              {isClassActive && (
                <th
                  className="text-center"
                  style={{
                    padding: "14px 12px",
                    fontWeight: "700",
                    fontSize: "1.05rem",
                    borderBottom: "3px solid #22c55e",
                    letterSpacing: "0.5px",
                    minWidth: "200px",
                  }}
                >
                  លទ្ធផល
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={columns} className="text-center py-5">
                  <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
                    {searchTerm || gradeFilter !== "all" 
                      ? "មិនឃើញនិស្សិតដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរក" 
                      : "មិនមាននិស្សិតក្នុងថ្នាក់នេះទេ"}
                  </p>
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const studentId = student.student_id?._id || student._id;
                const studentName = student.student_id
                  ? `${student.student_id.firstname || ""} ${student.student_id.lastname || ""}`.trim() || "N/A"
                  : "N/A";
                const genderLabel = genderMap[student.student_id?.gender] || student.student_id?.gender || "N/A";
                const totalScore = calculateTotalScore(student);
                const gradeInfo = getGrade(totalScore);
                const totalAbsence = calculateTotalAbsence(student);
                const isPassed = getIsPassed(student);
                const isUpdating = updatingStudentId === student._id;

                return (
                  <tr
                    key={student._id}
                    style={{
                      backgroundColor: totalScore > 0 && totalScore >= passScore
                        ? "#f0fdf4"
                        : totalScore > 0 && totalScore < passScore
                        ? "#fef2f2"
                        : "#ffffff",
                      transition: "all 0.2s ease",
                      borderLeft: totalScore > 0 && totalScore >= passScore
                        ? "4px solid #22c55e"
                        : totalScore > 0 && totalScore < passScore
                        ? "4px solid #ef4444"
                        : "4px solid transparent",
                      opacity: isUpdating ? 0.6 : 1,
                      pointerEvents: isUpdating ? "none" : "auto",
                    }}
                  >
                    <td
                      className="text-center"
                      style={{
                        verticalAlign: "middle",
                        fontWeight: "600",
                        padding: "12px 10px",
                        color: "#0f172a",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        verticalAlign: "middle",
                        padding: "12px 10px",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #1a3c2a, #2d6a4f)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "bold",
                            flexShrink: 0,
                            cursor: "pointer"
                          }}
                          onClick={() => navigate(`/admin/student-management/student-profile/view/${student.student_id?._id}`)}
                        >
                          {studentName.charAt(0) || "S"}
                        </div>
                        <span style={{ fontSize: "1rem", fontWeight: "500" }}>{studentName}</span>
                      </div>
                    </td>
                    <td
                      className="text-center"
                      style={{
                        verticalAlign: "middle",
                        padding: "12px 10px",
                        color: "#475569",
                      }}
                    >
                      {genderLabel}
                    </td>
                    <td
                      className="text-center"
                      style={{
                        verticalAlign: "middle",
                        fontWeight: "700",
                        color: totalScore > 0 ? "#0f172a" : "#94a3b8",
                        fontSize: "1.15rem",
                        padding: "12px 10px",
                      }}
                    >
                      {totalScore > 0 ? `${totalScore.toFixed(1)}` : "-"}
                    </td>
                    <td
                      className="text-center"
                      style={{
                        verticalAlign: "middle",
                        padding: "12px 10px",
                      }}
                    >
                      <span
                        style={{
                          color: totalAbsence > 5 ? "#ef4444" : totalAbsence > 2 ? "#f59e0b" : "#22c55e",
                          fontWeight: "600",
                          fontSize: "1rem",
                        }}
                      >
                        {totalAbsence} ដង
                      </span>
                    </td>
                    <td
                      className="text-center"
                      style={{
                        verticalAlign: "middle",
                        padding: "12px 10px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "1.6rem",
                            color: gradeInfo.color,
                          }}
                        >
                          {gradeInfo.grade}
                        </span>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                          }}
                        >
                          {gradeInfo.label}
                        </div>
                      </div>
                    </td>
                    {/* Only show "លទ្ធផល" column if class is active (start) */}
                    {isClassActive && (
                      <td
                        className="text-center"
                        style={{
                          verticalAlign: "middle",
                          padding: "12px 10px",
                        }}
                      >
                        {isPassed === null ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#94a3b8",
                              fontSize: "0.95rem",
                              fontWeight: "500",
                            }}
                          >
                            <FaMinusCircle size={16} />
                            មិនទាន់មានពិន្ទុ
                          </span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                            {/* Toggle Switch */}
                            <div
                              style={{
                                position: "relative",
                                width: "52px",
                                height: "28px",
                                background: isPassed ? "#22c55e" : "#ef4444",
                                borderRadius: "14px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                                flexShrink: 0,
                              }}
                              onClick={() => handleToggleClick(student)}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  left: isPassed ? "26px" : "2px",
                                  width: "24px",
                                  height: "24px",
                                  background: "white",
                                  borderRadius: "50%",
                                  transition: "all 0.3s ease",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                              />
                              {isUpdating && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 2,
                                  }}
                                >
                                  <FaSpinner className="fa-spin" size={14} color="white" />
                                </div>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: isPassed ? "#22c55e" : "#ef4444",
                                minWidth: "45px",
                              }}
                            >
                              {isPassed ? "ជាប់" : "ធ្លាក់"}
                            </span>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px 16px",
          background: "#f8fafc",
          borderRadius: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "0.95rem",
          color: "#64748b",
        }}
      >
        <span>
          <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#f0fdf4", borderLeft: "4px solid #22c55e", marginRight: "6px" }}></span>
          ជាប់
        </span>
        <span>
          <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#fef2f2", borderLeft: "4px solid #ef4444", marginRight: "6px" }}></span>
          ធ្លាក់
        </span>
        <span>
          <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#ffffff", borderLeft: "4px solid transparent", marginRight: "6px" }}></span>
          មិនទាន់មានពិន្ទុ
        </span>
        {isClassActive && (
          <span style={{ color: "#22c55e", fontSize: "0.9rem" }}>
            💡 ចុចលើប៊ូតុង <strong>Toggle</strong> ដើម្បីផ្លាស់ប្តូរលទ្ធផលសិស្ស
          </span>
        )}
        {!isClassActive && (
          <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
            ⛔ ថ្នាក់មិនទាន់ចាប់ផ្តើម មិនអាចកែប្រែលទ្ធផលបានទេ
          </span>
        )}
      </div>
    </div>
  );
}

export default ResultTab;
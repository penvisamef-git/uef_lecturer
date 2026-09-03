import React, { useState, useEffect } from "react";
import SwalToast from "../../../../component/SwalToast/SwalToast";
import {
  FaSave,
  FaBan,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";
import Auth from "../../../../util/auth";

function ScoreTab({ classData }) {
  const swalToast = new SwalToast();
  const auth = new Auth();
  
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get teacher ID
  const teacherId = auth.getClientLogin()?.data?._id;
  
  // Get subjects taught by this teacher (all subjects in the class)
  const teacherSubjects = classData?.schedule?.filter(
    (schedule) => schedule?.teacher_id?._id === teacherId
  ) || [];

  // Use the first subject's score options (since all subjects have the same options)
  const currentSubject = teacherSubjects[0];
  const scoreOption = currentSubject?.score_option_id;
  const scoreOptions = scoreOption?.score_options || [];
  const totalScore = scoreOption?.total || 100;
  const passScore = scoreOption?.pass_score || 60;

  // Get sorted students list
  const getSortedStudents = () => {
    const students = classData?.students || [];
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

  // Load existing scores for the current subject from score_detail
  const loadExistingScores = () => {
    const students = getSortedStudents();
    const existingScores = {};
    
    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      const subjectId = currentSubject?.subject_id?._id;
      
      // Find student's score for this subject
      const studentScore = student.score?.find(
        (s) => s.subject_id?._id?.toString() === subjectId?.toString() ||
               s.subject_id?.toString() === subjectId?.toString()
      );
      
      if (studentScore && studentScore.score_detail) {
        const scoreDetail = studentScore.score_detail;
        existingScores[studentId] = {};
        
        // Map score_detail keys to score_0, score_1, etc.
        if (scoreOptions.length > 0) {
          scoreOptions.forEach((option, index) => {
            // Try to find the value using the option name (case insensitive)
            const optionKey = option.name.toLowerCase().replace(/\s+/g, "_");
            const scoreKey = `score_${index}`;
            
            // Check if value exists in score_detail using option name
            let foundValue = null;
            
            // Check exact match
            if (scoreDetail[optionKey] !== undefined && scoreDetail[optionKey] !== null) {
              foundValue = scoreDetail[optionKey];
            } 
            // Check case insensitive match
            else {
              const keys = Object.keys(scoreDetail);
              for (const key of keys) {
                if (key.toLowerCase().replace(/\s+/g, "_") === optionKey) {
                  foundValue = scoreDetail[key];
                  break;
                }
              }
            }
            
            // If found, assign to score_* key
            if (foundValue !== null && foundValue !== undefined) {
              existingScores[studentId][scoreKey] = foundValue;
            } else if (scoreDetail[scoreKey] !== undefined && scoreDetail[scoreKey] !== null) {
              // Fallback: check if stored with score_* keys directly
              existingScores[studentId][scoreKey] = scoreDetail[scoreKey];
            }
          });
        } else {
          // If no score options, just use whatever is in score_detail
          Object.keys(scoreDetail).forEach((key) => {
            if (key !== 'total' && key !== 'grade') {
              existingScores[studentId][key] = scoreDetail[key];
            }
          });
        }
      }
    });
    
    return existingScores;
  };

  // Initialize scores with existing data
  useEffect(() => {
    setLoading(true);
    if (currentSubject) {
      const existingScores = loadExistingScores();
      setScores(existingScores);
    }
    setLoading(false);
  }, [classData, currentSubject]);

  // Handle score change for a student
  const handleScoreChange = (studentId, optionIndex, value) => {
    const key = `score_${optionIndex}`;
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [key]: value === "" ? "" : parseFloat(value) || 0,
      },
    }));
  };

  // Calculate total score for a student
  const calculateTotal = (studentId) => {
    const studentScores = scores[studentId] || {};
    let total = 0;
    let hasScore = false;

    scoreOptions.forEach((option, index) => {
      const key = `score_${index}`;
      const value = parseFloat(studentScores[key]);
      if (!isNaN(value) && value >= 0) {
        total += value;
        hasScore = true;
      }
    });

    return hasScore ? total : null;
  };

  // Get status for a student
  const getStudentStatus = (studentId) => {
    const total = calculateTotal(studentId);
    if (total === null) return { label: "⏳ មិនទាន់មានពិន្ទុ", color: "#94a3b8", bg: "#f1f5f9" };
    if (total >= passScore) return { label: "✅ ជាប់", color: "#22c55e", bg: "#f0fdf4" };
    return { label: "❌ ធ្លាក់", color: "#ef4444", bg: "#fef2f2" };
  };

  // Check if there are any changes to save
  const hasUnsavedChanges = () => {
    const students = getSortedStudents();
    for (const student of students) {
      const studentId = student.student_id?._id || student._id;
      const studentScores = scores[studentId] || {};
      for (let i = 0; i < scoreOptions.length; i++) {
        const key = `score_${i}`;
        if (studentScores[key] !== undefined && studentScores[key] !== "" && studentScores[key] !== null) {
          return true;
        }
      }
    }
    return false;
  };

  // Filter students by search term
  const getFilteredStudents = () => {
    const students = getSortedStudents();
    if (!searchTerm) return students;
    
    return students.filter((student) => {
      const fullName = student.student_id
        ? `${student.student_id.firstname || ""} ${student.student_id.lastname || ""}`.trim().toLowerCase()
        : "";
      const email = (student.student_id?.email || "").toLowerCase();
      const idCard = (student.student_id?.id_card_number || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || email.includes(search) || idCard.includes(search);
    });
  };

  // Save scores
  const saveScores = async () => {
    const students = getSortedStudents();
    const scoresToSave = [];
    const subjectId = currentSubject?.subject_id?._id;
    const classId = classData?._id;

    // Validate that each student's scores don't exceed individual max scores
    let hasErrors = false;
    let errorMessage = "";

    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      const studentScores = scores[studentId] || {};
      const scoreEntry = {
        student_id: studentId,
      };
      
      let hasScore = false;
      let isValid = true;

      // Check each score option
      scoreOptions.forEach((option, index) => {
        const key = `score_${index}`;
        const value = studentScores[key];
        
        if (value !== undefined && value !== "" && value !== null) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            if (numValue < 0) {
              isValid = false;
              errorMessage = `ពិន្ទុមិនអាចតិចជាង 0 បានទេ!`;
            } else if (numValue > (option.score || 0)) {
              isValid = false;
              errorMessage = `ពិន្ទុសម្រាប់ ${option.name} មិនអាចលើសពី ${option.score} បានទេ!`;
            } else {
              // Use score_0, score_1, etc. as keys
              scoreEntry[key] = numValue;
              hasScore = true;
            }
          }
        } else {
          scoreEntry[key] = null;
        }
      });
      
      if (hasScore && isValid) {
        scoresToSave.push(scoreEntry);
      }
      
      if (!isValid) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      swalToast.toastWarning(`⚠️ ${errorMessage}`);
      return;
    }

    if (scoresToSave.length === 0) {
      swalToast.toastWarning("⚠️ សូមបញ្ចូលពិន្ទុសិស្សមុនពេលរក្សាទុក!");
      return;
    }

    setIsSaving(true);

    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      
      const payload = {
        class_id: classId,
        subject_id: subjectId,
        scores: scoresToSave,
        note: `ពិន្ទុមុខវិជ្ជា ${currentSubject?.subject_id?.name || ""} - ${new Date().toLocaleDateString("km-KH")}`,
      };

      const apiUrl = `${process.env.REACT_APP_API_HOST}/api/admin/logs/class-update-score`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        swalToast.toastSuccess("✅ បានរក្សាទុកពិន្ទុដោយជោគជ័យ!");
        // Reload scores to reflect changes
        const existingScores = loadExistingScores();
        setScores(existingScores);

        setTimeout(() => {
            window.location.reload();
        }, 1500);
      } else {
        swalToast.toastError(`❌ ${result.message || "បរាជ័យក្នុងការរក្សាទុក!"}`);
      }
    } catch (error) {
      console.error("Error saving scores:", error);
      swalToast.toastError("❌ មានបញ្ហាក្នុងប្រព័ន្ធ! សូមព្យាយាមម្តងទៀត");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate class statistics
  const calculateStats = () => {
    const students = getSortedStudents();
    let passed = 0;
    let failed = 0;
    let noScore = 0;
    let totalScores = 0;
    let scoreCount = 0;

    students.forEach((student) => {
      const studentId = student.student_id?._id || student._id;
      const total = calculateTotal(studentId);
      if (total === null) {
        noScore++;
      } else if (total >= passScore) {
        passed++;
        totalScores += total;
        scoreCount++;
      } else {
        failed++;
        totalScores += total;
        scoreCount++;
      }
    });

    const average = scoreCount > 0 ? (totalScores / scoreCount) : 0;
    const totalStudents = students.length;

    return { passed, failed, noScore, average, totalStudents };
  };

  // Check if class is active
  const isClassActive = classData?.class_status === "start";

  // Debug logging
  useEffect(() => {
    console.log("Class Data:", classData);
    console.log("Current Subject:", currentSubject);
    console.log("Score Options:", scoreOptions);
    console.log("Loaded Scores:", scores);
  }, [classData, currentSubject, scoreOptions, scores]);

  // No subjects for this teacher
  if (teacherSubjects.length === 0) {
    return (
      <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
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
            មិនមានមុខវិជ្ជាដែលអ្នកបង្រៀនទេ
          </h5>
        </div>
      </div>
    );
  }

  // No score options available for current subject
  if (!scoreOptions || scoreOptions.length === 0) {
    return (
      <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
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
            មិនមានរចនាសម្ព័ន្ធពិន្ទុ
          </h5>
          <p
            style={{
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              fontSize: "1.05rem",
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ ដើម្បីបង្កើតរចនាសម្ព័ន្ធពិន្ទុ
          </p>
        </div>
      </div>
    );
  }

  // Not allowed - Class is not "start" status
  if (!isClassActive) {
    const statusLabels = {
      pending: "មិនទាន់ចាប់ផ្តើម",
      closed: "បានបញ្ចប់",
    };
    const statusLabel = statusLabels[classData?.class_status] || classData?.class_status;

    return (
      <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
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
            មិនអាចបញ្ចូលពិន្ទុបានទេ
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
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <FaSpinner className="fa-spin" size={30} color="#2d6a4f" />
        <p style={{ marginTop: "10px", color: "#64748b" }}>កំពុងផ្ទុក...</p>
      </div>
    );
  }

  const students = getFilteredStudents();
  const allStudents = getSortedStudents();
  const stats = calculateStats();
  const subjectName = currentSubject?.subject_id?.name || "N/A";
  const subjectCode = currentSubject?.subject_id?.code || "N/A";
  const hasChanges = hasUnsavedChanges();

  return (
    <div
      style={{
        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
        padding: "0",
      }}
    >
      {/* Header with Statistics and Search */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px",
                fontSize: "1.4rem",
              }}
            >
              {subjectName}
              <span
                style={{
                  fontSize: "1rem",
                  color: "#94a3b8",
                  marginLeft: "12px",
                  fontWeight: "400",
                }}
              >
                ({subjectCode}) - {allStudents.length} នាក់
              </span>
            </h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                color: "#64748b",
                marginTop: '20px'
              }}
            >
              <span style={{ color: "#22c55e" }}>
                ✅ ជាប់: <strong>{stats.passed}</strong> នាក់
              </span>
              <span style={{ color: "#ef4444" }}>
                ❌ ធ្លាក់: <strong>{stats.failed}</strong> នាក់
              </span>
              <span style={{ color: "#3b82f6" }}>
                📊 មធ្យម: <strong>{stats.average.toFixed(1)}</strong>%
              </span>
              <span style={{ color: "#f59e0b" }}>
                🎯 ពិន្ទុជាប់: <strong>{passScore}</strong>%
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
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
            <button
              className="btn"
              style={{
                background: hasChanges 
                  ? "linear-gradient(135deg, #1a3c2a 0%, #2d6a4f 100%)"
                  : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                color: "white",
                border: "none",
                padding: "10px 28px",
                borderRadius: "10px",
                fontSize: "1.1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.2s ease",
                cursor: hasChanges && !isSaving ? "pointer" : "not-allowed",
                opacity: hasChanges && !isSaving ? 1 : 0.7,
                whiteSpace: "nowrap",
              }}
              onClick={saveScores}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="fa-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : (
                <>
                  <FaSave />
                  {hasChanges ? "រក្សាទុកពិន្ទុ" : "គ្មានការផ្លាស់ប្តូរ"}
                </>
              )}
            </button>
          </div>
        </div>
        {/* Show search results count */}
        {searchTerm && students.length !== allStudents.length && (
          <div style={{ 
            marginTop: "8px", 
            fontSize: "0.9rem", 
            color: "#64748b",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }}>
            បង្ហាញ <strong>{students.length}</strong> នាក់ ក្នុងចំណោម <strong>{allStudents.length}</strong> នាក់
          </div>
        )}
      </div>

      {/* Score Table */}
      <div className="table-responsive" style={{ overflowX: "auto" }}>
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
                ឈ្មោះនិស្សិត
              </th>
              {scoreOptions.map((option, index) => (
                <th
                  key={index}
                  className="text-center"
                  style={{
                    padding: "14px 12px",
                    fontWeight: "700",
                    fontSize: "1rem",
                    borderBottom: "3px solid #22c55e",
                    letterSpacing: "0.5px",
                    minWidth: "120px",
                  }}
                >
                  {option.name}
                  <br />
                  <span style={{ fontSize: "0.85rem", fontWeight: "400", opacity: 0.8 }}>
                    ({option.score} ពិន្ទុ)
                  </span>
                </th>
              ))}
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
                សរុប
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
                ស្ថានភាព
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={scoreOptions.length + 4} className="text-center py-5">
                  <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
                    {searchTerm ? "មិនឃើញនិស្សិតដែលស្វែងរក" : "មិនមាននិស្សិតក្នុងថ្នាក់នេះទេ"}
                  </p>
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const studentId = student.student_id?._id || student._id;
                const studentName = student.student_id
                  ? `${student.student_id.firstname || ""} ${student.student_id.lastname || ""}`.trim() || "N/A"
                  : "N/A";
                
                const studentScores = scores[studentId] || {};
                const total = calculateTotal(studentId);
                const status = getStudentStatus(studentId);

                return (
                  <tr
                    key={studentId}
                    style={{
                      backgroundColor: total !== null && total >= passScore
                        ? "#f0fdf4"
                        : total !== null && total < passScore
                        ? "#fef2f2"
                        : "#ffffff",
                      transition: "all 0.2s ease",
                      borderLeft: total !== null && total >= passScore
                        ? "4px solid #22c55e"
                        : total !== null && total < passScore
                        ? "4px solid #ef4444"
                        : "4px solid transparent",
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
                          }}
                        >
                          {studentName.charAt(0) || "S"}
                        </div>
                        <span style={{ fontSize: "1rem", fontWeight: "500" }}>{studentName}</span>
                      </div>
                    </td>
                    {scoreOptions.map((option, optIndex) => {
                      const key = `score_${optIndex}`;
                      const value = studentScores[key] !== undefined ? studentScores[key] : "";
                      
                      return (
                        <td
                          key={optIndex}
                          className="text-center"
                          style={{
                            verticalAlign: "middle",
                            padding: "8px 6px",
                          }}
                        >
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{
                              width: "100px",
                              margin: "0 auto",
                              textAlign: "center",
                              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                              fontSize: "1rem",
                              borderColor: value !== "" && parseFloat(value) > option.score
                                ? "#ef4444"
                                : value !== "" && parseFloat(value) < 0
                                ? "#ef4444"
                                : "#d1d5db",
                              borderRadius: "6px",
                              padding: "6px 8px",
                              backgroundColor: value !== "" ? "#ffffff" : "#f8fafc",
                            }}
                            placeholder="-"
                            min="0"
                            max={option.score}
                            step="0.5"
                            value={value}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= option.score)) {
                                handleScoreChange(studentId, optIndex, val);
                              } else if (parseFloat(val) > option.score) {
                                swalToast.toastWarning(`⚠️ ពិន្ទុមិនអាចលើសពី ${option.score} បានទេ`);
                              } else if (parseFloat(val) < 0) {
                                swalToast.toastWarning(`⚠️ ពិន្ទុមិនអាចតិចជាង 0 បានទេ`);
                              }
                            }}
                            onBlur={() => {
                              if (value !== "" && parseFloat(value) > option.score) {
                                handleScoreChange(studentId, optIndex, option.score.toString());
                              }
                              if (value !== "" && parseFloat(value) < 0) {
                                handleScoreChange(studentId, optIndex, "0");
                              }
                            }}
                          />
                        </td>
                      );
                    })}
                    <td
                      className="text-center"
                      style={{
                        verticalAlign: "middle",
                        padding: "12px 10px",
                        fontWeight: "700",
                        fontSize: "1.15rem",
                        color: total !== null && total >= passScore
                          ? "#22c55e"
                          : total !== null && total < passScore
                          ? "#ef4444"
                          : "#94a3b8",
                      }}
                    >
                      {total !== null ? `${total.toFixed(1)}/${totalScore}` : "-"}
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
                          background: status.bg,
                          color: status.color,
                          padding: "6px 16px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "0.95rem",
                          display: "inline-block",
                          minWidth: "100px",
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
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
        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          💡 កំណត់ពិន្ទុក្នុងប្រអប់នីមួយៗ រួចចុច "រក្សាទុកពិន្ទុ"
        </span>
      </div>
    </div>
  );
}

export default ScoreTab;
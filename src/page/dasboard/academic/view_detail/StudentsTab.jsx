import React, { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaUser, FaInfoCircle, FaArrowLeft, FaCalendarAlt, FaChartPie, FaSpinner } from "react-icons/fa";
import Loading from "../../../../component/Loading/Loading.component.jsx";

function StudentsTab({ classData, navigate, setShowEnrollStudent, loadData, auth, classId }) {

  const [searchTerm, setSearchTerm] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceSubject, setAttendanceSubject] = useState(null);

  const genderMap = { male: "ប្រុស", female: "ស្រី", other: "ផ្សេងទៀត" };

  const teacherId = auth?.getClientLogin()?.data?._id;

  const teacherSubjects = classData?.schedule?.filter(
    (schedule) => schedule?.teacher_id?._id === teacherId
  ) || [];

  const teacherSubjectIds = teacherSubjects.map(
    (subject) => subject.subject_id?._id?.toString()
  ).filter(id => id);

  const currentSubject = teacherSubjects[0];

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

  const getGrade = (totalScore) => {
    if (totalScore === 0) return { grade: "N/A", color: "#94a3b8", label: "មិនទាន់មានពិន្ទុ" };
    if (totalScore >= 90) return { grade: "A", color: "#22c55e", label: "ពូកែ" };
    if (totalScore >= 80) return { grade: "B", color: "#3b82f6", label: "ល្អ" };
    if (totalScore >= 70) return { grade: "C", color: "#f59e0b", label: "មធ្យម" };
    if (totalScore >= 60) return { grade: "D", color: "#f97316", label: "ខ្សោយ" };
    if (totalScore > 0) return { grade: "F", color: "#ef4444", label: "ធ្លាក់" };
    return { grade: "N/A", color: "#94a3b8", label: "មិនទាន់មានពិន្ទុ" };
  };

  const getSubjectScores = (student) => {
    if (!student?.score || student.score.length === 0) return [];
    return student.score
      .filter(score => {
        const subjectId = score.subject_id?._id?.toString() || score.subject_id?.toString();
        return teacherSubjectIds.includes(subjectId);
      })
      .map(score => {
        const subjectName = score.subject_id?.name || "N/A";
        const scoreDetail = score.score_detail || {};
        const scores = Object.keys(scoreDetail)
          .filter(key => key !== 'total' && key !== 'grade')
          .reduce((obj, key) => {
            obj[key] = scoreDetail[key];
            return obj;
          }, {});
        return {
          subjectName,
          scores,
          total: scoreDetail.total || 0,
          grade: scoreDetail.grade || "N/A"
        };
      });
  };

  const filteredStudents = classData?.students?.filter((student) => {
    if (!searchTerm) return true;
    const fullName = `${student.student_id?.firstname || ""} ${student.student_id?.lastname || ""}`.toLowerCase();
    const email = (student.student_id?.email || "").toLowerCase();
    const idCard = (student.student_id?.id_card_number || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search) || idCard.includes(search);
  }) || [];

  const calculateClassStats = () => {
    const students = classData?.students || [];
    let totalScoreSum = 0;
    let studentCount = 0;
    let gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0, "N/A": 0 };

    students.forEach(student => {
      const totalScore = calculateTotalScore(student);
      if (totalScore > 0) {
        totalScoreSum += totalScore;
        studentCount++;
        const gradeInfo = getGrade(totalScore);
        if (gradeCounts[gradeInfo.grade] !== undefined) {
          gradeCounts[gradeInfo.grade]++;
        } else {
          gradeCounts['N/A']++;
        }
      } else {
        gradeCounts['N/A']++;
      }
    });

    const average = studentCount > 0 ? (totalScoreSum / studentCount) : 0;
    return { average, studentCount, gradeCounts };
  };

  const stats = calculateClassStats();

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailView(true);
    setActiveTab("details");
    setAttendanceLogs([]);
    setAttendanceStats(null);
    setAttendanceSubject(null);
  };

  const handleBackToTable = () => {
    setShowDetailView(false);
    setSelectedStudent(null);
    setActiveTab("details");
    setAttendanceLogs([]);
    setAttendanceStats(null);
    setAttendanceSubject(null);
  };

  const fetchAttendanceLogs = async (studentId) => {
    if (!studentId || !classData?._id || !currentSubject?.subject_id?._id) {
      return;
    }

    setLoadingAttendance(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const classId = classData._id;
      const subjectId = currentSubject.subject_id._id;
      const teacherId = auth?.getClientLogin()?.data?._id;

      const url = `${process.env.REACT_APP_API_HOST}/api/admin/logs/class-all-one-student-one-subject-in-one-class?class_id=${classId}&student_id=${studentId}&subject_id=${subjectId}&teacher_id=${teacherId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      const result = await response.json();

      if (result.success) {
        setAttendanceLogs(result.data.logs || []);
        setAttendanceStats(result.data.statistics || null);
        setAttendanceSubject(result.data.subject || null);
      } else {
        setAttendanceLogs([]);
        setAttendanceStats(null);
      }
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      setAttendanceLogs([]);
      setAttendanceStats(null);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "attendance" && selectedStudent) {
      fetchAttendanceLogs(selectedStudent.student_id?._id);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: { label: "មានវត្តមាន", color: "#22c55e", bg: "#f0fdf4" },
      absent: { label: "អវត្តមាន", color: "#ef4444", bg: "#fef2f2" },
      late: { label: "យឺត", color: "#f59e0b", bg: "#fffbeb" },
      "absent-report": { label: "អវត្តមាន (មានលិខិត)", color: "#3b82f6", bg: "#eff6ff" }
    };
    return statusMap[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  };

  const students = filteredStudents;
  const allStudents = classData?.students || [];

  // Detail View
  const renderDetailView = () => {
    if (!selectedStudent) return null;

    const studentInfo = selectedStudent.student_id || {};
    const totalScore = calculateTotalScore(selectedStudent);
    const gradeInfo = getGrade(totalScore);
    const totalAbsence = calculateTotalAbsence(selectedStudent);
    const subjectScores = getSubjectScores(selectedStudent);

    return (
      <div style={{ padding: "20px 0", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#1a3c2a",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 0",
            marginBottom: "20px",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }}
          onClick={handleBackToTable}
        >
          <FaArrowLeft />
          ត្រឡប់ក្រោយ
        </button>

        <div style={{
          background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
        }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a3c2a, #2d6a4f)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "700",
            flexShrink: 0
          }}>
            {studentInfo.firstname?.charAt(0) || "S"}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: "600", color: "#0f172a", margin: 0, fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
              {studentInfo.firstname || ""} {studentInfo.lastname || ""}
            </h4>
            <div style={{ fontSize: "0.95rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
              {studentInfo.email || "N/A"}
            </div>
            <div style={{ fontSize: "0.95rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
              {studentInfo.id_card_number ? `ID: ${studentInfo.id_card_number}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>ពិន្ទុសរុប</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#0f172a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                {totalScore > 0 ? `${totalScore.toFixed(1)}%` : "-"}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>ចំណាត់ថ្នាក់</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "700", color: gradeInfo.color, fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                {gradeInfo.grade}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>អវត្តមានសរុប</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: totalAbsence > 5 ? "#ef4444" : totalAbsence > 2 ? "#f59e0b" : "#22c55e", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                {totalAbsence} ដង
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: "flex",
          borderBottom: "2px solid #e9ecef",
          marginBottom: "24px",
          fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
        }}>
          <button
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "details" ? "3px solid #1a3c2a" : "3px solid transparent",
              color: activeTab === "details" ? "#1a3c2a" : "#94a3b8",
              fontWeight: activeTab === "details" ? "600" : "400",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
            }}
            onClick={() => handleTabChange("details")}
          >
            <FaUser style={{ marginRight: "8px" }} />
            ព័ត៌មានលម្អិត
          </button>
          <button
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "attendance" ? "3px solid #1a3c2a" : "3px solid transparent",
              color: activeTab === "attendance" ? "#1a3c2a" : "#94a3b8",
              fontWeight: activeTab === "attendance" ? "600" : "400",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
            }}
            onClick={() => handleTabChange("attendance")}
          >
            <FaCalendarAlt style={{ marginRight: "8px" }} />
            ប្រវត្តិវត្តមាន
          </button>
        </div>

        <div style={{ fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
          {activeTab === "details" ? (
            <div>
              <h6 style={{ fontWeight: "600", color: "#0f172a", marginBottom: "16px", fontSize: "1.1rem", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                📊 ពិន្ទុតាមមុខវិជ្ជា
              </h6>
              {subjectScores.length > 0 ? (
                subjectScores.map((subject, idx) => (
                  <div key={idx} style={{
                    background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                    padding: "14px 18px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    border: "1px solid #e9ecef",
                    fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "1.05rem", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                        {subject.subjectName}
                      </span>
                      <span style={{ fontWeight: "700", color: subject.total >= 60 ? "#22c55e" : "#ef4444", fontSize: "1.2rem", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                        {subject.total > 0 ? `${subject.total.toFixed(1)}%` : "-"}
                      </span>
                    </div>
                    {Object.keys(subject.scores).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.9rem", color: "#64748b" }}>
                        {Object.entries(subject.scores).map(([key, value]) => (
                          <span key={key} style={{ background: "#f1f5f9", padding: "4px 14px", borderRadius: "16px", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            <span style={{ fontWeight: "500", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>{key}:</span>
                            <span style={{ fontWeight: "600", color: "#0f172a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>{value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  មិនទាន់មានពិន្ទុ
                </p>
              )}
            </div>
          ) : (
            <div>
              {loadingAttendance ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <FaSpinner className="fa-spin" size={32} color="#1a3c2a" />
                  <p style={{ color: "#64748b", marginTop: "16px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>កំពុងផ្ទុកប្រវត្តិវត្តមាន...</p>
                </div>
              ) : attendanceLogs.length > 0 ? (
                <>
                  {attendanceStats && (
                    <div style={{
                      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                      border: "1px solid #e9ecef"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "1rem", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            <FaChartPie style={{ marginRight: "8px", color: "#1a3c2a" }} />
                            ស្ថិតិវត្តមាន
                          </span>
                          <span style={{ fontSize: "0.9rem", color: "#64748b", marginLeft: "12px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceSubject?.name || ""} ({attendanceStats.total_sessions} វគ្គ)
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-around" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>មានវត្តមាន</div>
                          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#22c55e", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.present}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.present_percentage}%
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>អវត្តមាន</div>
                          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#ef4444", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.absent}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.absent_percentage}%
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>យឺត</div>
                          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#f59e0b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.late}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.late_percentage}%
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>អវត្តមាន (មានលិខិត)</div>
                          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#3b82f6", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.absent_report}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                            {attendanceStats.absent_report_percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ overflowX: "auto" }}>
                    <table style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                      fontSize: "0.95rem"
                    }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>វគ្គ</th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#1a3c2a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>កាលបរិច្ឆេទ</th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#1a3c2a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>ម៉ោង</th>
                          <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>ស្ថានភាព</th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#1a3c2a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>កំណត់ចំណាំ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceLogs.map((log, idx) => {
                          const status = getStatusBadge(log.status);
                          return (
                            <tr key={log._id || idx} style={{ borderBottom: "1px solid #e9ecef", background: idx % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                              <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                                {log.session || "-"}
                              </td>
                              <td style={{ padding: "10px 12px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                                {log.date_formatted || "-"}
                              </td>
                              <td style={{ padding: "10px 12px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                                {log.time || "-"}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "center", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                                <span style={{
                                  background: status.bg,
                                  color: status.color,
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "0.85rem",
                                  fontWeight: "500",
                                  display: "inline-block",
                                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                }}>
                                  {status.label}
                                </span>
                              </td>
                              <td style={{ padding: "10px 12px", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                                {log.note || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{
                    marginTop: "12px",
                    padding: "10px 12px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    textAlign: "right",
                    fontSize: "0.9rem",
                    color: "#64748b",
                    fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                  }}>
                    សរុប: <strong>{attendanceLogs.length}</strong> វគ្គ
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                  <FaCalendarAlt size={48} style={{ color: "#d1d5db" }} />
                  <p style={{ marginTop: "16px", fontSize: "1.1rem", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                    មិនមានប្រវត្តិវត្តមាន
                  </p>
                  <p style={{ fontSize: "0.9rem", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                    សិស្សនេះមិនទាន់មានកំណត់ត្រាវត្តមានក្នុងមុខវិជ្ជានេះទេ
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
        padding: "0",
      }}
    >
      <Loading is_loading={isRemoving} />

      {!showDetailView ? (
        <>
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
                  👨‍🎓 បញ្ជីនិស្សិត
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
                    A: <strong>{stats.gradeCounts.A || 0}</strong>
                  </span>
                  <span style={{ color: "#3b82f6" }}>
                    B: <strong>{stats.gradeCounts.B || 0}</strong>
                  </span>
                  <span style={{ color: "#f59e0b" }}>
                    C: <strong>{stats.gradeCounts.C || 0}</strong>
                  </span>
                  <span style={{ color: "#f97316" }}>
                    D: <strong>{stats.gradeCounts.D || 0}</strong>
                  </span>
                  <span style={{ color: "#ef4444" }}>
                    F: <strong>{stats.gradeCounts.F || 0}</strong>
                  </span>
                  <span style={{ color: "#94a3b8" }}>
                    N/A: <strong>{stats.gradeCounts["N/A"] || 0}</strong>
                  </span>
                  <span style={{ color: "#3b82f6" }}>
                    📊 មធ្យម: <strong>{stats.average.toFixed(1)}</strong>%
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

          {/* Students Table */}
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
                    ពិន្ទុ
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
                    អវត្តមាន
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
                    លំអិត
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
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
                    const genderLabel = genderMap[student.student_id?.gender] || student.student_id?.gender || "N/A";
                    const totalScore = calculateTotalScore(student);
                    const gradeInfo = getGrade(totalScore);
                    const totalAbsence = calculateTotalAbsence(student);

                    return (
                      <tr
                        key={student._id}
                        style={{
                          backgroundColor: totalScore > 0 && totalScore >= 60
                            ? "#f0fdf4"
                            : totalScore > 0 && totalScore < 60
                            ? "#fef2f2"
                            : "#ffffff",
                          transition: "all 0.2s ease",
                          borderLeft: totalScore > 0 && totalScore >= 60
                            ? "4px solid #22c55e"
                            : totalScore > 0 && totalScore < 60
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
                        <td
                          className="text-center"
                          style={{
                            verticalAlign: "middle",
                            padding: "12px 10px",
                          }}
                        >
                          <button
                            className="btn btn-sm"
                            style={{
                              background: "linear-gradient(135deg, #1a3c2a, #2d6a4f)",
                              color: "white",
                              border: "none",
                              padding: "6px 14px",
                              borderRadius: "6px",
                              fontSize: "0.9rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.05)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 60, 42, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                            onClick={() => handleViewDetails(student)}
                          >
                            <FaInfoCircle size={14} />
                            លំអិត
                          </button>
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
              💡 ចុច "លំអិត" ដើម្បីមើលព័ត៌មានបន្ថែម
            </span>
          </div>
        </>
      ) : (
        renderDetailView()
      )}
    </div>
  );
}

export default StudentsTab;
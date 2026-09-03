import React, { useState, useEffect } from "react";
import { FaChartBar, FaChartPie, FaUsers, FaUserGraduate, FaUserTimes, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaTrophy, FaMedal, FaAward, FaFileExcel, FaDownload } from "react-icons/fa";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function StatisticsTab({ classData, auth }) {

  const [stats, setStats] = useState({
    totalStudents: 0,
    passed: 0,
    failed: 0,
    noScore: 0,
    average: 0,
    totalSessions: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0, "N/A": 0 },
    genderDistribution: { male: 0, female: 0, other: 0 },
    subjectStats: [],
    studentsList: [],
    attendanceSummary: {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalAbsentReport: 0,
      presentPercentage: 0,
      absentPercentage: 0,
      latePercentage: 0,
      absentReportPercentage: 0
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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
    if (totalScore === 0) return "N/A";
    if (totalScore >= 90) return "A";
    if (totalScore >= 80) return "B";
    if (totalScore >= 70) return "C";
    if (totalScore >= 60) return "D";
    if (totalScore > 0) return "F";
    return "N/A";
  };

  // Get is_passed from student or calculate
  const getIsPassed = (student) => {
    if (student.is_passed !== undefined && student.is_passed !== null) {
      return student.is_passed;
    }
    const totalScore = calculateTotalScore(student);
    if (totalScore === 0) return null;
    return totalScore >= passScore;
  };

  // Calculate total absence for a student
  const calculateTotalAbsence = (student) => {
    if (!student?.attendance || student.attendance.length === 0) return { absent: 0, absentReport: 0 };
    let absent = 0, absentReport = 0;
    student.attendance.forEach(att => {
      absent += att.total_absence_unreport || 0;
      absentReport += att.total_absence_report || 0;
    });
    return { absent, absentReport };
  };

  useEffect(() => {
    if (classData) {
      calculateAllStats();
    }
  }, [classData]);

  const calculateAllStats = () => {
    const students = classData?.students || [];
    const totalStudents = students.length;

    let passed = 0, failed = 0, noScore = 0;
    let totalScores = 0, scoreCount = 0;
    let gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0, "N/A": 0 };
    let genderDistribution = { male: 0, female: 0, other: 0 };
    const subjectStats = [];
    const studentsList = [];
    let totalAbsent = 0, totalAbsentReport = 0;
    let totalSessions = 0;

    // Calculate total sessions from schedule (only teacher's subjects)
    if (classData?.schedule) {
      classData.schedule.forEach(sub => {
        if (teacherSubjectIds.includes(sub.subject_id?._id?.toString() || sub.subject_id?.toString())) {
          totalSessions += sub.session_total || 0;
        }
      });
    }

    students.forEach(student => {
      const totalScore = calculateTotalScore(student);
      const gender = student.student_id?.gender || "other";
      genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
      
      const grade = getGrade(totalScore);
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

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

      // Calculate attendance
      const absence = calculateTotalAbsence(student);
      
      totalAbsent += absence.absent;
      totalAbsentReport += absence.absentReport;

      const studentName = student.student_id
        ? `${student.student_id.firstname || ""} ${student.student_id.lastname || ""}`.trim()
        : "N/A";
      
      studentsList.push({
        id: student._id,
        name: studentName,
        score: totalScore,
        grade: grade,
        isPassed: isPassed,
        gender: gender,
        email: student.student_id?.email || "",
        idCard: student.student_id?.id_card_number || "",
        absent: absence.absent,
        absentReport: absence.absentReport,
        totalAbsence: absence.absent + absence.absentReport
      });

      if (student.score && student.score.length > 0) {
        student.score.forEach(score => {
          const subjectId = score.subject_id?._id?.toString() || score.subject_id?.toString();
          if (teacherSubjectIds.includes(subjectId)) {
            const subjectName = score.subject_id?.name || "N/A";
            const scoreDetail = score.score_detail || {};
            const total = scoreDetail.total || 0;
            
            const existing = subjectStats.find(s => s.name === subjectName);
            if (existing) {
              existing.totalScore += total;
              existing.count++;
              if (total >= passScore) existing.passed++;
              else if (total > 0) existing.failed++;
              else existing.noScore++;
            } else {
              subjectStats.push({
                name: subjectName,
                totalScore: total,
                count: 1,
                passed: total >= passScore ? 1 : 0,
                failed: total > 0 && total < passScore ? 1 : 0,
                noScore: total === 0 ? 1 : 0,
                average: total
              });
            }
          }
        });
      }
    });

    // Calculate subject averages
    subjectStats.forEach(sub => {
      sub.average = sub.count > 0 ? (sub.totalScore / sub.count) : 0;
    });

    const average = scoreCount > 0 ? (totalScores / scoreCount) : 0;

    setStats({
      totalStudents,
      passed,
      failed,
      noScore,
      average,
      totalSessions,
      gradeDistribution,
      genderDistribution,
      subjectStats,
      studentsList,
      attendanceSummary: {
        totalPresent: 0,
        totalAbsent: totalAbsent,
        totalLate: 0,
        totalAbsentReport: totalAbsentReport,
        presentPercentage: 0,
        absentPercentage: 0,
        latePercentage: 0,
        absentReportPercentage: 0
      }
    });

    setIsLoading(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    setIsExporting(true);
    try {
      // Prepare student data
      const studentHeaders = [
        'ល.រ',
        'ឈ្មោះនិស្សិត',
        'ភេទ',
        'អ៊ីមែល',
        'លេខអត្តសញ្ញាណ',
        'ពិន្ទុសរុប',
        'ចំណាត់ថ្នាក់',
        'លទ្ធផល',
        'អវត្តមានសរុប',
        'អវត្តមាន (មិនមានលិខិត)',
        'អវត្តមាន (មានលិខិត)'
      ];

      const studentRows = stats.studentsList.map((student, idx) => [
        idx + 1,
        student.name,
        student.gender === "male" ? "ប្រុស" : student.gender === "female" ? "ស្រី" : "ផ្សេងទៀត",
        student.email || "-",
        student.idCard || "-",
        student.score > 0 ? `${student.score.toFixed(1)}%` : "-",
        student.grade,
        student.isPassed === true ? "ជាប់" : student.isPassed === false ? "ធ្លាក់" : "មិនទាន់មាន",
        student.totalAbsence || 0,
        student.absent || 0,
        student.absentReport || 0
      ]);

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // 1. Student List Sheet
      const wsData = [studentHeaders, ...studentRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 5 },   // #
        { wch: 25 },  // Name
        { wch: 10 },  // Gender
        { wch: 30 },  // Email
        { wch: 20 },  // ID Card
        { wch: 15 },  // Score
        { wch: 12 },  // Grade
        { wch: 15 },  // Result
        { wch: 18 },  // Total Absence
        { wch: 25 },  // Absent (No Report)
        { wch: 25 }   // Absent (With Report)
      ];
      
      // Add title with class info at the top
      const titleRow = [
        [`ថ្នាក់: ${classData?.code || 'N/A'}`],
        [`មុខវិជ្ជា: ${classData?.major_id?.name || 'N/A'}`],
        [`ឆ្នាំសិក្សា: ${classData?.year_study_from || ''} - ${classData?.year_study_to || ''}`],
        [`វេន: ${classData?.shift_id?.name || 'N/A'}`],
        [`ឆមាស: ${classData?.semester_id?.name || 'N/A'}`],
        [`សរុបសិស្ស: ${stats.totalStudents}`],
        ['']
      ];
      
      // Merge title rows
      const titleRows = titleRow.map(row => row);
      const fullData = [...titleRows, studentHeaders, ...studentRows];
      const wsFinal = XLSX.utils.aoa_to_sheet(fullData);
      
      // Set column widths
      wsFinal['!cols'] = [
        { wch: 5 },   // #
        { wch: 25 },  // Name
        { wch: 10 },  // Gender
        { wch: 30 },  // Email
        { wch: 20 },  // ID Card
        { wch: 15 },  // Score
        { wch: 12 },  // Grade
        { wch: 15 },  // Result
        { wch: 18 },  // Total Absence
        { wch: 25 },  // Absent (No Report)
        { wch: 25 }   // Absent (With Report)
      ];
      
      // Merge cells for title rows (columns A-F)
      wsFinal['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsFinal, 'បញ្ជីសិស្ស');

      // 2. Summary Sheet
      const summaryData = [
        ['សង្ខេបទិន្នន័យ'],
        [''],
        ['ព័ត៌មានថ្នាក់'],
        ['ថ្នាក់', classData?.code || 'N/A'],
        ['មុខវិជ្ជា', classData?.major_id?.name || 'N/A'],
        ['ឆ្នាំសិក្សា', `${classData?.year_study_from || ''} - ${classData?.year_study_to || ''}`],
        ['វេន', classData?.shift_id?.name || 'N/A'],
        ['ឆមាស', classData?.semester_id?.name || 'N/A'],
        ['សរុបសិស្ស', stats.totalStudents],
        [''],
        ['ស្ថិតិពិន្ទុ'],
        ['ជាប់', stats.passed],
        ['ធ្លាក់', stats.failed],
        ['មិនទាន់មានពិន្ទុ', stats.noScore],
        ['ពិន្ទុមធ្យម', `${stats.average.toFixed(1)}%`],
        [''],
        ['ការចែកចាយចំណាត់ថ្នាក់'],
        ['A', stats.gradeDistribution.A],
        ['B', stats.gradeDistribution.B],
        ['C', stats.gradeDistribution.C],
        ['D', stats.gradeDistribution.D],
        ['F', stats.gradeDistribution.F],
        ['N/A', stats.gradeDistribution["N/A"]],
        [''],
        ['ព័ត៌មានតាមមុខវិជ្ជា'],
        ['មុខវិជ្ជា', 'ចំនួនសិស្ស', 'ពិន្ទុមធ្យម', 'ជាប់', 'ធ្លាក់', 'មិនទាន់មាន']
      ];

      stats.subjectStats.forEach(sub => {
        summaryData.push([
          sub.name,
          sub.count,
          `${sub.average.toFixed(1)}%`,
          sub.passed,
          sub.failed,
          sub.noScore
        ]);
      });

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'សង្ខេប');

      // Generate Excel file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const fileName = `ស្ថិតិ_${classData?.code || 'class'}_${new Date().toLocaleDateString('km-KH')}.xlsx`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Grade distribution chart data
  const gradeChartData = {
    labels: ['A', 'B', 'C', 'D', 'F', 'N/A'],
    datasets: [
      {
        label: 'ចំនួនសិស្ស',
        data: [
          stats.gradeDistribution.A || 0,
          stats.gradeDistribution.B || 0,
          stats.gradeDistribution.C || 0,
          stats.gradeDistribution.D || 0,
          stats.gradeDistribution.F || 0,
          stats.gradeDistribution["N/A"] || 0
        ],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#94a3b8'],
        borderColor: ['#16a34a', '#2563eb', '#d97706', '#ea580c', '#dc2626', '#64748b'],
        borderWidth: 2
      }
    ]
  };

  // Result pie chart data
  const resultPieData = {
    labels: ['ជាប់', 'ធ្លាក់', 'មិនទាន់មានពិន្ទុ'],
    datasets: [
      {
        data: [stats.passed, stats.failed, stats.noScore],
        backgroundColor: ['#22c55e', '#ef4444', '#94a3b8'],
        borderColor: ['#16a34a', '#dc2626', '#64748b'],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif", marginTop: '10px', color: '#64748b' }}>
          កំពុងផ្ទុកទិន្នន័យស្ថិតិ...
        </p>
      </div>
    );
  }

  if (stats.totalStudents === 0) {
    return (
      <div className="text-center py-5">
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px"
        }}>
          <FaChartBar style={{ fontSize: "2.5rem", color: "#94a3b8" }} />
        </div>
        <h5 style={{ fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif", fontWeight: "600", color: "#0f172a", fontSize: "1.3rem" }}>
          មិនមានទិន្នន័យស្ថិតិ
        </h5>
        <p style={{ fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif", color: "#64748b" }}>
          មិនទាន់មានសិស្សក្នុងថ្នាក់នេះទេ
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif", padding: "0" }}>
      
      {/* ====== HEADER WITH CLASS INFO AND EXPORT BUTTON ====== */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card" style={{ borderRadius: "12px", border: "1px solid #e9ecef", background: "linear-gradient(135deg, #f8fafc, #ffffff)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h5 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "4px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                    📊 ស្ថិតិថ្នាក់
                  </h5>
             
                </div>
                <button
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, #1a7431, #2d6a4f)",
                    color: "white",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                  onClick={exportToExcel}
                  disabled={isExporting}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 60, 42, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {isExporting ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status" />
                      កំពុងនាំចេញ...
                    </>
                  ) : (
                    <>
                      <FaFileExcel size={20} />
                      ទាញជា Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== STATISTICS CARDS ====== */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
          <div className="card h-100" style={{ borderRadius: "12px", border: "1px solid #e9ecef", background: "linear-gradient(135deg, #f8fafc, #ffffff)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>សរុបសិស្ស</h6>
                  <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#0f172a", margin: "8px 0 0 0" }}>{stats.totalStudents}</h3>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(26, 60, 42, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUsers size={24} color="#1a3c2a" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
          <div className="card h-100" style={{ borderRadius: "12px", border: "1px solid #bbf7d0", background: "linear-gradient(135deg, #f0fdf4, #ffffff)", boxShadow: "0 2px 8px rgba(34, 197, 94, 0.08)" }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 style={{ fontSize: "0.85rem", color: "#22c55e", margin: 0, fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>✅ ជាប់</h6>
                  <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#22c55e", margin: "8px 0 0 0" }}>{stats.passed}</h3>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUserGraduate size={24} color="#22c55e" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
          <div className="card h-100" style={{ borderRadius: "12px", border: "1px solid #fecaca", background: "linear-gradient(135deg, #fef2f2, #ffffff)", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.08)" }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 style={{ fontSize: "0.85rem", color: "#ef4444", margin: 0, fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>❌ ធ្លាក់</h6>
                  <h3 style={{ fontSize: "2rem", fontWeight: "700", color: "#ef4444", margin: "8px 0 0 0" }}>{stats.failed}</h3>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUserTimes size={24} color="#ef4444" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
          <div className="card h-100" style={{ borderRadius: "12px", border: "1px solid #e9ecef", background: "linear-gradient(135deg, #f8fafc, #ffffff)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="card-body">
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>📊 មធ្យម</h6>
                    <h3 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#3b82f6", margin: "4px 0 0 0" }}>{stats.average.toFixed(1)}%</h3>
                  </div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaChartPie size={20} color="#3b82f6" />
                  </div>
                </div>
                <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "#94a3b8", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  <span>⏳ មិនទាន់មានពិន្ទុ: <strong>{stats.noScore}</strong> នាក់</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== CHARTS SECTION ====== */}
      <div className="row g-4">
        <div className="col-xl-6 col-lg-6 col-md-12">
          <div className="card" style={{ borderRadius: "12px", border: "1px solid #e9ecef", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="card-body">
              <h6 style={{ fontWeight: "600", color: "#0f172a", marginBottom: "16px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                📊 ការចែកចាយចំណាត់ថ្នាក់
              </h6>
              <div style={{ height: "250px" }}>
                <Bar data={gradeChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-lg-6 col-md-12">
          <div className="card" style={{ borderRadius: "12px", border: "1px solid #e9ecef", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="card-body">
              <h6 style={{ fontWeight: "600", color: "#0f172a", marginBottom: "16px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                🎯 លទ្ធផលសិស្ស
              </h6>
              <div style={{ height: "250px" }}>
                <Pie data={resultPieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== STUDENT LIST ====== */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card" style={{ borderRadius: "12px", border: "1px solid #e9ecef", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="card-body">
              <h6 style={{ fontWeight: "600", color: "#0f172a", marginBottom: "16px", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                👨‍🎓 បញ្ជីសិស្ស
              </h6>
              <div className="table-responsive">
                <table className="table table-bordered" style={{ fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif", fontSize: "0.95rem" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>#</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#1a3c2a" }}>ឈ្មោះ</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>ភេទ</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>ពិន្ទុ</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>ចំណាត់</th>
                                            <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>អវត្តមាន</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>លទ្ធផល</th>

                    </tr>
                  </thead>
                  <tbody>
                    {stats.studentsList.map((student, idx) => (
                      <tr key={student.id} style={{ 
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                        borderLeft: student.isPassed === true ? "4px solid #22c55e" : student.isPassed === false ? "4px solid #ef4444" : "4px solid transparent"
                      }}>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>{idx + 1}</td>
                        <td style={{ padding: "10px 12px", fontWeight: "500", color: "#0f172a" }}>{student.name}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", color: "#475569" }}>
                          {student.gender === "male" ? "ប្រុស" : student.gender === "female" ? "ស្រី" : "ផ្សេងទៀត"}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "700", color: student.score > 0 ? "#0f172a" : "#94a3b8" }}>
                          {student.score > 0 ? `${student.score.toFixed(1)}%` : "-"}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <span style={{ 
                            fontWeight: "700", 
                            fontSize: "1.2rem", 
                            color: student.grade === "A" ? "#22c55e" : 
                                   student.grade === "B" ? "#3b82f6" : 
                                   student.grade === "C" ? "#f59e0b" : 
                                   student.grade === "D" ? "#f97316" : 
                                   student.grade === "F" ? "#ef4444" : "#94a3b8"
                          }}>
                            {student.grade}
                          </span>
                        </td>

                         <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: student.totalAbsence > 5 ? "#ef4444" : student.totalAbsence > 2 ? "#f59e0b" : "#22c55e" }}>
                          {student.totalAbsence} ដង
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          {student.isPassed === null ? (
                            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>⏳ មិនទាន់មាន</span>
                          ) : student.isPassed === true ? (
                            <span style={{ 
                              background: "#f0fdf4", 
                              color: "#22c55e", 
                              padding: "4px 14px", 
                              borderRadius: "20px", 
                              fontWeight: "600", 
                              fontSize: "0.9rem",
                              border: "1px solid #bbf7d0",
                              display: "inline-block"
                            }}>
                              ✅ ជាប់
                            </span>
                          ) : (
                            <span style={{ 
                              background: "#fef2f2", 
                              color: "#ef4444", 
                              padding: "4px 14px", 
                              borderRadius: "20px", 
                              fontWeight: "600", 
                              fontSize: "0.9rem",
                              border: "1px solid #fecaca",
                              display: "inline-block"
                            }}>
                              ❌ ធ្លាក់
                            </span>
                          )}
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsTab;
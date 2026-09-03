import React from "react";
import { FaCalendarAlt, FaUsers, FaBook, FaUser, FaDoorOpen, FaClock, FaHashtag, FaGraduationCap, FaCalendarCheck, FaInfoCircle, FaBookOpen, FaChalkboardTeacher, FaHourglassHalf } from "react-icons/fa";
import { HiAcademicCap, HiOutlineBookOpen, HiOutlineUserGroup } from "react-icons/hi";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";

function ClassDetailTab({ classData }) {
  const getShiftLabel = (shiftId) => shiftId?.name || "N/A";
  const getStatusLabel = (status) => {
    const labels = { start: "កំពុងបង្រៀន", pending: "មិនទាន់ចាប់ផ្តើម", closed: "បានបញ្ចប់" };
    return labels[status] || status;
  };
  const getStatusColor = (status) => {
    const colors = { start: "#22c55e", pending: "#eab308", closed: "#ef4444" };
    return colors[status] || "#6b7280";
  };
  const getDegreeLabel = (degree) => degree?.name || "N/A";
  const getYearStudyLabel = (yearStudy) => yearStudy?.name || "N/A";
  const getSemesterLabel = (semester) => semester?.name || "N/A";

  // ==========================================
  // FIXED: Count UNIQUE subjects only
  // ==========================================
  const getTotalSubjects = () => {
    if (!classData?.schedule) return 0;
    
    const uniqueSubjects = new Set();
    classData.schedule.forEach(entry => {
      const subjectId = entry.subject_id?._id || entry.subject_id;
      if (subjectId) {
        uniqueSubjects.add(subjectId.toString());
      }
    });
    return uniqueSubjects.size;
  };

  // ==========================================
  // FIXED: Count UNIQUE teachers only
  // ==========================================
  const getUniqueTeachers = () => {
    if (!classData?.schedule) return 0;
    
    const teacherIds = new Set();
    classData.schedule.forEach(entry => {
      const teacherId = entry.teacher_id?._id || entry.teacher_id;
      if (teacherId) {
        teacherIds.add(teacherId.toString());
      }
    });
    return teacherIds.size;
  };

  // ==========================================
  // Get total periods (all periods from all entries)
  // ==========================================
  const getTotalPeriods = () => {
    if (!classData?.schedule) return 0;
    let total = 0;
    classData.schedule.forEach(entry => {
      total += entry.periods?.length || 0;
    });
    return total;
  };

  // ==========================================
  // Get unique subject names for display
  // ==========================================
  const getUniqueSubjectNames = () => {
    if (!classData?.schedule) return [];
    
    const subjectMap = new Map();
    classData.schedule.forEach(entry => {
      const subjectId = entry.subject_id?._id || entry.subject_id;
      if (subjectId) {
        const key = subjectId.toString();
        if (!subjectMap.has(key)) {
          subjectMap.set(key, {
            id: subjectId,
            name: entry.subject_id?.name || "N/A",
            code: entry.subject_id?.code || "N/A"
          });
        }
      }
    });
    return Array.from(subjectMap.values());
  };

  // ==========================================
  // Get session count by subject (FIRST occurrence only - NOT SUM)
  // ==========================================
  const getSubjectSessionCounts = () => {
    if (!classData?.schedule) return [];
    
    const subjectMap = new Map();
    classData.schedule.forEach(entry => {
      const subjectId = entry.subject_id?._id || entry.subject_id;
      if (subjectId) {
        const key = subjectId.toString();
        if (!subjectMap.has(key)) {
          // Use FIRST occurrence's values (not sum)
          subjectMap.set(key, {
            name: entry.subject_id?.name || "N/A",
            code: entry.subject_id?.code || "N/A",
            totalSessions: entry.session_total || 0,
            taughtSessions: entry.session_have_teach || 0,
            entries: 1,
            teachers: new Set(),
            teacherNames: [],
            // Store the first occurrence for reference
            firstOccurrence: entry
          });
        } else {
          // Subject already exists - just increment count
          const existing = subjectMap.get(key);
          existing.entries += 1;
          // DO NOT add to totalSessions or taughtSessions
          // We keep the values from the first occurrence
        }
      }
    });
    
    // Add teacher info from all occurrences
    const result = Array.from(subjectMap.values()).map(subject => {
      // Collect all teachers from all occurrences
      classData.schedule.forEach(entry => {
        const entrySubjectId = entry.subject_id?._id || entry.subject_id;
        if (entrySubjectId) {
          const key = entrySubjectId.toString();
          if (key === subjectMap.keys().find(k => {
            const val = subjectMap.get(k);
            return val && val.name === subject.name && val.code === subject.code;
          })) {
            const teacherId = entry.teacher_id?._id || entry.teacher_id;
            if (teacherId) {
              const teacherKey = teacherId.toString();
              if (!subject.teachers.has(teacherKey)) {
                subject.teachers.add(teacherKey);
                const teacherName = entry.teacher_id 
                  ? `${entry.teacher_id.info_firstname_kh || ''} ${entry.teacher_id.info_lastname_kh || ''}`.trim() 
                  : 'N/A';
                if (teacherName && teacherName !== 'N/A') {
                  subject.teacherNames.push(teacherName);
                }
              }
            }
          }
        }
      });
      return subject;
    });
    
    return result;
  };

  if (!classData) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  const InfoRow = ({ label, value }) => (
    <div className="row g-0 py-3 border-bottom" style={{ borderColor: "#f1f5f9 !important" }}>
      <div className="col-5" style={{ 
        fontSize: "1.05rem", 
        color: "#64748b", 
        fontWeight: 500,
        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
      }}>
        {label}
      </div>
      <div className="col-7" style={{ 
        fontSize: "1.2rem", 
        color: "#0f172a", 
        fontWeight: 500,
        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
      }}>
        {value}
      </div>
    </div>
  );

  // Get data for display
  const uniqueSubjects = getUniqueSubjectNames();
  const subjectSessions = getSubjectSessionCounts();
  const totalUniqueSubjects = getTotalSubjects();
  const totalUniqueTeachers = getUniqueTeachers();
  const totalPeriods = getTotalPeriods();

  return (
    <div className="card border-0 shadow-sm" style={{ 
      borderRadius: "16px", 
      background: "#ffffff",
      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
    }}>
      <div className="card-body p-3">
        <div className="row">
          <div className="col-md-6">
            <InfoRow label="ជំនាន់" value={classData.batch || "N/A"} />
            <InfoRow label="លេខក្រុម" value={classData.group_number || "N/A"} />
            <InfoRow label="ជំនាញ" value={classData.major_id?.name || "N/A"} />
            <InfoRow label="កម្រិតសិក្សា" value={getDegreeLabel(classData.degree_level_id)} />
            <InfoRow label="ឆ្នាំសិក្សា" value={getYearStudyLabel(classData.year_study_id)} />
          </div>
          <div className="col-md-6">
            <InfoRow label="ឆមាស" value={getSemesterLabel(classData.semester_id)} />
            <InfoRow label="ឆ្នាំចាប់ផ្ដើម" value={classData.year_study_from} />
            <InfoRow label="ឆ្នាំបញ្ចប់" value={classData.year_study_to} />
            <InfoRow label="វេនសិក្សា" value={getShiftLabel(classData.shift_id)} />
            <InfoRow label="បន្ទប់" value={classData.room_id?.name || "N/A"} />
          </div>
        </div>

        {/* ====== SUBJECT & SESSION INFO ====== */}
        {subjectSessions.length > 0 && (
          <>
            <div className="mt-4">
              <h6 style={{
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "12px",
                fontSize: "1.1rem",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <FaBookOpen style={{ color: "#1a3c2a" }} />
                មុខវិជ្ជា និងវគ្គសិក្សា
                <span style={{
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  fontWeight: "400",
                  marginLeft: "8px"
                }}>
                  ({subjectSessions.length} មុខវិជ្ជា)
                </span>
              </h6>
              <div className="table-responsive">
                <table className="table table-bordered" style={{
                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                  fontSize: "0.95rem",
                  borderColor: "#e2e8f0",
                }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#1a3c2a" }}>ល.រ</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#1a3c2a" }}>មុខវិជ្ជា</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>កូដ</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>វគ្គសរុប</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>បានបង្រៀន</th>
                      <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>នៅសល់</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#1a3c2a" }}>គ្រូបង្រៀន</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectSessions.map((subject, idx) => (
                      <tr key={idx} style={{
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa"
                      }}>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#1a3c2a" }}>{idx + 1}</td>
                        <td style={{ padding: "10px 12px", fontWeight: "500", color: "#0f172a" }}>{subject.name}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", color: "#64748b" }}>{subject.code}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#0f172a" }}>{subject.totalSessions}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#22c55e" }}>{subject.taughtSessions}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: subject.totalSessions - subject.taughtSessions > 0 ? "#ef4444" : "#94a3b8" }}>
                          {subject.totalSessions - subject.taughtSessions}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#475569" }}>
                          {subject.teacherNames.length > 0 ? subject.teacherNames.join(", ") : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {classData.note && (
          <div className="mt-3 p-3" style={{ 
            background: "#f8fafc", 
            borderRadius: "8px", 
            fontSize: "1.05rem", 
            color: "#475569",
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
          }}>
            <strong style={{ color: "#64748b", fontSize: "1.1rem" }}>កំណត់ចំណាំ:</strong> {classData.note}
          </div>
        )}

        {/* Stats Cards */}
        <div className="row g-3 mt-1">
          <div className="col-3 col-md-3">
            <div className="text-center p-3" style={{ background: "#f8fafc", borderRadius: "10px" }}>
              <div style={{ 
                fontSize: "1.7rem", 
                fontWeight: 700, 
                color: "#0f172a",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                {totalUniqueSubjects}
              </div>
              <div style={{ 
                fontSize: "0.95rem", 
                color: "#94a3b8",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                មុខវិជ្ជា
              </div>
            </div>
          </div>
          <div className="col-3 col-md-3">
            <div className="text-center p-3" style={{ background: "#f8fafc", borderRadius: "10px" }}>
              <div style={{ 
                fontSize: "1.7rem", 
                fontWeight: 700, 
                color: "#0f172a",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                {classData.students?.length || classData.total_students || 0}
              </div>
              <div style={{ 
                fontSize: "0.95rem", 
                color: "#94a3b8",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                និស្សិត
              </div>
            </div>
          </div>
          <div className="col-3 col-md-3">
            <div className="text-center p-3" style={{ background: "#f8fafc", borderRadius: "10px" }}>
              <div style={{ 
                fontSize: "1.7rem", 
                fontWeight: 700, 
                color: "#0f172a",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                {totalPeriods}
              </div>
              <div style={{ 
                fontSize: "0.95rem", 
                color: "#94a3b8",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                វគ្គសិក្សា
              </div>
            </div>
          </div>
          <div className="col-3 col-md-3">
            <div className="text-center p-3" style={{ background: "#f8fafc", borderRadius: "10px" }}>
              <div style={{ 
                fontSize: "1.7rem", 
                fontWeight: 700, 
                color: "#0f172a",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                {totalUniqueTeachers}
              </div>
              <div style={{ 
                fontSize: "0.95rem", 
                color: "#94a3b8",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}>
                គ្រូបង្រៀន
              </div>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        {subjectSessions.length > 0 && (
          <div className="mt-3 p-3" style={{ 
            background: "#f8fafc", 
            borderRadius: "10px",
            border: "1px solid #e9ecef"
          }}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "space-around"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  វគ្គសរុប
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#0f172a", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  {subjectSessions.reduce((sum, s) => sum + s.totalSessions, 0)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  បានបង្រៀន
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#22c55e", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  {subjectSessions.reduce((sum, s) => sum + s.taughtSessions, 0)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  នៅសល់
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#ef4444", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  {subjectSessions.reduce((sum, s) => sum + (s.totalSessions - s.taughtSessions), 0)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  វឌ្ឍនភាព
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#3b82f6", fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif" }}>
                  {(() => {
                    const total = subjectSessions.reduce((sum, s) => sum + s.totalSessions, 0);
                    const taught = subjectSessions.reduce((sum, s) => sum + s.taughtSessions, 0);
                    return total > 0 ? `${Math.round((taught / total) * 100)}%` : "0%";
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassDetailTab;
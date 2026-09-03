import React from "react";
import { FaUserGraduate, FaChartPie, FaBook, FaExclamationTriangle, FaCheckCircle, FaChartBar } from "react-icons/fa";

function AnalyticsTab({ classData, genderStats, gradeStats, highAbsentStudents, subjectScores }) {
  return (
    <div className="row">
      {/* Gender Chart */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none", height: "100%" }}>
          <div className="card-header" style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
            <h6 className="siemreap-regular mb-0"><FaUserGraduate className="me-2" />ចំនួននិស្សិតតាមភេទ</h6>
          </div>
          <div className="card-body text-center">
            <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }}>
              <div>
                <div style={{ 
                  width: "120px", height: "120px", borderRadius: "50%",
                  background: `conic-gradient(#4facfe 0% ${(genderStats.male / (genderStats.male + genderStats.female + genderStats.other || 1)) * 100}%, 
                                #f093fb ${(genderStats.male / (genderStats.male + genderStats.female + genderStats.other || 1)) * 100}% ${((genderStats.male + genderStats.female) / (genderStats.male + genderStats.female + genderStats.other || 1)) * 100}%, 
                                #ffc107 ${((genderStats.male + genderStats.female) / (genderStats.male + genderStats.female + genderStats.other || 1)) * 100}% 100%)`,
                  margin: "0 auto" 
                }}></div>
                <div className="mt-3">
                  <span className="badge me-2" style={{ background: "#4facfe" }}>ប្រុស: {genderStats.male}</span>
                  <span className="badge me-2" style={{ background: "#f093fb" }}>ស្រី: {genderStats.female}</span>
                  <span className="badge" style={{ background: "#ffc107" }}>ផ្សេង: {genderStats.other}</span>
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <p><span style={{ display: "inline-block", width: "20px", height: "20px", background: "#4facfe", borderRadius: "4px" }}></span> ប្រុស: {genderStats.male} ({(genderStats.male + genderStats.female + genderStats.other > 0 ? ((genderStats.male / (genderStats.male + genderStats.female + genderStats.other)) * 100).toFixed(1) : 0)}%)</p>
                <p><span style={{ display: "inline-block", width: "20px", height: "20px", background: "#f093fb", borderRadius: "4px" }}></span> ស្រី: {genderStats.female} ({(genderStats.male + genderStats.female + genderStats.other > 0 ? ((genderStats.female / (genderStats.male + genderStats.female + genderStats.other)) * 100).toFixed(1) : 0)}%)</p>
                <p><span style={{ display: "inline-block", width: "20px", height: "20px", background: "#ffc107", borderRadius: "4px" }}></span> ផ្សេង: {genderStats.other} ({(genderStats.male + genderStats.female + genderStats.other > 0 ? ((genderStats.other / (genderStats.male + genderStats.female + genderStats.other)) * 100).toFixed(1) : 0)}%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none", height: "100%" }}>
          <div className="card-header" style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
            <h6 className="siemreap-regular mb-0"><FaChartPie className="me-2" />ការចែកចាយចំណាត់ថ្នាក់</h6>
          </div>
          <div className="card-body text-center">
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {Object.entries(gradeStats).map(([grade, count]) => {
                const colors = { A: "#28a745", B: "#17a2b8", C: "#ffc107", D: "#fd7e14", F: "#dc3545", "N/A": "#6c757d" };
                return (
                  <div key={grade} className="text-center" style={{ minWidth: "60px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: colors[grade] || "#6c757d", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "20px" }}>{count}</div>
                    <div className="mt-1" style={{ fontWeight: "500" }}>{grade}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Scores */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none", height: "100%" }}>
          <div className="card-header" style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
            <h6 className="siemreap-regular mb-0"><FaBook className="me-2" />ពិន្ទុមធ្យមតាមមុខវិជ្ជា</h6>
          </div>
          <div className="card-body">
            {subjectScores.length > 0 ? (
              subjectScores.map((subject, index) => (
                <div key={index} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span className="siemreap-regular">{subject.name}</span>
                    <span className="siemreap-regular" style={{ fontWeight: "bold" }}>{subject.average}%</span>
                  </div>
                  <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                    <div className="progress-bar" role="progressbar" style={{ 
                      width: `${Math.min(subject.average, 100)}%`,
                      background: subject.average >= 70 ? "#28a745" : subject.average >= 50 ? "#ffc107" : "#dc3545",
                      borderRadius: "4px"
                    }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted siemreap-regular">មិនមានទិន្នន័យពិន្ទុ</p>
            )}
          </div>
        </div>
      </div>

      {/* High Absent Students */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none", height: "100%" }}>
          <div className="card-header" style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
            <h6 className="siemreap-regular mb-0"><FaExclamationTriangle className="me-2" style={{ color: "#dc3545" }} />និស្សិតអវត្តមានច្រើន (≥8 ដង)</h6>
          </div>
          <div className="card-body">
            {highAbsentStudents.length > 0 ? (
              <div className="list-group">
                {highAbsentStudents.map((student, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className="siemreap-regular">{student.student_id?.firstname || ""} {student.student_id?.lastname || ""}</span>
                    <span className="badge" style={{ background: "#dc3545", color: "white" }}>{student.total_absent_session} ដង</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted siemreap-regular">
                <FaCheckCircle style={{ color: "#28a745", fontSize: "2rem" }} />
                <br />គ្មាននិស្សិតអវត្តមានច្រើន
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="col-md-12">
        <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
          <div className="card-header" style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
            <h6 className="siemreap-regular mb-0"><FaChartBar className="me-2" />សង្ខេប</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 text-center">
                <h3 style={{ color: "#1a3c2a" }}>{classData.total_students || 0}</h3>
                <small className="text-muted siemreap-regular">ចំនួននិស្សិតសរុប</small>
              </div>
              <div className="col-md-4 text-center">
                <h3 style={{ color: "#28a745" }}>{classData.students?.filter(s => s.status).length || 0}</h3>
                <small className="text-muted siemreap-regular">និស្សិតសកម្ម</small>
              </div>
              <div className="col-md-4 text-center">
                <h3 style={{ color: "#dc3545" }}>{classData.students?.filter(s => !s.status).length || 0}</h3>
                <small className="text-muted siemreap-regular">និស្សិតអសកម្ម</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsTab;
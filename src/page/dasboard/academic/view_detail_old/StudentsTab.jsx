import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaUsers, FaTrash, FaUserCheck } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
import Swal from "sweetalert2";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";

function StudentsTab({ classData, navigate, setShowEnrollStudent, loadData }) {
  const swalToast = new SwalToast();

  // Get classId, subjectId, sessionNumber from classData
  const classId = classData?._id || classData?.id;
  const subjectId = classData?.schedule?.[0]?.subject_id?._id || classData?.schedule?.[0]?.subject_id;
  const sessionNumber = "1"; // You can get this from the schedule

  const handleCheckAttendance = () => {
    // Prepare student list from classData
    const studentList = classData.students?.map(student => ({
      _id: student.student_id?._id || student._id,
      fullName_kh: student.student_id?.firstname && student.student_id?.lastname 
        ? `${student.student_id.firstname} ${student.student_id.lastname}`
        : student.student_id?.fullName_kh || 'N/A',
      code: student.student_id?.code || 'N/A',
      email: student.student_id?.email || 'N/A',
      phone: student.student_id?.phone || 'N/A'
    })) || [];

    // 👇 NEW: Pass className to the state so it shows on the CheckAttendance header
    const className = classData?.name || classData?.class_name || "N/A";

    navigate(`/admin/check-attendance/${classId}/${subjectId}/${sessionNumber}?mode=edit`, {
      state: { 
        mode: 'edit',
        students: studentList,
        className: className // Passing this along
      }
    });
  };

  const genderMap = { male: "ប្រុស", female: "ស្រី", other: "ផ្សេងទៀត" };

  return (
    <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none", overflow: "hidden" }}>
      <div className="card-body p-0">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3" style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
          <div style={{ width: "300px" }}>
            <input type="text" className="form-control form-control-sm siemreap-regular"
              placeholder="ស្វែងរកនិស្សិត..."
              style={{ borderRadius: "20px", padding: "8px 16px" }}
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll(".student-row").forEach(row => {
                  row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? "" : "none";
                });
              }} />
          </div>

        </div>

        {classData.students?.length > 0 ? (
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="table table-bordered table-hover mb-0" style={{ fontFamily: "'KhmerOS', 'Siemreap', sans-serif", minWidth: "750px" }}>
              <thead style={{ background: "linear-gradient(135deg, #1a3c2a 0%, #2d5a3d 100%)", color: "white", borderBottom: "3px solid #0d1f15" }}>
                <tr>
                  <th className="siemreap-regular text-center" style={{ padding: "12px 15px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", width: "5%" }}>#</th>
                  <th className="siemreap-regular text-center" style={{ padding: "12px 15px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", width: "20%" }}>ឈ្មោះនិស្សិត</th>
                  <th className="siemreap-regular text-center" style={{ padding: "12px 15px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", width: "10%" }}>ភេទ</th>
                  <th className="siemreap-regular text-center" style={{ padding: "12px 15px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", width: "14%" }}>ប្រភេទ</th>
                  <th className="siemreap-regular text-center" style={{ padding: "12px 15px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", width: "11%" }}>ពិន្ទុសរុប</th>
                  <th className="siemreap-regular text-center" style={{ padding: "12px 15px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", width: "10%" }}>ចំណាត់ថ្នាក់</th>
                  <th className="siemreap-regular text-center" style={{ padding: "12px 15px", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", width: "11%" }}>អវត្តមាន</th>
                </tr>
              </thead>
              <tbody>
                {classData.students.map((student, idx) => {
                  const genderLabel = genderMap[student.student_id?.gender] || student.student_id?.gender || "N/A";
                  const totalScore = student.scores?.reduce((acc, s) => acc + (s.total || 0), 0) || 0;
                  let grade = "N/A", gradeColor = "#6c757d";
                  if (totalScore >= 90) { grade = "A"; gradeColor = "#28a745"; }
                  else if (totalScore >= 80) { grade = "B"; gradeColor = "#17a2b8"; }
                  else if (totalScore >= 70) { grade = "C"; gradeColor = "#ffc107"; }
                  else if (totalScore >= 60) { grade = "D"; gradeColor = "#fd7e14"; }
                  else if (totalScore > 0) { grade = "F"; gradeColor = "#dc3545"; }

                  return (
                    <tr key={student._id} className="student-row" style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8faf8" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8f5e9")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f8faf8")}>
                      <td className="text-center" style={{ verticalAlign: "middle", fontWeight: "bold" }}>{idx + 1}</td>
                      <td style={{ verticalAlign: "middle" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #1a3c2a, #2d5a3d)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "bold", flexShrink: 0, cursor: "pointer" }}
                            onClick={() => navigate(`/admin/student-management/student-profile/view/${student.student_id?._id}`)} title="មើលព័ត៌មាននិស្សិត">
                            {student.student_id?.firstname?.charAt(0) || "S"}
                          </div>
                          <div>
                            <div style={{ fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>{student.student_id?.firstname || ""} {student.student_id?.lastname || ""}</span>
                              <button className="btn btn-link p-0" style={{ fontSize: "14px", textDecoration: "none", color: "#0264a0", padding: "0" }}
                                onClick={() => navigate(`/admin/student-management/student-profile/view/${student.student_id?._id}`)} title="មើលព័ត៌មាននិស្សិត" >👁️ មើលប្រវត្តិរូប </button>
                            </div>
                            {student.student_id?.email && <div style={{ fontSize: "11px", color: "#888" }}>{student.student_id.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="text-center" style={{ verticalAlign: "middle" }}><span className="siemreap-regular">{genderLabel}</span></td>
                      <td className="text-center" style={{ verticalAlign: "middle" }}>
                        <span style={{ color: "#000000", fontWeight: "500", padding: "4px 10px", borderRadius: "4px", background: "transparent" }}>
                          {student.student_joined === "new_student" ? "និស្សិតថ្មី" :
                            student.student_joined === "passed_previous" ? "បានប្រឡងជាប់" : "បន្ថែមមុខវិជ្ជា"}
                        </span>
                      </td>
                      <td className="text-center" style={{ verticalAlign: "middle", fontWeight: "600", color: "#1a3c2a" }}>{totalScore}</td>
                      <td className="text-center" style={{ verticalAlign: "middle" }}>
                        <span style={{ fontWeight: "700", fontSize: "16px", color: gradeColor, background: "transparent" }}>{grade}</span>
                      </td>
                      <td className="text-center" style={{ verticalAlign: "middle" }}>
                        <span style={{ color: "#000000", fontWeight: "500" }}>{student.total_absent_session || 0} ដង</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <FaUsers style={{ fontSize: "4rem", color: "#ddd" }} />
            <h5 className="mt-3 siemreap-regular">មិនមាននិស្សិត</h5>
            <p className="text-muted siemreap-regular">សូមបន្ថែមនិស្សិតចូលរៀនក្នុងថ្នាក់នេះ</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsTab;
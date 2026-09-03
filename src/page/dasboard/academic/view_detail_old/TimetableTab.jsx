import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";

function TimetableTab({ classData, navigate, setShowCreateTable }) {
  const khmerDays = {
    Monday: "ច័ន្ទ",
    Tuesday: "អង្គារ",
    Wednesday: "ពុធ",
    Thursday: "ព្រហស្បតិ៍",
    Friday: "សុក្រ",
    Saturday: "សៅរ៍",
    Sunday: "អាទិត្យ",
  };

  return (
    <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none", overflow: "hidden" }}>
      <div className="card-body p-0">
        {classData.time_table ? (
          <>
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table table-bordered table-hover mb-0" style={{ fontFamily: "'KhmerOS', 'Siemreap', sans-serif", minWidth: "600px" }}>
                <thead style={{ background: "linear-gradient(135deg, #1a3c2a 0%, #2d5a3d 100%)", color: "white", borderBottom: "3px solid #0d1f15" }}>
                  <tr>
                    <th className="siemreap-regular text-center" style={{ padding: "10px 12px", fontWeight: "600", whiteSpace: "nowrap" }}>ថ្ងៃ</th>
                    <th className="siemreap-regular text-center" style={{ padding: "10px 12px", fontWeight: "600", whiteSpace: "nowrap" }}>ម៉ោង</th>
                    <th className="siemreap-regular text-center" style={{ padding: "10px 12px", fontWeight: "600", whiteSpace: "nowrap" }}>មុខវិជ្ជា</th>
                    <th className="siemreap-regular text-center" style={{ padding: "10px 12px", fontWeight: "600", whiteSpace: "nowrap" }}>គ្រូបង្រៀន</th>
                    <th className="siemreap-regular text-center" style={{ padding: "10px 12px", fontWeight: "600", whiteSpace: "nowrap" }}>បន្ទប់ (ជាន់ - អគារ)</th>
                    <th className="siemreap-regular text-center" style={{ padding: "10px 12px", fontWeight: "600", whiteSpace: "nowrap" }}>បានបង្រៀន</th>
                  </tr>
                </thead>
                <tbody>
                  {classData.time_table.schedule?.map((day, idx) => {
                    const khmerDay = khmerDays[day.day] || day.day;
                    return day.periods.map((period, pIdx) => (
                      <tr key={`${idx}-${pIdx}`} style={{ backgroundColor: pIdx % 2 === 0 ? "#ffffff" : "#f8faf8", transition: "background-color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8f5e9")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = pIdx % 2 === 0 ? "#ffffff" : "#f8faf8")}
                      >
                        {pIdx === 0 && (
                          <td rowSpan={day.periods.length} style={{ fontWeight: "bold", verticalAlign: "middle", textAlign: "center", backgroundColor: "#e8f5e9", color: "#1a3c2a", minWidth: "80px" }}>
                            <span style={{ background: "#1a3c2a", color: "white", padding: "3px 10px", borderRadius: "20px", display: "inline-block", whiteSpace: "nowrap" }}>{khmerDay}</span>
                          </td>
                        )}
                        <td className="text-center" style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                          <span style={{ background: "#f0f4f0", padding: "3px 8px", borderRadius: "15px", fontWeight: "500" }}>{period.time_from} - {period.time_to}</span>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          <div>
                            <span style={{ color: "#1a3c2a", fontWeight: "500" }}>{period.subject_id?.name || "N/A"}</span>
                            {period.subject_id?.code && (
                              <span style={{ color: "#888", display: "block", marginTop: "1px" }}>
                                <span style={{ fontWeight: "500" }}>លេខកូដ:</span> {period.subject_id.code}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #1a3c2a, #2d5a3d)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                              {period.teacher_id?.firstname?.charAt(0) || "T"}
                            </div>
                            <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {period.teacher_id?.firstname || ""} {period.teacher_id?.lastname || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          <div>
                            <span style={{ fontWeight: "500" }}>{period.room_id?.name || "N/A"}</span>
                            {period.room_id?.floor_id && (
                              <div style={{ color: "#666", marginTop: "2px" }}>
                                <span style={{ background: "#f0f4f0", padding: "2px 6px", borderRadius: "12px", display: "inline-block" }}>
                                  {period.room_id.floor_id.name || "N/A"}
                                  {period.room_id.floor_id.building_id && <span> - {period.room_id.floor_id.building_id.name || "N/A"}</span>}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center" style={{ verticalAlign: "middle" }}>
                          <span style={{ color: period.period_has_teach > 0 ? "#28a745" : "#dc3545", fontWeight: "500" }}>
                            {period.period_has_teach > 0 ? <>✅ {period.period_has_teach} session</> : "⏳ មិនទាន់"}
                          </span>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <FaCalendarAlt style={{ fontSize: "4rem", color: "#ddd" }} />
            <h5 className="mt-3 siemreap-regular">មិនមានកាលវិភាគ</h5>
            <p className="text-muted siemreap-regular">សូមបន្ថែមកាលវិភាគសម្រាប់ថ្នាក់នេះ</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimetableTab;
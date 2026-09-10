import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";

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

  function dayToKH(value) {
    const days = {
      Monday: "ថ្ងៃច័ន្ទ",
      Tuesday: "ថ្ងៃអង្គារ",
      Wednesday: "ថ្ងៃពុធ",
      Thursday: "ថ្ងៃព្រហស្បតិ៍",
      Friday: "ថ្ងៃសុក្រ",
      Saturday: "ថ្ងៃសៅរ៍",
      Sunday: "ថ្ងៃអាទិត្យ",
    };
    return days[value] || value;
  }

  const schedule = classData?.schedule || [];
  const hasSchedule = schedule.length > 0;
  const showCreateButton = classData?.class_status === "pending";

  // ==========================================
  // Group ALL periods by day
  // ==========================================
  const groupPeriodsByDay = () => {
    const dayMap = new Map();

    schedule.forEach((dayEntry) => {
      const day = dayEntry.day;
      
      dayEntry.periods.forEach((period) => {
        const periodDay = period.day || day;
        
        if (!dayMap.has(periodDay)) {
          dayMap.set(periodDay, []);
        }
        
        dayMap.get(periodDay).push({
          ...period,
          subject_id: dayEntry.subject_id,
          teacher_id: dayEntry.teacher_id,
          room_id: dayEntry.room_id,
          session_total: dayEntry.session_total,
          session_have_teach: dayEntry.session_have_teach,
          subject_status: dayEntry.subject_status,
          note: dayEntry.note,
        });
      });
    });

    // Sort periods within each day by time
    dayMap.forEach((periods, day) => {
      periods.sort((a, b) => {
        return a.time_from.localeCompare(b.time_from);
      });
    });

    // Sort days in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const sortedDays = Array.from(dayMap.keys()).sort((a, b) => {
      return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    return sortedDays.map(day => ({
      day,
      periods: dayMap.get(day)
    }));
  };

  const groupedSchedule = groupPeriodsByDay();

  return (
    <div
      className="card shadow-sm"
      style={{
        borderRadius: "16px",
        border: "none",
        overflow: "hidden",
        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
      }}
    >
      <div className="card-body p-0">
        {hasSchedule ? (
          <>
            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 p-3" style={{ background: "#f8fafc", borderBottom: "1px solid #e9ecef" }}>
              {schedule.length > 0 && (
                <button
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                    color: "white",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    transition: "all 0.3s ease",
                    fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                    fontSize: "1rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(75, 85, 99, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() =>
                    navigate(
                      `/admin/timetable/schedule/${classData?._id}`,
                    )
                  }
                >
                  <FaFilePdf style={{ fontSize: "1rem" }} />
                  <span>ទាញយកាលវិភាគ</span>
                </button>
              )}
            </div>

            {/* Table */}
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table
                className="table table-bordered mb-0"
                style={{
                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                  minWidth: "800px",
                  borderColor: "#e5e7eb",
                  fontSize: "1rem",
                }}
              >
                <thead>
                  <tr style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    color: "white"
                  }}>
                    <th
                      className="text-center"
                      style={{
                        padding: "16px 14px",
                        fontWeight: "600",
                        fontSize: "1.05rem",
                        letterSpacing: "0.3px",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        borderBottom: "3px solid #22c55e"
                      }}
                    >
                      ថ្ងៃ
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "16px 14px",
                        fontWeight: "600",
                        fontSize: "1.05rem",
                        letterSpacing: "0.3px",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        borderBottom: "3px solid #22c55e"
                      }}
                    >
                      ម៉ោង
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "16px 14px",
                        fontWeight: "600",
                        fontSize: "1.05rem",
                        letterSpacing: "0.3px",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        borderBottom: "3px solid #22c55e"
                      }}
                    >
                      មុខវិជ្ជា
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "16px 14px",
                        fontWeight: "600",
                        fontSize: "1.05rem",
                        letterSpacing: "0.3px",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        borderBottom: "3px solid #22c55e"
                      }}
                    >
                      គ្រូបង្រៀន
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "16px 14px",
                        fontWeight: "600",
                        fontSize: "1.05rem",
                        letterSpacing: "0.3px",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        borderBottom: "3px solid #22c55e"
                      }}
                    >
                      បន្ទប់ (ជាន់ - អគារ)
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "16px 14px",
                        fontWeight: "600",
                        fontSize: "1.05rem",
                        letterSpacing: "0.3px",
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        borderBottom: "3px solid #22c55e"
                      }}
                    >
                      វគ្គ (Session)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSchedule.map((dayGroup, groupIdx) => {
                    const periods = dayGroup.periods;
                    
                    return periods.map((period, pIdx) => {
                      return (
                        <tr
                          key={`${groupIdx}-${pIdx}`}
                          style={{
                            backgroundColor: pIdx % 2 === 0 ? "#ffffff" : "#f8fafc",
                            transition: "all 0.2s ease",
                            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                            fontSize: "1rem"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0fdf4";
                            e.currentTarget.style.transform = "scale(1.002)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              pIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {/* Day column - only show on first period of the day */}
                          {pIdx === 0 && (
                            <td
                              rowSpan={periods.length}
                              style={{
                                fontWeight: "bold",
                                verticalAlign: "middle",
                                textAlign: "center",
                                backgroundColor: "#f0fdf4",
                                color: "#0f172a",
                                minWidth: "100px",
                                borderRight: "2px solid #22c55e",
                                fontSize: "1rem"
                              }}
                            >
                              <span
                                style={{
                                  background: "linear-gradient(135deg, #1a3c2a 0%, #2d6a4f 100%)",
                                  color: "white",
                                  padding: "8px 18px",
                                  borderRadius: "20px",
                                  display: "inline-block",
                                  whiteSpace: "nowrap",
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                }}
                              >
                                {dayToKH(dayGroup.day)}
                              </span>
                            </td>
                          )}
                          
                          {/* Time */}
                          <td
                            className="text-center"
                            style={{
                              verticalAlign: "middle",
                              whiteSpace: "nowrap",
                              padding: "12px 10px"
                            }}
                          >
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "6px 16px",
                                borderRadius: "12px",
                                fontWeight: "500",
                                fontSize: "1rem",
                                color: "#0f172a",
                                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                              }}
                            >
                              {period.time_from} - {period.time_to}
                            </span>
                          </td>
                          
                          {/* Subject */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px" }}>
                            <div>
                              <span
                                style={{
                                  color: "#0f172a",
                                  fontWeight: "600",
                                  fontSize: "1.05rem",
                                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                }}
                              >
                                {period.subject_id?.name || "N/A"}
                              </span>
                              {period.subject_id?.code && (
                                <div
                                  style={{
                                    color: "#64748b",
                                    marginTop: "2px",
                                    fontSize: "0.85rem",
                                    fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                  }}
                                >
                                  <span style={{ fontWeight: "500" }}>លេខកូដ:</span> {period.subject_id.code}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Teacher */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px" }}>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #1a3c2a, #2d6a4f)",
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "15px",
                                  fontWeight: "bold",
                                  flexShrink: 0,
                                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                }}
                              >
                                {period.teacher_id?.info_firstname_kh?.charAt(0) || "T"}
                              </div>
                              <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: "1rem",
                                    fontWeight: "500",
                                    color: "#0f172a",
                                    fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                  }}
                                >
                                  {period.teacher_id?.info_firstname_kh || ""}{" "}
                                  {period.teacher_id?.info_lastname_kh || "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Room */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px" }}>
                            <div>
                              <span
                                style={{
                                  fontWeight: "600",
                                  fontSize: "1rem",
                                  color: "#0f172a",
                                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                }}
                              >
                                {period.room_id?.name || "N/A"}
                              </span>
                              {period.room_id?.floor_id && (
                                <div style={{ marginTop: "4px" }}>
                                  <span
                                    style={{
                                      background: "#f1f5f9",
                                      padding: "4px 12px",
                                      borderRadius: "12px",
                                      display: "inline-block",
                                      fontSize: "0.85rem",
                                      color: "#475569",
                                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                                    }}
                                  >
                                    {period.room_id.floor_id.name || "N/A"}
                                    {period.room_id.floor_id.building_id && (
                                      <span> - {period.room_id.floor_id.building_id.name || "N/A"}</span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Session */}
                          <td
                            className="text-center"
                            style={{ verticalAlign: "middle", padding: "12px 10px" }}
                          >
                            <span
                              style={{
                                color: period.session_have_teach > 0 ? "#16a34a" : "#dc2626",
                                fontWeight: "600",
                                fontSize: "1rem",
                                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                              }}
                            >
                              {period.session_have_teach > 0 ? (
                                <>
                                  <span style={{ marginRight: "4px" }}>✅</span>
                                  {period.session_have_teach} / {period.session_total}
                                </>
                              ) : (
                                <>
                                  <span style={{ marginRight: "4px" }}>⏳</span>
                                  0 / {period.session_total}
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>










            
          </>
        ) : (
          // Empty State
          <div className="text-center py-5 px-3">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <FaCalendarAlt style={{ fontSize: "2.5rem", color: "#94a3b8" }} />
            </div>
            <h5
              style={{
                fontWeight: "600",
                color: "#0f172a",
                marginBottom: "8px",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                fontSize: "1.3rem"
              }}
            >
              មិនមានកាលវិភាគ
            </h5>
            <p
              className="text-muted"
              style={{
                marginBottom: "20px",
                fontSize: "1.05rem",
                fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
              }}
            >
              សូមបន្ថែមកាលវិភាគសម្រាប់ថ្នាក់នេះ
            </p>
            {showCreateButton && (
              <button
                className="btn d-inline-flex align-items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #1a3c2a 0%, #2d6a4f 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 36px",
                  borderRadius: "10px",
                  fontWeight: "500",
                  fontSize: "1.05rem",
                  transition: "all 0.3s ease",
                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(26, 60, 42, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => setShowCreateTable(true)}
              >
                <FaPlus style={{ fontSize: "1rem" }} />
                <span>បង្កើតកាលវិភាគ</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TimetableTab;
import React, { useState, useEffect, useRef } from "react";
import uefLogo from "../../../asset/logo/logo.png";
import { useParams, useNavigate } from "react-router-dom";
import { CiSaveDown1 } from "react-icons/ci";
import RowBreaker from "../../../component/Boostramp/RowBreaker.component";

const baseStyle = {
  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', Arial, sans-serif",
};

const cellStyle = {
  border: "1px solid #000",
  padding: "6px 8px",
  verticalAlign: "middle",
  fontSize: "12px",
  ...baseStyle,
};

const headerCellStyle = {
  ...cellStyle,
  textAlign: "center",
  fontWeight: "bold",
  background: "#f2f2f2",
};

const timeCellStyle = {
  ...cellStyle,
  textAlign: "center",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

// Style for Khmer Moul font (header and university names)
const khmerMoulStyle = {
  fontFamily: "'Khmer OS Moul', 'Moul', 'Khmer OS', Arial, sans-serif",
};

// Day order for consistent display - Monday to Saturday (always shown)
const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function SubjectCell({ subject }) {
  if (!subject) {
    return (
      <td style={{ ...cellStyle, textAlign: "center", color: "#999", fontStyle: "italic", verticalAlign: "middle" }}>
        មិនមាន
      </td>
    );
  }
  
  // Format teacher name with degree
  const formatTeacherName = (teacherName, degreeLevel) => {
    if (!teacherName) return "TBE";
    
    let name = teacherName;
    
    // Add degree abbreviation
    if (degreeLevel) {
      const degreeMap = {
        "phd": "Ph.D",
        "master": "Master",
        "bachelor": "Bachelor",
        "professor": "Prof.",
        "doctor": "Dr.",
        "associate professor": "Assoc. Prof.",
        "assistant professor": "Asst. Prof."
      };
      const degreeAbbr = degreeMap[degreeLevel.toLowerCase()] || degreeLevel;
      name = `${name}, ${degreeAbbr}`;
    }
    
    return name;
  };
  
  // Get teacher name - handle both object and string cases
  let teacherName = "Unknown Teacher";
  if (subject.teacher_id) {
    teacherName = subject.teacher_id.fullname_english || 
                  subject.teacher_id.fullname ||
                  subject.teacher_id.name ||
                  `${subject.teacher_id.firstname || ''} ${subject.teacher_id.lastname || ''}`.trim() ||
                  "Unknown Teacher";
  }
  
  // Get degree
  const degreeLevel = subject.teacher_id?.degree_level || 
                      subject.teacher_id?.degree || 
                      "";
  
  // Get phone
  const phone = subject.teacher_id?.personal_contact || 
                subject.teacher_id?.phone ||
                subject.teacher_id?.contact || 
                "";
  
  return (
    <td style={{ ...cellStyle, verticalAlign: "middle" }}>
      <div style={{ fontWeight: "bold" }}>
        {subject.subject_id?.name || subject.subject_id?.name_in_eng || subject.subject_name || "N/A"}
      </div>
      <div>
        {subject.teacher_id ? (
          formatTeacherName(teacherName, degreeLevel)
        ) : (
          "No Teacher Assigned"
        )}
      </div>
      <div>Tel: {phone || "N/A"}</div>
    </td>
  );
}

function ScheduleIndex({ auth }) {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {id} = useParams();
  const navigate = useNavigate();
  const scheduleRef = useRef(null);
  
  // API configuration
  const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class`;
  const access_token = auth?.getClientLogin()?.data?.access_token;

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!access_token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const url =  `${api}/${id}`;
        
        console.log("Fetching URL:", url);
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log("=== FULL API RESPONSE ===", result);
        
        let classData = result.data || result;
        
        console.log("=== CLASS DATA ===", classData);
        console.log("=== SCHEDULE ARRAY ===", classData.schedule);
        
        setScheduleData({ data: classData });
        setError(null);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError(err.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [api, access_token, id]);

  // Save/Print to PDF function
  const handleSavePDF = () => {
    const printContent = document.getElementById('schedule-content');
    const originalTitle = document.title;
    document.title = "Schedule";
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Schedule</title>
          <style>
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              padding: 20px;
              margin: 0;
              background: white;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px 8px;
              text-align: center;
              vertical-align: middle;
            }
            .header-title {
              font-weight: bold;
              font-size: 14px;
              text-align: center;
              margin-bottom: 8px;
            }
            .subtitle {
              font-weight: bold;
              font-size: 13px;
              text-align: center;
              margin-bottom: 4px;
            }
            .logo-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .logo-left {
              display: flex;
              flex-direction: column;
            }
            .logo-right {
              text-align: right;
            }
            .university-name {
              color: #1a3c8c;
              font-weight: bold;
              font-size: 12px;
            }
            .khmer-text {
              font-family: 'Khmer OS Moul', 'Moul', sans-serif;
            }
            .red-text {
              color: #8b1a1a;
            }
            .break-row {
              background: #f9f9f9;
              font-style: italic;
              color: #666;
            }
            .footer {
              text-align: right;
              margin-top: 60px;
            }
            .footer-text {
              font-size: 13px;
            }
            .rector-name {
              font-weight: bold;
              font-size: 13px;
              margin-top: 8px;
            }
            .signature-space {
              height: 60px;
            }
            
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div style="text-align: center; margin-top: 20px;">
            
          </div>
          <script>
            // Auto-open print dialog when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Restore original title
    document.title = originalTitle;
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        maxWidth: "1050px", 
        margin: "0 auto", 
        padding: "40px", 
        textAlign: "center",
        ...baseStyle 
      }}>
        <div>Loading schedule...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        maxWidth: "1050px", 
        margin: "0 auto", 
        padding: "40px", 
        textAlign: "center",
        color: "red",
        ...baseStyle 
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  // If no data provided, show empty state
  if (!scheduleData) {
    return (
      <div style={{ 
        maxWidth: "1050px", 
        margin: "0 auto", 
        padding: "24px", 
        textAlign: "center",
        ...baseStyle 
      }}>
        <div>No schedule data available</div>
      </div>
    );
  }

  const data = scheduleData.data || scheduleData;
  
  // Extract schedule info
  const degreeLevel = data?.degree_level_id?.name_in_eng || "";
  const major = data?.major_id?.name || "";
  const yearStudy = data.year_study_id?.name_in_eng || "";
  const semester = data.semester_id?.name_in_eng || "";
  const shift = data.shift_id?.name_in_eng || "";
  const room = data.room_id?.name || "";
  const batch = data.batch || "";
  const groupNumber = data.group_number || "";
  
  // Build title
  const title = `TIMETABLE FOR ${degreeLevel} OF ${major}`;
  const subtitle = `Promotion ${batch}, ${yearStudy}, ${semester}, Group ${groupNumber}`;
  const roomInfo =  ` ${room}` ;
  
  const scheduleMap = {};
  let allTimes = new Set();

  // Check if schedule exists
  if (!data.schedule || data.schedule.length === 0) {
    return (
      <div style={{ 
        maxWidth: "1050px", 
        margin: "0 auto", 
        padding: "24px", 
        textAlign: "center",
        ...baseStyle 
      }}>
        <div>No schedule data available for this class</div>
      </div>
    );
  }

  data.schedule.forEach((item, index) => {
    console.log(`Processing schedule item ${index}:`, item);
    
    if (!item.periods || item.periods.length === 0) {
      console.log(`Item ${index} has no periods`);
      return;
    }
    
    item.periods.forEach((period) => {
      const day = period.day;
      const timeKey = `${period.time_from}-${period.time_to}`;
      
      console.log(`Adding period: day=${day}, timeKey=${timeKey}`);
      
      allTimes.add(timeKey);
      
      if (!scheduleMap[day]) {
        scheduleMap[day] = {};
      }
      
      // Store the ORIGINAL item object directly
      scheduleMap[day][timeKey] = item;
    });
  });

  console.log("=== FINAL SCHEDULE MAP ===", scheduleMap);
  console.log("=== ALL TIMES ===", Array.from(allTimes));

  // Sort times
  const sortedTimes = Array.from(allTimes).sort();

  // Generate time slots with breaks
  const timeSlotsWithBreaks = [];
  for (let i = 0; i < sortedTimes.length; i++) {
    const timeKey = sortedTimes[i];
    const [from, to] = timeKey.split("-");
    
    // Add the class time slot
    timeSlotsWithBreaks.push({
      type: 'class',
      timeKey: timeKey,
      timeDisplay: `${from}-${to}`
    });
    
    if (i < sortedTimes.length - 1) {
      const nextTime = sortedTimes[i + 1];
      const [nextFrom] = nextTime.split("-");
      const currentEnd = parseInt(to.replace(":", ""));
      const nextStart = parseInt(nextFrom.replace(":", ""));
      const gap = nextStart - currentEnd;
      
      if (gap > 10) {
        const breakStart = to;
        const breakEnd = nextFrom;
        timeSlotsWithBreaks.push({
          type: 'break',
          timeDisplay: `${breakStart}-${breakEnd}`,
          label: 'Break'
        });
      }
    }
  }
  
  const displayDays = dayOrder;

  return (
    <div
      style={{
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "24px",
        color: "#000",
        ...baseStyle,
      }}
    >
      {/* Button Row - Back on left, Save/PDF on right */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "16px",
        padding: "8px 0"
      }}>
        <button 
          type="button" 
          className="btn btn-success"
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "8px",
            fontFamily: "'Khmer OS Siemreap', sans-serif",
            fontWeight: "500",
            fontSize: "14px",
            border: "none",
            background: "#28a745",
            color: "white",
            cursor: "pointer"
          }}
        >
          <span style={{ fontSize: "18px" }}>←</span> ត្រលប់
        </button>
        
       
      </div>

      {/* Schedule Content - for PDF export */}
      <div id="schedule-content">
        {/* Header: logos + institution names */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", verticalAlign: "middle" }}>
            <img
              src={uefLogo}
              alt="University Logo"
              style={{ height: "70px", objectFit: "contain" }}
            />
            <div style={{ 
              color: "#1a3c8c", 
              fontWeight: "bold", 
              fontSize: "12px", 
              marginTop: "4px",
              ...khmerMoulStyle
            }}>
              សាកលវិទ្យាល័យសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ
            </div>
            <div style={{ 
              color: "#1a3c8c", 
              fontWeight: "bold", 
              fontSize: "12px",
              fontFamily: "'Times New Roman', Times, serif"
            }}>
              University of Economics and Finance
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ 
                color: "#8b1a1a", 
                fontWeight: "bold", 
                fontSize: "13px",
                ...khmerMoulStyle
              }}>
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div style={{ 
                color: "#8b1a1a", 
                fontWeight: "bold", 
                fontSize: "13px",
                ...khmerMoulStyle
              }}>
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
              <div style={{ 
                color: "#1a3c8c", 
                fontSize: "12px",
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                Kingdom of Cambodia
              </div>
              <div style={{ 
                color: "#1a3c8c", 
                fontSize: "12px",
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                Nation Religion King
              </div>
            </div>
          </div>
        </div>

        {/* Title block */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "14px",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            {title}
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "13px",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            {subtitle}
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "13px",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            {roomInfo && ` Starting Date:..................... ${roomInfo}`}
            {shift && `  ${shift}`}
          </div>
        </div>

        {/* Timetable grid */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            ...baseStyle,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, width: "12%" }}>Time</th>
              {displayDays.map((day) => (
                <th key={day} style={headerCellStyle}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlotsWithBreaks.map((slot, idx) => {
              if (slot.type === 'break') {
                return (
                  <tr key={`break-${idx}`} style={{ background: "#f9f9f9" }}>
                    <td style={{ ...timeCellStyle, color: "#666" }}>{slot.timeDisplay}</td>
                    <td 
                      colSpan={displayDays.length} 
                      style={{ 
                        ...cellStyle, 
                        textAlign: "center", 
                        fontWeight: "bold",
                        color: "#666",
                        background: "#f9f9f9",
                        fontStyle: "italic",
                        verticalAlign: "middle"
                      }}
                    >
                      {slot.label}
                    </td>
                  </tr>
                );
              }
              
              return (
                <tr key={idx}>
                  <td style={timeCellStyle}>{slot.timeDisplay}</td>
                  {displayDays.map((day) => {
                    const subjectData = scheduleMap[day]?.[slot.timeKey] || null;
                    console.log(`Rendering day=${day}, timeKey=${slot.timeKey}, data=${!!subjectData}`);
                    return <SubjectCell key={day} subject={subjectData} />;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ textAlign: "right", marginTop: "60px" }}>
          <div style={{ 
            fontSize: "13px",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            Phnom Penh, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "13px", 
            marginTop: "8px",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            Rector
          </div>
          <div style={{ height: "60px" }} />
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "13px",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            Rattanak Chuon, Ph.D.
          </div>
        </div>
      </div>


          <RowBreaker/>
          <RowBreaker/> 

      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        marginTop: "20px"
      }}>
        <button
          onClick={handleSavePDF}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 24px",
            borderRadius: "8px",
            fontFamily: "'Khmer OS Siemreap', sans-serif",
            fontWeight: "500",
            fontSize: "14px",
            border: "none",
            background: "#007bff",
            color: "white",
            cursor: "pointer"
          }}
        >
          <CiSaveDown1 style={{ fontSize: "18px" }} /> ទាញយក
        </button>
      </div>
    </div>
  );
}

export default ScheduleIndex;
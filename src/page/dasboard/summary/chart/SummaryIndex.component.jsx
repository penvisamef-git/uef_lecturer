import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// Component
import Loading from "../../../../component/Loading/Loading.component";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";

// Icon
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBookOpen,
  FaCalendarCheck,
  FaChartLine,
  FaTrophy,
  FaGraduationCap,
  FaMoneyBillWave,
} from "react-icons/fa";
import { IoMdSchool } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { GiTeacher } from "react-icons/gi";

// Colors
const COLORS = [
  "#0dc25e",
  "#02a33d",
  "#004a0f",
  "#4ade80",
  "#86efac",
  "#fbbf24",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
];

function SummaryIndex({ setIsGlobalLoading }) {
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // SAMPLE DATA - Replace with real API data
  // ==========================================

  // Current year stats
  const currentYear = new Date().getFullYear();

  // Students by subject (Pie Chart)
  const studentsBySubject = [
    { name: "គណនេយ្យ និងហិរញ្ញវត្ថុ", value: 145 },
    { name: "ហិរញ្ញវត្ថុ", value: 98 },
    { name: "ជំនួញអន្តរជាតិ", value: 76 },
    { name: "ធនាគារ និងហិរញ្ញវត្ថុ", value: 112 },
    { name: "គ្រប់គ្រងពាណិជ្ជកម្ម", value: 89 },
    { name: "វិទ្យាសាស្រ្តសេដ្ឋកិច្ច", value: 54 },
    { name: "អភិវឌ្ឍកម្មវិធីព័ត៌មានវិទ្យា", value: 67 },
  ];

  // Monthly student enrollment (Line/Area Chart)
  const monthlyEnrollment = [
    { month: "មករា", students: 45, teachers: 12 },
    { month: "កុម្ភៈ", students: 52, teachers: 14 },
    { month: "មីនា", students: 48, teachers: 13 },
    { month: "មេសា", students: 60, teachers: 15 },
    { month: "ឧសភា", students: 75, teachers: 18 },
    { month: "មិថុនា", students: 82, teachers: 20 },
    { month: "កក្កដា", students: 90, teachers: 22 },
    { month: "សីហា", students: 85, teachers: 21 },
    { month: "កញ្ញា", students: 95, teachers: 24 },
    { month: "តុលា", students: 100, teachers: 25 },
    { month: "វិច្ឆិកា", students: 110, teachers: 28 },
    { month: "ធ្នូ", students: 120, teachers: 30 },
  ];

  // Yearly performance (Bar Chart)
  const yearlyPerformance = [
    { year: 2020, students: 150, graduates: 80, teachers: 15 },
    { year: 2021, students: 220, graduates: 120, teachers: 20 },
    { year: 2022, students: 310, graduates: 180, teachers: 25 },
    { year: 2023, students: 420, graduates: 250, teachers: 32 },
    { year: 2024, students: 550, graduates: 320, teachers: 40 },
    { year: 2025, students: 680, graduates: 400, teachers: 48 },
  ];

  // Department performance (Radar Chart)
  const departmentPerformance = [
    { subject: "គណនេយ្យ", satisfaction: 85, performance: 90, attendance: 95 },
    {
      subject: "ហិរញ្ញវត្ថុ",
      satisfaction: 78,
      performance: 85,
      attendance: 88,
    },
    {
      subject: "ជំនួញអន្តរជាតិ",
      satisfaction: 82,
      performance: 88,
      attendance: 92,
    },
    { subject: "ធនាគារ", satisfaction: 88, performance: 92, attendance: 90 },
    { subject: "គ្រប់គ្រង", satisfaction: 76, performance: 80, attendance: 85 },
    {
      subject: "សេដ្ឋកិច្ច",
      satisfaction: 80,
      performance: 82,
      attendance: 87,
    },
  ];

  // Summary Stats
  const summaryStats = {
    totalStudents: 1248,
    totalTeachers: 48,
    totalGraduates: 320,
    totalSubjects: 12,
    thisYearStudents: 680,
    thisYearGraduates: 400,
    maleStudents: 680,
    femaleStudents: 568,
    satisfactionRate: 85,
    attendanceRate: 92,
  };

  // ==========================================
  // Loading Simulation
  useEffect(() => {
   // setIsGlobalLoading(true);
    setTimeout(() => {
     //setIsGlobalLoading(false);
    }, 1000);
  }, [setIsGlobalLoading]);

  // Format numbers with Khmer commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div>
      <Loading is_loading={isLoading} />
      <div className="container defualt_White_Shadow_Theme">
        <RowBreaker />

        {/* Title */}
        <div className="row">
          <div className="col-md-12">
            <h4
              style={{
                fontFamily: "'Siemreap', sans-serif",
                color: "#1a3c2a",
                padding: "8px 0",
              }}
            >
              <MdDashboard style={{ marginRight: "10px", color: "#0dc25e" }} />
              ផ្ទាំងគ្រប់គ្រងទូទៅ - (បញ្ជាក់ : ទិន្នន័យសាកល្បង)
            </h4>
            <hr style={{ marginBottom: "24px" }} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row" style={{ marginBottom: "24px" }}>
          <div className="col-md-3">
            <div
              style={{
                background: "linear-gradient(135deg, #0dc25e, #02a33d)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(13, 194, 94, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.8,
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                  >
                    និស្សិតសរុប
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    {formatNumber(summaryStats.totalStudents)}
                  </div>
                  <div
                    style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}
                  >
                    +{summaryStats.thisYearStudents} នាក់ក្នុងឆ្នាំនេះ
                  </div>
                </div>
                <FaUsers style={{ fontSize: "40px", opacity: 0.4 }} />
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.8,
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                  >
                    គ្រូបង្រៀន
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    {summaryStats.totalTeachers}
                  </div>
                  <div
                    style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}
                  >
                    សមាមាត្រ ១:
                    {Math.round(
                      summaryStats.totalStudents / summaryStats.totalTeachers,
                    )}
                  </div>
                </div>
                <FaChalkboardTeacher
                  style={{ fontSize: "40px", opacity: 0.4 }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.8,
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                  >
                    និស្សិតបញ្ចប់ការសិក្សា
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    {formatNumber(summaryStats.totalGraduates)}
                  </div>
                  <div
                    style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}
                  >
                    {summaryStats.thisYearGraduates} នាក់ក្នុងឆ្នាំនេះ
                  </div>
                </div>
                <FaGraduationCap style={{ fontSize: "40px", opacity: 0.4 }} />
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                borderRadius: "16px",
                padding: "20px",
                color: "white",
                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.8,
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                  >
                    មុខជំនាញ
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    {summaryStats.totalSubjects}
                  </div>
                  <div
                    style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}
                  >
                    កម្មវិធីសិក្សាទាំងអស់
                  </div>
                </div>
                <FaBookOpen style={{ fontSize: "40px", opacity: 0.4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="row" style={{ marginBottom: "24px" }}>
          <div className="col-md-3">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #f0f2f5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  fontFamily: "'Siemreap', sans-serif",
                }}
              >
                ប្រុស
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#3b82f6",
                }}
              >
                {formatNumber(summaryStats.maleStudents)}
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                {Math.round(
                  (summaryStats.maleStudents / summaryStats.totalStudents) *
                    100,
                )}
                %
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #f0f2f5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  fontFamily: "'Siemreap', sans-serif",
                }}
              >
                ស្រី
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#ec4899",
                }}
              >
                {formatNumber(summaryStats.femaleStudents)}
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                {Math.round(
                  (summaryStats.femaleStudents / summaryStats.totalStudents) *
                    100,
                )}
                %
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #f0f2f5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  fontFamily: "'Siemreap', sans-serif",
                }}
              >
                ការពេញចិត្ត
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#0dc25e",
                }}
              >
                {summaryStats.satisfactionRate}%
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                កម្រិតខ្ពស់
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #f0f2f5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  fontFamily: "'Siemreap', sans-serif",
                }}
              >
                ការចូលរៀន
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#f59e0b",
                }}
              >
                {summaryStats.attendanceRate}%
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                កម្រិតល្អ
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="row" style={{ marginBottom: "24px" }}>
          <div className="col-md-6">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f0f2f5",
                height: "350px",
              }}
            >
              <h5
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a3c2a",
                  marginBottom: "16px",
                  fontFamily: "'Siemreap', sans-serif",
                  textAlign: "center",
                }}
              >
                <FaChartLine style={{ marginRight: "8px", color: "#0dc25e" }} />
                និស្សិតចូលរៀនប្រចាំខែ ({currentYear})
              </h5>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={monthlyEnrollment}>
                  <defs>
                    <linearGradient
                      id="colorStudents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0dc25e" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#0dc25e"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#0dc25e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                    name="និស្សិត"
                  />
                  <Area
                    type="monotone"
                    dataKey="teachers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    name="គ្រូបង្រៀន"
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "'Siemreap', sans-serif",
                      fontSize: "12px",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-md-6">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f0f2f5",
                height: "350px",
              }}
            >
              <h5
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a3c2a",
                  marginBottom: "16px",
                  fontFamily: "'Siemreap', sans-serif",
                  textAlign: "center",
                }}
              >
                <FaTrophy style={{ marginRight: "8px", color: "#f59e0b" }} />
                ការវិវត្តន៍ប្រចាំឆ្នាំ
              </h5>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={yearlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                  <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "'Siemreap', sans-serif",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="students"
                    fill="#0dc25e"
                    radius={[4, 4, 0, 0]}
                    name="និស្សិត"
                  />
                  <Bar
                    dataKey="graduates"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="បញ្ចប់ការសិក្សា"
                  />
                  <Bar
                    dataKey="teachers"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="គ្រូបង្រៀន"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="row" style={{ marginBottom: "24px" }}>
          <div className="col-md-6">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f0f2f5",
                height: "350px",
              }}
            >
              <h5
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a3c2a",
                  marginBottom: "16px",
                  fontFamily: "'Siemreap', sans-serif",
                  textAlign: "center",
                }}
              >
                <FaGraduationCap
                  style={{ marginRight: "8px", color: "#8b5cf6" }}
                />
                ការចែកចាយនិស្សិតតាមមុខជំនាញ
              </h5>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={studentsBySubject}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name.substring(0, 10)}... (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentsBySubject.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                    formatter={(value) => [`${value} នាក់`, "ចំនួន"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-md-6">
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f0f2f5",
                height: "350px",
              }}
            >
              <h5
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a3c2a",
                  marginBottom: "16px",
                  fontFamily: "'Siemreap', sans-serif",
                  textAlign: "center",
                }}
              >
                <GiTeacher style={{ marginRight: "8px", color: "#3b82f6" }} />
                ការវាយតម្លៃកម្មវិធីសិក្សា
              </h5>
              <ResponsiveContainer width="100%" height="85%">
                <RadarChart outerRadius={90} data={departmentPerformance}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#6b7280"
                    fontSize={11}
                    tick={{ fontFamily: "'Siemreap', sans-serif" }}
                  />
                  <PolarRadiusAxis
                    stroke="#6b7280"
                    fontSize={11}
                    tick={{ fontFamily: "'Siemreap', sans-serif" }}
                  />
                  <Radar
                    name="ការពេញចិត្ត"
                    dataKey="satisfaction"
                    stroke="#0dc25e"
                    fill="#0dc25e"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="ការអនុវត្ត"
                    dataKey="performance"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="ការចូលរៀន"
                    dataKey="attendance"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "'Siemreap', sans-serif",
                      fontSize: "12px",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontFamily: "'Siemreap', sans-serif",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="row" style={{ marginBottom: "24px" }}>
          <div className="col-md-4">
            <div
              style={{
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                borderRadius: "12px",
                padding: "16px 20px",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#0dc25e",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "white",
                }}
              >
                <FaCalendarCheck size={24} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontFamily: "'Siemreap', sans-serif",
                  }}
                >
                  ឆ្នាំសិក្សាបច្ចុប្បន្ន
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a3c2a",
                  }}
                >
                  {currentYear} - {currentYear + 1}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              style={{
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                borderRadius: "12px",
                padding: "16px 20px",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#3b82f6",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "white",
                }}
              >
                <FaMoneyBillWave size={24} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontFamily: "'Siemreap', sans-serif",
                  }}
                >
                  អត្រាអាហារូបករណ៍
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a3c2a",
                  }}
                >
                  35%
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              style={{
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                borderRadius: "12px",
                padding: "16px 20px",
                border: "1px solid #fcd34d",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#f59e0b",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "white",
                }}
              >
                <FaTrophy size={24} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontFamily: "'Siemreap', sans-serif",
                  }}
                >
                  និស្សិតពូកែ
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a3c2a",
                  }}
                >
                  12 នាក់
                </div>
              </div>
            </div>
          </div>
        </div>

        <RowBreaker break={2} />
      </div>
    </div>
  );
}

export default SummaryIndex;

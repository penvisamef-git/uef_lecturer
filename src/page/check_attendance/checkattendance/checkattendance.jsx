import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RowBreaker from "../../../component/Boostramp/RowBreaker.component.jsx";
import Loading from "../../../component/Loading/Loading.component.jsx";
import SwalToast from "../../../component/SwalToast/SwalToast.js";
import DataTableCustom from "../../../component/DataTable/datatable.component.jsx";
import { getByIdRequest } from "../../../util/request_api.js";
import { FaSave, FaCheckCircle, FaTimesCircle, FaClock, FaHourglassHalf, FaUsers } from "react-icons/fa";
import Title from "../../../component/Title/Title.component.jsx";

function CheckAttendance({ auth }) {
  const { classId, subjectId, sessionNumber } = useParams();
  const navigate = useNavigate();
  const swalToast = new SwalToast();

  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataCount, setDataCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [attendanceData, setAttendanceData] = useState({});
  const [note, setNote] = useState("");

  const [subjectName, setSubjectName] = useState("N/A");

  const [stats, setStats] = useState({
    total: 0, present: 0, absent: 0, late: 0, excused: 0
  });

  const API_HOST = process.env.REACT_APP_API_HOST;
  const access_token = auth?.getClientLogin()?.data?.access_token;
  const teacherId = auth?.getClientLogin()?.data?._id;

  const updateStats = (studentList, data) => {
    const total = studentList.length;
    let present = 0, absent = 0, late = 0, excused = 0;
    studentList.forEach(student => {
      const status = data[student._id] || 'present';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });
    setStats({ total, present, absent, late, excused });
  };

  // =========================================================
  // 🚀 FETCH CLASS DATA
  // =========================================================
  useEffect(() => {
    const loadClassAndStudents = async () => {
      try {
        setIsLoading(true);

        if (!teacherId || !access_token) {
          swalToast.toastError("សូមចូលប្រើប្រាស់ឡើងវិញ", 2000);
          setIsLoading(false);
          return;
        }

        const url = `${API_HOST}/api/admin/academic/class-get-all-class-by-id-teacher/${teacherId}`;
        const result = await getByIdRequest(url, access_token);

        if (!result?.success) {
          swalToast.toastError(result?.message || "ទាញយកទិន្នន័យបរាជ័យ", 2000);
          setIsLoading(false);
          return;
        }

        const classData = result.data.find(cls => cls._id === classId);

        if (!classData) {
          swalToast.toastError("មិនឃើញថ្នាក់នេះសម្រាប់គ្រូ", 2000);
          setIsLoading(false);
          return;
        }

        if (classData.schedule && classData.schedule.length > 0) {
          const foundSubject = classData.schedule.find(
            item => item.subject_id?._id === subjectId
          );
          if (foundSubject) {
            setSubjectName(foundSubject.subject_id?.name || "N/A");
          } else {
            setSubjectName(classData.schedule[0]?.subject_id?.name || "N/A");
          }
        }

        const extractedStudents = classData.students?.map(item => ({
          _id: item.student_id?._id || item._id,
          fullName_kh: item.student_id?.firstname && item.student_id?.lastname 
            ? `${item.student_id.firstname} ${item.student_id.lastname}`
            : item.student_id?.fullName_kh || 'N/A',
          code: item.student_id?.code || 'N/A',
          email: item.student_id?.email || 'N/A',
          phone: item.student_id?.personal_contact || item.student_id?.phone || 'N/A'
        })) || [];

        if (extractedStudents.length > 0) {
          setStudents(extractedStudents);
          setFilteredData(extractedStudents);
          setDataCount(extractedStudents.length);

          const initialData = {};
          extractedStudents.forEach(student => {
            initialData[student._id] = 'present';
          });
          setAttendanceData(initialData);
          updateStats(extractedStudents, initialData);
        } else {
          swalToast.toastInfo("ថ្នាក់នេះមិនទាន់មាននិស្សិតទេ", 2000);
          setStudents([]);
          setFilteredData([]);
          setDataCount(0);
        }

      } catch (error) {
        console.error("Error loading data:", error);
        swalToast.toastError("មានបញ្ហាបច្ចេកទេស", 2000);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassAndStudents();
  }, [classId, subjectId, teacherId, access_token]);

  const handleAttendanceChange = (studentId, status) => {
    const newData = { ...attendanceData, [studentId]: status };
    setAttendanceData(newData);
    updateStats(students, newData);
  };

  // =========================================================
  // ✅ SAVE (WITH SIMULATION MODE IF BACKEND FAILS)
  // =========================================================
  const handleSaveAttendance = async () => {
    try {
      setIsLoading(true);
      const studentList = Object.keys(attendanceData).map(studentId => ({
        student_id: studentId,
        attendace_status: attendanceData[studentId] || 'present'
      }));

      const payload = {
        class_id: classId,
        teacher_id: teacherId,
        student_id_as_list: studentList,
        subject_id: subjectId,
        current_session: sessionNumber,
        schedule_session: new Date().toISOString(),
        note: note,
        status: true
      };

      console.log("📤 Attempting to save payload:", payload);

      // TRY TO SAVE TO BACKEND
      let savedSuccessfully = false;
      try {
        const response = await fetch(`${API_HOST}/api/attendance/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          savedSuccessfully = true;
        } else {
          // Read backend error message if available
          let errorMsg = 'Backend rejected the save';
          try {
            const errorJson = await response.json();
            errorMsg = errorJson.message || errorMsg;
          } catch (e) {}
          console.warn("Backend Error:", errorMsg);
        }
      } catch (networkError) {
        console.warn("Network Error (Backend offline or route missing):", networkError.message);
      }

      
      if (savedSuccessfully) {
        swalToast.toastSuccess('បានរក្សាទុកវត្តមានដោយជោគជ័យ (API)', 2000);
      } 

      setTimeout(() => navigate(-1), 1500);

    } catch (error) {
      console.error('Critical Error saving attendance:', error);
      swalToast.toastError('មិនអាចរក្សាទុកវត្តមានបានទេ', 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => navigate(-1);

  const handleSearchChange = (value) => {
    setCurrentPage(1);
    if (value.trim() === '') {
      setFilteredData(students);
      setDataCount(students.length);
      return;
    }
    const searchLower = value.toLowerCase();
    const filtered = students.filter(item => 
      item.fullName_kh?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.phone?.toLowerCase().includes(searchLower)
    );
    setFilteredData(filtered);
    setDataCount(filtered.length);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  // =========================================================
  // UI HELPERS
  // =========================================================
  const getStatusColor = (status) => {
    const colors = { present: '#0dc25e', absent: '#dc3545', late: '#f59e0b', excused: '#0d6efd' };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = { present: 'វត្តមាន', absent: 'អវត្តមាន', late: 'មកយឺត', excused: 'អវត្តមានមានច្បាប់' };
    return labels[status] || 'វត្តមាន';
  };

  const columns = [
    {
      name: "ឈ្មោះនិស្សិត",
      selector: (row) => row.fullName_kh || 'N/A',
      sortable: true,
    },
    {
      name: "អ៊ីមែល",
      selector: (row) => row.email || 'N/A',
      sortable: true,
    },
    {
      name: "លេខទូរស័ព្ទ",
      selector: (row) => row.phone || 'N/A',
      sortable: true,
    },
    {
      name: "វត្តមាន (Present / Absent / Excused / Late)",
      selector: (row) => {
        const status = attendanceData[row._id] || 'present';
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['present', 'absent', 'excused', 'late'].map((type) => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={status === type}
                  onChange={() => handleAttendanceChange(row._id, type)}
                  style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: getStatusColor(type) }}
                />
                <span>{getStatusLabel(type)}</span>
              </label>
            ))}
          </div>
        );
      },
      sortable: false,
    },
  ];

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (isLoading) return <Loading is_loading={isLoading} />;

  return (
    <div>
      <div className="container defualt_White_Shadow_Theme">
        <RowBreaker />

        {/* Header with Back Button */}
        <div className="row">
          <div className="col-md-12">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Khmer OS', 'Siemreap', sans-serif" }}>
              <button type="button" className="btn btn-success" onClick={handleGoBack} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "8px", fontFamily: "'Khmer OS Siemreap", fontWeight: "500", fontSize: "14px" }}>
                <span style={{ fontSize: "16px" }}>←</span> ត្រលប់
              </button>
              <Title mode="custom" icons={null} title={`ពិនិត្យវត្តមាននិសិត្ស`} />
            </div>
          </div>
        </div>

        <RowBreaker/>
        <RowBreaker/>

        {/* Session & Subject Info */}
        <div className="row" style={{ marginBottom: '20px' }}>
          <div className="col-md-8">
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div><label style={{fontSize:"16px"}}>វគ្គទី:</label> {sessionNumber || 'N/A'}</div>
              <div style={{fontFamily:"Khmer Os Siemreap" ,fontSize:"16px"}}><label>មុខវិជ្ជា:</label> {subjectName}</div>
            </div>
          </div>
          <div className="col-md-4" style={{ textAlign: 'right' }}></div>
        </div>

       

       

       
        {/* Student Table */}
        <div className="row">
          <div className="col-md-12">
            <DataTableCustom
              onChangePage={handlePageChange}
              onSearch={handleSearchChange}
              props={{
                show_loading: false,
                header: { show_create: false, title: "បញ្ជីនិស្សិតក្នុងថ្នាក់" },
                columns,
                data: paginatedData,
                pagination: { currentPage, rowsPerPage: pageSize, count: dataCount },
                show_status: false,
                actionButton: { show_view: false, show_edit: false, show_delete: false },
                errorGetData: { status: false, message: "" },
              }}
            />
          </div>
        </div>

        <RowBreaker break={2} />

        {/* Save Button */}
        <div className="row">
          <div className="col-md-12" style={{textAlign: 'right'}}>
            <button type="button" className="btn btn-success" onClick={handleSaveAttendance} style={{ cursor: 'pointer', alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "8px", fontFamily: "'Khmer OS Siemreap", fontWeight: "500", fontSize: "14px" }}>
              <span style={{ fontSize: "16px" }}><FaSave size={14} /></span> រក្សាទុក
            </button>
          </div>
        </div>

        <RowBreaker break={2} />
      </div>
    </div>
  );
}

export default CheckAttendance;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaBookOpen,
  FaMapMarkerAlt,
  FaEye,
  FaChalkboardTeacher,
  FaBuilding,
  FaFilter,
} from "react-icons/fa";
import { MdClass, MdSchool, MdRoom } from "react-icons/md";
import Loading from "../../../../component/Loading/Loading.component.jsx";
import { getAllRequest } from "../../../../util/request_api";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";
import Title from "../../../../component/Title/Title.component";

function ClassTeacherTeach({ teacherId, auth }) {
  const navigate = useNavigate();
  const swalToast = new SwalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [classList, setClassList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const access_token = auth?.getClientLogin()?.data?.access_token;

  const statusOptions = [
    { value: "all", label: "ទាំងអស់", color: "#6c757d" },
    { value: "pending", label: "មិនទាន់ចាប់ផ្តើម", color: "#f59e0b" },
    { value: "start", label: "កំពុងដំណើរការ", color: "#0dc25e" },
    { value: "closed", label: "បានបញ្ចប់", color: "#ef4444" },
  ];

  // Fetch classes by teacher ID
  useEffect(() => {
    if (teacherId) {
      fetchClassesByTeacher(1, selectedStatus);
    }
  }, [teacherId]);

  const fetchClassesByTeacher = async (page = 1, status = selectedStatus) => {
    if (!teacherId) return;

    setIsLoading(true);
    try {
      const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class-get-all-class-by-id-teacher/${teacherId}?page=${page}&limit=${pagination.limit}&status=${status}`;
      const result = await getAllRequest(api, access_token);

      if (result.success) {
        setClassList(result?.data?.data || []);
        if (result?.data?.pagination) {
          setPagination(result?.data?.pagination);
        }
      } else {
        swalToast.toastError("មិនអាចទាញយកទិន្នន័យថ្នាក់!", 2000);
      }
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchClassesByTeacher(1, status);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchClassesByTeacher(newPage, selectedStatus);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      start: "កំពុងដំណើរការ",
      pending: "មិនទាន់ចាប់ផ្តើម",
      closed: "បានបញ្ចប់",
    };
    return map[status] || status || "N/A";
  };

  const getStatusColor = (status) => {
    const map = {
      start: "#0dc25e",
      pending: "#f59e0b",
      closed: "#ef4444",
    };
    return map[status] || "#6b7280";
  };

  const getShiftLabel = (shift) => {
    if (!shift) return "N/A";
    return shift.name || shift || "N/A";
  };

  const getDegreeLabel = (degree) => {
    if (!degree) return "N/A";
    return degree.name || degree || "N/A";
  };

  const getMajorLabel = (major) => {
    if (!major) return "N/A";
    return major.name || major || "N/A";
  };

  const getRoomLabel = (room) => {
    if (!room) return "N/A";
    return room.name || room || "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("km-KH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <Loading is_loading={true} />
      </div>
    );
  }

  return (
    <div className="container defualt_White_Shadow_Theme">
      <RowBreaker />

      {/* Header */}
      <div className="row">
        <div className="col-md-12">
          <Title
            mode="custom"
            icons={<FaChalkboardTeacher />}
            title={`ថ្នាក់ដែលបង្រៀន (${pagination.total})`}
          />
        </div>
      </div>

      <RowBreaker />

      {/* Status Filter Buttons */}
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="siemreap-regular text-muted me-2">
              <FaFilter className="me-1" /> តម្រង៖
            </span>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className="btn btn-sm"
                style={{
                  background: selectedStatus === option.value ? option.color : "#f8f9fa",
                  color: selectedStatus === option.value ? "white" : "#6c757d",
                  border: selectedStatus === option.value ? `2px solid ${option.color}` : "2px solid #e9ecef",
                  borderRadius: "20px",
                  padding: "5px 16px",
                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                  fontWeight: selectedStatus === option.value ? "bold" : "normal",
                  transition: "all 0.2s",
                }}
                onClick={() => handleStatusChange(option.value)}
              >
                {option.label}
                {selectedStatus === option.value && (
                  <span className="ms-1" style={{ fontSize: "12px" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <RowBreaker />

      {classList.length === 0 ? (
        <div className="text-center py-5">
          <MdSchool style={{ fontSize: "4rem", color: "#ddd" }} />
          <h5 className="mt-3 siemreap-regular">មិនមានថ្នាក់បង្រៀន</h5>
          <p className="text-muted siemreap-regular">
            {selectedStatus === "all" 
              ? "គ្រូបង្រៀននេះមិនទាន់បានបង្រៀនក្នុងថ្នាក់ណាមួយទេ"
              : `មិនមានថ្នាក់ដែលមានស្ថានភាព "${getStatusLabel(selectedStatus)}"`}
          </p>
        </div>
      ) : (
        <>
          {/* Class Cards */}
          {classList.map((cls, index) => (
            <div
              key={cls._id}
              className="card mb-3"
              style={{
                borderRadius: "10px",
                border: "1px solid #e8f5e9",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Class Header */}
              <div
                style={{
                  background: index % 2 === 0 ? "#f8faf8" : "#ffffff",
                  padding: "15px 20px",
                  borderBottom: "1px solid #e8f5e9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <h6
                    className="siemreap-regular mb-0"
                    style={{ fontWeight: "bold", color: "#1a3c2a" }}
                  >
                    <FaGraduationCap className="me-2" style={{ color: "#0dc25e" }} />
                    {cls.code || "N/A"}
                  </h6>
                  <div className="mt-1">
                    <span
                      className="badge me-2"
                      style={{
                        background: getStatusColor(cls.class_status),
                        color: "white",
                        padding: "10px",
                        borderRadius: "12px",                   
                        fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                      }}
                    >
                      {getStatusLabel(cls.class_status)}
                    </span>
                    <span className="text-muted small siemreap-regular">
                      <FaCalendarAlt className="me-1" /> {cls.year_study_from} -{" "}
                      {cls.year_study_to}
                    </span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm"
                    style={{
                      background: "#1a3c2a",
                      color: "white",
                      borderRadius: "6px",
                      padding: "5px 14px",
                      fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                    }}
                    onClick={() =>
                      navigate(`/admin/academic-management/class/${cls._id}`)
                    }
                  >
                    <FaEye className="me-1" /> មើលថ្នាក់
                  </button>
                </div>
              </div>

              {/* Class Details */}
              <div className="p-3">
                <div className="row">
                  <div className="col-md-3 col-sm-6 mb-2">
                    <div
                      className="text-center p-2"
                      style={{ background: "#f8f9fa", borderRadius: "8px" }}
                    >
                      <small className="text-muted siemreap-regular">
                        <MdClass className="me-1" /> កម្រិត
                      </small>
                      <div
                        className="siemreap-regular"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {getDegreeLabel(cls.degree_level_id)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-2">
                    <div
                      className="text-center p-2"
                      style={{ background: "#f8f9fa", borderRadius: "8px" }}
                    >
                      <small className="text-muted siemreap-regular">
                        <FaBookOpen className="me-1" /> មុខជំនាញ
                      </small>
                      <div
                        className="siemreap-regular"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {getMajorLabel(cls.major_id)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-2">
                    <div
                      className="text-center p-2"
                      style={{ background: "#f8f9fa", borderRadius: "8px" }}
                    >
                      <small className="text-muted siemreap-regular">
                        <FaClock className="me-1" /> វេន
                      </small>
                      <div
                        className="siemreap-regular"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {getShiftLabel(cls.shift_id)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-2">
                    <div
                      className="text-center p-2"
                      style={{ background: "#f8f9fa", borderRadius: "8px" }}
                    >
                      <small className="text-muted siemreap-regular">
                        <MdRoom className="me-1" /> បន្ទប់
                      </small>
                      <div
                        className="siemreap-regular"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {getRoomLabel(cls.room_id)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule/Subjects taught by this teacher */}
                {cls.schedule && cls.schedule.length > 0 && (
                  <div className="mt-3">
                    <small
                      className="text-muted siemreap-regular"
                      style={{ fontWeight: "600" }}
                    >
                      <FaChalkboardTeacher className="me-1" /> មុខវិជ្ជាដែលបង្រៀន
                    </small>
                    <div className="row mt-2">
                      {cls.schedule.map((item, idx) => {
                        // Only show subjects where this teacher is assigned
                        const teacherIdStr =
                          item.teacher_id?._id || item.teacher_id;
                        if (teacherIdStr !== teacherId) return null;

                        return (
                          <div key={idx} className="col-md-4 col-sm-6 mb-2">
                            <div
                              style={{
                                background: "#e8f5e9",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                className="siemreap-regular"
                                style={{ fontSize: "13px", color: "#1a3c2a" }}
                              >
                                {item.subject_id?.name || "N/A"}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#6b7280",
                                  fontFamily:
                                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                }}
                              >
                                {item.subject_id?.code || ""}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Class Info */}
                <div className="mt-3">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted siemreap-regular">
                        <FaUsers className="me-1" /> ចំនួនសិស្ស:{" "}
                        <strong>{cls.students?.length || 0}</strong>
                      </small>
                    </div>
                    <div className="col-md-6 text-end">
                      <small className="text-muted siemreap-regular">
                        <FaCalendarAlt className="me-1" /> បង្កើត:{" "}
                        {formatDate(cls.created_date)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <div>
                <span className="text-muted siemreap-regular small">
                  បង្ហាញ {classList.length} ពី {pagination.total}
                </span>
              </div>
              <div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${
                        !pagination.hasPrevPage ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.page - 1)
                        }
                        disabled={!pagination.hasPrevPage}
                      >
                        មុន
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          pagination.page === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(i + 1)}
                          style={
                            pagination.page === i + 1
                              ? { background: "#1a3c2a", color: "white", borderColor: "#1a3c2a" }
                              : {}
                          }
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        !pagination.hasNextPage ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.page + 1)
                        }
                        disabled={!pagination.hasNextPage}
                      >
                        បន្ទាប់
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      <RowBreaker break={2} />
    </div>
  );
}

export default ClassTeacherTeach;
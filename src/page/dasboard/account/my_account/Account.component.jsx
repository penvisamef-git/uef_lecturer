import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getByIdRequest } from "../../../../util/request_api";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import Loading from "../../../../component/Loading/Loading.component.jsx";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";
import Title from "../../../../component/Title/Title.component";
import {
  FaChalkboardTeacher,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdCard,
  FaPassport,
  FaGraduationCap,
  FaBriefcase,
  FaUser,
  FaMars,
  FaVenus,
  FaTransgender,
  FaInfoCircle,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import { FaUserGraduate } from "react-icons/fa6";
import {
  MdEmail,
  MdPerson,
  MdWork,
  MdLocationOn,
  MdPhone,
  MdDateRange,
} from "react-icons/md";

function ProfileComponent({ auth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const swalToast = new SwalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [teacherData, setTeacherData] = useState(null);

  const api = `${process.env.REACT_APP_API_HOST}/api/admin/teacher/student-management/teacher`;
  const access_token = auth?.getClientLogin()?.data?.access_token;

  useEffect(() => {
      loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const result = await getByIdRequest(`${api}`, access_token);
      if (result.success) {
        setTeacherData(result?.data);
        console.log(result.data)
      } else {
        swalToast.toastError("មិនអាចទាញយកទិន្នន័យ!", 2000);
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 2000);
    } finally {
      setIsLoading(false);
    }
  }

  const getGenderLabel = (gender) => {
    const map = { male: "ប្រុស", female: "ស្រី", other: "ផ្សេងទៀត" };
    return map[gender] || gender || "N/A";
  };

  const getGenderIcon = (gender) => {
    if (gender === "male")
      return <FaMars className="me-1" style={{ color: "#4facfe" }} />;
    if (gender === "female")
      return <FaVenus className="me-1" style={{ color: "#f093fb" }} />;
    return <FaTransgender className="me-1" style={{ color: "#ffc107" }} />;
  };

  const getGenderColor = (gender) => {
    if (gender === "male") return "#4facfe";
    if (gender === "female") return "#f093fb";
    return "#ffc107";
  };

  const getMaritalStatus = (status) => {
    const map = {
      single: "នៅលីវ",
      married: "រៀបការ",
      divorced: "លែងលះ",
      widowed: "មេម៉ាយ",
    };
    return map[status] || status || "N/A";
  };

  const getDegreeLabel = (level) => {
    const map = {
      certificate: "វិញ្ញាបនបត្រ",
      associate: "បរិញ្ញាបត្ររង",
      bachelor: "បរិញ្ញាបត្រ",
      master: "បរិញ្ញាបត្រជាន់ខ្ពស់",
      phd: "បណ្ឌិត",
      other: "ផ្សេងៗ",
    };
    return map[level] || level || "N/A";
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

  const getInitials = (firstname, lastname) => {
    const first = firstname?.charAt(0) || "";
    const last = lastname?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "T";
  };

  return (
    <div className="container defualt_White_Shadow_Theme">
      <Loading is_loading={isLoading} />

      {teacherData && (
        <>
          <RowBreaker />

          {/* Header */}
          <div className="row">
            <div className="col-md-12">
              <Title
                mode="custom"
                icons={<FaChalkboardTeacher />}
                title="ព័ត៌មានគ្រូបង្រៀន"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="row mb-3">
            <div className="col-md-6">
              <button
                className="btn btn-sm"
                style={{ background: "#6c757d", color: "white" }}
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft style={{ marginTop: "-5px" }} />{" "}
                <label style={{ cursor: "pointer" }}>ត្រឡប់ក្រោយ</label>
              </button>
            </div>

            <div className="col-md-6 text-end">
              <button
                className="btn btn-sm"
                style={{ background: "#1a3c2a", color: "white" }}
                onClick={() =>
                  navigate(`/admin/student-management/teacher/edit/${id}`)
                }
              >
                <FaEdit style={{ marginTop: "-5px" }} />{" "}
                <label style={{ cursor: "pointer" }}>កែប្រែ</label>
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="row">
            <div className="col-md-12">
              <div
                className="card shadow-sm"
                style={{
                  borderRadius: "15px",
                  border: "none",
                  overflow: "hidden",
                }}
              >
                {/* Cover Image / Header */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #1a3c2a 0%, #2d5a3d 100%)",
                    padding: "40px 30px 30px 30px",
                    color: "white",
                    position: "relative",
                  }}
                >
                  <div className="row align-items-center">
                    <div className="col-md-3 text-center">
                      {/* Profile Avatar */}
                      <div
                        style={{
                          width: "150px",
                          height: "150px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #4facfe, #00f2fe)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "50px",
                          fontWeight: "bold",
                          color: "white",
                          margin: "0 auto",
                          border: "5px solid white",
                          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                        }}
                      >
                        {getInitials(
                          teacherData.info_firstname_kh,
                          teacherData.info_lastname_kh,
                        )}
                      </div>
                    </div>
                    <div className="col-md-9">
                      <h2
                        className="siemreap-regular"
                        style={{ fontWeight: "bold", marginBottom: "5px" }}
                      >
                        {teacherData.info_firstname_kh || ""}{" "}
                        {teacherData.info_lastname_kh || ""}
                      </h2>
                      <h5 className="siemreap-regular" style={{ opacity: 0.9 }}>
                        <FaGraduationCap className="me-2" />
                        {getDegreeLabel(teacherData.degree_level)} -{" "}
                        {teacherData.major || "N/A"}
                      </h5>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="card-body" style={{ padding: "30px" }}>
                  <div className="row">
                    {/* Personal Information */}
                    <div className="col-md-6">
                      <h6
                        className="siemreap-regular"
                        style={{
                          color: "#1a3c2a",
                          fontWeight: "bold",
                          borderBottom: "2px solid #1a3c2a",
                          paddingBottom: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <FaUser className="me-2" /> ព័ត៌មានផ្ទាល់ខ្លួន
                      </h6>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            គោត្តនាម
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_firstname_kh || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            នាម
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_lastname_kh || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            ឈ្មោះឡាតាំង
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_firstname_en || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            ភេទ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{
                              fontWeight: "500",
                              color: getGenderColor(teacherData.info_gender),
                            }}
                          >
                            {getGenderIcon(teacherData.info_gender)}{" "}
                            {getGenderLabel(teacherData.info_gender)}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            ថ្ងៃខែឆ្នាំកំណើត
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {formatDate(teacherData.info_dob)}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            សញ្ជាតិ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_national_id.name || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            ស្ថានភាពគ្រួសារ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {getMaritalStatus(teacherData.info_marital_status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Documents */}
                    <div className="col-md-6">
                      <h6
                        className="siemreap-regular"
                        style={{
                          color: "#1a3c2a",
                          fontWeight: "bold",
                          borderBottom: "2px solid #1a3c2a",
                          paddingBottom: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <FaInfoCircle className="me-2" /> ព័ត៌មានទំនាក់ទំនង &
                        ឯកសារ
                      </h6>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            <MdEmail className="me-1" /> អ៊ីមែល
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_email || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            <MdPhone className="me-1" /> លេខទូរស័ព្ទ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_phone_number || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            <MdLocationOn className="me-1" /> អាសយដ្ឋាន
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.present_address || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            <FaIdCard className="me-1" /> អត្តសញ្ញាណប័ណ្ណ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_id_card_number || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            <FaPassport className="me-1" /> លិខិតឆ្លងដែន
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.info_passport_number || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            <FaUserGraduate className="me-1" /> ឈ្មោះអ្នកប្រើ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.username || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <RowBreaker />

                  {/* Academic & Work Experience */}
                  <div className="row">
                    <div className="col-md-6">
                      <h6
                        className="siemreap-regular"
                        style={{
                          color: "#1a3c2a",
                          fontWeight: "bold",
                          borderBottom: "2px solid #1a3c2a",
                          paddingBottom: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <FaGraduationCap className="me-2" /> កម្រិតសិក្សា
                      </h6>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            កម្រិត
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {getDegreeLabel(teacherData.education.degree_level_id)}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            មុខជំនាញ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.major || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h6
                        className="siemreap-regular"
                        style={{
                          color: "#1a3c2a",
                          fontWeight: "bold",
                          borderBottom: "2px solid #1a3c2a",
                          paddingBottom: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <FaBriefcase className="me-2" /> បទពិសោធន៍ការងារ
                      </h6>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            តួនាទី
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.working_position || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            កន្លែងធ្វើការ
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.working_company || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-4">
                          <label className="text-muted small siemreap-regular">
                            ទីតាំង
                          </label>
                        </div>
                        <div className="col-8">
                          <span
                            className="siemreap-regular"
                            style={{ fontWeight: "500" }}
                          >
                            {teacherData.working_place || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <RowBreaker />

                  {/* Note & Status */}
                  <div className="row">
                    <div className="col-md-12">
                      <h6
                        className="siemreap-regular"
                        style={{
                          color: "#1a3c2a",
                          fontWeight: "bold",
                          borderBottom: "2px solid #1a3c2a",
                          paddingBottom: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <FaInfoCircle className="me-2" /> កំណត់ចំណាំ
                      </h6>
                      <div
                        className="card"
                        style={{
                          background: "#f8f9fa",
                          borderRadius: "8px",
                          padding: "15px",
                        }}
                      >
                        <span className="siemreap-regular">
                          {teacherData.note || "(មិនមាន)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <RowBreaker />

                  {/* Meta Information */}
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted siemreap-regular">
                        <FaCalendarAlt className="me-1" /> បង្កើតនៅ:{" "}
                        {formatDate(teacherData.created_date)}
                      </small>
                    </div>
                    <div className="col-md-6 text-end">
                      <small className="text-muted siemreap-regular">
                        <FaCalendarAlt className="me-1" /> កែប្រែចុងក្រោយ:{" "}
                        {formatDate(teacherData.updated_date)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RowBreaker break={2} />
        </>
      )}
    </div>
  );
}

export default ProfileComponent;
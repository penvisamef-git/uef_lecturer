import React from "react";
import {
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
  FaFlag,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import { FaUserGraduate } from "react-icons/fa6";
import {
  MdEmail,
  MdPhone as MdPhoneIcon,
  MdLocationOn,
} from "react-icons/md";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";

function TeacherDetailTab({ teacherData }) {
  // Helper function to get nested object value
  const getNestedValue = (obj, path, fallback = "N/A") => {
    if (!obj) return fallback;
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    return value || fallback;
  };

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
    if (!level) return "N/A";
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("km-KH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Get data from the new structure
  const data = teacherData?.data || teacherData || {};

  // Personal Information
  const firstNameEn = data.info_firstname_en || "N/A";
  const lastNameEn = data.info_lastname_en || "N/A";
  const firstNameKh = data.info_firstname_kh || "N/A";
  const lastNameKh = data.info_lastname_kh || "N/A";
  const fullNameEn = `${firstNameEn} ${lastNameEn}`.trim();
  const fullNameKh = `${firstNameKh} ${lastNameKh}`.trim();
  const gender = data.info_gender || "N/A";
  const dob = data.info_dob || null;
  const maritalStatus = data.info_marital_status || "N/A";
  const nationality = getNestedValue(data, 'info_nationality_id.name', 'N/A');
  const national = getNestedValue(data, 'info_national_id.name', 'N/A');

  // Contact & Documents
  const email = data.info_email || "N/A";
  const phoneNumber = data.info_phone_number || "N/A";
  const idCardNumber = data.info_id_card_number || "N/A";
  const passportNumber = data.info_passport_number || "N/A";
  const teacherUefId = data.info_teacher_uef_id || "N/A";

  // Address
  const bornHouseNumber = data.born_house_number || "";
  const bornStreetNumber = data.born_street_number || "";
  const bornVillageId = data.born_village_id || "";
  const bornZipCode = data.born_zip_code || "";
  
  const addressHouseNumber = data.address_house_number || "";
  const addressStreetNumber = data.address_street_number || "";
  const addressVillageId = data.address_village_id || "";
  const addressZipCode = data.address_zip_code || "";

  const bornAddress = [bornHouseNumber, bornStreetNumber, bornVillageId, bornZipCode]
    .filter(Boolean)
    .join(", ") || "N/A";
  
  const presentAddress = [addressHouseNumber, addressStreetNumber, addressVillageId, addressZipCode]
    .filter(Boolean)
    .join(", ") || "N/A";

  // Education (ALL items)
  const educationList = data.education || [];

  // Experience (ALL items)
  const experienceList = data.experience || [];

  // UEF Experience (ALL items)
  const uefExperienceList = data.uef_experience || [];

  // Other Organizations (ALL items)
  const otherOrgList = data.other_organizations || [];

  // Meta
  const note = data.note || "(មិនមាន)";
  const createdDate = data.created_date || null;
  const updatedDate = data.updated_date || null;
  const status = data.status ? "សកម្ម" : "អសកម្ម";
  const createdBy = data.created_by || "N/A";
  const updatedBy = data.updated_by || "N/A";

  // Subject
  const subject = data.info_subject_id?.name || "N/A";

  // Render function for Education items
  const renderEducationItems = () => {
    if (educationList.length === 0) {
      return <div className="text-muted siemreap-regular">មិនមានព័ត៌មានសិក្សា</div>;
    }

    return educationList.map((edu, index) => (
      <div key={index} className="card mb-2" style={{ background: "#f8f9fa", borderRadius: "8px", padding: "15px" }}>
        <div className="row">
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">កម្រិតសិក្សា</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {edu.degree_level_id?.name || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">មុខជំនាញ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {edu.major_id?.name || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">សាកលវិទ្យាល័យ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {edu.university_name || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ប្រទេស</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {edu.university_country || "N/A"}
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ឆ្នាំចាប់ផ្តើម</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {edu.start_year || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ឆ្នាំបញ្ចប់</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {edu.end_year || "N/A"}
            </div>
          </div>
          <div className="col-md-6">
            <label className="text-muted small siemreap-regular">ចំណងជើងនិក្ខេបបទ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {edu.title_final_paper || "N/A"}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  // Render function for Experience items
  const renderExperienceItems = () => {
    if (experienceList.length === 0) {
      return <div className="text-muted siemreap-regular">មិនមានបទពិសោធន៍ការងារ</div>;
    }

    return experienceList.map((exp, index) => (
      <div key={index} className="card mb-2" style={{ background: "#f8f9fa", borderRadius: "8px", padding: "15px" }}>
        <div className="row">
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">អង្គការ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {exp.organization || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">តួនាទី</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {exp.role || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ស្ថានភាព</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {exp.status || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ឆ្នាំ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {exp.year_start || "N/A"} - {exp.year_end || "N/A"}
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-12">
            <label className="text-muted small siemreap-regular">ទំនួលខុសត្រូវ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {exp.job_responsibility || "N/A"}
            </div>
          </div>
        </div>
        {exp.file && exp.file !== "N/A" && (
          <div className="row mt-2">
            <div className="col-md-12">
              <label className="text-muted small siemreap-regular">ឯកសារ</label>
              <div className="siemreap-regular" style={{ fontWeight: "500" }}>
                <a href={exp.file} target="_blank" rel="noopener noreferrer">
                  {exp.file}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    ));
  };

  // Render function for UEF Experience items
  const renderUEFExperienceItems = () => {
    if (uefExperienceList.length === 0) {
      return <div className="text-muted siemreap-regular">មិនមានបទពិសោធន៍នៅ UEF</div>;
    }

    return uefExperienceList.map((uef, index) => (
      <div key={index} className="card mb-2" style={{ background: "#f8f9fa", borderRadius: "8px", padding: "15px" }}>
        <div className="row">
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">តួនាទី</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {uef.role || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">អ្នកតែងតាំង</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {uef.appoint_by || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ឆ្នាំចាប់ផ្តើម</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {uef.year_start ? formatDate(uef.year_start) : "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ឆ្នាំបញ្ចប់</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {uef.year_end ? formatDate(uef.year_end) : "N/A"}
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-6">
            <label className="text-muted small siemreap-regular">ទំនួលខុសត្រូវ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {uef.job_responsibility || "N/A"}
            </div>
          </div>
          <div className="col-md-6">
            <label className="text-muted small siemreap-regular">ការពិពណ៌នាការងារ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {uef.job_description || "N/A"}
            </div>
          </div>
        </div>
        {uef.file && uef.file !== "N/A" && (
          <div className="row mt-2">
            <div className="col-md-12">
              <label className="text-muted small siemreap-regular">ឯកសារ</label>
              <div className="siemreap-regular" style={{ fontWeight: "500" }}>
                <a href={uef.file} target="_blank" rel="noopener noreferrer">
                  {uef.file}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    ));
  };

  // Render function for Other Organizations items
  const renderOtherOrgItems = () => {
    if (otherOrgList.length === 0) {
      return null;
    }

    return otherOrgList.map((org, index) => (
      <div key={index} className="card mb-2" style={{ background: "#f8f9fa", borderRadius: "8px", padding: "15px" }}>
        <div className="row">
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ស្ថាប័ន</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {org.organization || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">អង្គភាព</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {org.unit || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">តួនាទី</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {org.role || "N/A"}
            </div>
          </div>
          <div className="col-md-3">
            <label className="text-muted small siemreap-regular">ឆ្នាំចាប់ផ្តើម</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {org.year_start ? formatDate(org.year_start) : "N/A"}
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-12">
            <label className="text-muted small siemreap-regular">ទំនួលខុសត្រូវ</label>
            <div className="siemreap-regular" style={{ fontWeight: "500" }}>
              {org.job_responsibility || "N/A"}
            </div>
          </div>
        </div>
        {org.file && org.file !== "N/A" && (
          <div className="row mt-2">
            <div className="col-md-12">
              <label className="text-muted small siemreap-regular">ឯកសារ</label>
              <div className="siemreap-regular" style={{ fontWeight: "500" }}>
                <a href={org.file} target="_blank" rel="noopener noreferrer">
                  {org.file}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <>
  
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
            <div className="col-5">
              <label className="text-muted small siemreap-regular">គោត្តនាម (ឡាតាំង)</label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {firstNameEn}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">នាម (ឡាតាំង)</label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {lastNameEn}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">គោត្តនាម (ខ្មែរ)</label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {firstNameKh}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">នាម (ខ្មែរ)</label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {lastNameKh}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">ភេទ</label>
            </div>
            <div className="col-7">
              <span
                className="siemreap-regular"
                style={{
                  fontWeight: "500",
                  color: getGenderColor(gender),
                }}
              >
                {getGenderIcon(gender)} {getGenderLabel(gender)}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">ថ្ងៃខែឆ្នាំកំណើត</label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {formatDate(dob)}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <FaFlag className="me-1" /> ជាតិសាសន៍
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {national}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <FaFlag className="me-1" /> សញ្ជាតិ
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {nationality}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">ស្ថានភាពគ្រួសារ</label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {getMaritalStatus(maritalStatus)}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <FaUserTie className="me-1" /> មុខវិជ្ជា
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {subject}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <FaUserGraduate className="me-1" /> លេខអត្តសញ្ញាណ UEF
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {teacherUefId}
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
            <FaInfoCircle className="me-2" /> ព័ត៌មានទំនាក់ទំនង & ឯកសារ
          </h6>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <MdEmail className="me-1" /> អ៊ីមែល
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {email}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <MdPhoneIcon className="me-1" /> លេខទូរស័ព្ទ
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {phoneNumber}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <FaIdCard className="me-1" /> អត្តសញ្ញាណប័ណ្ណ
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {idCardNumber}
              </span>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-5">
              <label className="text-muted small siemreap-regular">
                <FaPassport className="me-1" /> លិខិតឆ្លងដែន
              </label>
            </div>
            <div className="col-7">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {passportNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <RowBreaker />

      {/* Addresses */}
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
            <FaMapMarkerAlt className="me-2" /> អាសយដ្ឋានកំណើត
          </h6>
          <div className="row mb-3">
            <div className="col-12">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {bornAddress}
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
            <MdLocationOn className="me-2" /> អាសយដ្ឋានបច្ចុប្បន្ន
          </h6>
          <div className="row mb-3">
            <div className="col-12">
              <span className="siemreap-regular" style={{ fontWeight: "500" }}>
                {presentAddress}
              </span>
            </div>
          </div>
        </div>
      </div>

      <RowBreaker />

      {/* Education - ALL ITEMS */}
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
            <FaGraduationCap className="me-2" /> ព័ត៌មានសិក្សា ({educationList.length})
          </h6>
          {renderEducationItems()}
        </div>
      </div>

      <RowBreaker />

      {/* Experience - ALL ITEMS */}
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
            <FaBriefcase className="me-2" /> បទពិសោធន៍ការងារ ({experienceList.length})
          </h6>
          {renderExperienceItems()}
        </div>
      </div>

      <RowBreaker />

      {/* UEF Experience - ALL ITEMS */}
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
            <FaUserTie className="me-2" /> ការងារនៅ UEF ({uefExperienceList.length})
          </h6>
          {renderUEFExperienceItems()}
        </div>
      </div>

      <RowBreaker />

      {/* Other Organizations - ALL ITEMS */}
      {otherOrgList.length > 0 && (
        <>
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
                <FaUsers className="me-2" /> អង្គភាពផ្សេងទៀត ({otherOrgList.length})
              </h6>
              {renderOtherOrgItems()}
            </div>
          </div>
          <RowBreaker />
        </>
      )}

      {/* Note */}
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
            <span className="siemreap-regular">{note}</span>
          </div>
        </div>
      </div>

      <RowBreaker />

      {/* Meta Information */}
      <div className="row">
        <div className="col-md-6">
          <small className="text-muted siemreap-regular">
            <FaCalendarAlt className="me-1" /> បង្កើតនៅ: {formatDate(createdDate)}
          </small>
          <br />
          
        </div>
        <div className="col-md-6 text-end">
          <small className="text-muted siemreap-regular">
            <FaCalendarAlt className="me-1" /> កែប្រែចុងក្រោយ: {formatDate(updatedDate)}
          </small>
      
        </div>
      </div>
    </>
  );
}

export default TeacherDetailTab;
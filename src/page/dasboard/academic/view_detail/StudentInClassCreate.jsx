import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getByIdRequest,
  getAllRequest,
  updateRequest,
} from "../../../../util/request_api";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import Loading from "../../../../component/Loading/Loading.component.jsx";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";
import { MdPersonAdd, MdSearch } from "react-icons/md";
import { FaTimes, FaUserPlus, FaSpinner, FaUser } from "react-icons/fa";
import Swal from "sweetalert2";

function StudentInClassCreate({ auth, onSuccess, onCancel, classId }) {
  const navigate = useNavigate();
  const swalToast = new SwalToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedStudentId = queryParams.get("studentId");

  const [studentPage, setStudentPage] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);
  const [studentHasMore, setStudentHasMore] = useState(false);
  const STUDENT_PAGE_SIZE = 20;

  const studentJoinedTypes = [
    { value: "new_student", label: "និស្សិតថ្មី" },
    { value: "passed_previous", label: "បានប្រឡងជាប់" },
    { value: "add_subject", label: "បន្ថែមមុខវិជ្ជា" },
  ];

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudent({ _id: preselectedStudentId });
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!studentSearch || studentSearch.length < 2) {
      setStudentSearchResults([]);
      setShowStudentDropdown(false);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchStudents(studentSearch);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [studentSearch]);

  async function searchStudents(search) {
    if (!search || search.length < 2) return;

    setIsSearchingStudent(true);
    setHasSearched(true);
    setShowStudentDropdown(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const studentApi = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/student`;

      const params = {
        page: 1,
        limit: STUDENT_PAGE_SIZE,
        q: search.trim(),
        q_key: JSON.stringify([
          "uef_code_id_card_number",
          "firstname",
          "lastname",
          "firstname_english",
          "lastname_english",
          "email",
          "id_card_number",
          "passport_number",
          "personal_contact",
        ]),
      };

      const result = await getAllRequest(studentApi, access_token, params);

      if (result.success) {
        const newStudents = result?.data?.data || [];
        const total = result?.data?.pagination?.total || 0;

        setStudentSearchResults(newStudents);
        setStudentTotal(total);
        setStudentPage(1);
        setStudentHasMore(
          newStudents.length === STUDENT_PAGE_SIZE &&
            1 * STUDENT_PAGE_SIZE < total,
        );
      }
    } catch (error) {
      console.error("❌ Error searching students:", error);
    } finally {
      setIsSearchingStudent(false);
    }
  }

  async function loadMoreStudents() {
    if (!studentHasMore || isSearchingStudent || !studentSearch) return;

    setIsSearchingStudent(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const studentApi = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/student`;

      const params = {
        page: studentPage + 1,
        limit: STUDENT_PAGE_SIZE,
        q: studentSearch.trim(),
        q_key: JSON.stringify([
          "uef_code_id_card_number",
          "firstname",
          "lastname",
          "firstname_english",
          "lastname_english",
          "email",
          "id_card_number",
          "passport_number",
          "personal_contact",
        ]),
      };

      const result = await getAllRequest(studentApi, access_token, params);

      if (result.success) {
        const newStudents = result?.data?.data || [];
        const total = result?.data?.pagination?.total || 0;

        setStudentSearchResults((prev) => [...prev, ...newStudents]);
        setStudentTotal(total);
        setStudentPage((prev) => prev + 1);
        setStudentHasMore(
          newStudents.length === STUDENT_PAGE_SIZE &&
            (studentPage + 1) * STUDENT_PAGE_SIZE < total,
        );
      }
    } catch (error) {
      console.error("❌ Error loading more students:", error);
    } finally {
      setIsSearchingStudent(false);
    }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(
      `${student.firstname} ${student.lastname} (${student.email || "N/A"})`,
    );
    setShowStudentDropdown(false);
    setStudentSearchResults([]);
    setHasSearched(false);
    showAddStudentDialog(student);
  };

  const showAddStudentDialog = (student) => {
    let typeOptionsHtml = "";
    studentJoinedTypes.forEach((type) => {
      typeOptionsHtml += `<option value="${type.value}">${type.label}</option>`;
    });

    Swal.fire({
      title: `បញ្ចូលនិស្សិត: ${student.firstname} ${student.lastname}`,
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>ឈ្មោះ:</strong> ${student.firstname} ${student.lastname}</p>
          <p><strong>អ៊ីមែល:</strong> ${student.email || "N/A"}</p>
          <p><strong>លេខអត្តសញ្ញាណ:</strong> ${student.id_card_number || "N/A"}</p>
          <hr/>
     
          <div style="margin-top: 10px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; font-family: 'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif;">កំណត់ចំណាំ</label>
            <input id="swal-note" type="text" class="swal2-input" placeholder="កំណត់ចំណាំ (ស្រេចចិត្ត)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-family: 'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif;" />
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1a3c2a",
      cancelButtonColor: "#d33",
      confirmButtonText: "បញ្ចូលនិស្សិត",
      cancelButtonText: "បោះបង់",
      width: 500,
      customClass: {
        popup: "swal2-popup",
        title: "swal2-title",
        htmlContainer: "swal2-html-container",
        confirmButton: "swal2-confirm",
        cancelButton: "swal2-cancel",
      },
      preConfirm: () => {
        const note = document.getElementById("swal-note")?.value || "";

        return { note };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        saveStudent(student, result.value.type, result.value.note);
      } else {
        setSelectedStudent(null);
        setStudentSearch("");
      }
    });
  };

  const saveStudent = async (student, note) => {
    setIsSaving(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;

      // Get current class data using getByIdRequest
      const getApi = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class/${classId}`;
      const result = await getByIdRequest(getApi, access_token);

      if (!result.success || !result.data) {
        swalToast.toastError("មិនអាចទាញយកទិន្នន័យថ្នាក់!", 3000);
        setIsSaving(false);
        return;
      }

      const classData = result.data;
      const currentStudents = classData.students || [];

      // Debug: log current students
      console.log("📋 Current students:", currentStudents.length);
      console.log(
        "📋 Current student IDs:",
        currentStudents.map((s) => s.student_id?._id || s.student_id),
      );

      // Check if student already exists
      const existingStudent = currentStudents.find((s) => {
        const id1 = s.student_id?._id || s.student_id;
        const id2 = student._id;
        return id1?.toString() === id2?.toString();
      });

      if (existingStudent) {
        swalToast.toastError("និស្សិតនេះមានក្នុងថ្នាក់រួចហើយ!", 3000);
        setIsSaving(false);
        return;
      }

      // Create new student entry - just the ID, backend handles rest
      const newStudent = {
        student_id: student._id,
      };

      // Add student to existing list (preserve all existing students)
      const updatedStudents = [...currentStudents, newStudent];

      console.log("📤 Updated students count:", updatedStudents.length);
      console.log(
        "📤 Updated student IDs:",
        updatedStudents.map((s) => s.student_id?._id || s.student_id),
      );

      // Prepare update data
      const updateData = {
        students: updatedStudents,
      };

      // Update class with new student
      const updateApi = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class/${classId}`;
      const updateResult = await updateRequest(
        updateApi,
        updateData,
        access_token,
      );

      if (updateResult.success) {
        swalToast.toastSuccess("បានបញ្ចូលនិស្សិតចូលថ្នាក់ដោយជោគជ័យ!", 2000);
        if (onSuccess) onSuccess();
        else navigate(`/admin/academic/class/view/${classId}`);
      } else {
        swalToast.toastError(
          "បរាជ័យ: " +
            (updateResult.message || "មានបញ្ហាក្នុងការបញ្ចូលនិស្សិត"),
          3000,
        );
      }
    } catch (error) {
      console.error("❌ Error:", error);
      swalToast.toastError("មានបញ្ហាក្នុងប្រព័ន្ធ! សូមព្យាយាមម្តងទៀត", 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setStudentSearchResults([]);
    setShowStudentDropdown(false);
    setHasSearched(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className="card shadow-sm"
      style={{
        borderRadius: "12px",
        border: "none",
        background: "#ffffff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <Loading is_loading={isLoading || isSaving} />

      <div
        className="card-header"
        style={{
          background: "linear-gradient(135deg, #1a3c2a 0%, #2d5a3d 100%)",
          color: "white",
          padding: "18px 24px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <h5
          className="mb-0"
          style={{
            fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
            fontWeight: "600",
          }}
        >
          <MdPersonAdd className="me-2" /> បញ្ចូលនិស្សិតក្នុងថ្នាក់
        </h5>
      </div>

      <div className="card-body" style={{ padding: "20px" }}>
        <div className="row">
          <div className="col-md-12">
            <div className="mb-3" ref={dropdownRef}>
              <label
                className="mb-2"
                style={{
                  fontFamily:
                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                <FaUser className="me-1" style={{ color: "#1a3c2a" }} />{" "}
                ស្វែងរកនិស្សិត <span style={{ color: "red" }}>*</span>
              </label>
              <div className="position-relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control"
                  placeholder="បញ្ចូលឈ្មោះ អ៊ីមែល ឬលេខអត្តសញ្ញាណ ដើម្បីស្វែងរក..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onFocus={() => {
                    if (
                      studentSearch.length >= 2 &&
                      studentSearchResults.length > 0
                    ) {
                      setShowStudentDropdown(true);
                    }
                  }}
                  style={{
                    paddingRight: "40px",
                    fontFamily:
                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                    borderColor: selectedStudent ? "#28a745" : "#ced4da",
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "10px 14px",
                    height: "44px",
                  }}
                />
                {selectedStudent && (
                  <div
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#28a745",
                    }}
                  >
                    <FaUserPlus size={18} />
                  </div>
                )}
                {studentSearch && !selectedStudent && (
                  <button
                    type="button"
                    className="position-absolute btn btn-link p-0"
                    style={{
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                    }}
                    onClick={handleClearStudent}
                  >
                    <FaTimes size={16} />
                  </button>
                )}

                {showStudentDropdown && (
                  <div
                    className="position-absolute w-100 mt-1"
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      maxHeight: "300px",
                      overflowY: "auto",
                      zIndex: 1000,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {isSearchingStudent ? (
                      <div className="text-center py-3">
                        <FaSpinner
                          className="spinner-border text-primary"
                          style={{ fontSize: "24px" }}
                        />
                        <p
                          className="mb-0 text-muted mt-2"
                          style={{
                            fontFamily:
                              "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                          }}
                        >
                          កំពុងស្វែងរក...
                        </p>
                      </div>
                    ) : studentSearchResults.length > 0 ? (
                      <>
                        {studentSearchResults.map((student) => (
                          <div
                            key={student._id}
                            className="d-flex align-items-center p-3"
                            style={{
                              cursor: "pointer",
                              borderBottom: "1px solid #f0f0f0",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f8f9fa";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                            onClick={() => handleSelectStudent(student)}
                          >
                            <div className="flex-grow-1">
                              <div
                                style={{
                                  fontFamily:
                                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                  fontWeight: "500",
                                }}
                              >
                                {student.firstname} {student.lastname}
                              </div>
                              <div
                                className="text-muted small"
                                style={{
                                  fontFamily:
                                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                }}
                              >
                                {student.email}{" "}
                                {student.id_card_number &&
                                  `| ${student.id_card_number}`}
                              </div>
                            </div>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "#1a3c2a",
                                color: "white",
                                borderRadius: "6px",
                                padding: "4px 14px",
                                fontFamily:
                                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                              }}
                            >
                              ជ្រើស
                            </button>
                          </div>
                        ))}
                        {studentHasMore && (
                          <div className="text-center py-2 border-top">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              style={{
                                fontFamily:
                                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                              }}
                              onClick={loadMoreStudents}
                              disabled={isSearchingStudent}
                            >
                              {isSearchingStudent
                                ? "កំពុងផ្ទុក..."
                                : "ផ្ទុកបន្ថែម..."}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      hasSearched &&
                      studentSearch.length >= 2 && (
                        <div
                          className="text-center py-3 text-muted"
                          style={{
                            fontFamily:
                              "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                          }}
                        >
                          <MdSearch className="me-1" />{" "}
                          មិនឃើញនិស្សិតដែលត្រូវនឹងការស្វែងរក
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <RowBreaker break={2} />

        {selectedStudent && (
          <div className="row">
            <div className="col-md-12">
              <div
                className="alert alert-success"
                style={{
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontFamily:
                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                }}
              >
                <FaUserPlus className="me-2" />{" "}
                <strong>និស្សិតដែលបានជ្រើស:</strong>
                <span className="ms-2">
                  {selectedStudent.firstname} {selectedStudent.lastname}
                </span>
                <span className="ms-3 text-muted">
                  | {selectedStudent.email || "N/A"}
                </span>
                <button
                  className="btn btn-sm ms-3"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc3545",
                  }}
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentSearch("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        )}

        <RowBreaker break={2} />

        <div className="row">
          <div
            className="col-md-12 text-end"
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button
              className="btn"
              onClick={handleCancel}
              style={{
                background: "#f0f0f0",
                color: "#333",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontFamily:
                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                fontWeight: "500",
              }}
            >
              <FaTimes className="me-1" /> បោះបង់
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentInClassCreate;

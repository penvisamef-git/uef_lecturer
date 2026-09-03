import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaClock,
  FaUser,
  FaBook,
  FaDoorOpen,
  FaChartBar,
  FaSearch,
  FaUserPlus,
  FaSpinner,
} from "react-icons/fa";
import { getAllRequest, updateRequest } from "../../../../util/request_api";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import Loading from "../../../../component/Loading/Loading.component.jsx";
import CustomInput from "../../../../component/Input/CustomInput.component";
import CustomSelect from "../../../../component/Select/CustomSelect.component.jsx";

function AcademicTableCreate({
  class_id,
  auth,
  onSuccess,
  onCancel,
  existingData,
}) {
  const navigate = useNavigate();
  const swalToast = new SwalToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [scoreOptions, setScoreOptions] = useState([]);

  const [schedule, setSchedule] = useState([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherSearchResults, setTeacherSearchResults] = useState([]);
  const [isSearchingTeacher, setIsSearchingTeacher] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [hasSearchedTeacher, setHasSearchedTeacher] = useState(false);
  const teacherDropdownRef = useRef(null);
  const teacherSearchInputRef = useRef(null);

  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectSearchResults, setSubjectSearchResults] = useState([]);
  const [isSearchingSubject, setIsSearchingSubject] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [hasSearchedSubject, setHasSearchedSubject] = useState(false);
  const subjectDropdownRef = useRef(null);

  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherTotal, setTeacherTotal] = useState(0);
  const [teacherHasMore, setTeacherHasMore] = useState(false);
  const TEACHER_PAGE_SIZE = 20;

  const [subjectPage, setSubjectPage] = useState(1);
  const [subjectTotal, setSubjectTotal] = useState(0);
  const [subjectHasMore, setSubjectHasMore] = useState(false);
  const SUBJECT_PAGE_SIZE = 20;

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedTeacherForSubject, setSelectedTeacherForSubject] =
    useState(null);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const khmerDays = {
    Monday: "ច័ន្ទ",
    Tuesday: "អង្គារ",
    Wednesday: "ពុធ",
    Thursday: "ព្រហស្បតិ៍",
    Friday: "សុក្រ",
    Saturday: "សៅរ៍",
    Sunday: "អាទិត្យ",
  };

  const timeOptions = [];
  for (let hour = 7; hour <= 21; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    timeOptions.push(`${hourStr}:00`);
    timeOptions.push(`${hourStr}:30`);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        teacherDropdownRef.current &&
        !teacherDropdownRef.current.contains(event.target)
      ) {
        setShowTeacherDropdown(false);
      }
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target)
      ) {
        setShowSubjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!teacherSearch || teacherSearch.length < 2) {
      setTeacherSearchResults([]);
      setShowTeacherDropdown(false);
      setHasSearchedTeacher(false);
      return;
    }
    const delay = setTimeout(() => searchTeachers(teacherSearch), 400);
    return () => clearTimeout(delay);
  }, [teacherSearch]);

  useEffect(() => {
    if (!subjectSearch || subjectSearch.length < 2) {
      setSubjectSearchResults([]);
      setShowSubjectDropdown(false);
      setHasSearchedSubject(false);
      return;
    }
    const delay = setTimeout(() => searchSubjects(subjectSearch), 400);
    return () => clearTimeout(delay);
  }, [subjectSearch]);

  async function loadData() {
    setIsLoading(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;

      const teacherApi = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/teacher-all`;
      const teacherResult = await getAllRequest(teacherApi, access_token);
      if (teacherResult.success) setTeachers(teacherResult?.data?.data || []);

      const subjectApi = `${process.env.REACT_APP_API_HOST}/api/admin/subject-and-major/subject-all`;
      const subjectResult = await getAllRequest(subjectApi, access_token);
      if (subjectResult.success) setSubjects(subjectResult?.data?.data || []);

      // Load rooms with building and floor populated
      const roomApi = `${process.env.REACT_APP_API_HOST}/api/admin/building-management/room-all`;
      const roomResult = await getAllRequest(roomApi, access_token);
      if (roomResult.success) {
        const roomsWithDetails = roomResult?.data?.data || [];
        // Format room data with building and floor info
        const formattedRooms = roomsWithDetails.map((room) => ({
          ...room,
          displayName: `${room.name} ${room.floor_id?.name ? `, ${room.floor_id.name} - ${room.building_data?.name}` : ""} ${room.floor_id?.building_id?.name ? `(${room.floor_id.building_id.name})` : ""}`,
        }));
        setRooms(formattedRooms);
      }

      const scoreOptionApi = `${process.env.REACT_APP_API_HOST}/api/admin/master-data/score-option-all`;
      const scoreOptionResult = await getAllRequest(
        scoreOptionApi,
        access_token,
      );
      if (scoreOptionResult.success)
        setScoreOptions(scoreOptionResult?.data?.data || []);

      if (existingData?.schedule && existingData.schedule.length > 0) {
        setIsEditMode(true);
        const existingSchedule = existingData.schedule || [];
        const existingNote = existingData.note || "";
        const existingStatus =
          existingData.status !== undefined ? existingData.status : true;

        const teacherMap = new Map();
        existingSchedule.forEach((item) => {
          const teacherId = item.teacher_id?._id || item.teacher_id;
          if (!teacherMap.has(teacherId)) {
            teacherMap.set(teacherId, {
              teacher_id: teacherId,
              teacher_name:
                item.teacher_id?.info_firstname_kh + " " + item.teacher_id?.info_lastname_kh ||
                "",
              subjects: [],
            });
          }
          teacherMap.get(teacherId).subjects.push({
            subject_id: item.subject_id?._id || item.subject_id || "",
            subject_name: item.subject_id?.name || "",
            room_id: item.room_id?._id || item.room_id || "",
            session_total: item.session_total || 1,
            session_have_teach: item.session_have_teach || 0,
            score_option_id:
              item.score_option_id?._id || item.score_option_id || "",
            subject_status: item.subject_status || "pending",
            note: item.note || "",
            periods: (item.periods || []).map((period) => ({
              day: period.day || "",
              time_from: period.time_from || "",
              time_to: period.time_to || "",
              period_number: period.period_number,
              session_number: period.session_number || period.period_number,
              status: period.status || "pending",
              note: period.note || "",
            })),
          });
        });
        setSchedule(Array.from(teacherMap.values()));
        setNote(existingNote);
        setStatus(existingStatus);
      } else {
        setSchedule([]);
        setNote("");
        setStatus(true);
      }
    } catch (error) {
      console.error("❌ Error loading data:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 2000);
    } finally {
      setIsLoading(false);
    }
  }

  async function searchTeachers(search) {
    if (!search || search.length < 2) return;
    setIsSearchingTeacher(true);
    setHasSearchedTeacher(true);
    setShowTeacherDropdown(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const teacherApi = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/teacher`;
      const params = {
        page: 1,
        limit: TEACHER_PAGE_SIZE,
        q: search.trim(),
        q_key: JSON.stringify([
          "info_firstname_en",
          "info_lastname_en",
          "info_firstname_kh",
          "info_lastname_kh",
          "info_email",
          "info_id_card_number", 
          "info_passport_number",
          "info_phone_number",
          "info_teacher_uef_id"
        ]),
      };
      const result = await getAllRequest(teacherApi, access_token, params);
      if (result.success) {
        const newTeachers = result?.data?.data || [];
        const total = result?.data?.pagination?.total || 0;
        setTeacherSearchResults(newTeachers);
        setTeacherTotal(total);
        setTeacherPage(1);
        setTeacherHasMore(
          newTeachers.length === TEACHER_PAGE_SIZE &&
            1 * TEACHER_PAGE_SIZE < total,
        );
      }
    } catch (error) {
      console.error("❌ Error searching teachers:", error);
    } finally {
      setIsSearchingTeacher(false);
    }
  }

  async function loadMoreTeachers() {
    if (!teacherHasMore || isSearchingTeacher || !teacherSearch) return;
    setIsSearchingTeacher(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const teacherApi = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/teacher`;
      const params = {
        page: teacherPage + 1,
        limit: TEACHER_PAGE_SIZE,
        q: teacherSearch.trim(),
        q_key: JSON.stringify([
           "info_firstname_en",
          "info_lastname_en",
          "info_firstname_kh",
          "info_lastname_kh",
          "info_email",
          "info_id_card_number", 
          "info_passport_number",
          "info_phone_number",
          "info_teacher_uef_id"
        ]),
      };
      const result = await getAllRequest(teacherApi, access_token, params);
      if (result.success) {
        const newTeachers = result?.data?.data || [];
        const total = result?.data?.pagination?.total || 0;
        setTeacherSearchResults((prev) => [...prev, ...newTeachers]);
        setTeacherTotal(total);
        setTeacherPage((prev) => prev + 1);
        setTeacherHasMore(
          newTeachers.length === TEACHER_PAGE_SIZE &&
            (teacherPage + 1) * TEACHER_PAGE_SIZE < total,
        );
      }
    } catch (error) {
      console.error("❌ Error loading more teachers:", error);
    } finally {
      setIsSearchingTeacher(false);
    }
  }

  async function searchSubjects(search) {
    if (!search || search.length < 2) return;
    setIsSearchingSubject(true);
    setHasSearchedSubject(true);
    setShowSubjectDropdown(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const subjectApi = `${process.env.REACT_APP_API_HOST}/api/admin/subject-and-major/subject`;
      const params = {
        page: 1,
        limit: SUBJECT_PAGE_SIZE,
        q: search.trim(),
        q_key: JSON.stringify(["name", "code"]),
      };
      const result = await getAllRequest(subjectApi, access_token, params);
      if (result.success) {
        const newSubjects = result?.data?.data || [];
        const total = result?.data?.pagination?.total || 0;
        setSubjectSearchResults(newSubjects);
        setSubjectTotal(total);
        setSubjectPage(1);
        setSubjectHasMore(
          newSubjects.length === SUBJECT_PAGE_SIZE &&
            1 * SUBJECT_PAGE_SIZE < total,
        );
      }
    } catch (error) {
      console.error("❌ Error searching subjects:", error);
    } finally {
      setIsSearchingSubject(false);
    }
  }

  async function loadMoreSubjects() {
    if (!subjectHasMore || isSearchingSubject || !subjectSearch) return;
    setIsSearchingSubject(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const subjectApi = `${process.env.REACT_APP_API_HOST}/api/admin/subject-and-major/subject`;
      const params = {
        page: subjectPage + 1,
        limit: SUBJECT_PAGE_SIZE,
        q: subjectSearch.trim(),
        q_key: JSON.stringify(["name", "code"]),
      };
      const result = await getAllRequest(subjectApi, access_token, params);
      if (result.success) {
        const newSubjects = result?.data?.data || [];
        const total = result?.data?.pagination?.total || 0;
        setSubjectSearchResults((prev) => [...prev, ...newSubjects]);
        setSubjectTotal(total);
        setSubjectPage((prev) => prev + 1);
        setSubjectHasMore(
          newSubjects.length === SUBJECT_PAGE_SIZE &&
            (subjectPage + 1) * SUBJECT_PAGE_SIZE < total,
        );
      }
    } catch (error) {
      console.error("❌ Error loading more subjects:", error);
    } finally {
      setIsSearchingSubject(false);
    }
  }

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherSearch(
      `${teacher.info_firstname_kh} ${teacher.info_lastname_kh} (${teacher.info_firstname_en} ${teacher.info_lastname_en}) - ${teacher.info_email || "N/A"}`,
    );
    setShowTeacherDropdown(false);
    setTeacherSearchResults([]);
    setHasSearchedTeacher(false);
    setSelectedTeacherForSubject(teacher);
  };

  const handleAddSubjectToTeacher = (subject) => {
    if (!selectedTeacherForSubject) {
      swalToast.toastError("សូមជ្រើសរើសគ្រូបង្រៀនមុន!", 2000);
      return;
    }

    const newSchedule = [...schedule];
    let teacherEntry = newSchedule.find(
      (t) => t.teacher_id === selectedTeacherForSubject._id,
    );
    if (!teacherEntry) {
      teacherEntry = {
        teacher_id: selectedTeacherForSubject._id,
        teacher_name: `${selectedTeacherForSubject.info_firstname_kh} ${selectedTeacherForSubject.info_lastname_kh}`,
        subjects: [],
      };
      newSchedule.push(teacherEntry);
    }

    teacherEntry.subjects.push({
      subject_id: subject._id,
      subject_name: subject.name,
      room_id: "",
      session_total: 1,
      session_have_teach: 0,
      score_option_id: "",
      subject_status: "pending",
      note: "",
      periods: [
        {
          day: selectedDay,
          time_from: "",
          time_to: "",
          period_number: 1,
          session_number: 1,
          status: "pending",
          note: "",
        },
      ],
    });

    setSchedule(newSchedule);
    setSubjectSearch("");
    setSubjectSearchResults([]);
    setShowSubjectDropdown(false);
    setHasSearchedSubject(false);
  };

  const addPeriodToSubject = (teacherIndex, subjectIndex) => {
    const newSchedule = [...schedule];
    const subject = newSchedule[teacherIndex].subjects[subjectIndex];
    const periodNumber = subject.periods.length + 1;
    subject.periods.push({
      day: selectedDay,
      time_from: "",
      time_to: "",
      period_number: periodNumber,
      session_number: periodNumber,
      status: "pending",
      note: "",
    });
    subject.session_total = subject.periods.length;
    setSchedule(newSchedule);
  };

  const removePeriod = (teacherIndex, subjectIndex, periodIndex) => {
    const newSchedule = [...schedule];
    const subject = newSchedule[teacherIndex].subjects[subjectIndex];
    const periods = subject.periods;
    periods.splice(periodIndex, 1);
    periods.forEach((period, idx) => {
      period.period_number = idx + 1;
      period.session_number = idx + 1;
    });
    subject.session_total = periods.length;
    setSchedule(newSchedule);
  };

  const removeSubject = (teacherIndex, subjectIndex) => {
    const newSchedule = [...schedule];
    newSchedule[teacherIndex].subjects.splice(subjectIndex, 1);
    if (newSchedule[teacherIndex].subjects.length === 0)
      newSchedule.splice(teacherIndex, 1);
    setSchedule(newSchedule);
  };

  const removeTeacher = (teacherIndex) => {
    const newSchedule = [...schedule];
    newSchedule.splice(teacherIndex, 1);
    setSchedule(newSchedule);
  };

  const updateSubjectField = (teacherIndex, subjectIndex, field, value) => {
    const newSchedule = [...schedule];
    const subject = newSchedule[teacherIndex].subjects[subjectIndex];
    subject[field] = value;
    setSchedule(newSchedule);
  };

  const updatePeriodField = (
    teacherIndex,
    subjectIndex,
    periodIndex,
    field,
    value,
  ) => {
    const newSchedule = [...schedule];
    newSchedule[teacherIndex].subjects[subjectIndex].periods[periodIndex][
      field
    ] = value;
    setSchedule(newSchedule);
  };

  const handleClearTeacher = () => {
    setSelectedTeacher(null);
    setSelectedTeacherForSubject(null);
    setTeacherSearch("");
    setTeacherSearchResults([]);
    setShowTeacherDropdown(false);
    setHasSearchedTeacher(false);
    if (teacherSearchInputRef.current) teacherSearchInputRef.current.focus();
  };

  const handleSave = async () => {
    let hasError = false;

    schedule.forEach((teacher) => {
      teacher.subjects.forEach((subject) => {
        if (!subject.subject_id || !subject.room_id) hasError = true;
        subject.periods.forEach((period) => {
          if (!period.time_from || !period.time_to || !period.day)
            hasError = true;
        });
      });
    });

    if (hasError) {
      swalToast.toastError("សូមបំពេញព័ត៌មានឱ្យបានពេញលេញ!", 2000);
      return;
    }

    const preparedSchedule = [];

    schedule.forEach((teacher) => {
      teacher.subjects.forEach((subject) => {
        const periodsByDay = {};
        subject.periods.forEach((period) => {
          if (!periodsByDay[period.day]) periodsByDay[period.day] = [];
          periodsByDay[period.day].push({
            day: period.day,
            time_from: period.time_from,
            time_to: period.time_to,
            period_number: period.period_number,
            session_number: period.session_number || period.period_number,
            status: period.status || "pending",
            note: period.note || "",
          });
        });

        Object.keys(periodsByDay).forEach((day) => {
          const subjectEntry = {
            day: day,
            subject_id: subject.subject_id,
            teacher_id: teacher.teacher_id,
            room_id: subject.room_id,
            session_total: subject.session_total || periodsByDay[day].length,
            session_have_teach: subject.session_have_teach || 0,
            subject_status: subject.subject_status || "pending",
            periods: periodsByDay[day].map((p, index) => ({
              ...p,
              period_number: index + 1,
              session_number: index + 1,
            })),
          };

          if (subject.score_option_id) {
            subjectEntry.score_option_id = subject.score_option_id;
          }
          if (subject.note) {
            subjectEntry.note = subject.note;
          }

          preparedSchedule.push(subjectEntry);
        });
      });
    });

    if (preparedSchedule.length === 0) {
      swalToast.toastError("សូមបន្ថែមយ៉ាងហោចណាស់មួយមុខវិជ្ជា!", 2000);
      return;
    }

    const preparedData = {
      schedule: preparedSchedule,
      note: note || "",
    };
    if (status !== undefined) preparedData.status = status;

    console.log("📤 Sending data:", JSON.stringify(preparedData, null, 2));

    setIsSaving(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/class/${class_id}`;
      const result = await updateRequest(api, preparedData, access_token);

      if (result.success) {
        swalToast.toastSuccess(
          isEditMode
            ? "បានកែប្រែកាលវិភាគដោយជោគជ័យ!"
            : "បានបង្កើតកាលវិភាគដោយជោគជ័យ!",
          2000,
        );
        if (onSuccess) onSuccess();
      } else {
        swalToast.toastError(
          "បរាជ័យ: " + (result.message || "មានបញ្ហាក្នុងការរក្សាទុក"),
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

  const getFilteredTimeOptions = (selectedTime) => {
    if (!selectedTime) return timeOptions;
    const index = timeOptions.indexOf(selectedTime);
    return timeOptions.slice(index >= 0 ? index : 0);
  };

  // Room options with building and floor info
  const roomOptions = rooms.map((r) => ({
    value: r._id,
    label: r.displayName || r.name,
  }));

  const scoreOptionOptions = scoreOptions.map((s) => ({
    value: s._id,
    label: s.name,
  }));

  const getSelectState = (value, options, defaultTitle) => {
    const foundOption = options.find((opt) => opt.value === value);
    return {
      title: "",
      id: `select-${Date.now()}`,
      required: false,
      is_correct: true,
      error: "",
      data: options,
      value: value || "",
      defualtValue: value || "",
      defualtTitle: foundOption ? foundOption.label : defaultTitle,
      display: "flex",
    };
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
      {isLoading || isSaving ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
          }}
        >
          <Loading is_loading={true} />
        </div>
      ) : (
        <>
          <div
            className="card-header"
            style={{
              background: "linear-gradient(135deg, #1a3c2a 0%, #2d5a3d 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            <h5
              className="mb-0"
              style={{
                fontFamily:
                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                fontWeight: "600",
              }}
            >
              <FaClock className="me-2" />
              {isEditMode ? "កែប្រែកាលវិភាគ" : "បង្កើតកាលវិភាគថ្មី"}
            </h5>
            <button
              className="btn btn-sm btn-light"
              onClick={onCancel}
              style={{
                borderRadius: "8px",
                padding: "6px 14px",
                fontFamily:
                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
              }}
            >
              <FaTimes className="me-1" /> បិទ
            </button>
          </div>

          <div className="card-body" style={{ padding: "20px" }}>
            {/* Teacher Search Section */}
            <div className="row mb-3">
              <div className="col-md-12">
                <div ref={teacherDropdownRef}>
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
                    ស្វែងរកគ្រូបង្រៀន <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      ref={teacherSearchInputRef}
                      type="text"
                      className="form-control"
                      placeholder="បញ្ចូលឈ្មោះ អ៊ីមែល គ្រូបង្រៀន ដើម្បីស្វែងរក..."
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      onFocus={() => {
                        if (
                          teacherSearch.length >= 2 &&
                          teacherSearchResults.length > 0
                        )
                          setShowTeacherDropdown(true);
                      }}
                      style={{
                        paddingRight: "40px",
                        fontFamily:
                          "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        borderColor: selectedTeacher ? "#28a745" : "#ced4da",
                        borderRadius: "8px",
                        fontSize: "14px",
                        padding: "10px 14px",
                        height: "44px",
                      }}
                    />
                    {selectedTeacher && (
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
                    {teacherSearch && !selectedTeacher && (
                      <button
                        type="button"
                        className="position-absolute btn btn-link p-0"
                        style={{
                          right: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6c757d",
                        }}
                        onClick={handleClearTeacher}
                      >
                        <FaTimes size={16} />
                      </button>
                    )}

                    {/* Teacher Dropdown Results */}
                    {showTeacherDropdown && (
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
                        {isSearchingTeacher ? (
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
                        ) : teacherSearchResults.length > 0 ? (
                          <>
                            {teacherSearchResults.map((teacher) => (
                              <div
                                key={teacher._id}
                                className="d-flex align-items-center p-3"
                                style={{
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f0f0f0",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f8f9fa")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                                onClick={() => handleSelectTeacher(teacher)}
                              >
                                <div className="flex-grow-1">
                                  <div
                                    style={{
                                      fontFamily:
                                        "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {teacher.info_firstname_kh} {teacher.info_lastname_kh} ({teacher.info_firstname_en} {teacher.info_lastname_en}) - {teacher.info_email || "N/A"} | UEF: {teacher.info_teacher_uef_id} 
                                  </div>
                                  <div
                                    className="text-muted small"
                                    style={{
                                      fontFamily:
                                        "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                    }}
                                  >
                                    {teacher.email}{" "}
                                    {teacher.id_card_number &&
                                      `| ${teacher.id_card_number}`}
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
                            {teacherHasMore && (
                              <div className="text-center py-2 border-top">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  style={{
                                    fontFamily:
                                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                  }}
                                  onClick={loadMoreTeachers}
                                  disabled={isSearchingTeacher}
                                >
                                  {isSearchingTeacher
                                    ? "កំពុងផ្ទុក..."
                                    : "ផ្ទុកបន្ថែម..."}
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          hasSearchedTeacher &&
                          teacherSearch.length >= 2 && (
                            <div
                              className="text-center py-3 text-muted"
                              style={{
                                fontFamily:
                                  "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                              }}
                            >
                              <FaSearch className="me-1" />{" "}
                              មិនឃើញគ្រូបង្រៀនដែលត្រូវនឹងការស្វែងរក
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Teacher Info */}
            {selectedTeacherForSubject && (
              <div
                className="alert alert-success"
                style={{
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontFamily:
                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                }}
              >
                <FaUser className="me-2" />{" "}
                <strong>គ្រូបង្រៀនដែលបានជ្រើស:</strong>{" "}
                {selectedTeacherForSubject.firstname}{" "}
                {selectedTeacherForSubject.lastname}
                <button
                  className="btn btn-sm ms-3"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc3545",
                  }}
                  onClick={() => {
                    setSelectedTeacherForSubject(null);
                    setSelectedTeacher(null);
                    setTeacherSearch("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* Subject Search Section */}
            {selectedTeacherForSubject && (
              <div className="row mb-3">
                <div className="col-md-12">
                  <div ref={subjectDropdownRef}>
                    <label
                      className="mb-2"
                      style={{
                        fontFamily:
                          "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        fontWeight: "500",
                        fontSize: "14px",
                      }}
                    >
                      <FaBook className="me-1" style={{ color: "#1a3c2a" }} />{" "}
                      ស្វែងរកមុខវិជ្ជាសម្រាប់{" "}
                      {selectedTeacherForSubject.info_firstname_kh}{" "}
                      {selectedTeacherForSubject.info_lastname_kh}
                    </label>
                    <div className="d-flex gap-2">
                      <div className="position-relative flex-grow-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="បញ្ចូលឈ្មោះ ឬកូដមុខវិជ្ជា..."
                          value={subjectSearch}
                          onChange={(e) => setSubjectSearch(e.target.value)}
                          onFocus={() => {
                            if (
                              subjectSearch.length >= 2 &&
                              subjectSearchResults.length > 0
                            )
                              setShowSubjectDropdown(true);
                          }}
                          style={{
                            paddingRight: "40px",
                            borderRadius: "8px",
                            fontFamily:
                              "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                            fontSize: "14px",
                            padding: "10px 14px",
                            height: "44px",
                          }}
                        />
                        {subjectSearch && (
                          <button
                            type="button"
                            className="position-absolute btn btn-link p-0"
                            style={{
                              right: "8px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#6c757d",
                            }}
                            onClick={() => {
                              setSubjectSearch("");
                              setSubjectSearchResults([]);
                            }}
                          >
                            <FaTimes size={16} />
                          </button>
                        )}

                        {/* Subject Dropdown Results */}
                        {showSubjectDropdown && (
                          <div
                            className="position-absolute w-100 mt-1"
                            style={{
                              background: "white",
                              borderRadius: "8px",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                              maxHeight: "250px",
                              overflowY: "auto",
                              zIndex: 1000,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            {isSearchingSubject ? (
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
                            ) : subjectSearchResults.length > 0 ? (
                              <>
                                {subjectSearchResults.map((subject) => (
                                  <div
                                    key={subject._id}
                                    className="d-flex align-items-center p-3"
                                    style={{
                                      cursor: "pointer",
                                      borderBottom: "1px solid #f0f0f0",
                                    }}
                                    onClick={() =>
                                      handleAddSubjectToTeacher(subject)
                                    }
                                  >
                                    <div className="flex-grow-1">
                                      <div
                                        style={{
                                          fontFamily:
                                            "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {subject.name}
                                      </div>
                                      <div
                                        className="text-muted small"
                                        style={{
                                          fontFamily:
                                            "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                        }}
                                      >
                                        {subject.code && (
                                          <span>កូដ: {subject.code}</span>
                                        )}{" "}
                                        {subject.major_id && (
                                          <span className="ms-2">
                                            <FaBook
                                              size={10}
                                              className="me-1"
                                            />
                                            {subject.major_id.name || "N/A"}
                                          </span>
                                        )}
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
                                      បន្ថែម
                                    </button>
                                  </div>
                                ))}
                                {subjectHasMore && (
                                  <div className="text-center py-2 border-top">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      style={{
                                        fontFamily:
                                          "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                      }}
                                      onClick={loadMoreSubjects}
                                      disabled={isSearchingSubject}
                                    >
                                      {isSearchingSubject
                                        ? "កំពុងផ្ទុក..."
                                        : "ផ្ទុកបន្ថែម..."}
                                    </button>
                                  </div>
                                )}
                              </>
                            ) : (
                              hasSearchedSubject &&
                              subjectSearch.length >= 2 && (
                                <div
                                  className="text-center py-3 text-muted"
                                  style={{
                                    fontFamily:
                                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                  }}
                                >
                                  <FaSearch className="me-1" />{" "}
                                  មិនឃើញមុខវិជ្ជាដែលត្រូវនឹងការស្វែងរក
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ minWidth: "160px" }}>
                        <select
                          className="form-select"
                          value={selectedDay}
                          onChange={(e) => setSelectedDay(e.target.value)}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #ced4da",
                            height: "44px",
                            fontFamily:
                              "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          {days.map((day) => (
                            <option key={day} value={day}>
                              {khmerDays[day]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Table - Merged Teacher & Subject columns */}
            <div className="table-responsive" style={{ marginTop: "15px" }}>
              <table
                className="table table-bordered table-hover"
                style={{
                  minWidth: "1200px",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  fontFamily:
                    "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                }}
              >
                <thead
                  style={{
                    background: "#f0f4f0",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th
                      className="text-center"
                      style={{
                        padding: "10px 8px",
                        fontWeight: "600",
                        color: "#1a3c2a",
                        width: "40%",
                        minWidth: "100px",
                      }}
                    >
                      <FaBook className="me-1" />
                      សាស្ត្រាចារ្យ &amp; មុខវិជ្ជា
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "10px 8px",
                        fontWeight: "600",
                        color: "#1a3c2a",
                        width: "30%",
                        minWidth: "100px",
                      }}
                    >
                      <FaDoorOpen className="me-1" /> បន្ទប់
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "10px 8px",
                        fontWeight: "600",
                        color: "#1a3c2a",
                        width: "30%",
                        minWidth: "110px",
                      }}
                    >
                      <FaChartBar className="me-1" /> រចនាសម្ព័ន្ធពិន្ទុ
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "10px 8px",
                        fontWeight: "600",
                        color: "#1a3c2a",
                        width: "320px",
                        minWidth: "320px",
                      }}
                    >
                      <FaClock className="me-1" /> ម៉ោងសិក្សា (ថ្ងៃ / ម៉ោង)
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "10px 8px",
                        fontWeight: "600",
                        color: "#1a3c2a",
                        width: "100px",
                        minWidth: "100px",
                      }}
                    >
                      វគ្គ (Session)
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "10px 8px",
                        fontWeight: "600",
                        color: "#1a3c2a",
                        width: "70px",
                        minWidth: "70px",
                      }}
                    >
                      សកម្មភាព
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center text-muted py-5"
                        style={{
                          fontFamily:
                            "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                        }}
                      >
                        <FaUser
                          size={40}
                          className="mb-3"
                          style={{ color: "#ddd" }}
                        />
                        <br />
                        សូមស្វែងរកគ្រូបង្រៀន និងបន្ថែមមុខវិជ្ជា
                      </td>
                    </tr>
                  ) : (
                    schedule.map((teacher, teacherIndex) => (
                      <React.Fragment key={teacherIndex}>
                        {teacher.subjects.map((subject, subjectIndex) => {
                          const roomState = getSelectState(
                            subject.room_id,
                            roomOptions,
                            "ជ្រើសរើស",
                          );
                          const scoreOptionState = getSelectState(
                            subject.score_option_id,
                            scoreOptionOptions,
                            "ជ្រើសរើស",
                          );
                          const isFirstRow = subjectIndex === 0;
                          const rowSpan = teacher.subjects.length;

                          return (
                            <tr
                              key={`${teacherIndex}-${subjectIndex}`}
                              style={{
                                backgroundColor:
                                  subjectIndex % 2 === 0
                                    ? "#ffffff"
                                    : "#f8faf8",
                              }}
                            >
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "6px 4px 5px",
                                }}
                              >
                                <label
                                  style={{
                                    fontWeight: "bolder",
                                    fontFamily:
                                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                  }}
                                >
                                
                                  សាស្ត្រាចារ្យ: {teacher.teacher_name || "N/A"}
                                </label>
                                <br />
                                <label
                                  style={{
                                    marginTop: "4px",
                                    fontFamily:
                                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                  }}
                                >
                                  មុខវិជ្ជា:{" "}
                                  {subject.subject_name ||
                                    subjects.find(
                                      (s) => s._id === subject.subject_id,
                                    )?.name ||
                                    "N/A"}
                                </label>
                              </td>
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "6px 4px",
                                }}
                              >
                                <CustomSelect
                                  key={`room-${teacherIndex}-${subjectIndex}`}
                                  props={{ select: roomState, mode: "create" }}
                                  event={(action, e) =>
                                    updateSubjectField(
                                      teacherIndex,
                                      subjectIndex,
                                      "room_id",
                                      e,
                                    )
                                  }
                                />
                                <br />
                              </td>
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "6px 4px",
                                }}
                              >
                                <CustomSelect
                                  key={`score-${teacherIndex}-${subjectIndex}`}
                                  props={{
                                    select: scoreOptionState,
                                    mode: "create",
                                  }}
                                  event={(action, e) =>
                                    updateSubjectField(
                                      teacherIndex,
                                      subjectIndex,
                                      "score_option_id",
                                      e,
                                    )
                                  }
                                />
                                <br />
                              </td>

                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "6px 4px",
                                }}
                              >
                                {subject.periods.map((period, periodIndex) => (
                                  <div
                                    key={periodIndex}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      marginBottom:
                                        periodIndex < subject.periods.length - 1
                                          ? "4px"
                                          : 0,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <select
                                      className="form-select form-select-sm"
                                      value={period.day}
                                      onChange={(e) =>
                                        updatePeriodField(
                                          teacherIndex,
                                          subjectIndex,
                                          periodIndex,
                                          "day",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        fontSize: "12px",
                                        borderRadius: "4px",
                                        borderColor: "#ced4da",
                                        padding: "4px 8px",
                                        minHeight: "32px",
                                        width: "90px",
                                        fontFamily:
                                          "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                        background: "#fff",
                                      }}
                                    >
                                      {days.map((d) => (
                                        <option key={d} value={d}>
                                          {khmerDays[d]}
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type="time"
                                      className="form-control form-control-sm"
                                      value={period.time_from}
                                      onChange={(e) =>
                                        updatePeriodField(
                                          teacherIndex,
                                          subjectIndex,
                                          periodIndex,
                                          "time_from",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        fontSize: "12px",
                                        borderRadius: "4px",
                                        borderColor: "#ced4da",
                                        padding: "4px 8px",
                                        minHeight: "32px",
                                        width: "80px",
                                        fontFamily:
                                          "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        color: "#888",
                                        margin: "0 2px",
                                      }}
                                    >
                                      ទៅ
                                    </span>
                                    <input
                                      type="time"
                                      className="form-control form-control-sm"
                                      value={period.time_to}
                                      onChange={(e) =>
                                        updatePeriodField(
                                          teacherIndex,
                                          subjectIndex,
                                          periodIndex,
                                          "time_to",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        fontSize: "12px",
                                        borderRadius: "4px",
                                        borderColor: "#ced4da",
                                        padding: "4px 8px",
                                        minHeight: "32px",
                                        width: "80px",
                                        fontFamily:
                                          "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                      }}
                                    />
                                    {subject.periods.length > 1 && (
                                      <button
                                        className="btn btn-sm"
                                        onClick={() =>
                                          removePeriod(
                                            teacherIndex,
                                            subjectIndex,
                                            periodIndex,
                                          )
                                        }
                                        style={{
                                          padding: "0 6px",
                                          background: "transparent",
                                          border: "none",
                                          color: "#dc3545",
                                          fontSize: "14px",
                                        }}
                                      >
                                        <FaTrash size={10} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  className="btn btn-sm"
                                  onClick={() =>
                                    addPeriodToSubject(
                                      teacherIndex,
                                      subjectIndex,
                                    )
                                  }
                                  style={{
                                    marginTop: "4px",
                                    padding: "4px 12px",
                                    fontFamily:
                                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                    background: "#1a3c2a",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <FaPlus size={8} className="me-1" />{" "}
                                  បន្ថែមម៉ោង
                                </button>
                              </td>

                              <td
                                className="text-center"
                                style={{
                                  verticalAlign: "middle",
                                  padding: "6px 4px",
                                  fontSize: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={
                                      subject.session_total ||
                                      subject.periods.length
                                    }
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 1;
                                      updateSubjectField(
                                        teacherIndex,
                                        subjectIndex,
                                        "session_total",
                                        val,
                                      );
                                    }}
                                    style={{
                                      width: "60px",
                                      textAlign: "center",
                                      fontFamily:
                                        "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                      borderRadius: "4px",
                                      borderColor: "#e0e0e0",
                                      fontSize: "12px",
                                      padding: "2px 4px",
                                    }}
                                    min="1"
                                  />
                                </div>
                              </td>
                              <td
                                className="text-center"
                                style={{
                                  verticalAlign: "middle",
                                  padding: "6px 4px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "4px",
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    className="btn btn-sm"
                                    onClick={() =>
                                      removeSubject(teacherIndex, subjectIndex)
                                    }
                                    style={{
                                      padding: "4px 10px",
                                      background: "transparent",
                                      border: "1px solid #dc3545",
                                      color: "#dc3545",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      fontFamily:
                                        "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                                    }}
                                  >
                                    <FaTrash size={9} className="me-1" /> លុប
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Note and Actions */}
            <div className="row mt-3">
              <div className="col-md-6">
                <CustomInput
                  event={(action, e) => setNote(e)}
                  props={{
                    input: {
                      title: "កំណត់ចំណាំ",
                      id: "note",
                      required: false,
                      is_correct: true,
                      type: "text",
                      icon: null,
                      error: "",
                      value: note || "",
                    },
                    mode: "create",
                    placeholder: "កំណត់ចំណាំ (ស្រេចចិត្ត)",
                  }}
                />
              </div>
              <div
                className="col-md-6 text-end"
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  className="btn"
                  onClick={onCancel}
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
                <button
                  className="btn"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    background: "#1a3c2a",
                    color: "white",
                    border: "none",
                    padding: "10px 28px",
                    borderRadius: "8px",
                    fontFamily:
                      "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                    fontWeight: "500",
                  }}
                >
                  <FaSave className="me-1" />{" "}
                  {isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AcademicTableCreate;

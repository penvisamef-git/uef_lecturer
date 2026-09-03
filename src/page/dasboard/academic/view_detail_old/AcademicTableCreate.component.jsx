import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaSave, FaTimes, FaClock } from "react-icons/fa";
import { getAllRequest, postRequest, updateRequest } from "../../../../util/request_api";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import Loading from "../../../../component/Loading/Loading.component.jsx";
import CustomInput from "../../../../component/Input/CustomInput.component";
import CustomSelect from "../../../../component/Select/CustomSelect.component.jsx";
import CustomSelectScript from "../../../../component/Select/CustomSelect.script";

function AcademicTableCreate({ class_id, auth, onSuccess, onCancel, existingData }) {
  const navigate = useNavigate();
  const swalToast = new SwalToast();
  const customSelectScript = new CustomSelectScript();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Form states
  const [schedule, setSchedule] = useState([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Available days
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
    Monday: "ចន្ទ",
    Tuesday: "អង្គារ",
    Wednesday: "ពុធ",
    Thursday: "ព្រហស្បតិ៍",
    Friday: "សុក្រ",
    Saturday: "សៅរ៍",
    Sunday: "អាទិត្យ",
  };

  // Time options from 7:00 AM to 9:00 PM (with 5-minute intervals)
  const timeOptions = [];
  for (let hour = 7; hour <= 21; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    timeOptions.push(`${hourStr}:00`);
    timeOptions.push(`${hourStr}:05`);
    timeOptions.push(`${hourStr}:10`);
    timeOptions.push(`${hourStr}:15`);
    timeOptions.push(`${hourStr}:20`);
    timeOptions.push(`${hourStr}:25`);
    timeOptions.push(`${hourStr}:30`);
    timeOptions.push(`${hourStr}:35`);
    timeOptions.push(`${hourStr}:40`);
    timeOptions.push(`${hourStr}:45`);
    timeOptions.push(`${hourStr}:50`);
    timeOptions.push(`${hourStr}:55`);
  }

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;

      // Load subjects
      const subjectApi = `${process.env.REACT_APP_API_HOST}/api/admin/subject-and-major/subject-all`;
      const subjectResult = await getAllRequest(subjectApi, access_token);
      let loadedSubjects = [];
      if (subjectResult.success) {
        loadedSubjects = subjectResult?.data?.data || [];
        setSubjects(loadedSubjects);
      }

      // Load teachers
      const teacherApi = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/teacher-all`;
      const teacherResult = await getAllRequest(teacherApi, access_token);
      let loadedTeachers = [];
      if (teacherResult.success) {
        loadedTeachers = teacherResult?.data?.data || [];
        setTeachers(loadedTeachers);
      }

      // Load rooms
      const roomApi = `${process.env.REACT_APP_API_HOST}/api/admin/building-management/room-all`;
      const roomResult = await getAllRequest(roomApi, access_token);
      let loadedRooms = [];
      if (roomResult.success) {
        loadedRooms = roomResult?.data?.data || [];
        setRooms(loadedRooms);
      }

      // Check if we have existing data for edit mode
      if (existingData?.time_table) {
        setIsEditMode(true);
        const existingSchedule = existingData.time_table.schedule || [];
        const existingNote = existingData.time_table.note || "";
        const existingStatus = existingData.time_table.status !== undefined ? existingData.time_table.status : true;

        // Map existing schedule to full days list
        const populatedSchedule = days.map((day) => {
          const existingDay = existingSchedule.find((d) => d.day === day);
          if (existingDay) {
            return {
              day: day,
              periods: existingDay.periods.map((period) => ({
                period_number: period.period_number,
                period_has_teach: period.period_has_teach || 0,
                time_from: period.time_from || "",
                time_to: period.time_to || "",
                subject_id: period.subject_id?._id || period.subject_id || "",
                teacher_id: period.teacher_id?._id || period.teacher_id || "",
                room_id: period.room_id?._id || period.room_id || "",
                note: period.note || "",
              })),
            };
          }
          return {
            day: day,
            periods: [],
          };
        });

        setSchedule(populatedSchedule);
        setNote(existingNote);
        setStatus(existingStatus);
      } else {
        // Initialize empty schedule for create mode
        const initialSchedule = days.map((day) => ({
          day: day,
          periods: [],
        }));
        setSchedule(initialSchedule);
        setNote("");
        setStatus(true);
      }
      
      setIsDataLoaded(true);
    } catch (error) {
      console.error("❌ Error loading data:", error);
      swalToast.toastError("មានបញ្ហាក្នុងការទាញយកទិន្នន័យ!", 2000);
    } finally {
      setIsLoading(false);
    }
  }

  // Add period to a day
  const addPeriod = (dayIndex) => {
    const newSchedule = [...schedule];
    const periodNumber = newSchedule[dayIndex].periods.length + 1;
    newSchedule[dayIndex].periods.push({
      period_number: periodNumber,
      period_has_teach: 0,
      time_from: "",
      time_to: "",
      subject_id: "",
      teacher_id: "",
      room_id: "",
      note: "",
    });
    setSchedule(newSchedule);
  };

  // Remove period from a day
  const removePeriod = (dayIndex, periodIndex) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].periods.splice(periodIndex, 1);
    // Update period numbers
    newSchedule[dayIndex].periods.forEach((period, idx) => {
      period.period_number = idx + 1;
    });
    setSchedule(newSchedule);
  };

  // Update period field
  const updatePeriod = (dayIndex, periodIndex, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].periods[periodIndex][field] = value;
    setSchedule(newSchedule);
  };

  // Handle save
  const handleSave = async () => {
    // Validate
    let hasError = false;
    const newSchedule = [...schedule];

    newSchedule.forEach((day, dayIdx) => {
      day.periods.forEach((period, periodIdx) => {
        if (
          !period.time_from ||
          !period.time_to ||
          !period.subject_id ||
          !period.teacher_id ||
          !period.room_id
        ) {
          hasError = true;
        }
      });
    });

    if (hasError) {
      swalToast.toastError("សូមបំពេញព័ត៌មានឱ្យបានពេញលេញ!", 2000);
      return;
    }

    // Filter out days with no periods
    const filteredSchedule = newSchedule.filter(
      (day) => day.periods.length > 0,
    );

    if (filteredSchedule.length === 0) {
      swalToast.toastError("សូមបន្ថែមយ៉ាងហោចណាស់មួយម៉ោងសិក្សា!", 2000);
      return;
    }

    const preparedData = {
      class_id: class_id,
      schedule: filteredSchedule,
      note: note,
      status: status,
    };

    setIsSaving(true);
    try {
      const access_token = auth?.getClientLogin()?.data?.access_token;
      let result;

      if (isEditMode && existingData?.time_table?._id) {
        // Update existing timetable
        const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/time-table/${existingData.time_table._id}`;
        result = await updateRequest(api, preparedData, access_token);
      } else {
        // Create new timetable
        const api = `${process.env.REACT_APP_API_HOST}/api/admin/academic/time-table`;
        result = await postRequest(api, preparedData, access_token);
      }

      if (result.success) {
        swalToast.toastSuccess(
          isEditMode 
            ? "បានកែប្រែកាលវិភាគដោយជោគជ័យ!" 
            : "បានបង្កើតកាលវិភាគដោយជោគជ័យ!",
          2000
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

  // Get filtered time options based on selected time_from
  const getFilteredTimeOptions = (selectedTime) => {
    if (!selectedTime) return timeOptions;
    const index = timeOptions.indexOf(selectedTime);
    return timeOptions.slice(index >= 0 ? index : 0);
  };

  // Get options for CustomSelect
  const subjectOptions = subjects.map((s) => ({
    value: s._id,
    label: `${s.name} (${s.major_id?.name || "N/A"})`,
  }));

  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: `${t.firstname} ${t.lastname}`,
  }));

  const roomOptions = rooms.map((r) => ({
    value: r._id,
    label: `${r.name} (${r.floor_id?.name || "N/A"} - ${r.building_data?.name || "N/A"})`,
  }));

  // Create select states for CustomSelect - FIXED to find label from options
  const getPeriodSelectState = (period, field, options, defaultTitle) => {
    const value = period[field] || "";
    // Find the option that matches the value
    const foundOption = options.find(opt => opt.value === value);
    
    return {
      title: "",
      id: `period-${field}`,
      required: false,
      is_correct: true,
      error: "",
      data: options,
      value: value,
      defualtValue: value,
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
        minHeight: "400px",
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
              padding: "18px 24px",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            <h5 className="mb-0 siemreap-regular" style={{ fontWeight: "600" }}>
              <FaClock className="me-2" /> 
              {isEditMode ? "កែប្រែកាលវិភាគ" : "បង្កើតកាលវិភាគថ្មី"}
            </h5>
            <button
              className="btn btn-sm btn-light siemreap-regular"
              onClick={onCancel}
              style={{ borderRadius: "8px", padding: "6px 14px" }}
            >
              <label style={{ cursor: "pointer" }}>
                {" "}
                <FaTimes style={{ marginTop: "-5px" }} /> បិទ
              </label>
            </button>
          </div>

          <div className="card-body" style={{ padding: "24px" }}>
            {/* Schedule Table */}
            <div className="table-responsive">
              <table
                className="table table-hover"
                style={{
                  minWidth: "750px",
                  borderCollapse: "separate",
                  borderSpacing: "0 4px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      className="siemreap-regular text-center"
                      style={{
                        width: "10%",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        padding: "14px 12px",
                        backgroundColor: "#f0f4f0",
                        borderRadius: "8px 0 0 8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1a3c2a",
                      }}
                    >
                      ថ្ងៃ
                    </th>
                    <th
                      className="siemreap-regular text-center"
                      style={{
                        width: "16%",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        padding: "14px 12px",
                        backgroundColor: "#f0f4f0",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1a3c2a",
                      }}
                    >
                      <FaClock className="me-1" /> ម៉ោង
                    </th>
                    <th
                      className="siemreap-regular text-center"
                      style={{
                        width: "20%",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        padding: "14px 12px",
                        backgroundColor: "#f0f4f0",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1a3c2a",
                      }}
                    >
                      មុខវិជ្ជា
                    </th>
                    <th
                      className="siemreap-regular text-center"
                      style={{
                        width: "17%",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        padding: "14px 12px",
                        backgroundColor: "#f0f4f0",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1a3c2a",
                      }}
                    >
                      គ្រូបង្រៀន
                    </th>
                    <th
                      className="siemreap-regular text-center"
                      style={{
                        width: "16%",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        padding: "14px 12px",
                        backgroundColor: "#f0f4f0",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1a3c2a",
                      }}
                    >
                      បន្ទប់
                    </th>
                    <th
                      className="siemreap-regular text-center"
                      style={{
                        width: "14%",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        padding: "14px 12px",
                        backgroundColor: "#f0f4f0",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1a3c2a",
                      }}
                    >
                      កំណត់ចំណាំ
                    </th>
                    <th
                      className="siemreap-regular text-center"
                      style={{
                        width: "7%",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        padding: "14px 12px",
                        backgroundColor: "#f0f4f0",
                        borderRadius: "0 8px 8px 0",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1a3c2a",
                      }}
                    >
                      សកម្មភាព
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((day, dayIndex) => (
                    <React.Fragment key={dayIndex}>
                      {day.periods.length === 0 ? (
                        <tr
                          style={{
                            backgroundColor: "#fafbfa",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            display: "table-row",
                          }}
                        >
                          <td
                            className="text-center siemreap-regular"
                            style={{
                              fontWeight: "600",
                              verticalAlign: "middle",
                              padding: "16px 12px",
                              backgroundColor: "#f8faf8",
                              borderRadius: "8px 0 0 8px",
                              color: "#1a3c2a",
                              paddingBottom: "20px",
                            }}
                          >
                            {khmerDays[day.day] || day.day}
                          </td>
                          <td
                            colSpan="6"
                            className="text-center text-muted"
                            style={{
                              verticalAlign: "middle",
                              padding: "16px 12px",
                              backgroundColor: "#fafbfa",
                              borderRadius: "0 8px 8px 0",
                              paddingBottom: "20px",
                            }}
                          >
                            <span className="siemreap-regular">
                              មិនមានម៉ោងសិក្សា
                            </span>
                            <button
                              className="btn btn-sm ms-2 siemreap-regular"
                              style={{
                                background: "#1a3c2a",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 12px",
                                transition: "all 0.2s",
                              }}
                              onClick={() => addPeriod(dayIndex)}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#2d5a3d")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "#1a3c2a")
                              }
                            >
                              <FaPlus size={10} className="me-1" />
                              <label style={{ cursor: "pointer" }}>
                                បញ្ចូល
                              </label>
                            </button>
                          </td>
                        </tr>
                      ) : (
                        day.periods.map((period, periodIndex) => {
                          const subjectState = getPeriodSelectState(
                            period,
                            "subject_id",
                            subjectOptions,
                            "ជ្រើសរើសមុខវិជ្ជា",
                          );
                          const teacherState = getPeriodSelectState(
                            period,
                            "teacher_id",
                            teacherOptions,
                            "ជ្រើសរើសគ្រូបង្រៀន",
                          );
                          const roomState = getPeriodSelectState(
                            period,
                            "room_id",
                            roomOptions,
                            "ជ្រើសរើសបន្ទប់",
                          );

                          const isLastRow =
                            periodIndex === day.periods.length - 1;

                          return (
                            <tr
                              key={periodIndex}
                              style={{
                                backgroundColor:
                                  periodIndex % 2 === 0 ? "#ffffff" : "#f8faf8",
                                borderRadius: "8px",
                                transition: "all 0.2s",
                                display: "table-row",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#e8f5e9";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(26, 60, 42, 0.08)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  periodIndex % 2 === 0 ? "#ffffff" : "#f8faf8";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              {periodIndex === 0 && (
                                <td
                                  rowSpan={day.periods.length}
                                  className="text-center siemreap-regular"
                                  style={{
                                    fontWeight: "600",
                                    verticalAlign: "middle",
                                    backgroundColor: "#e8f5e9",
                                    borderRadius: "8px 0 0 8px",
                                    color: "#1a3c2a",
                                    padding: "12px 8px",
                                    paddingBottom: isLastRow ? "20px" : "12px",
                                    minWidth: "70px",
                                  }}
                                >
                                  {khmerDays[day.day] || day.day}
                                </td>
                              )}
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "8px 6px",
                                  paddingBottom: isLastRow ? "20px" : "8px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                    marginTop: "11px",
                                  }}
                                >
                                  <select
                                    className="form-select form-select-sm siemreap-regular"
                                    value={period.time_from}
                                    onChange={(e) =>
                                      updatePeriod(
                                        dayIndex,
                                        periodIndex,
                                        "time_from",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      fontSize: "12px",
                                      textAlign: "center",
                                      textAlignLast: "center",
                                      borderRadius: "6px",
                                      borderColor: "#e0e0e0",
                                      padding: "2px 6px",
                                      minHeight: "28px",
                                    }}
                                  >
                                    <option value="">ចាប់ផ្ដើម</option>
                                    {timeOptions.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    className="form-select form-select-sm siemreap-regular"
                                    value={period.time_to}
                                    onChange={(e) =>
                                      updatePeriod(
                                        dayIndex,
                                        periodIndex,
                                        "time_to",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      fontSize: "12px",
                                      textAlign: "center",
                                      textAlignLast: "center",
                                      borderRadius: "6px",
                                      borderColor: "#e0e0e0",
                                      padding: "2px 6px",
                                      minHeight: "28px",
                                    }}
                                  >
                                    <option value="">បញ្ចប់</option>
                                    {getFilteredTimeOptions(
                                      period.time_from,
                                    ).map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "8px 6px",
                                  paddingBottom: isLastRow ? "20px" : "8px",
                                }}
                              >
                                <CustomSelect
                                  key={`subject-${dayIndex}-${periodIndex}-${period.subject_id}`}
                                  props={{
                                    select: subjectState,
                                    mode: "create",
                                  }}
                                  event={(action, e) => {
                                    updatePeriod(
                                      dayIndex,
                                      periodIndex,
                                      "subject_id",
                                      e,
                                    );
                                  }}
                                />
                              </td>
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "8px 6px",
                                  paddingBottom: isLastRow ? "20px" : "8px",
                                }}
                              >
                                <CustomSelect
                                  key={`teacher-${dayIndex}-${periodIndex}-${period.teacher_id}`}
                                  props={{
                                    select: teacherState,
                                    mode: "create",
                                  }}
                                  event={(action, e) => {
                                    updatePeriod(
                                      dayIndex,
                                      periodIndex,
                                      "teacher_id",
                                      e,
                                    );
                                  }}
                                />
                              </td>
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "8px 6px",
                                  paddingBottom: isLastRow ? "20px" : "8px",
                                }}
                              >
                                <CustomSelect
                                  key={`room-${dayIndex}-${periodIndex}-${period.room_id}`}
                                  props={{ select: roomState, mode: "create" }}
                                  event={(action, e) => {
                                    updatePeriod(
                                      dayIndex,
                                      periodIndex,
                                      "room_id",
                                      e,
                                    );
                                  }}
                                />
                              </td>
                              <td
                                style={{
                                  verticalAlign: "middle",
                                  padding: "8px 6px",
                                  paddingBottom: isLastRow ? "20px" : "8px",
                                }}
                              >
                                <CustomInput
                                  event={(action, e) => {
                                    updatePeriod(
                                      dayIndex,
                                      periodIndex,
                                      "note",
                                      e,
                                    );
                                  }}
                                  props={{
                                    input: {
                                      title: "",
                                      id: `note-${dayIndex}-${periodIndex}`,
                                      required: false,
                                      is_correct: true,
                                      type: "text",
                                      icon: null,
                                      error: "",
                                      value: period.note || "",
                                    },
                                    mode: "create",
                                    placeholder: "កំណត់ចំណាំ",
                                  }}
                                />
                              </td>
                              <td
                                className="text-center"
                                style={{
                                  verticalAlign: "middle",
                                  padding: "18px 6px",
                                  paddingBottom: isLastRow ? "20px" : "8px",
                                  borderRadius: "0 8px 8px 0",
                                }}
                              >
                                <button
                                  className="btn btn-sm siemreap-regular"
                                  onClick={() =>
                                    removePeriod(dayIndex, periodIndex)
                                  }
                                  title="លុប"
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    background: "transparent",
                                    border: "1px solid #dc3545",
                                    color: "#dc3545",
                                    borderRadius: "6px",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "#dc3545";
                                    e.currentTarget.style.color = "white";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "transparent";
                                    e.currentTarget.style.color = "#dc3545";
                                  }}
                                >
                                  <FaTrash size={10} />
                                </button>
                                {periodIndex === day.periods.length - 1 && (
                                  <button
                                    className="btn btn-sm ms-1 siemreap-regular"
                                    onClick={() => addPeriod(dayIndex)}
                                    title="បន្ថែម"
                                    style={{
                                      padding: "4px 8px",
                                      fontSize: "12px",
                                      background: "transparent",
                                      border: "1px solid #1a3c2a",
                                      color: "#1a3c2a",
                                      borderRadius: "6px",
                                      transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background =
                                        "#1a3c2a";
                                      e.currentTarget.style.color = "white";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background =
                                        "transparent";
                                      e.currentTarget.style.color = "#1a3c2a";
                                    }}
                                  >
                                    <FaPlus size={10} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note */}
            <div className="row mt-1">
              <div className="col-md-12">
                <CustomInput
                  event={(action, e) => {
                    setNote(e);
                  }}
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
            </div>

            {/* Action Buttons */}
            <div className="row mt-4">
              <div className="col-md-12 text-end">
                <button
                  className="btn me-2 siemreap-regular"
                  onClick={onCancel}
                  style={{
                    background: "#f0f0f0",
                    color: "#333",
                    border: "none",
                    padding: "8px 24px",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#e0e0e0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f0f0f0")
                  }
                >
                  <FaTimes className="me-1" />
                  <label style={{ cursor: "pointer" }}>បោះបង់</label>
                </button>
                <button
                  className="btn siemreap-regular "
                  style={{
                    background: "#1a3c2a",
                    color: "white",
                    border: "none",
                    padding: "8px 28px",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onClick={handleSave}
                  disabled={isSaving}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#2d5a3d")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#1a3c2a")
                  }
                >
                  <FaSave className="me-1" />{" "}
                  <label style={{ cursor: "pointer" }}>
                    {isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
                  </label>
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
import React, { useEffect, useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import km from "date-fns/locale/km";
import { format } from "date-fns";
import { SlCalender } from "react-icons/sl";
import "./CustomReatDatePickerKhmer.style.css";

function CustomReatDatePickerKhmer(prop) {
  const propInput = prop.props.input;
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!propInput.value);

  // Khmer digit converter
  const toKhmerNumber = (number) => {
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    return number
      .toString()
      .split("")
      .map((d) => khmerDigits[+d] || d)
      .join("");
  };

  // Custom input renderer with Khmer formatting
  const CustomInput = forwardRef(
    ({ value, onClick, date, className, placeholder }, ref) => {
      let khmerDate = "";
      if (date && date instanceof Date && !isNaN(date)) {
        try {
          const day = toKhmerNumber(format(date, "dd"));
          const month = format(date, "MMMM", { locale: km });
          const year = toKhmerNumber(format(date, "yyyy"));
          khmerDate = `${day} - ${month} - ${year}`;
        } catch (err) {
          // console.error("Formatting error:", err);
        }
      }

      // Update hasValue when date changes
      useEffect(() => {
        setHasValue(!!date);
      }, [date]);

      // Determine border color based on state
      let borderColor = "#d1d5db"; // Default gray
      if (!propInput.is_correct) {
        borderColor = "#dc2626"; // Error red
      } else if (isFocused) {
        //borderColor = "#0dc25e"; // Green when focused
      } else if (hasValue && !isFocused) {
        borderColor = "#d1d5db"; // Gray when has value but not focused
      }

      return (
        <input
          ref={ref}
          readOnly
          onClick={onClick}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={khmerDate}
          placeholder={placeholder || "ជ្រើសរើសកាលបរិច្ឆេទ"}
          className={`date-input-selector ${!propInput.is_correct ? "error" : ""}`}
          style={{
            color: propInput.readOnly ? "#9ca3af" : "#1a3c2a",
            width: "100%",
            display: "block",
            borderColor: borderColor,
            backgroundColor: propInput.readOnly ? "#f3f4f6" : "#ffffff",
            cursor: propInput.readOnly ? "not-allowed" : "pointer",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "6px",
            padding: "12px 16px",
            fontSize: "14px",
            fontFamily: "'Siemreap', sans-serif",
            fontWeight: "100",
            transition: "all 0.3s ease",
          }}
        />
      );
    },
  );

  registerLocale("km", km);

  // Determine label color
  const getLabelColor = () => {
    if (!propInput.is_correct) return "#dc2626"; // Error red
    if (isFocused) return "gray"; // Dark green when focused
    return "#6b7280"; // Gray by default (even with value)
  };

  const getIconColor = () => {
    if (!propInput.is_correct) return "#dc2626"; // Error red
    if (isFocused) return "gray"; // Green when focused
    return "#6b7280"; // Gray by default (even with value)
  };

  return (
    <div className="datepicker-wrapper" style={{ width: "100%" }}>
      <div className="datepicker-label">
        <label
          className="siemreap-regular"
          style={{
            color: getLabelColor(),
            transition: "all 0.3s ease",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <SlCalender
            style={{
              marginRight: "3px",
              color: getIconColor(),
              transition: "all 0.3s ease",
              fontSize: "12px",
            }}
          />
          {propInput.title}
          {propInput.required && <span style={{ color: "#dc2626" }}>*</span>}
        </label>
      </div>

      <div className="datepicker-container" style={{ width: "100%" }}>
        <DatePicker
          minDate={propInput.minDate}
          selected={propInput.value}
          readOnly={propInput.readOnly}
          locale="km"
          showTimeSelect={propInput.showTimeSelect}
          dateFormat="dd - MMMM - yyyy"
          placeholderText="ជ្រើសរើសកាលបរិច្ឆេទ"
          onChange={(date) => {
            setHasValue(!!date);
            prop.event(null, date);
          }}
          customInput={
            <CustomInput
              date={propInput.value}
              placeholder={propInput.placeholder || "ជ្រើសរើសកាលបរិច្ឆេទ"}
            />
          }
          className="date-input-selector"
          calendarClassName="custom-datepicker-calendar"
          disabled={propInput.readOnly}
          popperClassName="custom-datepicker-popper"
          popperPlacement="bottom-start"
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={50}
          wrapperClassName="datepicker-full-width"
        />
      </div>

      {!propInput.is_correct && (
        <div className="holder-error" style={{ marginTop: "4px" }}>
          <label style={{ fontSize: "12px", color: "#dc2626" }}>
            {propInput.error}
          </label>
        </div>
      )}
    </div>
  );
}

export default CustomReatDatePickerKhmer;

import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import "./Simple_Select.css";
import "../../../index.css";
import ColorHelper from "../../../util/color";

function Simple_SelectTree({
  data,
  senderOnChange,
  placeholder,
  title,
  id,
  is_multi = false,
  is_clear = true,
  required = false,
  readonly = false,
  multi_default_select_value,
  defaultValue, // NEW: for single select default
  is_correct = true,
  error = "",
  icon = null,
}) {
  const [dataValue, setDataValue] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef(null);

  // --- Convert hierarchical tree to select options ---
  const mapTreeToOptions = (nodes, level = 0) => {
    if (!nodes) return [];

    return nodes.flatMap((node) => {
      // Parent node (has sub) – not selectable
      if (node.sub && node.sub.length > 0) {
        return [
          {
            label: " ".repeat(level * 2) + node.label,
            value: node.value,
            isDisabled: true,
          },
          ...mapTreeToOptions(node.sub, level + 1),
        ];
      }
      // Leaf node – selectable
      return {
        label: " ".repeat(level * 2) + node.label,
        value: node.value,
      };
    });
  };

  const options = data ? mapTreeToOptions(data) : [];

  // Helper to find an option by value
  const findOptionByValue = (opts, val) => {
    if (!opts || !val) return null;
    return opts.find((item) => item.value === val) || null;
  };

  // --- Initialize state for single select with defaultValue ---
  useEffect(() => {
    if (!is_multi && options.length > 0 && defaultValue) {
      const defaultOption = findOptionByValue(options, defaultValue);
      if (defaultOption && !dataValue) {
        setDataValue(defaultOption);
        // Notify parent if needed
        if (senderOnChange) senderOnChange(defaultOption);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, defaultValue, is_multi]);

  // For multi‑select default (existing logic)
  const valueMultiDefault = () => {
    if (is_multi && multi_default_select_value?.length > 0) {
      return multi_default_select_value
        .map((i) => findOptionByValue(options, i.value))
        .filter(Boolean);
    }
    return [];
  };

  // Determine current value for Select component
  const currentValue = is_multi ? dataValue || valueMultiDefault() : dataValue;

  // --- Handle change ---
  const onChange = (selected) => {
    setDataValue(selected);
    if (senderOnChange) senderOnChange(selected);
  };

  // Focus handlers
  const onFocus = () => setIsFocused(true);
  const onBlur = () => setIsFocused(false);

  const hasValue =
    dataValue !== null &&
    (Array.isArray(dataValue) ? dataValue.length > 0 : true);

  // Color helper
  const colorHelper = new ColorHelper();

  // --- Styles (unchanged) ---
  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "white",
      borderRadius: 4,
      borderWidth: "1.5px",
      borderStyle: "solid",
      borderColor: !is_correct
        ? "#ef4444"
        : state.isFocused
          ? colorHelper.main()
          : "#cdcecf",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(255, 255, 255, 0.1)" : null,
      fontFamily: "'Siemreap', sans-serif",
      fontWeight: 100,
      minHeight: "55px",
      transition: "all 0.2s ease",
      position: "relative",
      "&:hover": {
        borderColor: !is_correct
          ? "#ef4444"
          : state.isFocused
            ? colorHelper.main()
            : "#9ca3af",
      },
    }),
    placeholder: (base) => ({
      ...base,
      fontFamily: "'Siemreap', sans-serif",
      fontWeight: 100,
      color: "#9ca3af",
      fontSize: "14px",
      position: "absolute",
      top: hasValue || isFocused ? "20px" : "50%",
      transform: hasValue || isFocused ? "translateY(0)" : "translateY(-50%)",
      transition: "all 0.2s ease",
      pointerEvents: "none",
      marginLeft: "8px",
    }),
    singleValue: (base) => ({
      ...base,
      fontFamily: "'Siemreap', sans-serif",
      fontWeight: 100,
      lineHeight: "1.8",
      color: "#1f2937",
      marginTop: "12px",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      marginTop: "12px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontFamily: "'Siemreap', sans-serif",
      fontWeight: 100,
      fontSize: "13px",
      color: "#374151",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#9ca3af",
      "&:hover": {
        backgroundColor: "#ef4444",
        color: "white",
        borderRadius: "0 6px 6px 0",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 8,
      marginTop: 4,
      zIndex: 9000,
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: "1px solid #f3f4f6",
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
      fontFamily: "'Siemreap', sans-serif",
      fontWeight: 100,
      maxHeight: "300px",
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f3f4f6",
        borderRadius: "8px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#9ca3af",
        borderRadius: "8px",
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      padding: "10px 12px",
      paddingLeft: state.isDisabled ? "20px" : "32px",
      fontFamily: "'Siemreap', sans-serif",
      fontWeight: 100,
      backgroundColor: state.isDisabled
        ? "#f9fafb"
        : state.isSelected
          ? colorHelper.main()
          : state.isFocused
            ? "#eff6ff"
            : "white",
      color: state.isDisabled
        ? "#9ca3af"
        : state.isSelected
          ? "white"
          : "#1f2937",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      fontSize: "14px",
      borderRadius: "6px",
      margin: "2px 0",
      transition: "all 0.2s ease",
      "&:active": {
        backgroundColor: state.isDisabled ? "#f9fafb" : "#3b82f6",
      },
    }),
    input: (base) => ({
      ...base,
      fontFamily: "'Siemreap', sans-serif",
      fontWeight: 100,
      color: "#142031",
      marginTop: "12px",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "#e5e7eb",
      marginTop: "12px",
      height: "24px",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "#9ca3af",
      transition: "all 0.2s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
      marginTop: "-1px",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#9ca3af",
      "&:hover": {
        color: "#ef4444",
      },
      marginTop: "-1px",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 8px",
    }),
  };

  // Floating label component
  const FloatingLabel = () => (
    <div
      style={{
        position: "absolute",
        top: isFocused || hasValue ? "-8px" : "50%",
        left: "12px",
        transform: isFocused || hasValue ? "translateY(0)" : "translateY(-50%)",
        backgroundColor: "white",
        padding: isFocused || hasValue ? "0 4px" : "0",
        fontSize: isFocused || hasValue ? "12px" : "14px",
        color: !is_correct ? "#ef4444" : isFocused ? "#3b82f6" : "#6b7280",
        transition: "all 0.2s ease",
        pointerEvents: "none",
        zIndex: 1,
        fontFamily: "'Siemreap', sans-serif",
        fontWeight: 500,
      }}
    >
      <label
        style={{
          color:
            isFocused === true
              ? colorHelper.main()
              : is_correct === false
                ? "red"
                : "gray",
        }}
      >
        {title || "Select Option"}
      </label>
      {required && (
        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
      )}
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        paddingTop: "15px",
      }}
    >
      <div style={{ position: "relative" }}>
        <Select
          icon={icon}
          ref={selectRef}
          menuPortalTarget={document.body}
          isDisabled={readonly}
          isMulti={is_multi}
          isClearable={is_clear}
          id={id}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="siemreap-regular"
          classNamePrefix="select"
          placeholder=""
          noOptionsMessage={({ inputValue }) =>
            !inputValue ? "មិនមានទិន្នន័យទាញយក" : "មិនមានទិន្នន័យស្វែងរក"
          }
          options={options}
          styles={customStyles}
          theme={(theme) => ({
            ...theme,
            borderRadius: 8,
            colors: {
              ...theme.colors,
              text: "black",
              primary25: "#eff6ff",
              primary: "#141517",
            },
          })}
          value={currentValue}
        />
        <FloatingLabel />
      </div>

      {!is_correct && (
        <div
          style={{
            marginTop: "4px",
            paddingLeft: "12px",
          }}
        >
          <label
            style={{
              fontSize: "12px",
              color: "#ef4444",
              fontFamily: "'Siemreap', sans-serif",
              fontWeight: 100,
            }}
          >
            {error || "This field is required"}
          </label>
        </div>
      )}
    </div>
  );
}

export default Simple_SelectTree;

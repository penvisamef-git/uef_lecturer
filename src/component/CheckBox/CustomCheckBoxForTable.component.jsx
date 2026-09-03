import React, { useState } from "react";

function CustomCheckBox({
  id,
  title,
  mode,
  check = false,
  blockChange,
  onChange = () => {}, // default empty function
}) {
  const [someState, setSomeState] = useState(check);

  const handleCheckboxChange = (value) => {
    if (blockChange != true) {
      setSomeState(value);
    }
    onChange({
      blockChange: blockChange,
      id: id,
      value: value,
      title: title,
    });
  };
  return (
    <div>
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={id}
          checked={someState}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          disabled={mode === "view"}
          style={{ marginTop: "4px" }}
        />
        <label className="form-check-label" htmlFor={id}>
          {title}
        </label>
      </div>
    </div>
  );
}

export default CustomCheckBox;

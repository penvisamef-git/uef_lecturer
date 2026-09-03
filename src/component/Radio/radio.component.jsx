import React, { useState } from "react";
import "./radio.style.css";

function Radio(prop) {
  const [selected, setSelected] = useState("option2"); // default selected option
  const input = prop.props.input;

  return (
    <div className="custom-radio">
      <label>
        {input.title}
        <label hidden={!input.required} style={{ color: "red" }}>
          *
        </label>
      </label>
      <div style={{ display: input.display, gap: "10px", marginTop: "10px" }}>
        {input.data.map((row, i) => {
          return (
            <div key={i} className="form-check">
              <input
                disabled={prop.props.mode == "view" ? true : false}
                className="form-check-input"
                type="radio"
                name={row.value}
                id={"flex" + row.value}
                value={row.value}
                checked={selected === row.value}
                onChange={(e) => {
                  setSelected(e.target.value);
                  prop.event(e.target.value);
                }}
              />
              <label className="form-check-label" htmlFor={"flex" + row.value}>
                {row.label}
              </label>
            </div>
          );
        })}
      </div>

      <div hidden={input.is_correct} className="text-danger">
        <label style={{ fontSize: "12px" }}>{input.error}</label>
      </div>
    </div>
  );
}

export default Radio;

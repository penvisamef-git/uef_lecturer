import React, { useEffect, useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { FaEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import "./CustomInput.style.css";
import { CustomInputScript } from "./CustomInput.script";

function CustomInput(props) {
  const propValue = props.props;
  const [showPassword, setShowPassword] = useState(false);
  const [showIconLeft, setshowIconLeft] = useState(false);
  const [value, setValue] = useState(propValue.input.value);
  const [typeInput, settypeInput] = useState(
    propValue.input.type == undefined || propValue.input.type == null
      ? "text"
      : propValue.input.type,
  );
  const script = new CustomInputScript(
    propValue,
    showIconLeft,
    setValue,
    setshowIconLeft,
    setShowPassword,
    typeInput,
    showPassword,
  );

  return (
    <div className="holder-custom-input" key={propValue.key}>
      <TextField
        disabled={propValue.mode == "view" ? true : false}
        id={propValue.input.id}
        label={
          <div className="siemreap-regular" style={{ paddingTop: "1.5px" }}>
            {script.addLabel()}
          </div>
        }
        variant="outlined"
        value={propValue.input.value}
        onChange={(e) => {
          script.handleChange(e);
          props.event("change", e.target.value, propValue);
        }}
        fullWidth
        type={script.checkInputType()}
        sx={{
          ...(propValue.input.is_correct == true
            ? script.styleCorrect
            : script.styleWrong),
          "& .MuiInputBase-input": {
            color: propValue.input.readonly == true ? "gray" : "#1a3c2a",
          },
        }}
        InputProps={{
          readOnly: propValue.input.readonly,
          startAdornment: script.addIconLeft(),
          endAdornment: (
            <IconButton
              sx={{
                backgroundColor: "white",
                zIndex: 1,
                marginRight: "-1px",
                color: "#0dc25e",
                "&:hover": {
                  backgroundColor: "#f0fdf4",
                  color: "#02a33d",
                },
              }}
              hidden={propValue.input.type != "password"}
              onClick={script.togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaRegEye />}
            </IconButton>
          ),
        }}
      />
      <div hidden={propValue.input.is_correct} className="holder-error">
        <label style={{ fontSize: "12px", color: "#dc2626" }}>
          {propValue.input.error}
        </label>
      </div>
    </div>
  );
}

export default CustomInput;

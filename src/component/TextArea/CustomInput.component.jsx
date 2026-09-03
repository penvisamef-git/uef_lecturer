import React, { useEffect, useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { FaEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import "./CustomInput.style.css";
import { CustomInputScript } from "./CustomInput.script";
import ColorHelper from "../../util/color";

function CustomInput(props) {
  const colorHelper = new ColorHelper();
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
        multiline={true} // 👈 makes it a textarea
        rows={propValue.input.rows == undefined ? 4 : propValue.input.rows} // 👈 you can customize the number of rows
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
        sx={
          propValue.input.is_correct == true
            ? script.styleCorrect
            : script.styleWrong
        }
        InputProps={{
          // Icon on the left side
          startAdornment: script.addIconLeft(),
          endAdornment: (
            <IconButton
              sx={{ backgroundColor: "white", zIndex: 1, marginRight: "-1px" }}
              hidden={propValue.input.type != "password"}
              onClick={script.togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaRegEye />}
            </IconButton>
          ),
        }}
      />
      <div hidden={propValue.input.is_correct} className="holder-error">
        <label style={{ fontSize: "12px" }}>{propValue.input.error}</label>
      </div>
    </div>
  );
}

export default CustomInput;

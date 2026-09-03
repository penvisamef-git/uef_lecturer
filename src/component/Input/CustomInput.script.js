import { TextField, InputAdornment, IconButton } from "@mui/material";
import "../../util/color";
import ColorHelper from "../../util/color";

export class CustomInputScript {
  //**************** Declaration *****************/
  styleCorrect = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "gray", // Default border color
      },
      "&:hover fieldset": {
        borderColor: "#02a33d", // Border color on hover
      },
      "&.Mui-focused fieldset": {
        borderColor: "#02a33d", // Change the border color when focused
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#4a7c5e", // Default label color
    },
    "& .MuiInputLabel-root:hover": {
      color: "#02a33d", // Label color on hover
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#02a33d", // Change label color when focused
    },
    "& .MuiInputLabel-root.Mui-shrink": {
      color: "#02a33d", // Change label color when there is a value
    },
    fontFamily: "'Siemreap', sans-serif",
  };

  styleWrong = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#dc2626", // Default border color when unfocused (and has text)
      },
      "&:hover fieldset": {
        borderColor: "#dc2626", // Border color on hover when wrong
      },
      "&.Mui-focused fieldset": {
        borderColor: "#dc2626", // Change the border color when focused
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#dc2626", // Default label color when unfocused and has text
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#dc2626", // Change label color when focused
    },
    "& .MuiInputLabel-root.Mui-shrink": {
      color: "#dc2626", // Change label color when there is a value
    },
    fontFamily: "'Siemreap', sans-serif",
  };

  constructor(
    propValue,
    showIconLeft,
    setValue,
    setshowIconLeft,
    setShowPassword,
    typeInput,
    showPassword,
  ) {
    this.propValue = propValue;
    this.showIconLeft = showIconLeft;
    this.setValue = setValue;
    this.setshowIconLeft = setshowIconLeft;
    this.setShowPassword = setShowPassword;
    this.typeInput = typeInput;
    this.showPassword = showPassword;
  }

  //**************** Function *****************/
  addIconLeft() {
    if (this.propValue.input.icon) {
      if (this.showIconLeft) {
        return (
          <InputAdornment position="start">
            <span style={{ color: "#0dc25e" }}>
              {this.propValue.input.icon}
            </span>
          </InputAdornment>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  addLabel() {
    if (this.propValue.input.icon) {
      if (!this.showIconLeft) {
        return (
          <div style={{ display: "flex", zIndex: 1 }}>
            <div style={{ marginRight: "5px", color: "#0dc25e" }}>
              {this.propValue.input.icon}
            </div>
            <span style={{ color: "#1a3c2a" }}>
              {this.propValue.input.title}
            </span>
            <label
              hidden={!this.propValue.input.required}
              style={{ color: "#dc2626" }}
            >
              *
            </label>
          </div>
        );
      } else {
        return (
          <div style={{ display: "flex", zIndex: 1 }}>
            <span style={{ color: "#1a3c2a" }}>
              {this.propValue.input.title}
            </span>
            <label
              hidden={!this.propValue.input.required}
              style={{ color: "#dc2626" }}
            >
              *
            </label>
          </div>
        );
      }
    } else {
      return (
        <div style={{ display: "flex", zIndex: 1 }}>
          <span style={{ color: "#1a3c2a" }}>{this.propValue.input.title}</span>
          <label
            hidden={!this.propValue.input.required}
            style={{ color: "#dc2626" }}
          >
            *
          </label>
        </div>
      );
    }
  }

  //**************** Event *****************/
  handleChange(e) {
    this.setValue(e.target.value);
    if (e.target.value) {
      this.setshowIconLeft(true);
    } else {
      this.setshowIconLeft(false);
    }
  }

  togglePasswordVisibility = () => {
    this.setShowPassword(!this.showPassword);
  };

  checkInputType() {
    if (this.propValue.input.type == "password") {
      if (this.showPassword) {
        return "text";
      } else {
        return "password";
      }
    } else {
      return this.typeInput;
    }
  }

  OnchangeTriggerChangeToAutoCorrection(e, setInput, isCorrect) {
    setInput((prevState) => ({
      ...prevState,
      value: e,
      is_correct: isCorrect,
    }));
  }
}

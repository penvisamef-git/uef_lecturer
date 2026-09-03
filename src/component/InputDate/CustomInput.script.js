import { TextField, InputAdornment, IconButton } from "@mui/material";
export class CustomInputScript {
  //**************** Declaration *****************/
  styleCorrect = {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "green", // Change the border color when focused
      },
    },
    "& .MuiInputLabel-root": {
      color: "gray", // Default label color
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "green", // Change label color when focused
    },
    "& .MuiInputLabel-root.Mui-shrink": {
      color: "green", // Change label color when there is a value
    },
    fontFamily: "'Siemreap', sans-serif",
  };
  styleWrong = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "red", // Default border color when unfocused (and has text)
      },
      "&.Mui-focused fieldset": {
        borderColor: "red", // Change the border color when focused
      },
    },
    "& .MuiInputLabel-root": {
      color: "red", // Default label color when unfocused and has text
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "red", // Change label color when focused
    },
    "& .MuiInputLabel-root.Mui-shrink": {
      color: "red", // Change label color when there is a value
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
    flexType,
    setflexType,
    readonly
  ) {
    this.propValue = propValue;
    this.showIconLeft = showIconLeft;
    this.setValue = setValue;
    this.setshowIconLeft = setshowIconLeft;
    this.setShowPassword = setShowPassword;
    this.typeInput = typeInput;
    this.showPassword = showPassword;
    this.flexType = flexType;
    this.setflexType = setflexType;
    this.readonly = readonly;
  }

  //**************** Function *****************/
  addIconLeft() {
    if (this.propValue.input.icon) {
      if (this.showIconLeft) {
        return (
          <InputAdornment position="start">
            {this.propValue.input.icon}
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
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "5px" }}>
              {this.propValue.input.icon}
            </div>
            {this.propValue.input.title}
            <label
              hidden={!this.propValue.input.required}
              style={{ color: "red" }}
            >
              *
            </label>
          </div>
        );
      } else {
        return (
          <div style={{ display: "flex" }}>
            {this.propValue.input.title}{" "}
            <label
              hidden={!this.propValue.input.required}
              style={{ color: "red" }}
            >
              *
            </label>
          </div>
        );
      }
    } else {
      return (
        <div style={{ display: "flex" }}>
          {this.propValue.input.title}{" "}
          <label
            hidden={!this.propValue.input.required}
            style={{ color: "red" }}
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
      this.setflexType("date");
    } else {
      this.setshowIconLeft(false);
      this.setflexType("text");
    }
  }

  togglePasswordVisibility = () => {
    this.setShowPassword(!this.showPassword);
  };

  checkInputType() {
    return "date";
  }

  OnchangeTriggerChangeToAutoCorrection(e, setInput, isCorrect) {
    setInput((prevState) => ({
      ...prevState,
      value: e,
      is_correct: isCorrect,
    }));
  }
}

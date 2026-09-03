import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ColorHelper from "../../util/color";

function CustomSelect(p) {
  const [value, setValue] = useState(null);
  const [isFirstSelect, setisFirstSelect] = useState(true);
  const props = p.props;
  const colorHelper = new ColorHelper();

  const handleChange = (event, newValue) => {
    setisFirstSelect(false);
    setValue(newValue);
    p.event("change", newValue ? newValue.value : "", p);
  };

  // Clear when instructed
  useEffect(() => {
    if (props?.select?.clearValue) {
      setValue(null);
    }

    if (props.select?.value) {
      // setValue(props.select?.defualtValue);
    }
  }, [
    props?.select?.clearValue,
    props.select?.value,
    props.select?.data,
    props.select?.defualtValue,
    props.select?.defualtTitle,
  ]);

  return (
    <div style={{ paddingTop: "15px" } }  className="siemreap-regular">
      <Box  className="siemreap-regular">
        <FormControl fullWidth  className="siemreap-regular">
          <Autocomplete
      
            disabled={props.mode == "view" ? true : false}
            options={props.select.data}
            getOptionLabel={(option) => option.label}
            value={props.select.clearValue ? null : value}
            onChange={handleChange}
            isOptionEqualToValue={(option, val) => option?.value === val?.value}
            noOptionsText="មិនមានជម្រើស"
            renderOption={(propsOption, option) => (
              <li className="siemreap-regular" {...propsOption} key={option.value}>
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
               className="siemreap-regular"
                {...params}
                label={
                  props?.select.defualtValue == "" || isFirstSelect == false ? (
                    <span className="siemreap-regular">
                      {value == null ? props?.select?.icon : ""}
                      &nbsp;
                      {props?.select?.title}
                      {props?.select?.required && (
                        <span style={{ color: "red" }}> *</span>
                      )}
                    </span>
                  ) : (
                    props?.select?.defualtTitle
                  )
                }
                error={!props.select.is_correct}
                helperText={!props.select.is_correct ? props.select.error : ""}
                InputProps={{
                  ...params.InputProps,
                  startAdornment:
                    value && props?.select?.icon ? (
                      <InputAdornment  position="start" sx={{ mr: 1 }}>
                        {props.select.icon}
                      </InputAdornment>
                    ) : null,
                }}
                sx={{
                  "& label.Mui-focused": {
                    color: colorHelper.main(), // ✅ ពណ៌ label នៅពេល focus
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: props.select.is_correct ? "gray" : "red", // ✅ border ធម្មតា
                    },
                    "&:hover fieldset": {
                      borderColor: colorHelper.main(), // ✅ border ពេល hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colorHelper.main(), // ✅ border ពេល focus
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "black", // ✅ text color inside input
                  },
                }}
              />
            )}
          />
        </FormControl>
      </Box>
    </div>
  );
}

export default CustomSelect;

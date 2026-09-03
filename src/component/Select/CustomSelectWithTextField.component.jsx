import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

// For file upload
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function CustomSelect(p) {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isFirstSelect, setisFirstSelect] = useState(true);
  const [fileName, setFileName] = useState("");
  const props = p.props;

  // Handle dropdown change
  const handleChange = (event, newValue) => {
    setisFirstSelect(false);
    setValue(newValue);
    setInputValue(newValue ? newValue.label : "");
    // Return only the value, not the entire object
    p.event("change", newValue ? newValue.value : "", p);
  };

  // Handle text input change (for free text)
  const handleInputChange = (event) => {
    const newInputValue = event.target.value;
    setInputValue(newInputValue);
    setValue(null); // Clear selected value when typing free text

    // Always return the value for text input
    if (props.select?.type === "text") {
      p.event("change", newInputValue, p);
    }
  };

  // Handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      // Return only the file name as text
      p.event("change", file.name, p);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    p.event("change", "", p);
  };

  // Clear when instructed
  useEffect(() => {
    if (props?.select?.clearValue) {
      setValue(null);
      setInputValue("");
      setFileName("");
    }

    // Set initial value if provided
    if (props.select?.value && props.select?.data) {
      const initialValue = props.select.data.find(
        (item) => item.value === props.select.value,
      );
      setValue(initialValue || null);
      setInputValue(initialValue ? initialValue.label : "");
    }

    // Set initial text if provided (for free text mode)
    if (props.select?.text && !props.select?.value) {
      setInputValue(props.select.text);
    }

    // Set initial file name if provided
    if (props.select?.fileValue) {
      setFileName(props.select.fileValue);
    }
  }, [
    props?.select?.clearValue,
    props.select?.value,
    props.select?.data,
    props.select?.defualtValue,
    props.select?.defualtTitle,
    props.select?.fileValue,
    props.select?.text,
  ]);

  // If it's a file upload type
  if (props.select?.type === "file") {
    return (
      <div style={{ paddingTop: "15px" }}>
        <Box>
          <FormControl fullWidth>
            <TextField
              disabled={props.mode == "view" ? true : false}
              value={fileName}
              placeholder={props?.select?.placeholder || "ជ្រើសរើសឯកសារ"}
              label={
                <span>
                  {props?.select?.icon}
                  &nbsp;
                  {props?.select?.title}
                  {props?.select?.required && (
                    <span style={{ color: "red" }}> *</span>
                  )}
                </span>
              }
              error={!props.select.is_correct}
              helperText={!props.select.is_correct ? props.select.error : ""}
              InputProps={{
                readOnly: true,
                startAdornment: props?.select?.icon ? (
                  <InputAdornment position="start">
                    {props.select.icon}
                  </InputAdornment>
                ) : null,
                endAdornment: (
                  <InputAdornment position="end">
                    {fileName ? (
                      <Button
                        onClick={handleRemoveFile}
                        size="small"
                        color="error"
                        disabled={props.mode === "view"}
                        sx={{
                          minWidth: "auto",
                          textTransform: "none",
                          mr: 1,
                        }}
                      >
                        លុប
                      </Button>
                    ) : (
                      <Button
                        component="label"
                        variant="contained"
                        size="small"
                        disabled={props.mode === "view"}
                        sx={{
                          backgroundColor: "green",
                          "&:hover": {
                            backgroundColor: "darkgreen",
                          },
                          textTransform: "none",
                          minWidth: "80px",
                        }}
                      >
                        រកមើល
                        <VisuallyHiddenInput
                          type="file"
                          onChange={handleFileChange}
                          accept={props?.select?.accept || "*"}
                        />
                      </Button>
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label.Mui-focused": {
                  color: "green",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: props.select.is_correct ? "gray" : "red",
                  },
                  "&:hover fieldset": {
                    borderColor: "darkgreen",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "green",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "black",
                },
              }}
            />
          </FormControl>
        </Box>
      </div>
    );
  }

  // If it's a free text input mode (no dropdown)
  if (props.select?.type === "text") {
    return (
      <div style={{ paddingTop: "15px" }}>
        <Box>
          <FormControl fullWidth>
            <TextField
              id={props.select?.id || "text-field"}
              disabled={props.mode == "view" ? true : false}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={props?.select?.placeholder || "បញ្ចូលអត្ថបទ"}
              label={
                <span>
                  {props?.select?.icon}
                  &nbsp;
                  {props?.select?.title}
                  {props?.select?.required && (
                    <span style={{ color: "red" }}> *</span>
                  )}
                </span>
              }
              error={!props.select.is_correct}
              helperText={!props.select.is_correct ? props.select.error : ""}
              InputProps={{
                startAdornment: props?.select?.icon ? (
                  <InputAdornment position="start">
                    {props.select.icon}
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                "& label.Mui-focused": {
                  color: "green",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: props.select.is_correct ? "gray" : "red",
                  },
                  "&:hover fieldset": {
                    borderColor: "darkgreen",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "green",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "black",
                },
              }}
            />
          </FormControl>
        </Box>
      </div>
    );
  }

  // Regular dropdown select with option for free text
  return (
    <div style={{ paddingTop: "15px" }}>
      <Box>
        <FormControl fullWidth>
          {props.select?.allowFreeText ? (
            // Combobox style: can select from dropdown OR type free text
            <Autocomplete
              disabled={props.mode == "view" ? true : false}
              options={props.select.data || []}
              getOptionLabel={(option) => {
                if (typeof option === "string") return option;
                return option?.label || "";
              }}
              value={value}
              onChange={handleChange}
              freeSolo={props.select.allowFreeText}
              onInputChange={(event, newInputValue, reason) => {
                setInputValue(newInputValue);

                // For free text, return the input value when typing
                if (props.select.allowFreeText) {
                  // Don't trigger on option select (that's handled by onChange)
                  if (reason === "input") {
                    p.event("change", newInputValue, p);
                  }
                }
              }}
              inputValue={inputValue}
              isOptionEqualToValue={(option, val) => {
                if (typeof option === "string" || typeof val === "string")
                  return option === val;
                return option?.value === val?.value;
              }}
              noOptionsText="មិនមានជម្រើស"
              renderOption={(propsOption, option) => (
                <li {...propsOption} key={option.value}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  id={props.select?.id || "dropdown-field"}
                  label={
                    props?.select.defualtValue == "" ||
                    isFirstSelect == false ? (
                      <span>
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
                  helperText={
                    !props.select.is_correct ? props.select.error : ""
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment:
                      value && props?.select?.icon ? (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          {props.select.icon}
                        </InputAdornment>
                      ) : null,
                  }}
                  sx={{
                    "& label.Mui-focused": {
                      color: "green",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: props.select.is_correct ? "gray" : "red",
                      },
                      "&:hover fieldset": {
                        borderColor: "darkgreen",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "green",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "black",
                    },
                  }}
                />
              )}
            />
          ) : (
            // Regular dropdown (no free text)
            <Autocomplete
              disabled={props.mode == "view" ? true : false}
              options={props.select.data || []}
              getOptionLabel={(option) => option?.label || ""}
              value={props.select.clearValue ? null : value}
              onChange={handleChange}
              isOptionEqualToValue={(option, val) =>
                option?.value === val?.value
              }
              noOptionsText="មិនមានជម្រើស"
              renderOption={(propsOption, option) => (
                <li {...propsOption} key={option.value}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  id={props.select?.id || "dropdown-field"}
                  label={
                    props?.select.defualtValue == "" ||
                    isFirstSelect == false ? (
                      <span>
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
                  helperText={
                    !props.select.is_correct ? props.select.error : ""
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment:
                      value && props?.select?.icon ? (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          {props.select.icon}
                        </InputAdornment>
                      ) : null,
                  }}
                  sx={{
                    "& label.Mui-focused": {
                      color: "green",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: props.select.is_correct ? "gray" : "red",
                      },
                      "&:hover fieldset": {
                        borderColor: "darkgreen",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "green",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "black",
                    },
                  }}
                />
              )}
            />
          )}
        </FormControl>
      </Box>
    </div>
  );
}

export default CustomSelect;

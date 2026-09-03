import React, { useState } from "react";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "./CustomDatePicker.style.css";
import { MdOutlineClear } from "react-icons/md";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Autocomplete from "@mui/material/Autocomplete";

const CustomDatePicker = () => {
  const [date, setDate] = useState(null);

  return (
    <div style={{ paddingTop: "15px" }}>
      <DatePicker
        className="date-picker-full"
        format="dd/MM/yyyy"
        onChange={setDate}
        value={date}
        maxDate={new Date()}
        clearIcon={date == null ? null : <MdOutlineClear />}
      />
    </div>
  );
};

export default CustomDatePicker;

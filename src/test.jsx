import React from "react";
import ExcelExport from "./excel_exporter.js";

function Test() {
  // Decalaration
  const excelExport = new ExcelExport();

  // View
  return (
    <div>
      <button onClick={() => excelExport.yearly_financial_report("abc")}>
        Export
      </button>
    </div>
  );
}

export default Test;

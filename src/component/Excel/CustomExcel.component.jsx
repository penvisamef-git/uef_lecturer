import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
export default function CustomExcel({
  data,
  column,
  title,
  fileName,
  colCellStyle,
  rowCellStyle,
}) {
  const columnExcel = column;
  const col = [];
  pushColomn();
  function pushColomn() {
    columnExcel.map((row, i) => {
      col.push(row.key);
    });
  }

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = columnExcel;

    worksheet.getCell("A1").value = title.name;
    worksheet.getCell("A1").font = title.font;
    worksheet.getCell("E1").value = "Exported User Data";

    const headerRow = worksheet.getRow(3);
    headerRow.values = col;

    // Header styling
    headerRow.eachCell((cell) => {
      Object.assign(cell, colCellStyle);
      cell.fill = colCellStyle.fill;
      cell.font = colCellStyle.font;
      cell.alignment = colCellStyle.alignment;
      cell.border = colCellStyle.border;
    });

    // Body Row styling
    data.forEach((item, index) => {
      const row = worksheet.addRow({
        កាលបរិច្ឆេទ: item.name,
        យោង: item.ref,
        បុគ្គលពាក់ព័ន្ធ: item.relevant_people,
        បរិយាយ: item.description,
        គណនី: item.account,
      });

      row.eachCell((cell) => {
        cell.font = rowCellStyle.font;
        cell.alignment = rowCellStyle.alignment;
      });
    });

    const totalយោង = data.reduce((sum, person) => sum + person.ref, 0);
    const totalRow = worksheet.addRow({ កាលបរិច្ឆេទ: "Total", យោង: totalយោង });
    totalRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sample Data Table</h2>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th
                key={key}
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((val, i) => (
                <td
                  key={i}
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                  }}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleExport}>Export to Excel</button>
    </div>
  );
}

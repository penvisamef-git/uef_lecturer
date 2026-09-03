import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

class ExcelExport {


    



  async yearly_financial_report(fileName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Title");
    //  =================== //

    // Design
    // worksheet.mergeCells("A1:J1");
    worksheet.mergeCells("A1:J2");
    const cell = worksheet.getCell("A1");
    cell.value = "របាយការណ៍ទាញយក";
    cell.font = {
      name: "Moul",
      bold: true,
      color: { argb: "FF1F497D" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };


    //  =================== //
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  }
}

export default ExcelExport;

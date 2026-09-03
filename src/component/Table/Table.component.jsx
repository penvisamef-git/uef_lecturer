import React from "react";
import DataTable from "react-data-table-component";

function Table(props) {
  const { columns, data } = props;

  // Custom styles for the table
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#f0f0f0",
        color: "#333",
        fontWeight: "bold",
        fontFamily: "battambang-bold", // header font
      },
    },
    rows: {
      style: (row, index) => ({
        backgroundColor: index % 2 === 0 ? "#ffffff" : "red", // alternating row colors
        fontFamily: "battambang, sans-serif", // row font
      }),
    },
  };

  return (
    <div>
      <br />
      <DataTable
        pagination
        columns={columns}
        data={data}
        customStyles={customStyles}
      />
    </div>
  );
}

export default Table;

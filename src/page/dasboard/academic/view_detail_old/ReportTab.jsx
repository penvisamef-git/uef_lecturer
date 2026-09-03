import React from "react";
import { FaDownload, FaChartBar } from "react-icons/fa";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";

function ReportTab({ classData }) {
  return (
    <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
      <div className="card-body">
        <div className="row">
          <div className="col-md-12">
            <h5 className="siemreap-regular">របាយការណ៍សង្ខេប</h5>
            <hr />
          </div>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className="card text-center" style={{ background: "#f8f9fa" }}>
              <div className="card-body">
                <h2 style={{ color: "#1a3c2a" }}>{classData.total_students || 0}</h2>
                <small className="text-muted siemreap-regular">ចំនួននិស្សិត</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center" style={{ background: "#f8f9fa" }}>
              <div className="card-body">
                <h2 style={{ color: "#28a745" }}>{classData.students?.filter(s => s.status).length || 0}</h2>
                <small className="text-muted siemreap-regular">និស្សិតសកម្ម</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center" style={{ background: "#f8f9fa" }}>
              <div className="card-body">
                <h2 style={{ color: "#dc3545" }}>{classData.students?.filter(s => !s.status).length || 0}</h2>
                <small className="text-muted siemreap-regular">និស្សិតអសកម្ម</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center" style={{ background: "#f8f9fa" }}>
              <div className="card-body">
                <h2 style={{ color: "#ffc107" }}>
                  {classData.time_table?.schedule?.reduce((acc, day) => acc + day.periods.length, 0) || 0}
                </h2>
                <small className="text-muted siemreap-regular">ម៉ោងសិក្សា</small>
              </div>
            </div>
          </div>
        </div>

        <RowBreaker />

        <div className="row">
          <div className="col-md-12 text-center">
            <button className="btn" style={{ background: "#1a3c2a", color: "white" }}>
              <FaDownload className="me-1" /> ទាញយករបាយការណ៍
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportTab;
import React from "react";
import { FaCalendarAlt, FaUsers, FaChartBar } from "react-icons/fa";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component";

function ClassDetailTab({ classData, getShiftLabel, getStatusLabel, getStatusColor, getDegreeLabel }) {
  return (
    <div className="card shadow-sm" style={{ borderRadius: "10px", border: "none" }}>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">កូដវគ្គសិក្សា</label>
              <h5 className="siemreap-regular">{classData.code}</h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">ជំនាញ</label>
              <h5 className="siemreap-regular">{classData.major_id?.name || "N/A"}</h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">កម្រិតសិក្សា</label>
              <h5 className="siemreap-regular">{getDegreeLabel(classData.degree_level)}</h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">ឆ្នាំសិក្សា (ជំនាញ)</label>
              <h5 className="siemreap-regular">ឆ្នាំទី {classData.major_year}</h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">ឆមាស</label>
              <h5 className="siemreap-regular">ឆមាសទី {classData.semester}</h5>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">ឆ្នាំសិក្សា</label>
              <h5 className="siemreap-regular">{classData.year_study_from} - {classData.year_study_to}</h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">វេនសិក្សា</label>
              <h5 className="siemreap-regular">{getShiftLabel(classData.shift)}</h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">បន្ទប់</label>
              <h5 className="siemreap-regular">{classData.room_id?.name || "N/A"}</h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">ស្ថានភាព</label>
              <h5>
                <span className="badge" style={{
                  background: getStatusColor(classData.class_status),
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}>
                  {getStatusLabel(classData.class_status)}
                </span>
              </h5>
            </div>
            <div className="mb-3">
              <label className="text-muted small siemreap-regular">កំណត់ចំណាំ</label>
              <h5 className="siemreap-regular">{classData.note || "(មិនមាន)"}</h5>
            </div>
          </div>
        </div>

        <RowBreaker />
        <div className="row">
          <div className="col-md-4">
            <div className="card" style={{ background: "#f8f9fa", borderLeft: "4px solid #1a3c2a" }}>
              <div className="card-body d-flex align-items-center">
                <FaCalendarAlt style={{ fontSize: "2rem", color: "#1a3c2a", marginRight: "15px" }} />
                <div>
                  <small className="text-muted siemreap-regular">ម៉ោងសិក្សា</small>
                  <h5 className="mb-0 siemreap-regular">{classData.time_table ? "មាន" : "គ្មាន"}</h5>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card" style={{ background: "#f8f9fa", borderLeft: "4px solid #28a745" }}>
              <div className="card-body d-flex align-items-center">
                <FaUsers style={{ fontSize: "2rem", color: "#28a745", marginRight: "15px" }} />
                <div>
                  <small className="text-muted siemreap-regular">ចំនួននិស្សិត</small>
                  <h5 className="mb-0 siemreap-regular">{classData.total_students || 0} នាក់</h5>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card" style={{ background: "#f8f9fa", borderLeft: "4px solid #ffc107" }}>
              <div className="card-body d-flex align-items-center">
                <FaChartBar style={{ fontSize: "2rem", color: "#ffc107", marginRight: "15px" }} />
                <div>
                  <small className="text-muted siemreap-regular">មុខវិជ្ជា</small>
                  <h5 className="mb-0 siemreap-regular">
                    {classData.time_table?.schedule?.reduce((acc, day) => acc + day.periods.length, 0) || 0}
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassDetailTab;
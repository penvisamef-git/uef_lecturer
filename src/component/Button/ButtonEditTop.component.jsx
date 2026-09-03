import React from "react";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

function ButtonEditTop({ isShow, url }) {
  const navigate = new useNavigate();
  return (
    <div hidden={!isShow} className="container-fluid p-0">
      <div className="row p-0">
        <div className="col-md-12 d-flex justify-content-end p-0">
          <button
            onClick={() => navigate(url)}
            type="button"
            className="btn btn-secondary"
            style={{ marginRight: "10px" }}
          >
            <CiEdit style={{ marginRight: "5px", marginTop: "-2px" }} />{" "}
            <label style={{ cursor: "pointer" }}>កែប្រែ</label>
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <br />
        </div>
      </div>
    </div>
  );
}

export default ButtonEditTop;

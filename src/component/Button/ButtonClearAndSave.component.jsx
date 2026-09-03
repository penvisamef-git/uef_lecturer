import React from "react";
import { FiSave } from "react-icons/fi";
import { MdCleaningServices } from "react-icons/md";
import Swal from "sweetalert2";
import { IoIosArrowBack } from "react-icons/io";

function ButtonClearAndSave({ formRef, isShowSaveButton, isShowClearButton, isHiddenBackBtn = false }) {
  const handleClear = () => {
    Swal.fire({
      title: "តើអ្នកចង់សម្អាតទិន្នន័យមែនទេ?",
      text: "ការសម្អាតនឹងលុបទិន្នន័យទាំងអស់!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "សម្អាត",
      confirmButtonColor: "green",
      cancelButtonText: "បោះបង់",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed && formRef.current) {
        formRef.current.reset(); // Reset the form
        window.location.reload();
      }
    });
  };

  return (
    <div className="container-fluid p-1">
      <div className="row p-0">
        <div className="col-md-3">
          <button
          hidden={isHiddenBackBtn} 
            type="button"
            className="btn btn-link"
            onClick={() => window.history.back()}
          >
            <IoIosArrowBack style={{ color: "green", fontSize: "20px" }} />
          </button>
        </div>
        <div className="col-md-9 d-flex justify-content-end p-0">
          <button
            hidden={!isShowClearButton}
            type="button"
            className="btn btn-outline-danger"
            onClick={handleClear}
            style={{ marginRight: "10px" }}
          >
            <MdCleaningServices
              style={{ marginRight: "5px", marginTop: "-2px" }}
            />
            <label style={{ cursor: "pointer" }}>សម្អាត</label>
          </button>
          <button
            hidden={!isShowSaveButton}
            type="button submit"
            className="btn btn-outline-success me-2 siemreap-regular"
          >
            <FiSave style={{ marginRight: "5px", marginTop: "-2px" }} />{" "}
            <label style={{ cursor: "pointer" }}>រក្សាទុក</label>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ButtonClearAndSave;

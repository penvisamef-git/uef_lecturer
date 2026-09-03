// react
import React, { useRef, useState } from "react";
import { RiLockPasswordFill } from "react-icons/ri";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdSaveAlt } from "react-icons/md";
import Loading from "../../../../component/Loading/Loading.component";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import CustomInputhelper from "../../../../component/Input/CustomInputHelper.script.js";
import CustomInput from "../../../../component/Input/CustomInput.component";
import { TbLockPassword } from "react-icons/tb";
import {
  getAllRequest,
  updateRequest,
  deleteRequest,
  postRequest,
  getByIdRequest,
} from "../../../../util/request_api";

function Change_password({ mode, auth }) {
  const formref = useRef();
  const [isLoading, setisLoading] = useState(false);
  const access_token = auth.getClientLogin()?.data?.access_token;
  const access_id = auth.getClientLogin()?.data?._id;
  const swalToast = new SwalToast();
  
  const [inputOldPassword, setInputOldPassword] = useState({
    title: "ពាក្យសម្ងាត់ចាស់",
    id: "current_password",
    required: true,
    is_correct: true,
    type: "password",
    icon: null,
    error: "សូមបំពេញ ពាក្យសម្ងាត់ចាស់",
    value: "",
    readonly: false,
  });

  const [inputNewPassword, setInputNewPassword] = useState({
    title: "ពាក្យសម្ងាត់ថ្មី",
    id: "new_password",
    required: true,
    is_correct: true,
    type: "password",
    icon: null,
    error: "សូមបំពេញ ពាក្យសម្ងាត់ថ្មី ",
    value: "",
    readonly: false,
  });

  const [inputConfirmNewPassword, setInputConfirmNewPassword] = useState({
    title: "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី",
    id: "confirm_new_password",
    required: true,
    is_correct: true,
    type: "password",
    icon: null,
    error: "សូមបំពេញដេីម្បី បញ្ជាក់ពាក្យសម្ងាត់ថ្មី",
    value: "",
    readonly: false,
  });

  const customInputHelper = new CustomInputhelper();
  
  function validateStrongPassword(data) {
    var userPassword = data;
    var strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPasswordPattern.test(userPassword);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    var data = customInputHelper.formValidation([
      { i: inputOldPassword, s: setInputOldPassword },
      { i: inputNewPassword, s: setInputNewPassword },
      { i: inputConfirmNewPassword, s: setInputConfirmNewPassword },
    ]);

    if (data.status) {
      if (inputConfirmNewPassword.value == inputNewPassword.value) {
        if (!validateStrongPassword(inputNewPassword.value)) {
          swalToast.toastError(
            "ពាក្យសម្ងាត់របស់អ្នកមិនមានសុវត្ថិភាពគ្រប់គ្រាន់ទេ! (ត្រូវមានអក្សរធំ, តូច, លេខ, និងសញ្ញាពិសេស យ៉ាងហោចណាស់ ៨ តួ)",
            3000
          );
        } else {
          successValidation(data, inputNewPassword.value);
        }
      } else {
        setInputNewPassword((prev) => ({
          ...prev,
          is_correct: false,
        }));
        setInputConfirmNewPassword((prev) => ({
          ...prev,
          is_correct: false,
        }));
        swalToast.toastError(
          "ពាក្យសម្ងាត់ថ្មី និងបញ្ជាក់ពាក្យសម្ងាត់ថ្មី ខុសគ្នា",
          3000
        );
      }
    }
  };

  async function successValidation(data, password) {
    setisLoading(true);
    try {
      const api = `${process.env.REACT_APP_API_HOST}/api/admin/student-management/teacher`;
     
      const response = await updateRequest(`${api}-update-password-no-token/for-teacher/${access_id}`, {
        password: password,
      });
      
      console.log("Response:", response);
      
      if (response.success) {
        swalToast.toastSuccess("ពាក្យសម្ងាត់បានកែប្រែដោយជោគជ័យ", 2000);
        // Reset form fields
        setInputOldPassword(prev => ({ ...prev, value: "" }));
        setInputNewPassword(prev => ({ ...prev, value: "" }));
        setInputConfirmNewPassword(prev => ({ ...prev, value: "" }));
        setTimeout(() => {
          // window.location.reload()
        }, 2000);
      } else {
        swalToast.toastError(response.message || "មានបញ្ហាក្នុងការកែប្រែពាក្យសម្ងាត់!", 3000);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      swalToast.toastError("មានបញ្ហាក្នុងប្រព័ន្ធ! សូមព្យាយាមម្តងទៀត", 3000);
    } finally {
      setisLoading(false);
    }
  }

  // ============================================================
  // MINIMAL CLEAN WHITE CARD STYLE
  // ============================================================
  return (
    <form ref={formref} onSubmit={handleSubmit}>
      <div 
        className="container mt-4"
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
          border: "1px solid #f0f4f0",
          padding: "32px",
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-4 text-center">
            <div
              style={{
                background: "#f8faf8",
                borderRadius: "20px",
                padding: "30px 20px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TbLockPassword
                style={{
                  width: "140px",
                  height: "140px",
                  color: "#047857",
                  marginBottom: "16px",
                }}
              />
              <p 
                className="siemreap-regular text-muted"
                style={{ fontSize: "14px", textAlign: "center" }}
              >
                សូមបំពេញព័ត៌មានខាងក្រោម<br />
                ដើម្បីប្តូរពាក្យសម្ងាត់របស់អ្នក
              </p>
            </div>
          </div>

          <div className="col-md-8">
            <h4 
              className="siemreap-regular mb-4"
              style={{
                color: "#1a2e1a",
                fontWeight: "600",
              }}
            >
              <RiLockPasswordFill className="me-2" style={{ color: "#047857" }} />
              ប្តូរពាក្យសម្ងាត់
            </h4>
            
            <CustomInput
              event={(a, e) =>
                setInputOldPassword((prev) => ({
                  ...prev,
                  value: e,
                  is_correct: true,
                }))
              }
              props={{ input: inputOldPassword, mode }}
            />

            <CustomInput
              event={(a, e) =>
                setInputNewPassword((prev) => ({
                  ...prev,
                  value: e,
                  is_correct: true,
                }))
              }
              props={{ input: inputNewPassword, mode }}
            />

            <CustomInput
              event={(a, e) =>
                setInputConfirmNewPassword((prev) => ({
                  ...prev,
                  value: e,
                  is_correct: true,
                }))
              }
              props={{ input: inputConfirmNewPassword, mode }}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-12">
            <div className="d-flex justify-content-end">
              <button 
                type="submit" 
                className="btn"
                style={{
                  background: "#047857",
                  color: "white",
                  padding: "10px 36px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "500",
                  fontSize: "15px",
                  transition: "all 0.3s ease",
                  fontFamily: "'Khmer OS Siemreap', 'Khmer OS', 'Moul', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#065f46";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#047857";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <label style={{ cursor: "pointer" }}>
                  រក្សាទុក <MdSaveAlt className="ms-2" />
                </label>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Loading is_loading={isLoading} />
    </form>
  );
}

export default Change_password;
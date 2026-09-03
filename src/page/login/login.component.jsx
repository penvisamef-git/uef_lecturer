// React
import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Style
import "./login.style.css";

// Script
import {
  postRequest,
  getByIdRequest,
  updateRequest,
} from "../../util/request_api";
import CustomInputHelper from "../../component/Input/CustomInputHelper.script";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Auth from "../../util/auth";
import SwalToast from "../../component/SwalToast/SwalToast";
import RouteScript from "../../route/route.script";
import ColorHelper from "../../util/color";
// Component
import CustomInput from "../../component/Input/CustomInput.component";
import RowBreaker from "../../component/Boostramp/RowBreaker.component";
import Loading from "../../component/Loading/Loading.component";
import Version from "../dasboard/version/version.script";
// Icon
import { FaUserTie } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaGraduationCap } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa"; // Add spinner icon

// Image
import logo_cpp from "../../asset/logo/logo.png";
import Swal from "sweetalert2";
import imgBg from "../../asset/image/university_bg.jpg";

function Login() {
  const colorHelper = new ColorHelper();
  const version = new Version();
  const routeScript = new RouteScript();
  const swalToast = new SwalToast();
  const customInputHelper = new CustomInputHelper();
  const auth = new Auth();
  const apiLogin = `${process.env.REACT_APP_API_HOST}/api/admin/teacher/auth/login`;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("កំពុងភ្ជាប់...");

  const [inputEmail, setInputEmail] = useState({
    title: "សារអេឡិចត្រូនិច",
    id: "info_email",
    required: true,
    is_correct: true,
    type: "text",
    icon: <FaUserTie />,
    error: "សូមបំពេញសារអេឡិចត្រូនិច!",
    value: "",
  });

  const [inputPassword, setInputPassword] = useState({
    title: "ពាក្យសម្ងាត់",
    id: "password",
    required: true,
    is_correct: true,
    type: "password",
    icon: <RiLockPasswordFill />,
    error: "សូមបំពេញពាក្យសម្ងាត់!",
    value: "",
  });

  useEffect(() => {
    document.title = "ចូលគណនី";
    document.getElementById(inputEmail.id)?.focus();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    var data = customInputHelper.formValidation([
      { i: inputEmail, s: setInputEmail },
      { i: inputPassword, s: setInputPassword },
    ]);

    if (data.status) {
      authValidation(data);
    }
  };

  function validateStrongPassword(data) {
    var userPassword = data.objectData.password;
    var strongPasswordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPasswordPattern.test(userPassword);
  }

  async function authValidation(dataValidation) {
    currentValidationError();
    setIsLoading(true);
    setLoadingMessage("កំពុងផ្ទៀងផ្ទាត់គណនី...");

    const data = {
      info_email: dataValidation.objectData.info_email,
      password: dataValidation.objectData.password,
    };

    try {
      const res = await axios.post(apiLogin, data);
      if (res.data?.success) {
        const loggedData = res.data;
        if (loggedData.data?.status) {
          if (loggedData.data.is_first_login) {
            setIsLoading(false);
            Swal.fire({
              title: "កែប្រែពាក្យសម្ងាត់ថ្មី",
              width: 450,
              html: `
              <div style="text-align: left; max-width: 320px; margin: 0">
                <br />
                <label for="newPassword" style="display: block; margin-bottom: 6px; font-weight: 600; color: #333;">
                  ពាក្យសម្ងាត់ថ្មី
                </label>
                <div style="position: relative; margin-bottom: 20px;">
                  <input
                    type="password"
                    id="newPassword"
                    class="swal2-input"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                    style="
                      width: 100%;
                      padding-right: 0px;
                      height: 50px;
                      border-radius: 6px;
                      border: 1px solid #ccc;
                      box-sizing: border-box;
                      transition: border-color 0.3s ease;
                    "
                    onfocus="this.style.borderColor='${colorHelper.mainGreen()}'"
                    onblur="this.style.borderColor='#ccc'"
                  />
                  <i
                    id="toggleNewPass"
                    class="fa fa-eye-slash"
                    style="
                      position: absolute;
                      top: 60%;
                      right: -30px;
                      transform: translateY(-50%);
                      cursor: pointer;
                      color: #888;
                      transition: color 0.3s ease;
                    "
                    onmouseover="this.style.color='${colorHelper.mainGreen()}'"
                    onmouseout="this.style.color='#888'"
                  ></i>
                </div>

                <label for="confirmPassword" style="display: block; margin-bottom: 6px; font-weight: 600; color: #333;">
                  បញ្ជាក់ពាក្យសម្ងាត់
                </label>
                <div style="position: relative;">
                  <input
                    type="password"
                    id="confirmPassword"
                    class="swal2-input"
                    placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                    style="
                      width: 100%;
                      padding-right: 0px;
                      height: 50px;
                      border-radius: 6px;
                      border: 1px solid #ccc;
                      box-sizing: border-box;
                      transition: border-color 0.3s ease;
                    "
                    onfocus="this.style.borderColor='${colorHelper.mainGreen()}'"
                    onblur="this.style.borderColor='#ccc'"
                  />
                  <i
                    id="toggleConfirmPass"
                    class="fa fa-eye-slash"
                    style="
                      position: absolute;
                      top: 60%;
                      right: -30px;
                      transform: translateY(-50%);
                      cursor: pointer;
                      color: #888;
                      transition: color 0.3s ease;
                    "
                    onmouseover="this.style.color='${colorHelper.mainGreen()}'"
                    onmouseout="this.style.color='#888'"
                  ></i>
                </div>
              </div>
              `,
              showCancelButton: true,
              confirmButtonColor: colorHelper.mainGreen(),
              cancelButtonColor: "#d33",
              confirmButtonText: "រក្សារទុក",
              cancelButtonText: "បោះបង់",
              reverseButtons: true,
              preConfirm: () => {
                const newPass =
                  Swal.getPopup().querySelector("#newPassword").value;
                const confirmPass =
                  Swal.getPopup().querySelector("#confirmPassword").value;

                const data = { objectData: { password: newPass } };
                if (!validateStrongPassword(data)) {
                  Swal.showValidationMessage(
                    "ពាក្យសម្ងាត់របស់អ្នកមិនមានសុវត្ថិភាពគ្រប់គ្រាន់ទេ! (ត្រូវការ 8 តួ, អក្សរធំ, អក្សរតូច, លេខ និងនិមិត្តសញ្ញា)"
                  );
                  return false;
                }

                if (newPass !== confirmPass) {
                  Swal.showValidationMessage("ពាក្យសម្ងាត់មិនត្រូវគ្នា!");
                  return false;
                }

                return newPass;
              },
              didOpen: () => {
                const toggleNew = document.getElementById("toggleNewPass");
                const toggleConfirm = document.getElementById("toggleConfirmPass");
                const newInput = document.getElementById("newPassword");
                const confirmInput = document.getElementById("confirmPassword");

                function toggleVisibility(icon, input) {
                  icon.addEventListener("click", () => {
                    if (input.type === "password") {
                      input.type = "text";
                      icon.className = "fa fa-eye";
                    } else {
                      input.type = "password";
                      icon.className = "fa fa-eye-slash";
                    }
                  });
                }

                toggleVisibility(toggleNew, newInput);
                toggleVisibility(toggleConfirm, confirmInput);
              },
              allowOutsideClick: () => !Swal.isLoading(),
            }).then(async (result) => {
              if (result.isConfirmed) {
                const api = `${process.env.REACT_APP_API_HOST}/api/admin/teacher/auth/login`;
                setIsLoading(true);
                setLoadingMessage("កំពុងធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់...");
                await updateRequest(
                  `${api}update-password-no-token/${loggedData.data._id}`,
                  {
                    password: result.value,
                  }
                );

                auth.setClientLogin(loggedData);
                setTimeout(() => {
                  window.location.replace(routeScript.route().summary_index);
                }, 1000);
              }
            });
          } else {
            setIsLoading(true);
            setLoadingMessage("កំពុងចូលគណនី...");
            auth.setClientLogin(loggedData);
            setTimeout(() => {
              window.location.replace(routeScript.route().class_start_index.url);
            }, 1000);
          }
        } else {
          error("គណនីរបស់អ្នកត្រូវបានផ្អាក!");
        }
      } else {
        error("គណនីនិងពាក្យសម្ងាត់មិនត្រឹមត្រូវ!");
        invalidInput();
      }
    } catch (err) {
      setIsLoading(false);
      if (err.response) {
        error("គណនីនិងពាក្យសម្ងាត់មិនត្រឹមត្រូវ!");
        invalidInput();
      } else if (err.request) {
        error("មិនអាចភ្ជាប់ទៅម៉ាស៊ីនបម្រើ! សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត");
        invalidInput();
      } else {
        error("ទិន្នន័យមេមានបញ្ហា! ព្យាយាមម្តងទៀតនៅពេលក្រោយ");
      }
    }
  }

  function error(title) {
    swalToast.toastError(title, 3000);
    setIsLoading(false);
  }

  function invalidInput() {
    setInputEmail({
      ...inputEmail,
      error: "សូមពិនិត្យសារអេឡិចត្រូនិចម្តងទៀត!",
      is_correct: false,
    });
    setInputPassword({
      ...inputPassword,
      error: "សូមពិនិត្យពាក្យសម្ងាត់ម្តងទៀត!",
      is_correct: false,
    });
  }

  function currentValidationError() {
    setInputEmail({
      ...inputEmail,
      error: "សូមបំពេញសារអេឡិចត្រូនិច!",
      is_correct: true,
    });
    setInputPassword({
      ...inputPassword,
      error: "សូមបំពេញពាក្យសម្ងាត់!",
      is_correct: true,
    });
  }

  return (
    <div className="login-page">
      {/* Split Layout Container */}
      <div className="login-container login-container-swapped">
        {/* Left Section - Login Form (NOW ON LEFT) */}
        <div className="login-left-form">
          <div className="login-center-wrapper">
            <div className="login-card">
              <div className="login-content">
                <form onSubmit={handleLogin}>
                  <div className="text-center">
                    <img
                      src={logo_cpp}
                      alt="logo"
                      className="img-fluid"
                      style={{
                        height: "180px",
                        width: "180px",
                        objectFit: "contain",
                        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.06))",
                      }}
                    />
                  </div>

                  <RowBreaker />

                  <CustomInput
                    event={(action, e) => {
                      setInputEmail((prev) => ({
                        ...prev,
                        value: e,
                        is_correct: true,
                      }));

                      setInputPassword((prev) => ({
                        ...prev,
                        is_correct: true,
                      }));
                    }}
                    props={{ input: inputEmail }}
                  />

                  <RowBreaker />

                  <CustomInput
                    event={(action, e) => {
                      setInputPassword((prev) => ({
                        ...prev,
                        value: e,
                        is_correct: true,
                      }));

                      setInputEmail((prev) => ({
                        ...prev,
                        is_correct: true,
                      }));
                    }}
                    props={{ input: inputPassword }}
                  />

                  <RowBreaker />

                  <button
                    style={{
                      borderRadius: "50px",
                      height: "56px",
                      marginTop: "10px",
                      background: isLoading 
                        ? "linear-gradient(135deg, #065f46, #047857)" 
                        : "linear-gradient(135deg, #047857, #059669, #10b981)",
                      backgroundSize: isLoading ? "100% 100%" : "200% 200%",
                      animation: isLoading ? "none" : "buttonGradient 3s ease infinite",
                      border: "none",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      fontSize: "1rem",
                      color: "white",
                      letterSpacing: "1px",
                      boxShadow: isLoading 
                        ? "0 4px 15px rgba(5, 150, 105, 0.2)" 
                        : "0 4px 25px rgba(5, 150, 105, 0.35)",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.85 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                    }}
                    type="submit"
                    className="btn btn-primary w-100 py-2 siemreap-regular"
                    disabled={isLoading}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = "translateY(-3px)";
                        e.target.style.boxShadow =
                          "0 8px 40px rgba(5, 150, 105, 0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 25px rgba(5, 150, 105, 0.35)";
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner 
                          style={{ 
                            animation: "spin 1s linear infinite",
                            fontSize: "1.2rem"
                          }} 
                        />
                        <label style={{ cursor: "pointer", color: "white" }}>
                          {loadingMessage}
                        </label>
                      </>
                    ) : (
                      <label style={{ cursor: "pointer", color: "white" }}>
                        ចូលគណនី
                      </label>
                    )}
                  </button>
                </form>

                {/* Fixed Footer Text Below Login Card */}
                <div className="login-footer-text">
                  <span>
                    © 2026
                    ប្រព័ន្ធគ្រប់គ្រងសាកលវិទ្យាល័យសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ
                  </span>
                  <br />
                  <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                    v{version.number()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - University Image (NOW ON RIGHT) */}
        <div
          className="login-right-image"
          style={{
            background: colorHelper.mainGreenGradient(),
            backgroundImage: `url(${imgBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="login-left-content">
            <span className="university-icon">
              <FaGraduationCap />
            </span>

            <div className="text-center">
              <h6
                className="moul-regular"
                style={{
                  color: "#FFFFFF",
                  textShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  fontSize: "1.4rem",
                }}
              >
                ប្រព័ន្ធគ្រប់គ្រងសាកលវិទ្យាល័យ
              </h6>
              <h6
                className="moul-regular"
                style={{
                  color: "#FFFFFF",
                  textShadow: "0 2px 15px rgba(0,0,0,0.3)",
                  fontSize: "1.1rem",
                  opacity: 0.95,
                }}
              >
                សេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ
              </h6>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
      {/* Loading component is now hidden - using button loading instead */}
      {false && <Loading is_loading={isLoading} message={loadingMessage} />}
    </div>
  );
}

export default Login;
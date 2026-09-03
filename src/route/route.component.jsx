// React
import React, { useState, useEffect, useMemo } from "react";

// Style
import "./route.style.css";

//Image
import logo from "../asset/logo/logo_white_stroke.png";
import avatar from "../asset/image/avatar.png";

// Script
import { Link } from "react-router-dom";

import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Auth from "../util/auth";
import Session from "../util/Session";
import RouteScript from "./route.script";
import { useNavigate } from "react-router-dom";
import SampleDB from "../util/sample_database/sampleDB";

// Component
import Login from "../page/login/login.component";
import Loading from "../component/Loading/Loading.component";
import { ToastContainer } from "react-toastify";
import CustomToast from "../component/Toast/CustomToast";
import MenuLeftBar from "./menu_left_bar/menu_left_bar.component";
import Version from "../page/dasboard/version/version.script";

// Icon
import { IoLocation } from "react-icons/io5";
import { IoMdMore } from "react-icons/io";
import { RiMenuFold4Fill } from "react-icons/ri";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { AiOutlineLogout } from "react-icons/ai";
import { AiOutlineMenuFold } from "react-icons/ai";
import { IoMdArrowDropright } from "react-icons/io";
import { FaPlus, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

function AppRoutes() {
  //================================================================
  // Declaration
  const version = new Version();
  const sampleDB = new SampleDB();
  const apiSessionToken = `${process.env.REACT_APP_API_HOST}/api/${process.env.REACT_APP_VERSION}/admin/auth/session-token`;
  const apiLogout = `${process.env.REACT_APP_API_HOST}/api/${process.env.REACT_APP_VERSION}/admin/auth/logout`;
  const auth = new Auth();
  const customToast = new CustomToast();
  const session = new Session();
  const [openMyAccount, setOpenMyAccount] = useState(false);
  const [menuCollaped, setmenuCollaped] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const prop = {
    auth: auth.getClientLogin(),
    session: session.get("ACC"),
  };
  // ✅ Pass setIsLoading to RouteScript constructor
  const routeScript = new RouteScript(prop, setisLoading);
  const routeURL = routeScript.route();
  const width_sidebar = 92;
  const width_content = 275;

  const isMobile = window.innerWidth <= 767;

  //================================================================
  // Loading
  useEffect(() => {
    authRefreshLogined();
  }, []);

  function authRefreshLogined() {
    document.addEventListener("click", (e) => {
      if (auth.getClientLogin()) {
        auth.setClientLogin(auth.getClientLogin());
      }
    });
  }

  //================================================================
  // Function
  const routeAuth = () => {
    if (auth.getClientLogin()) {
      return RouteLogin();
    } else {
      return RouteLogOut();
    }
  };

  function RouteLogOut() {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  function checkPermission(isSuperAdmin, loginGroupId, userRole) {
    if (isSuperAdmin) {
      return true;
    } else {
      if (loginGroupId == userRole?.id_admin) {
        return true;
      } else {
        return false;
      }
    }
  }

  function RouteLogin() {
    var listRoute = [];

    //************ Redirect ************
    const user = auth.getClientLogin()?.data;
    const userRole = {
      id_admin: "687dc2df144731e0efc41a35",
      id_noter: "68882da272f7b68ef2056dd2",
      is_super_admin: auth.getClientLogin()?.data?.is_super_admin,
    };

    if (
      checkPermission(userRole?.is_super_admin, user?.group_user_id, userRole)
    ) {
      listRoute.push(
        <Route
          path="/login"
          element={<Navigate to={"/admin/class-start"} />}
        />,
      );
      listRoute.push(
        <Route path="/" element={<Navigate to={"/admin/class-start"} />} />,
      );
    } else {
      listRoute.push(
        <Route
          path="/login"
          element={<Navigate to={"/admin/class-start"} />}
        />,
      );
      listRoute.push(
        <Route path="/" element={<Navigate to={"/admin/class-start"} />} />,
      );
    }

    listRoute.push(<Route path="*" element={<Navigate to="/" />} />);

    //************ Dashboard ************
    Object.values(routeURL).map((row, i) => {
      if (row.status) {
        listRoute.push(
          <Route
            key={i}
            path={row.url}
            element={
              <DashboardLayout
                page={row.component}
                breadcrumb={row.breadcurmb}
              />
            }
          />,
        );
      }
    });

    return <Routes>{listRoute}</Routes>;
  }

  //================================================================
  // Bubble Background Component (Memoized for performance)
  const BubbleBackground = React.memo(() => {
    const random = (min, max) => Math.random() * (max - min) + min;

    const bubbles = useMemo(() => {
      const bubbleCount = 25;
      return Array.from({ length: bubbleCount }, (_, i) => {
        const size = random(20, 120);
        const left = random(0, 100);
        const duration = random(30, 60);
        const delay = random(0, 25);
        const opacity = random(0.05, 0.15);
        const colors = [
          `radial-gradient(circle at 30% 30%, rgba(135, 206, 250, ${opacity + 0.05}), rgba(0, 105, 180, ${opacity}))`,
          `radial-gradient(circle at 70% 20%, rgba(100, 149, 237, ${opacity + 0.05}), rgba(25, 25, 112, ${opacity}))`,
          `radial-gradient(circle at 40% 60%, rgba(70, 130, 200, ${opacity + 0.05}), rgba(0, 0, 139, ${opacity}))`,
          `radial-gradient(circle at 60% 40%, rgba(173, 216, 230, ${opacity + 0.1}), rgba(0, 0, 205, ${opacity}))`,
        ];
        return {
          id: i,
          size,
          left,
          duration,
          delay,
          background: colors[Math.floor(Math.random() * colors.length)],
          opacity,
        };
      });
    }, []);

    return (
      <div className="bubble-background">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              background: bubble.background,
              opacity: bubble.opacity,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
            }}
          />
        ))}
      </div>
    );
  });

  //================================================================
  // Dashboard Layout Component
  function DashboardLayout({ page, breadcrumb }) {
    function clickCloseMenuAccount() {
      return () => {
        if (openMyAccount) {
          setOpenMyAccount(!openMyAccount);
        }
      };
    }

    const logoutUser = ({ auth, session, setisLoading }) => {
      Swal.fire({
        icon: "warning",
        title: "ចាកចេញ?",
        text: "តើអ្នកចង់ចាកចេញគណនី?",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "យល់ព្រម",
        cancelButtonText: "បោះបង់",
        reverseButtons: true,
        width: "350px",
        customClass: {
          popup: "siemreap-regular",
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          setisLoading(true);
          try {
            await localStorage.clear();
            await sessionStorage.clear();
            await document.cookie.split(";").forEach(function (c) {
              document.cookie = c
                .replace(/^ +/, "")
                .replace(
                  /=.*/,
                  "=;expires=" + new Date().toUTCString() + ";path=/",
                );
            });
            await auth.removeClientLogin();
            if (session) session.remove("ACC");
            setTimeout(() => {
              window.location.replace("/login");
            }, 2000);
          } catch (error) {
            console.error("Logout error:", error);
            auth.removeClientLogin();
            if (session) session.remove("ACC");
            setTimeout(() => {
              window.location.replace("/login");
            }, 2000);
          }
        }
      });
    };

    return (
      <>
        {/* ====== LOADING OVERLAY - OUTSIDE CONTAINER ====== */}
        <Loading is_loading={isLoading} />

        <div className={`dashboard-container ${isDarkMode ? "dark-mode" : ""}`}>
          {/* Toast Container */}
          <ToastContainer />

          {/* ====== 1. MOBILE OVERLAY ====== */}
          {isMobile && menuCollaped && (
            <div
              className="sidebar-overlay"
              onClick={() => setmenuCollaped(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 999,
                animation: "fadeIn 0.3s ease",
              }}
            />
          )}

          {/* Header */}
          <header
            onClick={clickCloseMenuAccount()}
            className="dashboard-header"
            style={{
              "--sidebar-width-left":
                menuCollaped == false ? width_content + 1 + "px" : "0px",
            }}
          >
            <div className="header-left">
              <div style={{ display: "flex", alignItems: "center" }}>
                {menuCollaped == true ? (
                  <RiMenuFold4Fill
                    onClick={() => setmenuCollaped(!menuCollaped)}
                    style={{
                      height: "25px",
                      width: "30px",
                      marginLeft: "10px",
                      cursor: "pointer",
                      color: "darkgreen",
                    }}
                  />
                ) : (
                  <AiOutlineMenuFold
                    onClick={() => setmenuCollaped(!menuCollaped)}
                    style={{
                      color: "darkgreen",
                      height: "25px",
                      width: "30px",
                      cursor: "pointer",
                    }}
                  />
                )}

                <div
                  hidden={!menuCollaped}
                  className="text-center header-title"
                >
                  <h6
                    className="moul-regular"
                    style={{
                      marginLeft: "25px",
                      paddingTop: "5px",
                      fontSize: "13px",
                    }}
                  >
                    ​សាកលវិទ្យាល័យសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ{" "}
                  </h6>
                </div>
              </div>
            </div>

            <div
              className="header-right"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              {/* Account Dropdown */}
              <div
                className="account-dropdown"
                style={{ position: "relative" }}
              >
                <button
                  className="account-info"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMyAccount(!openMyAccount);
                  }}
                  style={{
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    width: "100%",
                  }}
                  type="button"
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <img
                      src={avatar}
                      alt="profile"
                      className="profile-img"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: isDarkMode
                          ? "2px solid #444"
                          : "2px solid #e0e0e0",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px",
                        width: "12px",
                        height: "12px",
                        background: "#4CAF50",
                        borderRadius: "50%",
                        border: isDarkMode
                          ? "2px solid #1a1a1a"
                          : "2px solid white",
                      }}
                    />
                  </div>
                  <div
                    className="account-labels"
                    style={{ marginLeft: "10px", textAlign: "left" }}
                  >
                    <div
                      className="account-name siemreap-bold"
                      style={{
                        fontSize: "14px",
                        color: isDarkMode ? "#fff" : "#333",
                      }}
                    >
                      {auth?.getClientLogin()?.data?.info_firstname_kh +
                        " " +
                        auth?.getClientLogin()?.data?.info_lastname_kh}
                    </div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      <label style={{cursor:'pointer'}}>គ្រូបង្រៀន</label>
                    </div>
                  </div>
                </button>

                {openMyAccount && (
                  <div
                    className="dropdown-menus"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "60px",
                      background: isDarkMode ? "#2d2d2d" : "white",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                      padding: "8px",
                      minWidth: "200px",
                      zIndex: 1000,
                      border: isDarkMode ? "1px solid #444" : "1px solid #eee",
                    }}
                  >
                    {/* FIX: Use Link instead of <a> */}
                    <Link
                      to={routeURL.my_account_index.url}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 16px",
                        textDecoration: "none",
                        color: isDarkMode ? "#fff" : "#333",
                        borderRadius: "8px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = isDarkMode
                          ? "#3d3d3d"
                          : "#f5f5f5";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                      }}
                    >
                      <IoSettingsOutline
                        className="icon"
                        style={{ fontSize: "18px" }}
                      />
                      <label style={{ cursor: "pointer" }}>
                        ប្តូរពាក្យសម្ងាត់
                      </label>
                    </Link>

                    <button
                      onClick={() =>
                        logoutUser({ auth, session, setisLoading })
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 16px",
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: isDarkMode ? "#fff" : "#333",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = isDarkMode
                          ? "#3d3d3d"
                          : "#f5f5f5";
                        e.target.style.color = "#dc3545";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = isDarkMode ? "#fff" : "#333";
                      }}
                    >
                      <AiOutlineLogout
                        className="icon"
                        style={{ fontSize: "18px" }}
                      />
                      <label style={{ cursor: "pointer" }}>ចាកចេញ</label>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Left Sidebar and Right Content */}
          <div
            onClick={clickCloseMenuAccount()}
            className="dashboard-main"
            style={{
              "--sidebar-width-content":
                menuCollaped == false
                  ? width_content + 1 + "px"
                  : width_sidebar + 1 + "px",
            }}
          >
            {/* Left Sidebar - IMPROVED STYLE */}
            <aside
              className={
                isMobile == true
                  ? menuCollaped == true
                    ? "dashboard-sidebar active"
                    : "dashboard-sidebar deactive"
                  : "dashboard-sidebar"
              }
              style={{
                "--width_content": width_content + 10 + "px",
                "--sidebar-width": menuCollaped
                  ? width_sidebar + "px"
                  : width_content + "px",
                backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                borderRight: isDarkMode
                  ? "1px solid #2d2d2d"
                  : "1px solid #eef2f0",
                boxShadow: isDarkMode ? "none" : "2px 0 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="sidebar-header"
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                  zIndex: 10,
                  borderBottom: isDarkMode
                    ? "1px solid #2d2d2d"
                    : "1px solid #eef2f0",
                  paddingBottom: "12px",
                }}
              >
                <img
                  src={logo}
                  style={{
                    width: "100%",
                    height: menuCollaped ? "55px" : "90px",
                    objectFit: "contain",
                    padding: menuCollaped ? "10px" : undefined,
                    marginTop: !menuCollaped ? "30px" : "45px",
                    marginBottom: "-5px",
                  }}
                />
                <label
                  style={{
                    color: isDarkMode ? "#666" : "#aaa",
                    fontSize: "10px",
                    paddingTop: "8px",
                    textAlign: "center",
                    width: "100%",
                    display: "block",
                    fontWeight: "500",
                    letterSpacing: "0.5px",
                  }}
                >
                  {menuCollaped == true
                    ? version.numberShort()
                    : version.number()}
                </label>
                {!menuCollaped && (
                  <div
                    className="text-center mt-2"
                    style={{ marginBottom: "30px" }}
                  >
                    <h6
                      className="moul-regular"
                      style={{
                        fontSize: "13px",
                        color: isDarkMode ? "#fff" : "#1a2e1a",
                        fontWeight: "700",
                        letterSpacing: "0.3px",
                      }}
                    >
                      ប្រព័ន្ធគ្រប់គ្រងសាកលវិទ្យាល័យ
                    </h6>
                    <h6
                      className="moul-regular"
                      style={{
                        fontSize: "12px",
                        color: isDarkMode ? "#888" : "#6b7a6b",
                        fontWeight: "400",
                      }}
                    >
                      ​សេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ
                    </h6>
                  </div>
                )}
              </div>

              <div
                className="sidebar-scroll-content"
                style={{
                  overflowY: "auto",
                  height: "calc(100vh - 160px)",
                  paddingLeft: menuCollaped ? "6px" : "8px",
                  paddingRight: menuCollaped ? "6px" : "8px",
                  paddingBottom: "40px",
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                }}
              >
                <MenuLeftBar
                  event={(e) => {
                    if (isMobile) {
                      setmenuCollaped(!menuCollaped);
                    }
                  }}
                  prop={{
                    route: routeURL,
                    menuCollaped: menuCollaped,
                    isMobile: isMobile,
                    isDarkMode: isDarkMode,
                  }}
                />
              </div>
            </aside>

            {/* Right Content - Full Width (No Right Sidebar) */}
            <main
              className="dashboard-content"
              style={{
                backgroundColor: isDarkMode ? "#121212" : "#f8faf8",
                minHeight: "100vh",
              }}
            >
              <BubbleBackground />
              <div className="content-inner">
                <div
                  style={{
                    paddingTop: "100px",
                    paddingBottom: "100px",
                    color: isDarkMode ? "#fff" : "#333",
                  }}
                >
                  {page}
                </div>
              </div>
            </main>
          </div>

          {/* Breadcrumb - FIXED: Proper sidebar width */}
          <div
            onClick={clickCloseMenuAccount()}
            className="dashboard-breadcrumb"
            style={{
              zIndex: 10,
              "--sidebar-width": menuCollaped
                ? width_sidebar + "px"
                : width_content + "px",
              backgroundColor: isDarkMode ? "#1a1a1a" : "white",
              color: isDarkMode ? "#aaa" : "#666",
              borderTop: isDarkMode ? "1px solid #2d2d2d" : "1px solid #eef2f0",
            }}
          >
            <div className="mt-1" style={{ display: "flex", padding: "4px 0" }}>
              {breadcrumb.map((item, i) => (
                <div key={i} className="breadcrumb-items">
                  <Link
                    to={item.path}
                    className="siemreap-regular"
                    style={{
                      color:
                        i === breadcrumb.length - 1
                          ? isDarkMode
                            ? "#888"
                            : "gray"
                          : isDarkMode
                            ? "#10b981"
                            : "#047857",
                      cursor: "pointer",
                      textDecoration: "none",
                      fontSize: "13px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (i !== breadcrumb.length - 1) {
                        e.target.style.color = isDarkMode
                          ? "#34d399"
                          : "#065f46";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (i !== breadcrumb.length - 1) {
                        e.target.style.color = isDarkMode
                          ? "#10b981"
                          : "#047857";
                      }
                    }}
                  >
                    {item.name}
                  </Link>
                  {i !== breadcrumb.length - 1 && (
                    <span
                      className="siemreap-regular"
                      style={{
                        margin: "0px 10px",
                        color: isDarkMode ? "#444" : "#ccc",
                      }}
                    >
                      <IoMdArrowDropright />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer - FIXED: Proper sidebar width */}
          <footer
            style={{
              "--sidebar-width": menuCollaped
                ? width_sidebar + "px"
                : width_content + "px",
              backgroundColor: isDarkMode ? "#1a1a1a" : "white",
              borderTop: isDarkMode ? "1px solid #2d2d2d" : "1px solid #eef2f0",
            }}
            onClick={clickCloseMenuAccount()}
            className="dashboard-footer"
          >
            <label
              style={{
                fontSize: "0.7rem",
                color: isDarkMode ? "#555" : "#999",
              }}
            >
              @២០២៦
              រក្សាសិទ្ធិដោយប្រព័ន្ធគ្រប់គ្រងសាកលវិទ្យាល័យសេដ្ឋកិច្ចនិងហិរញ្ញវត្ថុ
            </label>
          </footer>
        </div>
      </>
    );
  }

  //================================================================
  // View
  return <BrowserRouter>{routeAuth()}</BrowserRouter>;
}
export default AppRoutes;

import React, { useEffect, useState } from "react";

// ==================================
// Component
import ProfileComponent from "../account/my_account/Account.component";
import ChangePassword from "../account/my_account/ChangePassword.component";

function Index({ auth }) {
  // ==================================
  // Declaration
  const [activeTab, setactiveTab] = useState("my_account");



  // ==================================
  // View
  return (
    <div
      className="container defualt_White_Shadow_Theme_2 p-0 mt-2 pt-0"
      style={{ borderRadius: "6px" }}
    >
      <div hidden className="row m-0 p-0">
        <div className="col-md-12 m-0 p-0">
          <ul
            className="nav nav-tabs"
            style={{
              backgroundColor: "whitesmoke",

              borderColor: "whitesmoke",
            }}
          >
            {/* <li className="nav-item">
              <a
                style={{
                  color: activeTab === "my_account" ? "black" : "darkblue",
                  borderColor:
                    activeTab === "my_account" ? "white" : "whitesmoke",
                  borderRadius: "0px",
                }}
                className={`nav-link ${
                  activeTab === "my_account" ? "active" : ""
                } battambang-bold`}
                onClick={() => setactiveTab("my_account")}
                href="#"
              >
                អំពីគណនី
              </a>
            </li> */}
            <li className="nav-item">
              <a
                style={{
                  color: activeTab === "expense" ? "black" : "darkblue",
                  borderColor: activeTab === "expense" ? "white" : "whitesmoke",
                  borderRadius: "0px",
                }}
                className={`nav-link ${
                  activeTab === "expense" ? "active" : ""
                } battambang-bold`}
                onClick={() => setactiveTab("expense")}
                href="#"
              >
                ប្តូរពាក្យសម្ងាត់
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="row m-0 p-0 mb-3">
        <div className="col-md-12">
          {activeTab === "my_account" ? (
            <ChangePassword mode={"edit"} auth={auth} />
          ) : (
             <ProfileComponent mode={"edit"} auth={auth} />
           
          )}
        </div>
      </div>


    </div>
  );
}

export default Index;

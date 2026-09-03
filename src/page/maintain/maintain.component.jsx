import React from "react";
import "./maintain.style.css";

// Icons
import { FaTools, FaWrench, FaClock, FaEnvelope } from "react-icons/fa";
import { MdConstruction } from "react-icons/md";
import { GiGearHammer } from "react-icons/gi";

function MaintainPage() {
  return (
    <div className="maintain-container">
      {/* Animated Background Shapes */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Main Content */}
      <div className="maintain-content" style={{ marginTop: "-150px" }}>
        {/* Animated Icon */}
        <div className="icon-wrapper">
          <div className="icon-circle">
            <MdConstruction className="main-icon" />
          </div>
          <div className="icon-rings">
            <span className="ring ring-1"></span>
            <span className="ring ring-2"></span>
            <span className="ring ring-3"></span>
          </div>
        </div>

        {/* Title */}
        <h1 className="maintain-title siemreap-regular">
          <span className="highlight">កំពុង</span>ថែទាំប្រព័ន្ធ
        </h1>

        <br />

        {/* Subtitle */}
        <p className="maintain-subtitle siemreap-regular">
          យើងខ្ញុំកំពុងធ្វើការកែលម្អប្រព័ន្ធ
          <br />
          ដើម្បីផ្តល់សេវាកម្មល្អប្រសើរជូនអ្នក
        </p>

        {/* Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="card-icon">
              <FaClock />
            </div>
            <h3 className="siemreap-regular">ពេលវេលាប៉ាន់ស្មាន</h3>
            <p className="siemreap-regular">នាពេលឆាប់ៗ</p>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <FaTools />
            </div>
            <h3 className="siemreap-regular">កំពុងធ្វើបច្ចុប្បន្នភាព</h3>
            <p className="siemreap-regular">ប្រព័ន្ធ និងមុខងារថ្មីៗ</p>
          </div>

          <div className="info-card">
            <div className="card-icon">
              <FaEnvelope />
            </div>
            <h3 className="siemreap-regular">ទាក់ទងមកយើង</h3>
            <p className="siemreap-regular">support@university.edu.kh</p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="footer-note siemreap-regular">
          <FaWrench className="small-icon" />
          សូមអភ័យទោសចំពោះការរំខាន
          <GiGearHammer className="small-icon" />
        </p>
      </div>
    </div>
  );
}

export default MaintainPage;

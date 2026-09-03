// Summary
import ClassStartIndex from "../page/dasboard/class/SartClassIndex.component.jsx";
import ClassAllIndex from "../page/dasboard/class/AllClasssIndex.componet.jsx";
import AccountProfileIndex from "../page/dasboard/class/AccountProfile.component.jsx";

// Account
import MyAccountIndex from "../page/dasboard/account/Index.component";

// Mainatain
import MaintainPage from "../page/maintain/maintain.component";


// Log
import IndexAccountLog from "../page/dasboard/summary/activity_log/Index.component";


// class program
import IndexEnrollment_NewClass from "../page/dasboard/addmission/year/Index.component";

// Academic
import IndexAcademic_ViewDetail from "../page/dasboard/academic/view_detail/Index.component";

import ProfileComponent from "../page/dasboard/account/my_account/Account.component"

// Timetable
import ScheduleIndex from "../page/timetable/Schedule/schedule.component"

// Academic confirmation
import AcademicConfirmation from "../page/academicconfirmation/academicconfirm/academicconfirmation"

// check attendance
import CheckAttendance from "../page/check_attendance/checkattendance/checkattendance";
// attendance session
import AttendanceSession from "../page/attendancesession/check_attendance/AttendanceSession";

//Icon
import { MdOutlineManageAccounts } from "react-icons/md";
import { MdOutlineCastForEducation } from "react-icons/md";
import { MdOutlineClass } from "react-icons/md";
import { GiTeacher } from "react-icons/gi";
import { BsWindowStack } from "react-icons/bs";
import { IoBarChartSharp } from "react-icons/io5";
import { IoIosPeople } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiChalkboardTeacherFill } from "react-icons/pi";
//Script
import Auth from "../util/auth";

class RouteScript {
  constructor(prop, setIsLoading) {
    this.prop = prop;
    this.setIsLoading = setIsLoading;
  }

  route() {
    const auth = new Auth();
    const user = auth.getClientLogin()?.data;
    const userRole = {
      id_admin: "687dc2df144731e0efc41a35",
      id_noter: "68882da272f7b68ef2056dd2",
      is_super_admin: auth.getClientLogin()?.data?.is_super_admin,
    };

    return {
      ...this.route_Summary(auth, userRole, user),
        ...this.route_Enrollment(auth, userRole, user),
      ...this.route_MyAccount(auth, userRole, user),
      ...this.route_Academic(auth, userRole, user),
    //  ...this.route_TeacherProfile(auth, userRole, user),
      ...this.route_Timetable(auth, userRole, user),
      ...this.route_academicconfirmation(auth, userRole, user),
      ...this.route_checkattendance(auth, userRole, user),
      ...this.route_attendanceSession(auth, userRole, user),
    };
  }

  checkPermission(isSuperAdmin, loginGroupId, userRole) {
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

  modelAdd(
    keyCrudAndIndex,
    dataCrudAndIndex,
    icon,
    indexURL,
    documentName,
    title,
    component,
    breadcurmb,
  ) {
    const resultDataCrubAndIndex = {};
    const addPrepareData = {};

    for (const [action, isActive] of Object.entries(dataCrudAndIndex)) {
      resultDataCrubAndIndex[`${keyCrudAndIndex}_${action}`] = isActive;

      var urlChecker = indexURL;
      var componentCheck = component.index;
      var breadcurmbChecker = breadcurmb.index;
      if (action == "create") {
        urlChecker = indexURL + "/create";
        componentCheck = component.create;
        breadcurmbChecker = breadcurmb.create;
      } else if (action == "edit") {
        urlChecker = indexURL + "/edit/:id";
        componentCheck = component.edit;
        breadcurmbChecker = breadcurmb.edit;
      } else if (action == "view") {
        urlChecker = indexURL + "/view/:id";
        componentCheck = component.view;
        breadcurmbChecker = breadcurmb.view;
      }

      addPrepareData[`${keyCrudAndIndex}_${action}`] = {
        status: resultDataCrubAndIndex[`${keyCrudAndIndex}_${action}`],
        document: documentName,
        url: urlChecker,
        title: title,
        component: componentCheck,
        icon: icon,
        breadcurmb: breadcurmbChecker,
      };
    }

    return {
      model: addPrepareData,
      status: resultDataCrubAndIndex,
    };
  }

  //==================================
  // Academic Route
  route_Academic(auth, userRole, user) {
    const documentName = "academic_management";
    const mainMenuTitle = "ថ្នាក់សិក្សា";
    const mainMenuIcon = <MdOutlineCastForEducation />;
    const isHiddenMenu = true;

    const routeMGT_AcademicView = this.modelAdd(
      "academic_management_class_view_detail",
      {
        index: true,
        create: false,
        view: false,
        edit: false,
        delete: false,
      },
      <MdOutlineClass />,
      "/admin/academic-management/class/:id",
      documentName,
      "ថ្នាក់សិក្សា",
      {
        index: (
          <IndexAcademic_ViewDetail
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        create: null,
        edit: null,
        view: null,
      },
      {
        index: [
          { name: mainMenuTitle, path: null },
          { name: "កម្មវិធីសិក្សា", path: null },
          { name: "ព័ត៌មានអំពីថ្នាក់", path: null },
        ],
        create: [],
        edit: [],
        view: [],
      },
    );

    var status = { ...routeMGT_AcademicView.status };

    return {
      academic_mgt_parent: {
        hidden_menu: isHiddenMenu,
        status: status,
        icon: mainMenuIcon,
        document: documentName,
        title: mainMenuTitle,
        breadcurmb: [],
      },
      ...routeMGT_AcademicView.model,
    };
  }

  //==================================
  // Enrollment Route
  route_Enrollment(auth, userRole, user) {
    const documentName = "enrollment_management";
    const mainMenuTitle = "កម្មវិធីសិក្សា";
    const mainMenuIcon = <MdOutlineCastForEducation />;
    const isHiddenMenu = true;

    const routeMGT_Enrollment_NewClass = this.modelAdd(
      "enrollment_management_newclass",
      {
        index: true,
        create: false,
        view: false,
        edit: false,
        delete: false,
      },
      <MdOutlineClass />,
      "/admin/enrollment/new-class",
      documentName,
      "វគ្គសិក្សា",
      {
        index: (
          <IndexEnrollment_NewClass
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        create: null,
        edit: null,
        view: null,
      },
      {
        index: [
          {
            name: mainMenuTitle,
            path: "/admin/enrollment/new-class",
          },
          {
            name: "វគ្គសិក្សាថ្មី",
            path: "/admin/enrollment/new-class",
          },
        ],
        create: [],
        edit: [],
        view: [],
      },
    );

    var status = { ...routeMGT_Enrollment_NewClass.status };

    return {
      enrollment_mgt_parent: {
        hidden_menu: isHiddenMenu,
        status: status,
        icon: mainMenuIcon,
        document: documentName,
        title: mainMenuTitle,
        breadcurmb: [],
      },
      ...routeMGT_Enrollment_NewClass.model,
    };
  }

  //==================================
  // Summary Route
  route_Summary(auth, userRole, user) {
    var status = {
      class_start_index: true,
      class_all_index: true,
      profile_account_index: true
    };
    return {
      summary_parent: {
        hidden_menu: false,
        status: status,
        icon: <IoBarChartSharp />,
        document: "summary",
        title: "ផ្ទាំងគ្រប់គ្រង",
        breadcurmb: [],
      },

      class_start_index: {
        status: status.class_start_index,
        document: "summary",
        url: "/admin/class-start",
        title: "ថ្នាក់កំពុងបង្រៀន",
        component: (
          <ClassStartIndex
            prop={this.prop}
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        icon: <FaChalkboardTeacher />,
        breadcurmb: [
          { name: "ផ្ទាំងគ្រប់គ្រង", path: "/admin/class-start" },
          { name: "ថ្នាក់កំពុងបង្រៀន", path: "/admin/class-start" },
          { name: "ទាំងអស់", path: null },
        ],
      },



      class_all_index: {
        status: status.class_all_index,
        document: "summary",
        url: "/admin/class-all",
        title: "ថ្នាក់ទាំងអស់",
        component: (
          <ClassAllIndex
            prop={this.prop}
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        icon: <PiChalkboardTeacherFill />,
        breadcurmb: [
          { name: "ផ្ទាំងគ្រប់គ្រង", path: "/admin/class-all" },
          { name: "ថ្នាក់ទាំងអស់", path: "/admin/class-all" },
          { name: "បញ្ជី", path: null },
        ],
      },




      profile_account_index: {
        status: status.profile_account_index,
        document: "summary",
        url: "/admin/account-profile",
        title: "គណនីប្រើប្រាស់",
        component: (
          <AccountProfileIndex
            prop={this.prop}
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        icon: <MdOutlineManageAccounts />,
        breadcurmb: [
          { name: "ផ្ទាំងគ្រប់គ្រង", path: "/admin/account-profile" },
          { name: "គណនីប្រើប្រាស់", path: "/admin/account-profile" },
          { name: "ប្រវត្តរូប", path: null },
        ],
      },








    };
  }

  //==================================
  // My Account Route
  route_MyAccount(auth, userRole, user) {
    var status = {
      my_account_index: true,
      account_log_index: true,
      maintain_page_index: true,
    };

    return {
      my_account_parent: {
        hidden_menu: true,
        status: status,
        icon: <IoBarChartSharp />,
        document: "my_account",
        title: "គណនីរបស់ខ្ញុំ",
        breadcurmb: [],
      },
      my_account_index: {
        status: status.my_account_index,
        document: "my_account",
        url: "/admin/my-account",
        title: "គណនីរបស់ខ្ញុំ",
        component: <MyAccountIndex auth={auth} />,
        icon: <IoIosPeople />,
        breadcurmb: [
          { name: "គណនី", path: "/admin/my-account" },
          { name: "ព័ត៌មានរបស់ខ្ញុំ", path: null },
        ],
      },

      maintain_page_index: {
        status: status.maintain_page_index,
        document: "my_account",
        url: "/admin/maintanance",
        title: "ថែទាំប្រព័ន្ធ",
        component: <MaintainPage auth={auth} />,
        icon: <IoIosPeople />,
        breadcurmb: [
          { name: "គណនី", path: "/admin/maintanance" },
          { name: "ថែទាំប្រព័ន្ធ", path: null },
        ],
      },

      account_log_index: {
        status: status.account_log_index,
        document: "my_account",
        url: "/admin/activity-log",
        title: "សកម្មភាពក្នុងប្រព័ន្ធ",
        component: (
          <IndexAccountLog auth={auth} setIsGlobalLoading={this.setIsLoading} />
        ),
        icon: <IoIosPeople />,
        breadcurmb: [
          { name: "គណនី", path: "/admin/activity-log" },
          { name: "សកម្មភាពក្នុងប្រព័ន្ធ", path: null },
        ],
      },
    };
  }

  //==================================
  // Teacher Profile Route
  route_TeacherProfile(auth, userRole, user) {
    const documentName = "teacher_management";
    const mainMenuTitle = "គ្រប់គ្រងគ្រូបង្រៀន";
    const mainMenuIcon = <GiTeacher />;
    const isHiddenMenu = true;

    const routeMGT_TeacherProfile = this.modelAdd(
      "teacher_profile_view",
      {
        index: false,
        create: false,
        view: true,
        edit: false,
        delete: false,
      },
      <GiTeacher />,
      "/admin/student-management/teacher/view/:id",
      documentName,
      "ព័ត៌មានគ្រូបង្រៀន",
      {
        index: null,
        create: null,
        edit: null,
        view: (
          <ProfileComponent
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
      },
      {
        index: [],
        create: [],
        edit: [],
        view: [
          { name: mainMenuTitle, path: "/admin/student-management/teacher" },
          { name: "ព័ត៌មានគ្រូបង្រៀន", path: null },
        ],
      }
    );

    var status = { ...routeMGT_TeacherProfile.status };

    return {
      teacher_profile_parent: {
        hidden_menu: isHiddenMenu,
        status: status,
        icon: mainMenuIcon,
        document: documentName,
        title: mainMenuTitle,
        breadcurmb: [],
      },
      ...routeMGT_TeacherProfile.model,
    };
  }

  // timetable

  route_Timetable(auth, userRole, user) {
    const documentName = "timetable_management";
    const mainMenuTitle = "កាលវិភាគ";
    const mainMenuIcon = <MdOutlineCastForEducation />;
    const isHiddenMenu = true;

    const routeMGT_Schedule = this.modelAdd(
      "timetable_schedule_view",
      {
        index: true,
        create: false,
        view: false,
        edit: false,
        delete: false
      },
      <FaCalendarAlt />,
      "/admin/timetable/schedule/:id",
      documentName,
      "ពិនិត្យកាលវិភាគ",
      {
        index: (
          <ScheduleIndex
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        create: null,
        edit: null,
        view: null,
      },
      {
        index: [
          { name: "កាលវិភាគ", path: null },
          { name: "ពិនិត្យកាលវិភាគ", path: null },

        ],
        create: [],
        edit: [],
        view: [],
      },
    );

    var status = { ...routeMGT_Schedule.status };

    return {
      timetable_mgt_parent: {
        hidden_menu: true,
        status: status,
        icon: <FaCalendarAlt />,
        document: documentName,
        title: "កាលវិភាគ",
        breadcurmb: [],
      },
      ...routeMGT_Schedule.model,
    };
  }

  route_academicconfirmation(auth, userRole, user) {
    const documentName = "academic_confirmation";
    const mainMenuTitle = "និសិត្ស";
    const mainMenuIcon = <MdOutlineCastForEducation />;
    const isHiddenMenu = true;

    const routeMGT_confirmation = this.modelAdd(
      "academic_confirmation_view",
      {
        index: true,
        create: false,
        view: false,
        edit: false,
        delete: false
      },
      <FaCalendarAlt />,
      "/admin/students/confirmation/:id",  // ✅ also fixed to a dynamic param (was hardcoded before)
      documentName,
      "លិខិតបញ្ជាក់ការសិក្សា",
      {
        index: (
          <AcademicConfirmation
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        create: null,
        edit: null,
        view: null,
      },
      {
        index: [
          { name: "និសិត្ស", path: null },
          { name: "លិខិតបញ្ជាក់ការសិក្សា", path: null },

        ],
        create: [],
        edit: [],
        view: [],
      },
    );

    var status = { ...routeMGT_confirmation.status };

    return {
      confirmation_mgt_parent: {
        hidden_menu: true,
        status: status,
        icon: <FaCalendarAlt />,
        document: documentName,
        title: "និសិត្ស",
        breadcurmb: [],
      },
      ...routeMGT_confirmation.model,
    };
  }

  route_checkattendance(auth, userRole, user) {
    const documentName = "check_attendance";
    const mainMenuTitle = "វត្តមាន";
    const mainMenuIcon = <MdOutlineCastForEducation />;
    const isHiddenMenu = true;

    const routeMGT_checkattendance = this.modelAdd(
      "check_attendance_view",
      {
        index: true,
        create: false,
        view: false,
        edit: false,
        delete: false
      },
      <FaCalendarAlt />,
      "/admin/check-attendance/:classId/:subjectId/:sessionNumber",
      documentName,
      "ពិនិត្យវត្តមាន",
      {
        index: (
          <CheckAttendance
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        create: null,
        edit: null,
        view: null,
      },
      {
        index: [
          { name: "វត្តមាន", path: null },
          { name: "ពិនិត្យវត្តមាន", path: null },
        ],
        create: [],
        edit: [],
        view: [],
      },
    );

    var status = { ...routeMGT_checkattendance.status };

    return {
      attendance_mgt_parent: {
        hidden_menu: true,
        status: status,
        icon: <FaCalendarAlt />,
        document: documentName,
        title: "វត្តមាន",
        breadcurmb: [],
      },
      ...routeMGT_checkattendance.model,
    };
  }

  // New: attendance session page (list of students for one class)
  route_attendanceSession(auth, userRole, user) {
    const documentName = "attendance_session";

    const routeMGT_attendanceSession = this.modelAdd(
      "attendance_session_view",
      {
        index: true,
        create: false,
        view: false,
        edit: false,
        delete: false
      },
      <FaCalendarAlt />,
      "/admin/attendance/class/:classId/session/:sessionNumber",
      documentName,
      "ពិនិត្យវត្តមាននិស្សិត",
      {
        index: (
          <AttendanceSession
            auth={auth}
            setIsGlobalLoading={this.setIsLoading}
          />
        ),
        create: null,
        edit: null,
        view: null,
      },
      {
        index: [
          { name: "វត្តមាន", path: null },
          { name: "ពិនិត្យវត្តមាននិស្សិត", path: null },
        ],
        create: [],
        edit: [],
        view: [],
      },
    );

    var status = { ...routeMGT_attendanceSession.status };

    return {
      attendance_session_parent: {
        hidden_menu: true,
        status: status,
        icon: <FaCalendarAlt />,
        document: documentName,
        title: "ពិនិត្យវត្តមាននិស្សិត",
        breadcurmb: [],
      },
      ...routeMGT_attendanceSession.model,
    };
  }

}

export default RouteScript;
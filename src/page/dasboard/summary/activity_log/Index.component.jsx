// React
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Component
import Title from "../../../../component/Title/Title.component.jsx";
import DataTableCustom from "../../../../component/DataTable/datatable.component.jsx";
import RowBreaker from "../../../../component/Boostramp/RowBreaker.component.jsx";
import CustomSelect from "../../../../component/Select/CustomSelect.component";

// Script
import DatatableScript from "../../../../component/DataTable/datatable.script.js";
import RouteScript from "../../../../route/route.script.js";
import {
  getAllRequest,
  updateRequest,
  deleteRequest,
} from "../../../../util/request_api.js";
import SwalToast from "../../../../component/SwalToast/SwalToast.js";
import { confirmDelete } from "../../../../component/SwalToast/SwalAlert.js";

function ActivityLog({ auth }) {
  //===============================================
  // Declaration
  const routeScript = new RouteScript();
  const navigate = useNavigate();
  const swalToast = new SwalToast();

  // Backend
  const api = `${process.env.REACT_APP_API_HOST}/api/admin/activity_log/`;
  const api_CategoryLog = `${process.env.REACT_APP_API_HOST}/api/admin/activity_log/category-all?all=true`;
  const api_User = `${process.env.REACT_APP_API_HOST}/api/admin/users-all?all=true`;
  const access_token = auth.getClientLogin().data?.access_token;

  //**************************************/
  // Table Steup
  const [isLoading, setisLoading] = useState(true);
  const [isLoadingText, setisLoadingText] = useState(false);
  const [data, setData] = useState([]);
  const [dataCount, setdataCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setsearchValue] = useState("");
  const [query, setquery] = useState("");
  const [errorGetData, seterrorGetData] = useState({
    status: false,
    message: "",
  });
  const [isSwitchPageFilter, setisSwitchPageFilter] = useState(false);
  const [columns, setcolumns] = useState([
    {
      defualt: true,
      omit: false,
      name: "សកម្មភាពក្នុងប្រព័ន្ធ",
      selector: (row) => row.title,
      sortable: true,
    },

    {
      defualt: false,
      omit: true,
      name: "លំអិត",
      selector: (row) => row.description,
      sortable: true,
    },

    {
      defualt: false,
      omit: true,
      name: "ឧបករណ៍ប្រើប្រាស់",
      selector: (row) =>
        row.device.device + ", " + row.device.browser + ", " + row.device.os,
      sortable: true,
    },
  ]);
  function columnClicked(setcolumns, e) {
    setcolumns((prev) =>
      prev.map(
        (col) =>
          col.name === e.title
            ? { ...col, omit: !e.value } // update omit
            : col, // keep others unchanged
      ),
    );
  }
  const script = new DatatableScript(
    columns,
    dataCount,
    setdataCount,
    data,
    setData,
    isLoading,
    setisLoading,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    isSwitchPageFilter,
    setisSwitchPageFilter,
    searchValue,
    setsearchValue,
  );

  const [inputUser, setinputUser] = useState({
    title: "អ្នកប្រើប្រាស់",
    id: "create_by_id",
    required: true,
    is_correct: true,
    error: "សូមជ្រើសរើសប្រភេទសកម្មភាព",
    data: [],
    value: "",
    defualtValue: "",
    defualtTitle: "",
    display: "flex",
  });

  //===============================================
  // Loading
  const [first_isLoading_For_ActivityLog, setfirst_isLoading_For_ActivityLog] =
    useState(true);
  const [first_isLoading_For_User, setfirst_isLoading_For_User] =
    useState(true);
  useEffect(() => {
    getUser();
    const timeout = setTimeout(() => {
      getData(); // or fetch API
    }, 400); // adjust as needed

    return () => clearTimeout(timeout);
  }, [pageSize, currentPage, searchValue, query, inputUser]);

  async function getUser() {
    const result = await getAllRequest(
      `${api_User}-all?all=true`,
      access_token,
    );

    if (result?.success) {
      if (result.data?.data.length > 0) {
        var list = [];
        result.data?.data.map((row) => {
          list.push({
            value: row._id,
            label: `${row.info_firstname} ${row.info_lastname} - ${row.info_email}`,
          });
        });

        if (first_isLoading_For_ActivityLog) {
          setTimeout(() => {
            setinputUser((prev) => ({
              ...prev,
              data: list,
            }));
          }, 1000);
          setfirst_isLoading_For_User(false);
        }
      }
    }
  }

  async function getData() {
    const result = await getAllRequest(`${api}`, access_token, {
      page: currentPage,
      limit: pageSize,
      q: searchValue,
      q_key: JSON.stringify(["title"]),
      q_key_id: JSON.stringify(["activity_log_category_id", "create_by_id"]),

      sort: "created_date",
      order: "desc",
    });
    if (result.success) {
      setData(result.data.data);
      setdataCount(result.data.pagination.total);
    }
    setisLoading(false);
  }

  //===============================================
  // Action
  const onChangePageOption = (page) => {
    if (page != currentPage) {
      setisLoading(true);
    }
  };

  //===============================================
  // Sub View
  function subViewAdvanceSearch() {
    return (
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-md-12">
            <CustomSelect
              props={{ select: inputUser, mode: "create" }}
              event={(action, e) => {
                setCurrentPage(1);
                setPageSize(10);
                setisLoading(true);
                setinputUser((prev) => ({
                  ...prev,
                  value: e,
                }));
              }}
            />
          </div>
        </div>
        <RowBreaker />
      </div>
    );
  }

  //===============================================
  // View
  return (
    <div>
      <div className="container defualt_White_Shadow_Theme">
        <RowBreaker />
        <div className="row">
          <div className="col-md-12">
            <Title mode={"list"} title={"សកម្មភាពទាំងអស់ក្នុងប្រព័ន្ធ"} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <DataTableCustom
              advanceSearchChange={(action, e) => {
                columnClicked(setcolumns, e);
              }}
              advanceSearch={true}
              advanceComponent={subViewAdvanceSearch()}
              onChangeStatus={(row, e) => {}}
              onChangePageOption={onChangePageOption}
              onChangePage={script.handlePageChange}
              onSearch={script.handleSearchChange}
              onClick={(e, data) => {
                alert("Coming Soon!");
              }}
              props={{
                hide_search: true,
                errorGetData: errorGetData,
                show_loading: isLoading,
                header: {
                  show_create: false,
                },
                columns: columns,
                data: data,
                pagination: {
                  currentPage: currentPage,
                  rowsPerPage: pageSize,
                  count: dataCount,
                },
                show_status: false,
                actionButton: {
                  show_view: { show: true, link: null },
                  show_edit: { show: false, link: "#" },
                  show_delete: { show: false, link: "#" },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;

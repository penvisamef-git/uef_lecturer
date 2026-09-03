import React, { useEffect, useState } from "react";
import Datatable from "./datatable.component";
import Datable from "./datatable.script";
import axios from "axios";

function Test() {
  // Test Loading
  const [isLoading, setisLoading] = useState(true);
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
  const [urlAPI, setAPIURL] = useState(
    "https://jsonplaceholder.typicode.com/posts"
  );

  const columns = [
    {
      width: "30%",
      name: "លេខសំម្គាល់",
      selector: (row) => row.userId,
      sortable: true,
    },
    {
      name: "ជំណងជើង",
      selector: (row) => row.title,
      sortable: true,
    },
  ];
  const script = new Datable(
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
    setsearchValue
  );

  useEffect(() => {
    getData_ByPageSizeAndCurrentPage();
  }, [pageSize, currentPage, searchValue, query]);

  
  //********************** Get Data From DB have 2 Type **************************/
  //>>>>>>> Type 1 :  Get Full Data
  function getData_ByFullData() {
    axios
      .get(urlAPI)
      .catch((e) => {
        setisLoading(false);
        seterrorGetData({
          status: true,
          message: e,
        });
      })
      .then((res) => {
        if (res) {
          seterrorGetData({
            status: false,
            message: "Success",
          });
          var rawData = res.data;
          // Add status  || Sample Test
          //   rawData.map((row, i) => {
          //     row.status = true;
          //   });
          if (searchValue.length > 0) {
            // Catch Searching
            const filteredData = filterDataNoAPISearch(rawData, searchValue);
            if (isSwitchPageFilter) {
              setPageSize(10);
              setCurrentPage(1);
              setisSwitchPageFilter(false);
            }
            setData(
              script.dataCustomPaignation(filteredData, currentPage, pageSize)
            );
            setdataCount(filteredData.length);
            setisLoading(false);
          } else {
            setData(
              script.dataCustomPaignation(rawData, currentPage, pageSize)
            ); //  Set If API no pagination
            setdataCount(rawData.length);
            setisLoading(false);
          }
        }
      });

    function filterDataNoAPISearch(data, searchValue) {
      return data.filter(
        (item) =>
          item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.userId
            .toString()
            .toLowerCase()
            .includes(searchValue.toLowerCase())
      );
    }
  }

  //>>>>>>> 2 Get By Page Size and Current Page
  function getData_ByPageSizeAndCurrentPage() {
    axios
      .get(`${urlAPI}?_page=${currentPage}&_limit=${pageSize}&q=${query}`)
      .catch((e) => {
        setisLoading(false);
        seterrorGetData({
          status: true,
          message: e,
        });
      })
      .then((res) => {
        if (res) {
          seterrorGetData({
            status: false,
            message: "Success",
          });
          var rawData = res.data;
          //   // Add status  || Sample Test
          //   rawData.map((row, i) => {
          //     row.status = true;
          //   });
          if (searchValue.length > 0) {
            // Catch Searching
            if (isSwitchPageFilter) {
              setPageSize(10);
              setCurrentPage(1);
              setisSwitchPageFilter(false);
            }
            setData(rawData);
            loadingCount();
          } else {
            setData(rawData);
            loadingCount();
          }
        }
      });

    function loadingCount() {
      setisLoading(false);
      axios
        .get(`${urlAPI}`)
        .catch((e) => {
          seterrorGetData({
            status: true,
            message: e,
          });
        })
        .then((res) => {
          if (res) {
            var rawData = res.data;
            setdataCount(rawData.length);
          }
        });
    }

  
  }

  return (
    <div>
      <Datatable
        onChangePage={script.handlePageChange}
        onSearch={script.handleSearchChange}
        onClick={(e) => console.log(e)}
        props={{
          errorGetData: errorGetData,
          show_loading: isLoading,
          header: {
            show_create: true,
          },
          columns: columns,
          data: data,
          pagination: {
            currentPage: currentPage,
            rowsPerPage: pageSize,
            count: dataCount,
          },
          show_status: true,
          actionButton: {
            show_view: {
              show: true,
              link: null,
            },
            show_edit: {
              show: true,
              link: "#",
            },
            show_delete: {
              show: true,
              link: "#",
            },
          },
        }}
      />
    </div>
  );
}

export default Test;

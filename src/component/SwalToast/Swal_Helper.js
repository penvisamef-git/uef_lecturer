import Swal from "sweetalert2";
import icon_create from "../../asset/icon/icons8-plus-150.png";
import icon_updte from "../../asset/icon/pen.png";
import closeDrop from "../../asset/icon/drop.png";
import serverErr from "../../asset/gif/integration.gif";
import mark from "../../asset/dot/mark.png";
import red from "../../asset/dot/red.png";
import closeIcon from "../../asset/icon/close.png";
import iconLoader from "../../asset/gif/unnamed.gif";
import MyHelper from "../Helper/MyHelper";
import "./Swal_Helper.css";
import eyeOpen from "../../asset/icon/eye_open.png";
import eyeClose from "../../asset/icon/eye_close.png";
import "../../index.css";

class Swal_Helper {
  alert_simple_1_button(icon, text, buttonText, buttonColor) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        icon: icon,
        text: text,
        confirmButtonText: buttonText,
        confirmButtonColor: buttonColor,
      }).then((result) => {
        resolve(result.isConfirmed);
      });
    });
  }

  alert_Ask_Confirm(text, colorButton) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        icon: "question",
        html: `<label>${text}</label>`,
        confirmButtonText: "យល់ព្រម",
        confirmButtonColor: colorButton,

        showCancelButton: true,
        cancelButtonText: "បោះបង់",
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(result.isConfirmed);
        } else {
          resolve(false);
        }
      });
    });
  }

  alert_Ask_Wrong_Input(text) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        text: text,
        icon: "warning",
        confirmButtonText: "ទទួលបាន",
        confirmButtonColor: "red",
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(result.isConfirmed);
        } else {
          resolve(false);
        }
      });
    });
  }

  alert_Ask_Wrong_Input_With_Text_Body(textTitle, textBody) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        title: textTitle,
        text: textBody,
        icon: "error",
        confirmButtonText: "ទទួលបាន",
        confirmButtonColor: "red",
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(result.isConfirmed);
        } else {
          resolve(false);
        }
      });
    });
  }

  alert_View_Only(htmlText) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        icon: "info",
        width: "500px",
        html: `${htmlText}
        `,
        confirmButtonText: "បិទ",
        confirmButtonColor: "darkgray",
        showCancelButton: false,
      });
    });
  }

  //*********************************/
  // How To User
  // Array
  /*{
        title: "ឈ្មោះសេវាកម្ម",
        value: row.name_kh,
        required: true
      }
  */
  alert_View_Only_WithArray(array_Title_And_Value, title, width) {
    return new Promise(async function (resolve, reject) {
      var text = " <hr/>";

      for (let i of array_Title_And_Value) {
        text += `
        <div>
        <br />
          <div>
            <label style="text-align: start; width: 100%">${i.title}
             <label  style="text-align: start; color:red">${
               i.required == null ? "" : "*"
             }</label>
            </label>   
          </div>
          
          
          <label style="text-align: start; width: 100%; padding: 10px; border-radius: 6px; background-color: rgb(220,220,220, 0.5); margin-top: 5px">${
            i.value
          }</label>
        </div>
        `;
      }

      text += " <br /> <hr/>";

      Swal.fire({
        title: title,

        width: width == null ? "500px" : width,
        html: text,
        confirmButtonText: "បិទ",
        confirmButtonColor: "darkgray",
        showCancelButton: false,
      });
    });
  }

  alert_Input_WithArray(
    array_Title_And_Value,
    title,
    width,
    confirmButtonText,
    type_is_create,
    activeData
  ) {
    // How To User
    // Array
    /*{
        title: "ឈ្មោះសេវាកម្ម",
        value: row.name_kh,
        required: true,
        id: 'NA,
        type: text or select
      }


      activeData : {
        is_active: true,
        id: checkbox_input
      }
  */

    return new Promise(async function (resolve, reject) {
      var icon = icon_updte;
      if (type_is_create == true) {
        icon = icon_create;
      }

      var textChheck = "";
      if (activeData.is_active == false) {
        textChheck = "checked";
      }

      var text = `
       <div style="display: flex">

        <img 
        style="width: 25px; height:25px; margin-right: 10px; margin-top: 3px; display:${
          type_is_create == null ? "none" : "block"
        }" src=${icon}></img> 
        <h4 style="text-align:left">${title}</h4>
        
      </div>
       <hr/>`;

      for (let i of array_Title_And_Value) {
        var va = i.value;

        // option check
        var option = [];
        if (i.option != null) {
          for (let j of i.option) {
            var selected = "";
            if (j.selected == true) {
              selected = "selected";
            }
            option += `<option ${selected}  value='${j.id}' >${j.value}</option>`;
          }
        }

        if (i.type == "select") {
          text += `

          <div>
             <br />
            <div>
               <label style="text-align: start; width: 100%">${i.title}
                <label  style="text-align: start; color:red">${
                  i.required == null ? "" : "*"
                }</label>
               </label>   
             </div>
         
           <select id=${
             i.id
           } style="width: 100%; padding: 10px; border-radius: 6px; background-color: white; margin-top: 5px; border-width: 0.1px">
             ${option}
           </select>
           
         </div>`;
        } else {
          text += `
          <div>
          <br />
            <div>
              <label style="text-align: start; width: 100%">${i.title}
               <label  style="text-align: start; color:red">${
                 i.required == null ? "" : "*"
               }</label>
              </label>   
            </div>
            
            
            <input id=${
              i.id
            } value="${va}" style="width: 100%; padding: 10px; border-radius: 6px; background-color: white; margin-top: 5px; border-width: 0.1px" />
        
          </div>
          `;
        }
      }

      if (activeData != null) {
        text += "<br/>";
        text += ` 
        <div style="text-align:left">
            <input ${textChheck}  id=${activeData.id} type="checkbox"></input>
            <label for=${activeData.id} style="padding-top: 0px">ឈប់ប្រើប្រាស់</label>
        </div>
        `;
      }

      text += "";

      Swal.fire({
        width: width == null ? "400px" : width,
        html: text,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: "green",
        showCancelButton: true,
        cancelButtonText: "បោះបង់",
      }).then((r) => {
        if (r.isConfirmed) {
          resolve(true);
        }
      });
    });
  }

  alert_Ask_Edit(htmlText) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        width: "500px",
        html: ` ${htmlText}`,
        confirmButtonText: "រក្សារទុក",
        confirmButtonColor: "darkgreen",
        showCancelButton: true,
        cancelButtonText: "បិទ",
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(result.isConfirmed);
        } else {
          resolve(false);
        }
      });
    });
  }

  alert_Ask_Create(htmlText) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        icon: "question",
        width: "500px",
        html: ` ${htmlText}`,
        confirmButtonText: "រក្សាទុក",
        confirmButtonColor: "darkblue",
        showCancelButton: true,
        cancelButtonText: "បោះបង់",
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(result.isConfirmed);
        } else {
          resolve(false);
        }
      });
    });
  }

  Swal_Custom_Create(
    width,
    title,
    listData_Input,
    isLoading,
    textLoading,
    isShowActiveBox
  ) {
    //===================================================================//
    //===================================================================//
    //===================================================================//

    // Design For MEF Input and Select
    /* How To Use

  [

       {
        title: "ឈ្មោះ",
        required: true,
        value: "",
        id: "input-1",
        error_text: "សូមបំពេញឈ្មោះ",
        type: "text",
        input_or_select: "input",
        select_data_option: null,
        select_data_id: null,
      },
       {
        title: "ជ្រើសយក",
        required: true,
        value: "",
        id: "input-4",
        error_text: "សូមជ្រើសយក",
        type: "text",
        input_or_select: "select",
        select_data_option: [
          {
            value: 1,
            label: "Visa",
          }
          
        ],
        select_data_id: null,
      },


  
  ]

  */

    return new Promise(async function (resolve, reject) {
      var listInput = "";
      var myHelper = new MyHelper();
      var select_Height_Select = 140;

      // Check Active
      var activeBox = "";
      if (isShowActiveBox == true) {
        activeBox += `<br/><br/> <div style="text-align:left">
            <input   id=${"check-box-active"} type="checkbox"></input>
            <label for=${"check-box-active"} style="padding-top: 0px">ឈប់ប្រើប្រាស់</label>
        </div>`;
      }

      for (let i of listData_Input) {
        // Check Type Select or Input
        var valueInputOrSelect = "";
        if (i.input_or_select == "input") {
          valueInputOrSelect = `
             <input class="siemreap-regular" type="${i.type}" id="${i.id}" style="width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px" value="${i.value}"/>`;
        } else {
          // option
          if (i.input_or_select == "file") {
            valueInputOrSelect = `
            <input  class="siemreap-regular" type="${i.type}" id="${i.id}" style="width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px" value="${i.value}"/>`;
          } else {
            var listOption = "";
            for (let j of i.select_data_option) {
              listOption += `<li class="swal_helper_class_li"  style="margin: 0px; padding-left: 10px" id="${j.value}-${i.id}-select-row" ><label class="siemreap-regular " id="${j.value}-${i.id}-select-row">${j.label}</label> </li>`;
            }
            valueInputOrSelect = `<div>
  
              <div  style="position: relative; over-flow:hidden; margin-bottom: -20px">
                 <img   id="${i.id}-select-holder-close-drop" src="${closeDrop}" style="width: 20px; height: 20px; object-fit: contain; position: absolute ;right: 5; margin-top:  10px" />
                 <input   class="siemreap-regular" id="${i.id}" placeholder="សូមជ្រើសយក..." type="text" style="color:black; width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px; " >
  
                 <ul  class="swal_helper_class" id="${i.id}-holder-list"  style="font-size: 15px; display:none ;text-align:left; position: absolute; overflow:scroll; height: ${select_Height_Select}px; background-color: #f2f2f2; width: 100%; z-index: 1; border-radius: 6px">
                  ${listOption}
                </ul>
  
              </div>
              
            
                </div>`;
          }
        }

        // Check Return Value
        listInput += `
       <div style="display: flex; justify-content: space-between; margin-top: 20px">
              <div style="display: flex; margin-top: 5px">
                  <label style="">${i.title}</label>
                  <label  style="margin-right: 10px; color:red; display:${
                    i.required == true ? "flex" : "none"
                  }">*</label>
              </div>


            <div>
                     ${valueInputOrSelect}

                     <br/>
                      <label id="${
                        i.id + "-holder-error"
                      }" style="text-align:start; color:red; font-size: 13px; width: 300px; display: none; margin-top: 5px">${
          i.error_text
        }</label>
            </div>

             
     
        </div>
      
      `;
      }

      Swal.fire({
        width: width == "auto" ? "auto" : width + "px",
        html: `

        <div style="${
          width == "auto" ? "auto" : width + "px; overflow:hidden"
        }">


          <div style="display: flex; justify-content: space-between">
             <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
             <image id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px"/>
          </div>
  
          <hr/>

         ${listInput}


         ${activeBox}

          <hr/>

          <div>

            <div id='swal-fire-holder-loading' style="display: none">

             <image id="swal-fire-alert-close" src="${iconLoader}" style="width: 200px; height: 40px; margin-top:0px; object-fit:contain"/>
              <br/>
              <label hidden style="color:gray; font-size: 15px">${textLoading}</label>
              
            </div>

            <div id='swal-fire-holder-button'  style="display:flex; justify-content: right">
                <button  id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary" style="width: 100px"> <label class="siemreap-regular">បោះបង់</label> </button>
                <div style="width: 10px"></div>
                <button id="btn-swal-fire-btn-success" type="button" class="btn btn-success" style="width: 100px"> <label class="siemreap-regular">រក្សាទុក</label> </button>
            </div>
            
          
          </div>

         

            
      </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          // success
          document
            .getElementById("btn-swal-fire-btn-success")
            .addEventListener("click", () => {
              // Check Input
              var isNoError_Step1 = true;
              for (let i of listData_Input) {
                var input = document.getElementById(i.id);
                var textError = document.getElementById(i.id + "-holder-error");
                if (i.required == true) {
                  if (
                    input.value == "" ||
                    input.value == null ||
                    input.value == undefined
                  ) {
                    input.style.borderColor = "red";
                    textError.style.display = "flex";
                    isNoError_Step1 = false;
                  } else {
                    i.value = input.value;
                  }
                }
              }

              // Complete Validation
              if (isNoError_Step1 == true) {
                // Check Input Select
                var isAprr_Step2 = false;

                for (let i of listData_Input) {
                  if (i.required == true && i.input_or_select == "select") {
                    var localisApp = false;
                    // Check Value If Select Error with name
                    var input = document.getElementById(i.id);
                    for (let j of i.select_data_option) {
                      localisApp = false;
                      if (j.label == input.value) {
                        isAprr_Step2 = true;
                        localisApp = true;
                        break;
                      }
                    }

                    if (localisApp == false) {
                      isAprr_Step2 = false;
                      // Change Here
                      var input = document.getElementById(i.id);
                      var textError = document.getElementById(
                        i.id + "-holder-error"
                      );
                      input.style.borderColor = "red";
                      textError.style.display = "flex";
                    }
                  }
                }

                // Check If Only Input
                var isOnlyInput = true;
                for (let i of listData_Input) {
                  if (i.input_or_select == "select") {
                    isOnlyInput = false;
                    break;
                  }
                }

                if (isOnlyInput == true) {
                  isAprr_Step2 = true;
                }

                // Complete
                if (isAprr_Step2 == true) {
                  var checkActive = document.getElementById("check-box-active");
                  if (isShowActiveBox == true) {
                    var check = {
                      is_active: checkActive.checked == true ? false : true,
                    };
                    listData_Input.push(check);
                  }

                  if (isLoading == true) {
                    // Show Loading
                    document.getElementById(
                      "swal-fire-alert-close"
                    ).style.display = "none";

                    document.getElementById(
                      "swal-fire-holder-loading"
                    ).style.display = "block";

                    document.getElementById(
                      "swal-fire-holder-button"
                    ).style.display = "none";

                    setTimeout(() => {
                      resolve(listData_Input);
                    }, 1000);
                  } else {
                    resolve(listData_Input);
                  }
                }
              }
            });

          //Return Back To Normal Input
          window.addEventListener("mouseover", (e) => {
            var clikId = "NA";
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3)
              // defeat Safari bug
              targ = targ.parentNode;
            // console.log(targ.id);
            clikId = targ.id;

            for (let i of listData_Input) {
              if (clikId == i.id) {
                var input = document.getElementById(i.id);
                var textError = document.getElementById(i.id + "-holder-error");

                input.addEventListener("change", () => {
                  input.style.borderColor = "#d1d1d1";
                  textError.style.display = "none";
                });
              }
            }
          });

          //Select Setup
          window.addEventListener("mouseup", (e) => {
            var clikId = "NA";
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3)
              // defeat Safari bug
              targ = targ.parentNode;
            // console.log(targ.id);
            clikId = targ.id;

            for (let i of listData_Input) {
              var input = document.getElementById(i.id);
              var input_Select_ListHolder = document.getElementById(
                `${i.id}-holder-list`
              );

              if (
                i.id + "-select-holder-close-drop" == clikId &&
                i.input_or_select == "select"
              ) {
                input_Select_ListHolder.style.display = "block";
              }

              if (clikId == i.id && i.input_or_select == "select") {
                // Open Select

                input_Select_ListHolder.style.display = "block";
              }

              // Close Select
              for (let i of listData_Input) {
                if (i.input_or_select == "select") {
                  for (let j of i.select_data_option) {
                    var row = `${j.value}-${i.id}-select-row`;
                    if (clikId == row) {
                      var input = document.getElementById(i.id);
                      var input_Select_ListHolder = document.getElementById(
                        `${i.id}-holder-list`
                      );

                      input_Select_ListHolder.style.display = "none";
                      input.style.readonly = true;
                      input.value = j.label;
                      i.select_data_id = j.value;

                      var textError = document.getElementById(
                        i.id + "-holder-error"
                      );
                      input.style.borderColor = "#d1d1d1";
                      textError.style.display = "none";

                      break;
                    }
                  }
                }
              }
            }
          });

          //Select Search
          window.addEventListener("mouseover", (e) => {
            var clikId = "NA";
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3)
              // defeat Safari bug
              targ = targ.parentNode;
            // console.log(targ.id);
            clikId = targ.id;

            for (let i of listData_Input) {
              if (clikId == i.id && i.input_or_select == "select") {
                var input = document.getElementById(i.id);
                var listHolder = document.getElementById(`${i.id}-holder-list`);

                input.addEventListener("input", () => {
                  var listOption = "";
                  var isHave = false;
                  var index = 0;
                  for (let j of i.select_data_option) {
                    var isApp =
                      myHelper.sort_Auto_Array_Input_Search_IS_Approved(
                        input.value,
                        [j.label]
                      );

                    if (isApp == true) {
                      index++;
                      isHave = true;
                      listOption += `<li   class="swal_helper_class_li"  style="padding: 5px; margin: 0px; padding-left: 10px"  id="${j.value}-${i.id}-select-row">${j.label}</li>`;
                    }
                  }

                  if (isHave == true) {
                    listHolder.innerHTML = listOption;

                    var select_Height = 140;

                    select_Height = select_Height_Select;
                    listHolder.style.height = select_Height;
                  } else {
                    listHolder.style.height = 70;
                    listHolder.innerHTML = `
                    <br/>
                    <label style="color: lightgray; width: 100%; text-align:center">មិនមានទិន្នន័យ</label>`;
                  }
                });
                break;
              }
            }
          });
        },
      });
    });
  }

  Swal_Custom_UpdatePassword(
    width,
    title,
    listData_Input,
    isLoading,
    textLoading,
    isShowActiveBox
  ) {
    //===================================================================//
    //===================================================================//
    //===================================================================//

    // Design For MEF Input and Select
    /* How To Use

  [

       {
        title: "ឈ្មោះ",
        required: true,
        value: "",
        id: "input-1",
        error_text: "សូមបំពេញឈ្មោះ",
        type: "text",
        input_or_select: "input",
        select_data_option: null,
        select_data_id: null,
      },
       {
        title: "ជ្រើសយក",
        required: true,
        value: "",
        id: "input-4",
        error_text: "សូមជ្រើសយក",
        type: "text",
        input_or_select: "select",
        select_data_option: [
          {
            value: 1,
            label: "Visa",
          }
          
        ],
        select_data_id: null,
      },


  
  ]

  */

    return new Promise(async function (resolve, reject) {
      var listInput = "";
      var myHelper = new MyHelper();
      var select_Height_Select = 140;

      // Check Active
      var activeBox = "";
      if (isShowActiveBox == true) {
        activeBox += `<br/><br/> <div style="text-align:left">
            <input   id=${"check-box-active"} type="checkbox"></input>
            <label for=${"check-box-active"} style="padding-top: 0px">ឈប់ប្រើប្រាស់</label>
        </div>`;
      }

      for (let i of listData_Input) {
        // Check Type Select or Input
        var valueInputOrSelect = "";
        if (i.input_or_select == "input") {
          valueInputOrSelect = `
            <div style="position: relative; width: 300px;">
              <input
                class="siemreap-regular"
                type="password"
                id="${i.id}"
                style="width: 100%; padding: 5px 35px 5px 10px; border-width: 1px; border-color: #d1d1d1; border-radius: 6px"
                value="${i.value || ""}"
              />
              <span
                id="toggle_${i.id}"
                style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); cursor: pointer;"
              >
              <img src="${eyeOpen}" style="width: 25px; height: 25px; object-fit: cover;" />
              </span>
            </div>
          `;
        } else {
          // option
          // if (i.input_or_select == "file") {
          //   valueInputOrSelect = `
          //   <input  class="siemreap-regular" type="${i.type}" id="${i.id}" style="width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px" value="${i.value}"/>`;
          // } else {
          //   var listOption = "";
          //   for (let j of i.select_data_option) {
          //     listOption += `<li class="swal_helper_class_li"  style="margin: 0px; padding-left: 10px" id="${j.value}-${i.id}-select-row" ><label class="siemreap-regular " id="${j.value}-${i.id}-select-row">${j.label}</label> </li>`;
          //   }
          //   valueInputOrSelect = `<div>
          //     <div  style="position: relative; over-flow:hidden; margin-bottom: -20px">
          //        <img   id="${i.id}-select-holder-close-drop" src="${closeDrop}" style="width: 20px; height: 20px; object-fit: contain; position: absolute ;right: 5; margin-top:  10px" />
          //        <input   class="siemreap-regular" id="${i.id}" placeholder="សូមជ្រើសយក..." type="text" style="color:black; width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px; " >
          //        <ul  class="swal_helper_class" id="${i.id}-holder-list"  style="font-size: 15px; display:none ;text-align:left; position: absolute; overflow:scroll; height: ${select_Height_Select}px; background-color: #f2f2f2; width: 100%; z-index: 1; border-radius: 6px">
          //         ${listOption}
          //       </ul>
          //     </div>
          //       </div>`;
          // }
        }

        // Check Return Value
        listInput += `
       <div style="display: flex; justify-content: space-between; margin-top: 20px">
              <div style="display: flex; margin-top: 5px">
                  <label style="">${i.title}</label>
                  <label  style="margin-right: 10px; color:red; display:${
                    i.required == true ? "flex" : "none"
                  }">*</label>
              </div>


            <div>
                     ${valueInputOrSelect}

                     <br/>
                      <label id="${
                        i.id + "-holder-error"
                      }" style="text-align:start; color:red; font-size: 13px; width: 300px; display: none; margin-top: 5px">${
          i.error_text
        }</label>
            </div>

             
     
        </div>
      
      `;
      }

      Swal.fire({
        width: width == "auto" ? "auto" : width + "px",
        html: `
    <div style="${width == "auto" ? "auto" : width + "px; overflow:hidden"}">

      <div style="display: flex; justify-content: space-between">
        <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
        <img id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px; cursor:pointer"/>
      </div>

      <hr/>

      ${listInput}

      ${activeBox}

      <hr/>

      <div>
        <div id='swal-fire-holder-loading' style="display: none">
          <img id="swal-fire-alert-close" src="${iconLoader}" style="width: 200px; height: 40px; margin-top:0px; object-fit:contain"/>
          <br/>
          <label hidden style="color:gray; font-size: 15px">${textLoading}</label>
        </div>

        <div id='swal-fire-holder-button' style="display:flex; justify-content: right">
          <button id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary" style="width: 100px">
            <label class="siemreap-regular">បោះបង់</label>
          </button>
          <div style="width: 10px"></div>
          <button id="btn-swal-fire-btn-success" type="button" class="btn btn-success" style="width: 100px">
            <label class="siemreap-regular">រក្សាទុក</label>
          </button>
        </div>
      </div>
    </div>`,
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          const input = document.getElementById("input_password");
          const toggle = document.getElementById("toggle_input_password");
          const toggleImg = toggle.querySelector("img");

          toggle.addEventListener("click", () => {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            toggleImg.src = isPassword ? eyeOpen : eyeClose;
          });

          const inputRe = document.getElementById("input_re_password");
          const toggleRe = document.getElementById("toggle_input_re_password");
          const toggleReImg = toggleRe.querySelector("img");

          toggleRe.addEventListener("click", () => {
            const isPasswordRe = inputRe.type === "password";
            inputRe.type = isPasswordRe ? "text" : "password";
            toggleReImg.src = isPasswordRe ? eyeOpen : eyeClose;
          });

          // Clear validation messages on input
          [input, inputRe].forEach((el) => {
            el.addEventListener("input", () => {
              Swal.resetValidationMessage();
            });
          });

          // Close buttons
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });
          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          // Success button validation and submission
          document
            .getElementById("btn-swal-fire-btn-success")
            .addEventListener("click", () => {
              Swal.resetValidationMessage();

              const strongPasswordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
              const passwordVal = input.value;
              const confirmPasswordVal = inputRe.value;

              if (!strongPasswordRegex.test(passwordVal)) {
                Swal.showValidationMessage(
                  "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួ អក្សរធំ អក្សរតូច លេខ និងនិមិត្តសញ្ញា"
                );
                return;
              }

              if (passwordVal !== confirmPasswordVal) {
                Swal.showValidationMessage(
                  "ពាក្យសម្ងាត់ និងការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នា"
                );
                return;
              }

              // Your existing validation for other inputs here (keep as you had)

              // If all validations pass:
              resolve(listData_Input);
              Swal.close();
            });

          // ... Your other existing event listeners (like input/select validation, mouse events, etc.)
        },
      });
    });
  }

  Swal_Custom_Delete(title, body, isLoading, textLoading) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        html: `

      <div>


        <div style="display: flex; justify-content: space-between">
           <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
           <image id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px"/>
        </div>

        <hr/>

        <label style="text-align: left; width: 100%">${body}</label>


        <hr/>



        <div>

          <div id='swal-fire-holder-loading' style="display: none">

            <image id="swal-fire-alert-close" src="${iconLoader}" style="width: 200px; height: 40px; margin-top:0px; object-fit:contain"/>
              <br/>
              <label hidden style="color:gray; font-size: 15px">${textLoading}</label>
            
          </div>

          <div id='swal-fire-holder-button'  style="display:flex; justify-content: right">
              <button  id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary siemreap-regular" style="width: 100px"> <label class="siemreap-regular">បោះបង់</label> </button>
              <div style="width: 10px"></div>
              <button id="btn-swal-fire-btn-success" type="button" class="btn btn-danger siemreap-regular" style="width: 100px"> <label class="siemreap-regular">លុប</label>  </button>
          </div>
          
        
        </div>

       

          
    </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          // success
          document
            .getElementById("btn-swal-fire-btn-success")
            .addEventListener("click", () => {
              if (isLoading == true) {
                // Show Loading
                document.getElementById("swal-fire-alert-close").style.display =
                  "none";

                document.getElementById(
                  "swal-fire-holder-loading"
                ).style.display = "block";

                document.getElementById(
                  "swal-fire-holder-button"
                ).style.display = "none";

                resolve(true);
              } else {
                resolve(true);
              }
            });
        },
      });
    });
  }

  Swal_Custom_Delete_Button_Title(
    title,
    body,
    isLoading,
    textLoading,
    btnTitle
  ) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        html: `

      <div>


        <div style="display: flex; justify-content: space-between">
           <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
           <image id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px"/>
        </div>

        <hr/>

        <label style="text-align: left; width: 100%">${body}</label>


        <hr/>



        <div>

          <div id='swal-fire-holder-loading' style="display: none">

            <image id="swal-fire-alert-close" src="${iconLoader}" style="width: 200px; height: 50px; margin-top:0px; object-fit:cover"/>
            <br/>
            <label style="color:gray; font-size: 15px">${textLoading}</label>
            
          </div>

          <div id='swal-fire-holder-button'  style="display:flex; justify-content: right">
              <button  id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary" style="width: 100px">បោះបង់</button>
              <div style="width: 10px"></div>
              <button id="btn-swal-fire-btn-success" type="button" class="btn btn-danger" style="width: 100px">${btnTitle}</button>
          </div>
          
        
        </div>

       

          
    </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          // success
          document
            .getElementById("btn-swal-fire-btn-success")
            .addEventListener("click", () => {
              if (isLoading == true) {
                // Show Loading
                document.getElementById("swal-fire-alert-close").style.display =
                  "none";

                document.getElementById(
                  "swal-fire-holder-loading"
                ).style.display = "block";

                document.getElementById(
                  "swal-fire-holder-button"
                ).style.display = "none";

                resolve(true);
              } else {
                resolve(true);
              }
            });
        },
      });
    });
  }

  Swal_Custom_Read(title, listBody, width) {
    /* How to use
   {
          title: "ឈ្មោះសេវាកម្ម",
          value: row.app_name,
          required: null,
    }
  */
    return new Promise(async function (resolve, reject) {
      var listOfBody = "";

      for (let i of listBody) {
        if (i.title == "ស្ថានភាព") {
          var isCheck = i.value == "កំពុងប្រើប្រាស់" ? "checked" : "";

          listOfBody += `
            <div hidden style="display: flex; justify-content: space-between; margin-top: 10px">
                    <div style="display: flex; margin-top: 5px">
                        <label style="margin-top: 5px">${i.title}</label>
                        <label  style="margin-right: 10px; color:red; display:${
                          i.required == true ? "flex" : "none"
                        }"></label>
                    </div>


                         
                  <div  className="form-check" style="margin-top: 10px; text-align:left;  width: 300px">
                    <input onclick="return false"  className="form-check-input siemreap-regular"  ${isCheck} type="checkbox" value="" id="">
                      <label  className="form-check-label siemreap-regular" for="statueID" style="color: gray">ឈប់ប្រើប្រាស់</label>
                  </div>

                  
          
              </div>
          
          `;
        } else {
          listOfBody += `

          <div style="display: flex; justify-content: space-between; margin-top: 20px">
                  <div style="display: flex; margin-top: 5px">
                      <label style="">${i.title}</label>
                      <label  style="margin-right: 10px; color:red; display:${
                        i.required == true ? "flex" : "none"
                      }">*</label>
                  </div>


                        <div>
                        <input onfocus="this.blur();" readonly style="color:gray; width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px" class="siemreap-regular" value="${
                          i.value
                        }"/>

                        <br/>
                          <label class="siemreap-regular" id="${
                            i.id + "-holder-error"
                          }" style="text-align:start; color:red; font-size: 13px; width: 300px; display: none; margin-top: 5px">${
            i.error_text
          }</label>
                </div>

                
        
            </div>
      
          `;
        }
      }

      Swal.fire({
        width: width == "auto" ? "auto" : width + "px",
        html: `

      <div>


        <div style="display: flex; justify-content: space-between">
           <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
           <image id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px"/>
        </div>

        <hr/>


        ${listOfBody}


        <hr/ style="margin-top: 20px">



        <div>

         

          <div hidden id='swal-fire-holder-button'  style="display:flex; justify-content: right">
              <button  id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary siemreap-regular" style="width: 100px"><label class="siemreap-regular">ទទួលបាន</label></button>
 
          </div>
          
        
        </div>

       

          
    </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        // allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });
        },
      });
    });
  }

  Swal_Custom_Read_With_Wrap(title, listBody, widthTitle, widthInput) {
    /* How to use
  {
         title: "ឈ្មោះសេវាកម្ម",
         value: row.app_name,
         required: null,
   }
 */
    return new Promise(async function (resolve, reject) {
      var listOfBody = "";

      for (let i of listBody) {
        listOfBody += `

         <div style="display: flex; justify-content: space-between; margin-top: 20px">



                 <div style="display: flex; margin-top: 5px; width:${widthTitle}">
                     <label>${i.title}</label>
                     <label  style="margin-right: 10px; color:red; display:${
                       i.required == true ? "flex" : "none"
                     }">*</label>
                 </div>


                <label style="color:gray; width:${widthInput}; text-align: start; padding: 10px; border-radius: 6px; background-color: white; margin-top: 5pxl; border-style: solid; border-color: #dedede; border-width: 1px">${
          i.value
        }</label>

               
       
           </div>
     
     `;
      }

      Swal.fire({
        width: "auto",
        html: `

     <div>


       <div style="display: flex; justify-content: space-between">
          <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
          <image id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px"/>
       </div>

       <hr/>


       ${listOfBody}


       <hr/ style="margin-top: 20px">



       <div>

        

         <div hidden id='swal-fire-holder-button'  style="display:flex; justify-content: right">
             <button  id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary" style="width: 100px">ទទួលបាន</button>

         </div>
         
       
       </div>

      

         
   </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        // allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });
        },
      });
    });
  }

  Swal_Custom_Update(
    width,
    title,
    listData_Input,
    isLoading,
    textLoading,
    isShowActiveBox,
    isActive
  ) {
    return new Promise(async function (resolve, reject) {
      var listInput = "";
      var myHelper = new MyHelper();
      var firstIdforFoucs = null;

      // Check Active
      var activeBox = "";
      if (isShowActiveBox == true) {
        var textChheck = "";
        if (isActive == false) {
          textChheck = "checked";
        }

        activeBox += `<br/><br/> <div style="text-align:left">
            <input class="siemreap-regular" ${textChheck}  id=${"check-box-active"} type="checkbox"></input>
            <label for=${"check-box-active"} style="padding-top: 0px">ឈប់ប្រើប្រាស់</label>
        </div>`;
      }

      for (let i of listData_Input) {
        // Check Type Select or Input
        var valueInputOrSelect = "";
        if (i.input_or_select == "input") {
          valueInputOrSelect = `
             <input class="siemreap-regular" type="${i.type}" id="${i.id}" style="width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px" value="${i.value}"/>`;

          if (firstIdforFoucs == null) {
            firstIdforFoucs = i.id;
          }
        } else {
          if (i.input_or_select == "file") {
            valueInputOrSelect = `
            <input class="siemreap-regular" type="${i.type}" id="${i.id}" style="width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px" value="${i.value}"/>`;
          } else {
            // option
            var listOption = "";
            var select_Height = 140;

            for (let j of i.select_data_option) {
              listOption += `<li class="swal_helper_class_li"  style="font-size:16px; margin: 0px; padding-left: 10px" id="${j.value}-${i.id}-select-row" > <label class="siemreap-regular" id="${j.value}-${i.id}-select-row" >${j.label}</label></li>`;
            }
            valueInputOrSelect = `<div>

            <div style="position: relative; over-flow:hidden; margin-bottom: -20px">
               <img id="${i.id}-select-holder-close-drop" src="${closeDrop}" style="width: 20px; height: 20px; object-fit: contain; position: absolute ;right: 5; margin-top: 10px" />
               <input class="siemreap-regular" value="${i.value}" id="${i.id}" placeholder="សូមជ្រើសយក..." type="text" style="color:black; width: 300px; padding: 5px; padding-left: 10px; border-width: 1px; border-color:#d1d1d1; border-radius: 6px; " >

               <ul  class="swal_helper_class siemreap-regular" id="${i.id}-holder-list"  style="display:none ;text-align:left; position: absolute; overflow:scroll; height: ${select_Height}; background-color: #f2f2f2; width: 100%; z-index: 1; border-radius: 6px">
                ${listOption}
              </ul>

            </div>
            
          
              </div>`;
          }
        }

        // Check Return Value
        listInput += `
       <div style="display: flex; justify-content: space-between; margin-top: 20px">
              <div style="display: flex; margin-top: 5px">
                  <label style="">${i.title}</label>
                  <label  style="margin-right: 10px; color:red; display:${
                    i.required == true ? "flex" : "none"
                  }">*</label>
              </div>


            <div>
                     ${valueInputOrSelect}

                     <br/>
                      <label id="${
                        i.id + "-holder-error"
                      }" style="text-align:start; color:red; font-size: 13px; width: 300px; display: none; margin-top: 5px">${
          i.error_text
        }</label>
            </div>

             
     
        </div>
      
      `;
      }

      if (firstIdforFoucs) {
        setTimeout(() => {
          var input = document.getElementById(firstIdforFoucs);
          // Focus the last of the text
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }, 100);
      }

      Swal.fire({
        width: width == "auto" ? "auto" : width + "px",
        html: `

        <div style="${width == "auto" ? "auto" : width + "px"}">


          <div style="display: flex; justify-content: space-between">
             <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
             <image id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px"/>
          </div>
  
          <hr/>

         ${listInput}


         ${activeBox}

          <hr/>

          <div>

            <div id='swal-fire-holder-loading' style="display: none">

             
              <image id="swal-fire-alert-close" src="${iconLoader}" style="width: 200px; height: 40px; margin-top:0px; object-fit:contain"/>
              <br/>
              <label hidden style="color:gray; font-size: 15px">${textLoading}</label>
              
            </div>

            <div  id='swal-fire-holder-button'  style="display:flex; justify-content: right">
                <button  id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary" style="width: 100px"> <label class="siemreap-regular">បោះបង់</label> </button>
                <div style="width: 10px"></div>
                <button id="btn-swal-fire-btn-success" type="button" class="btn btn-success" style="width: 100px"> <label class="siemreap-regular">រក្សាទុក</label>  </button>
            </div>
            
          
          </div>

         

            
      </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          // success
          document
            .getElementById("btn-swal-fire-btn-success")
            .addEventListener("click", () => {
              // Check Input
              var isNoError_Step1 = true;
              for (let i of listData_Input) {
                var input = document.getElementById(i.id);
                var textError = document.getElementById(i.id + "-holder-error");
                if (i.required == true) {
                  if (
                    input.value == "" ||
                    input.value == null ||
                    input.value == undefined
                  ) {
                    input.style.borderColor = "red";
                    textError.style.display = "flex";
                    isNoError_Step1 = false;
                  } else {
                    i.value = input.value;
                  }
                }
              }

              // Complete Validation
              if (isNoError_Step1 == true) {
                // Check Input Select
                var isAprr_Step2 = false;

                for (let i of listData_Input) {
                  if (i.required == true && i.input_or_select == "select") {
                    var localisApp = false;
                    // Check Value If Select Error with name
                    var input = document.getElementById(i.id);
                    for (let j of i.select_data_option) {
                      localisApp = false;
                      if (j.label == input.value) {
                        isAprr_Step2 = true;
                        localisApp = true;
                        break;
                      }
                    }

                    if (localisApp == false) {
                      isAprr_Step2 = false;
                      // Change Here
                      var input = document.getElementById(i.id);
                      var textError = document.getElementById(
                        i.id + "-holder-error"
                      );
                      input.style.borderColor = "red";
                      textError.style.display = "flex";
                    }
                  }
                }

                // Check If Only Input
                var isOnlyInput = true;
                for (let i of listData_Input) {
                  if (i.input_or_select == "select") {
                    isOnlyInput = false;
                    break;
                  }
                }

                if (isOnlyInput == true) {
                  isAprr_Step2 = true;
                }

                // Complete
                if (isAprr_Step2 == true) {
                  var checkActive = document.getElementById("check-box-active");
                  if (isShowActiveBox == true) {
                    var check = {
                      is_active: checkActive.checked == true ? false : true,
                    };
                    listData_Input.push(check);
                  }

                  if (isLoading == true) {
                    // Show Loading
                    document.getElementById(
                      "swal-fire-alert-close"
                    ).style.display = "none";

                    document.getElementById(
                      "swal-fire-holder-loading"
                    ).style.display = "block";

                    document.getElementById(
                      "swal-fire-holder-button"
                    ).style.display = "none";

                    setTimeout(() => {
                      resolve(listData_Input);
                    }, 1000);
                  } else {
                    resolve(listData_Input);
                  }
                }
              }
            });

          //Return Back To Normal Input
          window.addEventListener("mouseover", (e) => {
            var clikId = "NA";
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3)
              // defeat Safari bug
              targ = targ.parentNode;
            // console.log(targ.id);
            clikId = targ.id;

            for (let i of listData_Input) {
              if (clikId == i.id) {
                var input = document.getElementById(i.id);
                var textError = document.getElementById(i.id + "-holder-error");

                input.addEventListener("change", () => {
                  input.style.borderColor = "#d1d1d1";
                  textError.style.display = "none";
                });
              }
            }
          });

          //Select Setup
          window.addEventListener("mouseup", (e) => {
            var clikId = "NA";
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3)
              // defeat Safari bug
              targ = targ.parentNode;
            // console.log(targ.id);
            clikId = targ.id;

            for (let i of listData_Input) {
              var input = document.getElementById(i.id);
              var input_Select_ListHolder = document.getElementById(
                `${i.id}-holder-list`
              );

              if (
                i.id + "-select-holder-close-drop" == clikId &&
                i.input_or_select == "select"
              ) {
                input_Select_ListHolder.style.display = "block";
              }

              if (clikId == i.id && i.input_or_select == "select") {
                // Open Select
                input_Select_ListHolder.style.display = "block";
              }

              // Close Select
              for (let i of listData_Input) {
                if (i.input_or_select == "select") {
                  for (let j of i.select_data_option) {
                    var row = `${j.value}-${i.id}-select-row`;
                    if (clikId == row) {
                      var input = document.getElementById(i.id);
                      var input_Select_ListHolder = document.getElementById(
                        `${i.id}-holder-list`
                      );
                      input_Select_ListHolder.style.display = "none";
                      input.style.readonly = true;
                      input.value = j.label;
                      i.select_data_id = j.value;

                      var textError = document.getElementById(
                        i.id + "-holder-error"
                      );
                      input.style.borderColor = "#d1d1d1";
                      textError.style.display = "none";

                      break;
                    }
                  }
                }
              }
            }
          });

          //Select Search
          window.addEventListener("mouseover", (e) => {
            var clikId = "NA";
            var targ;
            if (!e) var e = window.event;
            if (e.target) targ = e.target;
            else if (e.srcElement) targ = e.srcElement;
            if (targ.nodeType == 3)
              // defeat Safari bug
              targ = targ.parentNode;
            // console.log(targ.id);
            clikId = targ.id;

            for (let i of listData_Input) {
              if (clikId == i.id && i.input_or_select == "select") {
                var input = document.getElementById(i.id);
                var listHolder = document.getElementById(`${i.id}-holder-list`);

                input.addEventListener("input", () => {
                  var listOption = "";
                  var isHave = false;
                  var index = 0;
                  for (let j of i.select_data_option) {
                    var isApp =
                      myHelper.sort_Auto_Array_Input_Search_IS_Approved(
                        input.value,
                        [j.label]
                      );

                    if (isApp == true) {
                      index++;
                      isHave = true;
                      listOption += `<li   class="swal_helper_class_li"  style="font-size: 16px; padding: 0px; margin: 0px; padding-left: 10px"  id="${j.value}-${i.id}-select-row">${j.label}</li>`;
                    }
                  }

                  if (isHave == true) {
                    listHolder.innerHTML = listOption;

                    var select_Height = 140;

                    listHolder.style.height = select_Height;
                  } else {
                    listHolder.style.height = 100;
                    listHolder.innerHTML = `
                    <br/>
                    <label style="color: lightgray; width: 85%; text-align:center">មិនមានទិន្នន័យ</label>`;
                  }
                });
                break;
              }
            }
          });
        },
      });
    });
  }

  Swal_Custom_Toast_Success(title) {
    return new Promise(async function (resolve, reject) {
      var myHelper = new MyHelper();
      myHelper.cookie_Set("loading-check-ct", "true", 1);
      myHelper.cookie_remove("loading-check-ct");
      Swal.close();
      Swal.fire({
        width: "auto",
        position: "top-end",
        html: `

      <div style="display:flex">
        <img src="${mark}" style="width: 25px; height: 25px; object-fit: contain; margin-right: 10px; margin-top: -1px"/>
        <label >${title}</label>
      </div>
      
      `,
        showConfirmButton: false,
        timer: 1500,
      }).then((r) => {
        resolve(true);
      });
    });
  }

  async Swal_Custom_Toast_Failed(title) {
    Swal.close();
    Swal.fire({
      width: "auto",
      position: "top-end",
      html: `

      <div style="display:flex">
        <img src="${red}" style="width: 25px; height: 25px; object-fit: contain; margin-right: 10px; margin-top: -1px"/>
        <label >${title}</label>
      </div>
      
      `,
      showConfirmButton: false,
      timer: 1500,
    });
  }

  Swal_Custom_Alert_One_Button(title, body, buttonText) {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        html: `

      <div>


        <div style="display: flex; justify-content: space-between">
           <label style="weight: bolder; color: black; font-size: 25px">${title}</label>
           <image id="swal-fire-alert-close" src="${closeIcon}" style="width: 20px; height: 20px; margin-top:5px"/>
        </div>

        <hr/>

        <label style="text-align: left; width: 100%">${body}</label>


        <hr/>



        <div>

         

          <div id='swal-fire-holder-button'  style="display:flex; justify-content: right">

              <button  id="btn-swal-fire-alert-close" type="button" class="btn btn-secondary" style="width: 100px">${buttonText}</button>
          </div>
          
        
        </div>

       

          
    </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });

          document
            .getElementById("swal-fire-alert-close")
            .addEventListener("click", () => {
              Swal.close();
            });
        },
      });
    });
  }

  Swal_Find_Value_by_ID(id_input, list) {
    for (let i of list) {
      if (i.id == id_input) {
        return i.value;
      }
    }
  }

  Swal_Find_ID_Of_Select(id_input, list) {
    for (let i of list) {
      if (i.id == id_input) {
        return i.select_data_id;
      }
    }
  }

  Swal_Find_Value_Active(list) {
    var active = null;
    for (let i of list) {
      active = i.is_active;
    }
    return active;
  }

  Server_Error() {
    return new Promise(async function (resolve, reject) {
      Swal.fire({
        width: "auto",
        html: `

      <div>


        <div style="display: flex; justify-content: space-between">
           <label style="weight: bolder; color: black; font-size: 25px">Server Error : 500 Internal</label>

        </div>

        <hr/>

        <img style="width: 350px; height: 200px; object-fit: contain" src="${serverErr}"/>


        <hr/>




        <div>

   

          <div id='swal-fire-holder-button'  style="display:flex; justify-content: right">


              <button id="btn-swal-fire-btn-success" type="button" class="btn btn-danger" style="width: 150px">សាកល្បងម្តងទៀត</button>
          </div>
          
        
        </div>

       

          
    </div>`,

        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          // Close
          document
            .getElementById("btn-swal-fire-btn-success")
            .addEventListener("click", () => {
              window.location.reload();
            });
        },
      });
    });
  }
}

export default Swal_Helper;

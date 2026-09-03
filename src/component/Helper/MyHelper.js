class MyHelper {
  cookie_Set_Temp_id(value) {
    this.cookie_Set("temp-id", this.encrypt(value), 1);
  }

  cookie_Get_Temp_id() {
    var data = this.decrypt(this.cookie_Get("temp-id"));
    //remove
    this.cookie_remove("temp-id");
    return data;
  }

  cookie_Set(name, value, daysToLive) {
    // Encode value in order to escape semicolons, commas, and whitespace
    var cookie = name + "=" + encodeURIComponent(value);

    if (typeof daysToLive === "number") {
      /* Sets the max-age attribute so that the cookie expires
              after the specified number of days */
      cookie += "; max-age=" + daysToLive * 24 * 60 * 60;

      document.cookie = cookie;
    }
  }

  cookie_Get(name) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");

    // Loop through the array elements
    for (var i = 0; i < cookieArr.length; i++) {
      var cookiePair = cookieArr[i].split("=");

      /* Removing whitespace at the beginning of the cookie name
                and compare it with the given string */
      if (name == cookiePair[0].trim()) {
        // Decode the cookie value and return
        return decodeURIComponent(cookiePair[1]);
      }
    }

    // Return null if not found
    return null;
  }

  cookie_remove(name) {
    document.cookie = name + "=; Max-Age=0";
  }

  encrypt(value) {
    var dataInLeft = "DE";
    var dataInRight = "EN";

    var encodeString = this.m_encrypt(value, dataInLeft, dataInRight);
    return encodeString;
  }

  decrypt(value) {
    var decodeString = this.m_decrypt(value);
    let arr = this.m_decrypt2(decodeString);

    return arr[1];
  }

  m_encrypt(value, dataInLeft, dataInRight) {
    return window.btoa(dataInLeft + "---(" + value + "---(" + dataInRight);
  }

  m_decrypt(value) {
    return window.atob(value);
  }

  m_decrypt2(decodeString) {
    return decodeString.split("---(");
  }

  session_Set(name, value) {
    sessionStorage.setItem(name, value);
  }

  session_Get(name) {
    return sessionStorage.getItem(name);
  }

  Screen_Get_Width_Of_Window_For_Resolution_Follow_Bootsramp() {
    var elementWidth = window.innerWidth;
    var screen = 0;
    if (elementWidth > 0 && elementWidth < 575.98) {
      screen = 1;
    } else if (elementWidth >= 575.98 && elementWidth < 767.98) {
      screen = 2;
    } else if (elementWidth >= 767.98 && elementWidth < 991.98) {
      screen = 3;
    } else if (elementWidth >= 991.98 && elementWidth < 1199.98) {
      screen = 4;
    } else if (elementWidth >= 1199.98) {
      screen = 5;
    }

    return screen;
  }

  table_is_Show_Column(col_no, isShow, id_of_table) {
    var rows = document.getElementById(id_of_table).rows;

    for (var row = 0; row < rows.length; row++) {
      var cols = rows[row].cells;
      if (col_no >= 0 && col_no < cols.length) {
        cols[col_no].style.display = isShow ? "" : "none";
      }
    }
  }

  tableView_ClickRow(e, return_as_textClick_rowClick_cellClick) {
    const cell = e.target.closest("td");
    if (!cell) {
      return;
    } // Quit, not clicked on a cell
    const row = cell.parentElement;
    // console.log(cell.innerHTML, row.rowIndex, cell.cellIndex);

    if (return_as_textClick_rowClick_cellClick == "textClick") {
      return cell.innerHTML;
    } else if (return_as_textClick_rowClick_cellClick == "cellClick") {
      return cell.cellIndex;
    } else {
      return row.rowIndex;
    }
  }

  sort_Auto_Array_Input_Search_IS_Approved(
    value_input_search,
    list_Will_Sort_As_String
  ) {
    var isAppReturn = false;
    if (value_input_search.length > 0) {
      for (let i of list_Will_Sort_As_String) {
        // console.log(i)

        if (
          this.array_Search_Return_isAprroved(i, value_input_search) == true
        ) {
          isAppReturn = true;
        }
      }
    } else {
      isAppReturn = true;
    }

    return isAppReturn;
  }
  array_Search_Return_isAprroved(value1, value2) {
    var txtValue_1 = value1.toLowerCase();
    var txtValue_2 = value2.toLowerCase();

    //  console.log(txtValue_1 + " : " + txtValue_2);

    if (txtValue_1.indexOf(txtValue_2) > -1) {
      return true;
    } else {
      return false;
    }
  }

  //=========================
  // Date Working

  dateTime_GetPeroid(dateAdd, monthAdd, yearAdd) {
    const date = new Date();
    let days = date.getDate();
    let months = date.getMonth() + 1;
    let years = date.getFullYear();

    return this.dateTime_GetPeroid_2_Date(
      days,
      months,
      years,
      dateAdd,
      monthAdd,
      yearAdd
    );
  }

  dateTime_Show_Khmer_Month_Only(dataMonth) {
    var resltMonth = "NA";

    if (dataMonth == 1) {
      resltMonth = "មករា";
    } else if (dataMonth == 2) {
      resltMonth = "កុម្ភះ";
    } else if (dataMonth == 3) {
      resltMonth = "មិនា";
    } else if (dataMonth == 4) {
      resltMonth = "មេសា";
    } else if (dataMonth == 5) {
      resltMonth = "ឧសភា";
    } else if (dataMonth == 6) {
      resltMonth = "មិថុនា";
    } else if (dataMonth == 7) {
      resltMonth = "កក្តដា";
    } else if (dataMonth == 8) {
      resltMonth = "សីហា";
    } else if (dataMonth == 9) {
      resltMonth = "កញ្ញា";
    } else if (dataMonth == 10) {
      resltMonth = "តុលា";
    } else if (dataMonth == 11) {
      resltMonth = "វិច្ឆិកា";
    } else if (dataMonth == 12) {
      resltMonth = "ធ្នូ";
    }

    return resltMonth;
  }

  dateTime_Show_Full_Date_Short_As_khmerMonth_With_Time(
    input_Date,
    input_Month,
    input_Year,
    input_Hour,
    input_Minute,
    input_Second
  ) {
    return (
      this.dateTime_Show_Full_Date_Short_As_khmerMonth(
        input_Date,
        input_Month,
        input_Year
      ) + `, ម៉ោង ${input_Hour}:${input_Minute} នាទី`
    );
  }

  dateTime_Month_Return_Current_Month_As_Khmer() {
    var mm = "";
    for (let i = 1; i <= this.dateTime_Get_Current_Month(); i++) {
      if (i == 1) {
        mm = "ខែមករា";
      } else if (i == 2) {
        mm = "ខែកុម្ភៈ";
      } else if (i == 3) {
        mm = "ខែមីនា";
      } else if (i == 4) {
        mm = "ខែមេសា";
      } else if (i == 5) {
        mm = "ខែឧសភា";
      } else if (i == 6) {
        mm = "ខែមិថុនា";
      } else if (i == 7) {
        mm = "ខែកក្តដា";
      } else if (i == 8) {
        mm = "ខែសីហា";
      } else if (i == 9) {
        mm = "ខែកញ្ញា";
      } else if (i == 10) {
        mm = "ខែតុលា";
      } else if (i == 11) {
        mm = "ខែវិច្ឆិកា";
      } else if (i == 12) {
        mm = "ខែធ្នូ";
      }
    }

    return mm;
  }

  dateTime_Show_Full_Date_Short_As_Eng_With_Time_With_Second_Ago(
    input_Date,
    input_Month,
    input_Year,
    input_Hour,
    input_Minute,
    input_Second
  ) {
    var date = "NA";
    var data = "NA";

    if (this.dateTime_GetPeroid(input_Date, input_Month, input_Year) == 0) {
      date = "Today";
      if (this.bizHub_Langauge_Read_kh_or_eng() == "kh") {
        date = "ថ្ងៃនេះ";
      }
    } else {
      //  console.log(dateTime_GetPeroid(input_Date, input_Month, input_Year))

      // console.log(this.dateTime_GetPeroid(input_Date, input_Month, input_Year) + " : " + -1)

      if (
        parseInt(
          this.dateTime_GetPeroid(input_Date, input_Month, input_Year)
        ) == -1
      ) {
        date = "Yesterday";
        if (this.bizHub_Langauge_Read_kh_or_eng() == "kh") {
          date = "ម្សិលមិញ";
        }
      } else {
        date =
          input_Date +
          " " +
          this.dateTime_Show_Khmer_Eng_Short_Only(input_Month) +
          " " +
          input_Year;
        if (this.bizHub_Langauge_Read_kh_or_eng() == "kh") {
          date =
            "ថ្ងៃទី" +
            input_Date +
            " ខែ" +
            this.dateTime_Show_Khmer_Month_Only(input_Month) +
            " ឆ្នាំ" +
            input_Year;
        }
      }
    }

    var textSec = " ";
    if (this.bizHub_Langauge_Read_kh_or_eng() == "kh") {
      textSec = " នាទី";
    }

    data =
      date +
      ", " +
      input_Hour +
      ":" +
      input_Minute +
      ":" +
      input_Second +
      " " +
      textSec;

    return data;
  }

  dateTime_Get_Current_Day() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    var result = day.toString();
    if (day.toString().length == 1) {
      result = "0" + result;
    }
    return result;
  }

  dateTime_Get_Current_Month() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    var result = month.toString();
    if (month.toString().length == 1) {
      result = "0" + result;
    }
    return result;
  }

  dateTime_Get_Current_Year() {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return year.toString();
  }

  dateTime_Get_Current_Hour() {
    const date = new Date();

    let value = date.getHours();

    var resuldCheck = value.toString();
    if (resuldCheck.length == 1) {
      resuldCheck = "0" + value.toString();
    }

    return resuldCheck;
  }

  dateTime_Get_Current_Minute() {
    const date = new Date();

    let value = date.getMinutes();
    var resuldCheck = value.toString();
    if (resuldCheck.length == 1) {
      resuldCheck = "0" + value.toString();
    }

    return resuldCheck;
  }

  dateTime_Get_Current_Second() {
    const date = new Date();

    let value = date.getSeconds();

    var resuldCheck = value.toString();
    if (resuldCheck.length == 1) {
      resuldCheck = "0" + value.toString();
    }

    return resuldCheck;
  }

  dateTime_GetPeroid_2_Date(
    start_Date,
    start_Month,
    start_Year,
    end_Data,
    end_Month,
    end_year
  ) {
    var firstDate = start_Month + "/" + start_Date + "/" + start_Year;
    var endData = end_Month + "/" + end_Data + "/" + end_year;

    return this.datediff(this.parseDate(firstDate), this.parseDate(endData));
  }

  // Date Sort
  datediff(first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  }

  /**
   * new Date("dateString") is browser-dependent and discouraged, so we'll write
   * a simple parse function for U.S. date format (which does no error checking)
   */
  parseDate(str) {
    var mdy = str.split("/");
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
  }

  dateTime_Month_Khmer_Return(month) {
    var dataValue = "NA";
    if (month == 1) {
      dataValue = "មករា";
    } else if (month == 2) {
      dataValue = "កុម្ភះ";
    } else if (month == 3) {
      dataValue = "មីនា";
    } else if (month == 4) {
      dataValue = "មេសា";
    } else if (month == 5) {
      dataValue = "ឧសភា";
    } else if (month == 6) {
      dataValue = "មិថុនា";
    } else if (month == 7) {
      dataValue = "កក្កដា";
    } else if (month == 8) {
      dataValue = "សីហា";
    } else if (month == 9) {
      dataValue = "កញ្ញា";
    } else if (month == 10) {
      dataValue = "តុលា";
    } else if (month == 11) {
      dataValue = "វិច្ឆិកា";
    } else if (month == 12) {
      dataValue = "ធ្នូ";
    }
    return dataValue;
  }

  localStorage_Set(key, value) {
    localStorage.setItem(key, value);
  }

  localStorage_Get(key) {
    return localStorage.getItem(key);
  }

  localStorage_Remove(key) {
    localStorage.removeItem(key);
  }
}

export default MyHelper;

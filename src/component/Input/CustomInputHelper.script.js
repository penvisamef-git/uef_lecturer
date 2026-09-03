import Swal from "sweetalert2";

class CustomInputHelper {
  inputValidation(input, setInput) {
    if (input) {
      if (input.value) {
      } else {
        document.getElementById(input.id).focus();
        setInput((prevState) => ({
          ...prevState,
          is_correct: false,
        }));
      }
    }
  }

  formValidation(data) {
    var isValid = true;
    var newList = [];
    var isFocus = false;
    data.map((row) => {
      if (row.i.required) {
        if (row.i.value == "" || row.i.is_correct == false) {
          isValid = false;
          row.s((prevState) => ({
            ...prevState,
            value: row.i.value,
            is_correct: false,
          }));
          if (!isFocus) {
            const el = document.getElementById(row.i.id);
            if (el && el.type !== "checkbox") {
              isFocus = true;
              el.focus();
            }
          }
        }
      }
    });
    newList = data;
    if (isValid) {
      var listData = {};

      data.forEach((row) => {
        listData[row.i["id"]] = row.i["value"];
      });

      return {
        status: true,
        originData: data,
        validataionData: newList,
        objectData: listData,
      };
    } else {
      return {
        status: false,
        originData: data,
        validataionData: newList,
        objectData: [],
      };
    }
  }

  formLocationValidation(i, s) {
    var isValid = true;
    if (i.city_province && i.city_province.required) {
      if (i.city_province.value === "" || i.city_province.value === null) {
        isValid = false;
        s((prevState) => ({
          ...prevState,
          city_province: {
            ...prevState.city_province,
            is_correct: false,
          },
        }));
      }
    }

    if (i.district && i.district.required) {
      if (i.district.value === "" || i.district.value === null) {
        isValid = false;
        s((prevState) => ({
          ...prevState,
          district: {
            ...prevState.district,
            is_correct: false,
          },
        }));
      }
    }

    if (i.commune && i.commune.required) {
      if (i.commune.value === "" || i.commune.value === null) {
        isValid = false;
        s((prevState) => ({
          ...prevState,
          commune: {
            ...prevState.commune,
            is_correct: false,
          },
        }));
      }
    }

    if (i.village && i.village.required) {
      if (i.village.value === "" || i.village.value === null) {
        isValid = false;
        s((prevState) => ({
          ...prevState,
          village: {
            ...prevState.village,
            is_correct: false,
          },
        }));
      }
    }

    if (isValid) {
      console.log("Yes", i);
    } else {
      console.log("No", i);
    }
  }

  inputInvalid(input, setInput) {
    document.getElementById(input.id).focus();
    document.getElementById(input.id).select();
    setInput((prevState) => ({
      ...prevState,
      is_correct: false,
    }));
  }

}

export default CustomInputHelper;

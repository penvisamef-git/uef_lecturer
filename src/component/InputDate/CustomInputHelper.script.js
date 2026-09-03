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
        if (row.i.value == "") {
          isValid = false;
          row.s((prevState) => ({
            ...prevState,
            value: row.i.value,
            is_correct: false,
          }));
          if (isFocus == false) {
            isFocus = true;
            document.getElementById(row.i.id).focus();
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

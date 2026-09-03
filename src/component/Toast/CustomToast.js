import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CustomToast.css";

class CustomToast {
  onShow(label, style = {}) {
    toast(<div style={style}>{label}</div>, {
      style: {
        width: "auto",
        ...style,
      },
      autoClose: 1500,
      hideProgressBar: false,
      progressStyle: {
        backgroundColor: "blue",
      },
      className: "custom-toast",
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  }
}

export default CustomToast;

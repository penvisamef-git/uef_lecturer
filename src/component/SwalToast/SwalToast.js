import Swal from "sweetalert2";

class SwalToast {
  toastError(title, second = 2000) {
    Swal.fire({
      width: "auto",
      toast: true,
      position: "top-end",
      icon: "error",
      title: title,
      showConfirmButton: false,
      timer: second,
      timerProgressBar: true,
      customClass: {
        popup: "siemreap-bold",
      },
    });
  }

  async toastSuccess(title, second = 2000) {
    await Swal.fire({
      width: "auto",
      toast: true,
      position: "top-end",
      icon: "success",
      title: title,
      showConfirmButton: false,
      timer: second,
      timerProgressBar: true,
      customClass: {
        popup: "siemreap-bold",
      },
    });
  }

  toastWarning(title, second = 2000) {
    Swal.fire({
      width: "auto",
      toast: true,
      position: "top-end",
      icon: "warning",
      title: title,
      showConfirmButton: false,
      timer: second,
      timerProgressBar: true,
      customClass: {
        popup: "siemreap-bold",
      },
    });
  }
}

export default SwalToast;
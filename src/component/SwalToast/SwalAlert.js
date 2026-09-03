import Swal from "sweetalert2";

/**
 * Confirm deletion using SweetAlert2
 * @param {Object} options - Options object
 * @param {string} options.title - The item name to display in the confirmation message
 * @param {Function} onConfirm - Callback function to execute on confirmation
 */
export const confirmDelete = async ({ title }, onConfirm) => {
  const result = await Swal.fire({
    title: "តើអ្នកពិតជាចង់លុបមែនឬ?",
    html: `${title}<br/> ទិន្នន័យនឹងត្រូវបានលុប និងមិនអាចយកវិញបាន!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "យល់ព្រម",
    cancelButtonText: "បោះបង់",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    onConfirm(); // Execute callback
  }
};

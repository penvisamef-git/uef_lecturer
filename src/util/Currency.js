export default class CurrencyHelper {
  toUSD_KHR_Short(value, currency) {
    if (currency == "USD") {
      return this.toUSD_Short(value);
    } else {
      return this.toKHR_Short(value);
    }
  }

  toUSD_Short(value) {
    if (value) {
      // Format number without currency
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

      return `${formatted} $`; // Add $ after
    } else {
      return "0.00 $";
    }
  }

  toKHR_Short(value) {
    const toKhmerNumber = (number) => {
      const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return number
        .toString()
        .split("")
        .map((d) => khmerDigits[+d] || d)
        .join("");
    };

    if (value) {
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return formatted + " ៛"; // toKhmerNumber(formatted) + "៛";
    } else {
      return "០ ៛"; // Also fix "0" to Khmer "០"
    }
  }
}

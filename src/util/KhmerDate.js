export default class KhmerDateHelper {
  toKhmerNumber = (number) => {
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    return number
      .toString()
      .padStart(2, "0")
      .split("")
      .map((d) => khmerDigits[+d] || d)
      .join("");
  };

  convert_ToDate(value) {
    const toKhmerNumber = (number) => {
      const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return number
        .toString()
        .padStart(2, "0")
        .split("")
        .map((d) => khmerDigits[+d] || d)
        .join("");
    };

    const khmerMonthNames = [
      "", // index 0 placeholder (months start from 1)
      "មករា",
      "កុម្ភៈ",
      "មីនា",
      "មេសា",
      "ឧសភា",
      "មិថុនា",
      "កក្កដា",
      "សីហា",
      "កញ្ញា",
      "តុលា",
      "វិច្ឆិកា",
      "ធ្នូ",
    ];

    if (!value) return "";

    const day = toKhmerNumber(value.day);
    const monthName = khmerMonthNames[value.month]; // Khmer month
    const year = toKhmerNumber(value.year);
    const hour = toKhmerNumber(value.hour);
    const minute = toKhmerNumber(value.minute);
    const second = toKhmerNumber(value.second);

    return `ថ្ងៃទី${day} ខែ${monthName} ឆ្នាំ${year}`;
  }
  convert_ToDateTimeKhmer(value) {
    const toKhmerNumber = (number) => {
      const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return number
        .toString()
        .padStart(2, "0")
        .split("")
        .map((d) => khmerDigits[+d] || d)
        .join("");
    };

    const khmerMonthNames = [
      "", // index 0 placeholder (months start from 1)
      "មករា",
      "កុម្ភៈ",
      "មីនា",
      "មេសា",
      "ឧសភា",
      "មិថុនា",
      "កក្កដា",
      "សីហា",
      "កញ្ញា",
      "តុលា",
      "វិច្ឆិកា",
      "ធ្នូ",
    ];

    if (!value) return "";

    const day = toKhmerNumber(value.day);
    const monthName = khmerMonthNames[value.month]; // Khmer month
    const year = toKhmerNumber(value.year);
    const hour = toKhmerNumber(value.hour);
    const minute = toKhmerNumber(value.minute);
    const second = toKhmerNumber(value.second);

    return `${day}-${monthName}-${year}, ${hour}:${minute}:${second}`;
  }

  convert_ToTimeKhmer(value) {
    const toKhmerNumber = (number) => {
      const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return number
        .toString()
        .padStart(2, "0")
        .split("")
        .map((d) => khmerDigits[+d] || d)
        .join("");
    };

    const khmerMonthNames = [
      "", // index 0 placeholder (months start from 1)
      "មករា",
      "កុម្ភៈ",
      "មីនា",
      "មេសា",
      "ឧសភា",
      "មិថុនា",
      "កក្កដា",
      "សីហា",
      "កញ្ញា",
      "តុលា",
      "វិច្ឆិកា",
      "ធ្នូ",
    ];

    if (!value) return "";

    const day = toKhmerNumber(value.day);
    const monthName = khmerMonthNames[value.month]; // Khmer month
    const year = toKhmerNumber(value.year);

    return `${day}-${monthName}-${year}`;
  }

  convert_ToTimeKhmer_WithTime(value) {
    const toKhmerNumber = (number) => {
      const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return number
        .toString()
        .padStart(2, "0")
        .split("")
        .map((d) => khmerDigits[+d] || d)
        .join("");
    };

    const khmerMonthNames = [
      "", // index 0 placeholder (months start from 1)
      "មករា",
      "កុម្ភៈ",
      "មីនា",
      "មេសា",
      "ឧសភា",
      "មិថុនា",
      "កក្កដា",
      "សីហា",
      "កញ្ញា",
      "តុលា",
      "វិច្ឆិកា",
      "ធ្នូ",
    ];

    if (!value) return "";

    const day = toKhmerNumber(value.day);
    const monthName = khmerMonthNames[value.month]; // Khmer month
    const year = toKhmerNumber(value.year);
    const hour = toKhmerNumber(value.hour);
    const minute = toKhmerNumber(value.minute);
    const second = toKhmerNumber(value.second);

    return `${day}-${monthName}-${year}, ${hour}:${minute} នាទី`;
  }

  convert_ToDateKhmer_MM_DD_YYY(value) {
    const toKhmerNumber = (number) => {
      const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
      return number
        .toString()
        .padStart(2, "0")
        .split("")
        .map((d) => khmerDigits[+d] || d)
        .join("");
    };

    const khmerMonthNames = [
      "", // index 0 placeholder (months start from 1)
      "មករា",
      "កុម្ភៈ",
      "មីនា",
      "មេសា",
      "ឧសភា",
      "មិថុនា",
      "កក្កដា",
      "សីហា",
      "កញ្ញា",
      "តុលា",
      "វិច្ឆិកា",
      "ធ្នូ",
    ];

    if (!value || typeof value !== "string") return "";

    // Split the input string assuming MM-DD-YYYY format
    const parts = value.split("-");
    if (parts.length !== 3) return "";

    const [monthStr, dayStr, yearStr] = parts;

    // Convert to numbers
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);

    if (
      isNaN(month) ||
      month < 1 ||
      month > 12 ||
      isNaN(day) ||
      day < 1 ||
      day > 31 ||
      isNaN(year)
    ) {
      return "";
    }

    const dayKhmer = toKhmerNumber(day);
    const monthKhmer = khmerMonthNames[month] || "";
    const yearKhmer = toKhmerNumber(year);

    return `${dayKhmer}-${monthKhmer}-${yearKhmer}`;
  }
}

class Helper {
  static color = "red";

  cambodiaDate() {
    const currentDateTimeInCambodia = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Phnom_Penh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24-hour format
    });
    return currentDateTimeInCambodia;
  }

  cambodiaDate_NoTime() {
    const currentDateTimeInCambodia = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Phnom_Penh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",

      hour12: false, // 24-hour format
    });
    return currentDateTimeInCambodia;
  }

  cleanUpRouteURL_WindowPath(url) {
    const segments = url.split("/");

    // Find the index of "view" in segments
    const viewIndex = segments.indexOf("view");

    if (viewIndex !== -1) {
      // Check if there is a next segment after "view"
      if (segments.length > viewIndex + 1) {
        // Remove the segment after "view"
        segments.splice(viewIndex + 1, 1);
      }
    }

    // Join back and make sure it starts with "/"
    const cleanPath = segments.join("/");
    return cleanPath.startsWith("/") ? cleanPath : "/" + cleanPath;
  }

  encrypt(value) {
    const prefix = "DE";
    const suffix = "EN";

    return this.base64Encode(`${prefix}---(${value}---(${suffix}`);
  }
  base64Decode(encoded) {
    return Buffer.from(encoded, "base64").toString("utf-8");
  }

  decrypt(encodedValue) {
    const decoded = this.base64Decode(encodedValue);
    const parts = decoded.split("---(");
    return parts[1] || null;
  }

  // Replace window.btoa
  base64Encode(text) {
    return Buffer.from(text, "utf-8").toString("base64");
  }

  // Replace window.atob
  base64Decode(encoded) {
    return Buffer.from(encoded, "base64").toString("utf-8");
  }
}

export default Helper;

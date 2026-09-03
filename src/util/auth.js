import CryptoJS from "crypto-js";
class Auth {
  static encryptionKey = "mef-encryption-key";

  setClientLogin(userData) {
    const encryptedData = this.encryptObject(userData);
    this.setCookie(
      process.env.REACT_APP_LOGIN_COOKIE_CLIENT_SRECRET_KEY,
      encryptedData,
      720
    );
  }

  getClientLogin() {
    const encryptedData = this.getCookie(
      process.env.REACT_APP_LOGIN_COOKIE_CLIENT_SRECRET_KEY
    );
    return encryptedData ? this.decryptObject(encryptedData) : null;
  }

  removeClientLogin() {
    this.deleteCookie(process.env.REACT_APP_LOGIN_COOKIE_CLIENT_SRECRET_KEY);
  }

  // Set a cookie
  setCookie(name, value, hours) {
    let expires = "";
    if (hours) {
      let date = new Date();
      date.setTime(date.getTime() + hours * 60 * 60 * 1000); // hours → ms
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  // setCookie(name, value, days) {
  //   let expires = "";
  //   if (days) {
  //     let date = new Date();
  //     date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  //     expires = "; expires=" + date.toUTCString();
  //   }
  //   document.cookie = name + "=" + value + expires + "; path=/";
  // }

  // Delete a cookie
  deleteCookie(name) {
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  // Get a cookie value
  getCookie(name) {
    let cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      let [cookieName, cookieValue] = cookie.split("=");
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null; // Return null if cookie not found
  }

  // Encrypt the object (convert it to a string and then encrypt)
  encryptObject(object) {
    const jsonString = JSON.stringify(object);
    return CryptoJS.AES.encrypt(jsonString, Auth.encryptionKey).toString();
  }

  // Decrypt the encrypted string back into an object
  decryptObject(encryptedString) {
    const bytes = CryptoJS.AES.decrypt(encryptedString, Auth.encryptionKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedString ? JSON.parse(decryptedString) : null;
  }
}

export default Auth;

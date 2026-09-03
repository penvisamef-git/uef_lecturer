// src/util/session.js

class Session {
  // Set session
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  // Get session
  get(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Remove session
  remove(key) {
    sessionStorage.removeItem(key);
  }

  // Clear all session data
  clear() {
    sessionStorage.clear();
  }
}

export default Session;

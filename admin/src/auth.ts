export function isAuthed() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin_authed") === "1";
  }
  
  export function signIn(username: string, password: string) {
    const u = process.env.EXPO_PUBLIC_ADMIN_USER;
    const p = process.env.EXPO_PUBLIC_ADMIN_PASS;
  
    if (username === u && password === p) {
      localStorage.setItem("admin_authed", "1");
      return true;
    }
    return false;
  }
  
  export function signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_authed");
    }
  }
  
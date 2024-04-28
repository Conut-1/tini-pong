import { BACKEND_URL, navigateTo } from "../index.js";
import { fetch_post } from "./fetch.js";

export default class {
  constructor() {
    this.loginStatus = false;
  }

  async isLogin() {
    const notLogined = () => {
      if (this.loginStatus === true) {
        clearTimeout(this.timerId);
        this.loginStatus = false;
      }
      alert("로그인이 필요합니다.");
      navigateTo("/login");
    };

    const getLoginStatus = async () => {
      try {
        const response = await fetch_post(`${BACKEND_URL}/user/status-update/`);
        if (!response.ok) throw new Error(response.statusText);
        this.timerId = setTimeout(getLoginStatus, 30000);
      } catch (error) {
        notLogined();
      }
    };

    try {
      const response = await fetch_post(`${BACKEND_URL}/user/status-update/`);
      if (response.ok) {
        if (this.loginStatus === false) {
          this.loginStatus = true;
          this.timerId = setTimeout(getLoginStatus, 30000);
        }
        return true;
      } else throw new Error(response.statusText);
    } catch (error) {
      notLogined();
      return false;
    }
  }
}

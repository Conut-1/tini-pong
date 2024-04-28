import FetchModule from "./fetchmodule.js";
import { BACKEND_URL, navigateTo } from "../index.js";

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

    const getLoginStatus = async (fetchModule) => {
      try {
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/user/status-update/`, {
            method: "POST",
            credentials: "include",
          })
        );
        if (!response.ok) throw new Error(response.statusText);
        this.timerId = setTimeout(getLoginStatus, 30000, fetchModule);
      } catch (error) {
        notLogined();
      }
    };

    try {
      const fetchModule = new FetchModule();
      const response = await fetchModule.request(
        new Request(`${BACKEND_URL}/user/status-update/`, {
          method: "POST",
          credentials: "include",
        })
      );
      if (response.ok) {
        if (this.loginStatus === false) {
          this.loginStatus = true;
          this.timerId = setTimeout(getLoginStatus, 30000, fetchModule);
        }
        return true;
      } else throw new Error(response.statusText);
    } catch (error) {
      notLogined();
      return false;
    }
  }
}

import AbstractComponent from "./AbstractComponent.js";
import FetchModule from "../utils/fetchmodule.js";
import { BACKEND_URL, navigateTo } from "../index.js";

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("Login oauth");
  }

  async getHtml() {
    return `
		<div class="spinner-border" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
		`;
  }

  handleRoute() {
    const queryString = location.search;

    (async function () {
      try {
        const fetchModule = new FetchModule();
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/auth/oauth${queryString}`, {
            method: "GET",
            credentials: "include",
          })
        );
        if (response.ok) {
          const data = await response.json();
          if (data.has_logged_in) navigateTo("/login/otp");
          else navigateTo("/login/otp/qr");
        } else throw new Error(response.statusText);
      } catch (error) {
        alert(error.message);
      }
    })();
  }
}

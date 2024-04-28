import AbstractComponent from "./AbstractComponent.js";
import FetchModule from "../utils/fetchmodule.js";
import {
  BACKEND_URL,
  DOMAIN_NAME,
  OAUTH_CLIENT,
  navigateTo,
} from "../index.js";

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("Login");
  }

  async getHtml() {
    return `
		<style>
		body {
			background-image: url("/src/img/Login_Background.png");
			background-repeat: no-repeat;
			background-attachment: fixed;
			background-size: cover;
			background-position: center;
		}
		</style>
		<div class="d-flex flex-column justify-content-center align-items-start" style="min-height: 100dvh; margin-left: 18dvw;">
			<div class="text-start noto-sans white-blue lobby-title">TINY<br />PING<br />PONG</div>
			<div class="mt-5">
				<button class="btn btn-outline-light btn-lg noto-sans lobby-btn">&nbsp&nbsp&nbspLOG IN&nbsp&nbsp&nbsp</button>
			</div>
		</div>
		`;
  }

  handleRoute() {
    const appNode = document.querySelector("#app");
    const loginBtn = appNode.querySelector(".btn");
    loginBtn.addEventListener("click", async (event) => {
      try {
        const fetchModule = new FetchModule();
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/user/status-update/`, {
            method: "POST",
            credentials: "include",
          })
        );
        if (response.ok) navigateTo("/");
        else throw new Error(response.statusText);
      } catch (error) {
        location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${OAUTH_CLIENT}&redirect_uri=https://${DOMAIN_NAME}/login/oauth&response_type=code`;
      }
    });
  }
}

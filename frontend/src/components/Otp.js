import AbstractComponent from "./AbstractComponent.js";
import FetchModule from "../utils/fetchmodule.js";
import { BACKEND_URL, navigateTo } from "../index.js";

const regex = /^[0-9]+$/;
const regex2 = /^[0-9]$/;

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("OTP Auth");
  }

  async getHtml() {
    return `
		<div class="container-sm text-center">
			<p><b>Verification Code</b></p>
			<p>Google Authenticator에 표시된 OTP 코드를 입력해주세요.</p>
			<div class="row row-cols-3 row-cols-sm-6">
				<div class="col">
					<input class="form-control form-control-lg otp-form" type="number" style="text-align: center" autofocus>
				</div>
				<div class="col">
					<input class="form-control form-control-lg otp-form" type="number" style="text-align: center">
				</div>
				<div class="col">
					<input class="form-control form-control-lg otp-form" type="number" style="text-align: center">
				</div>
				<div class="col">
					<input class="form-control form-control-lg otp-form" type="number" style="text-align: center">
				</div>
				<div class="col">
					<input class="form-control form-control-lg otp-form" type="number" style="text-align: center">
				</div>
				<div class="col">
					<input class="form-control form-control-lg otp-form" type="number" style="text-align: center">
				</div>
			</div>
			<div class="mt-2">
				<p class="text-danger" id="otp-danger">&nbsp</p>
				<button class="btn btn-primary" id="otp-submit-btn">제출</button>
			</div>
		</div>
		`;
  }

  handleRoute() {
    const otpForm = document.querySelectorAll(".otp-form");
    const otpSubmitBtn = document.querySelector("#otp-submit-btn");
    const otpDanger = document.querySelector("#otp-danger");

    [].forEach.call(otpForm, (form, i) => {
      form.addEventListener("input", (event) => {
        if (!regex.test(event.target.value)) event.target.value = null;
        else {
          event.target.value = event.target.value.slice(-1);
        }
        if (i === 5) otpSubmitBtn.focus();
        else otpForm[i + 1].focus();
      });
    });

    otpSubmitBtn.addEventListener("click", async (event) => {
      otpDanger.innerText = "\u00A0";
      let otpNum = "";
      try {
        [].forEach.call(otpForm, (form) => {
          const formval = form.value;
          if (!regex2.test(formval))
            throw new Error("OTP 코드를 모두 입력해주세요.");
          else {
            otpNum = otpNum + formval;
          }
        });

        const fetchModule = new FetchModule();
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/auth/otp/`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              otp_code: otpNum,
            }),
          })
        );
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("refresh_token", data.refresh_token);
          if (data.has_logged_in) navigateTo("/");
          else navigateTo("/edit");
        } else if (response.status === 401)
          throw new Error("유효하지 않는 요청입니다.");
        else if (response.status === 400)
          throw new Error("OTP 코드가 유효하지 않습니다.");
      } catch (error) {
        otpDanger.innerText = error.message;
      }
    });
  }
}

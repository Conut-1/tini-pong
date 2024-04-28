import AbstractComponent from "./AbstractComponent.js";
import FetchModule from "../utils/fetchmodule.js";
import { QRCode } from "../utils/qrcode.js";
import { BACKEND_URL } from "../index.js";

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("OTP QRcode");
  }

  async getHtml() {
    return `
		<h1>OTP 설정</h1>
		<ul>
			<li>Play 스토어에서 <b>Google Authenticator</b>를 다운로드합니다.</li>
			<li>앱에서 <b>+ 버튼</b>을 누르고 <b>QR 코드 스캔</b>을 선택합니다.</li>
			<li>아래의 QR 코드를 스캔합니다.</li>
			<li>등록이 완료되었으면 확인 버튼을 통해 인증 페이지로 넘어갑니다.</li>
			</ul>
		<div id="qrcode"></div>
		<button class="btn btn-primary" data-href="/login/otp">확인</button>
		`;
  }

  handleRoute() {
    const loadQRcode = async () => {
      try {
        const fetchModule = new FetchModule();
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/auth/otp/`, {
            method: "GET",
            credentials: "include",
          })
        );
        if (response.ok) {
          const data = await response.json();
          const qrcode = new QRCode(
            document.getElementById("qrcode"),
            data.otp_uri
          );
        } else throw new Error(response.statusText);
      } catch (error) {
        alert(error.message);
      }
    };

    loadQRcode();
  }
}

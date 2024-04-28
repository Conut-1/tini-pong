import AbstractComponent from "./AbstractComponent.js";
import FetchModule from "../utils/fetchmodule.js";
import DefenseXss from "../utils/defenseXss.js";
import { BACKEND_URL, navigateTo } from "../index.js";

const fileForm = /image\/(jpg|jpeg|png|gif)$/;
const maxFileSize = 2 * 1024 * 1024;

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("UserEdit");
  }

  async getHtml() {
    return `
		<div class="container mt-3">
			<h3 class="m-3 text-center">
				Edit Profile
			</h3>
			<div class="mb-3">
				<label for="nickname-form" class="form-label">Nickname</label>
				<input type="text" class="form-control" id="nickname-form" minlength="2" maxlength="10" placeholder="Enter your nickname">
				<p class="text-danger" id="form-danger-1">&nbsp</p>
			</div>
			<div class="mb-3">
				<label for="avatar-form" class="form-label">Avatar Image</label>
				<div class="text-center mb-2">
					<img id="image-preview" src="/src/img/default_profile.png" width="200px" height="200px" alt="avatar thumbnail" style="border-radius: 20%;"/>
				</div>
				<input class="form-control" type="file" id="avatar-form" accept="image/*">
			</div>
			<div class="mb-3">
				<label for="message-form" class="form-label">Status message</label>
				<input type="text" class="form-control" id="message-form" maxlength="100" placeholder="Enter your status message">
			</div>
			<div class="text-center">
				<button class="btn common-radio-btn btn-lg" id="editpage-submit">Submit</button>
			</div>
		</div>
		`;
  }

  handleRoute() {
    const defenseXss = new DefenseXss();
    let validNick = false;
    const nicknameForm = document.querySelector("#nickname-form");
    const avatarForm = document.querySelector("#avatar-form");
    const avatarPreview = document.querySelector("#image-preview");
    const messageForm = document.querySelector("#message-form");
    const nicknameDangerForm = document.querySelector("#form-danger-1");

    const profileSetting = async () => {
      try {
        const fetchModule = new FetchModule();
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/user/profile`, {
            method: "GET",
            credentials: "include",
          })
        );
        if (response.ok) {
          const data = await response.json();
          nicknameForm.value = data.nickname;
          avatarPreview.src = data.avatar;
          messageForm.value = data.message;
          validNick = true;
        } else throw new Error(response.statusText);
      } catch (error) {
        console.log(error.message);
      }
    };

    nicknameForm.addEventListener("change", (e) => {
      if (e.target.value.length < 3) {
        nicknameDangerForm.innerText =
          "닉네임은 최소 3글자 이상으로 구성되어야 합니다.";
        validNick = false;
      } else if (!defenseXss.validateNickname(e.target.value)) {
        nicknameDangerForm.innerText =
          "닉네임은 한글과 알파벳, 숫자로만 구성될 수 있습니다.";
        validNick = false;
      } else {
        nicknameDangerForm.innerText = "\u00A0";
        validNick = true;
      }
    });

    avatarForm.addEventListener("change", (e) => {
      const imgFile = e.target.files[0];
      const reader = new FileReader();

      // 이미지 유효성검사
      if (!imgFile.type.match(fileForm)) {
        alert("이미지 파일(jpg, jpeg, png)만 업로드!");
        return;
      } else if (imgFile.size > maxFileSize) {
        alert("2MB 이하 크기만 업로드!");
        return;
      }
      // 이미지 리사이징
      const getThumbFile = (image, file) => {
        const canvas = document.createElement("canvas");
        const base_size = 1024000;
        const comp_size = 102400;
        let width = image.width;
        let height = image.height;
        const size = file.size;

        if (size <= base_size) return image.src;

        const ratio = Math.ceil(Math.sqrt(size / comp_size, 2));
        width = image.width / ratio;
        height = image.height / ratio;
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        return canvas.toDataURL("image/png");
      };

      reader.addEventListener("load", (e) => {
        let img = new Image();
        img.onload = function () {
          let thumbFile = getThumbFile(img, imgFile);
          avatarPreview.setAttribute("src", thumbFile);
        };
        img.onerror = function () {
          alert("파일 업로드에 실패하였습니다.");
        };
        img.src = reader.result;
      });
      if (imgFile) {
        reader.readAsDataURL(imgFile);
      }
    });

    const editPageSubmit = document.querySelector("#editpage-submit");
    editPageSubmit.addEventListener("click", async (e) => {
      if (validNick === false) return;
      try {
        const fetchModule = new FetchModule();
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/user/edit/`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nickname: nicknameForm.value,
              avatar: avatarPreview.src,
              message: messageForm.value,
            }),
          })
        );
        if (response.ok) {
          alert("저장되었습니다.");
          navigateTo("/");
        } else throw new Error(response.statusText);
      } catch (error) {
        alert("정상적으로 저장되지 않았습니다.");
      }
    });

    profileSetting();
  }
}

import AbstractComponent from "./AbstractComponent.js";
import DefenseXss from "../utils/defenseXss.js";
import { BACKEND_URL, navigateTo } from "../index.js";
import { fetch_get, fetch_post } from "../utils/fetch.js";

import {
  onlineContainerEventKeyUp,
  onlineContainerEventKeyDown,
} from "../games/onlinePongBasic.js";
import {
  onlineContainerEventKeyUp as onlineContainerEventKeyUpM,
  onlineContainerEventKeyDown as onlineContainerEventKeyDownM,
} from "../games/onlinePongMultiple.js";
import {
  onlineContainerEventKeyUp as onlineContainerEventKeyUpT,
  onlineContainerEventKeyDown as onlineContainerEventKeyDownT,
} from "../games/onlinePongTournament.js";

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("Lobby");
  }

  async getHtml() {
    return `
		<div class="modal fade" id="openGameRoomModal" tabindex="-1" aria-labelledby="openGameRoomModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h1 class="modal-title fs-5" id="openGameRoomModalLabel">방 만들기</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<form onsubmit="return false">
							<div class="mb-3">
								<label for="title-name" class="col-form-label">TITLE</label>
								<input type="text" class="form-control" id="title-name" maxlength="20" placeholder="방 타이틀을 입력하세요.">
								<p class="text-danger" id="gameroom-title-danger">&nbsp</p>
							</div>
							<div class="row">
								<div class="col">
									<label class="col-form-label">DIFFICULTY</label>
										<div class="form-check">
											<input class="form-check-input" type="radio" name="flexRadioHC" id="flexRadioHC1" value="1" checked>
											<label class="form-check-label" for="flexRadioHC1">
												EASY
											</label>
										</div>
										<div class="form-check">
											<input class="form-check-input" type="radio" name="flexRadioHC" id="flexRadioHC2" value="2">
											<label class="form-check-label" for="flexRadioHC2">
												NORMAL
											</label>
										</div>
										<div class="form-check">
											<input class="form-check-input" type="radio" name="flexRadioHC" id="flexRadioHC3" value="3">
											<label class="form-check-label" for="flexRadioHC3">
												HARD
											</label>
										</div>
								</div>
								<div class="col">
									<label class="col-form-label">MODE</label>
										<div class="form-check">
											<input class="form-check-input" type="radio" name="flexRadioMode" id="flexRadioMode1" value="1" checked>
											<label class="form-check-label" for="flexRadioMode1">
												1 vs 1(2p)
											</label>
										</div>
										<div class="form-check">
											<input class="form-check-input" type="radio" name="flexRadioMode" id="flexRadioMode2" value="2">
											<label class="form-check-label" for="flexRadioMode2">
												2 vs 2(4p)
											</label>
										</div>
										<div class="form-check">
											<input class="form-check-input" type="radio" name="flexRadioMode" id="flexRadioMode3" value="3">
											<label class="form-check-label" for="flexRadioMode3">
												4-player tournament
											</label>
										</div>
								</div>
							</div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="gameroom-save">Save changes</button>
					</div>
				</div>
			</div>
		</div>
		<div class="container-fluid">
			<div class="row row-cols-1 row-cols-md-2 m-3">
				<div class="col">
					<div class="d-flex align-items-center">
						<div class="flex-grow-1 noto-sans" style="font-weight: 900; color: #4D37C6; font-size: 1.5rem;">GAME ROOM</div>
						<button type="button" class="btn" id="gameroom-list-reload">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
								<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
								<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
							</svg>
						</button>
					</div>
					<div class="border border-5 overflow-auto" style="height: 500px; --bs-border-color: #4D37C6;">
						<div class="list-group" id="gameroom-list" role="tablist"></div>
					</div>
				</div>
				<div class="col">
					<div class="text-end noto-sans" style="font-weight: 900; color: #FFC85D; font-size: 1.5rem;">INFO</div>
					<div class="border border-5 overflow-auto p-2 mb-5" style="min-height: 200px; --bs-border-color: #FFC85D;">
						<div class="tab-content" id="gameroom-content"></div>
					</div>
					<div class="text-end my-2">
						<button type="button" class="btn common-btn" id="gameroom-enter">&nbsp&nbsp방 참가&nbsp&nbsp</button>
					</div>
					<div class="text-end my-2">
						<button type="button" class="btn common-btn" id="gameroom-open" data-bs-toggle="modal" data-bs-target="#openGameRoomModal">방 만들기</button>
					</div>
				</div>
			</div>
		</div>
		`;
  }

  reloadGameRoomList() {
    const gameRoomList = document.querySelector("#gameroom-list");
    const gameRoomContent = document.querySelector("#gameroom-content");
    gameRoomList.replaceChildren();
    gameRoomContent.replaceChildren();

    (async function () {
      try {
        const response = await fetch_get(`${BACKEND_URL}/room/list/`);
        if (response.ok) {
          const data = await response.json();
          data.rooms.forEach((gameRoomData) => {
            const gameRoomID = gameRoomData.uuid;
            gameRoomList.insertAdjacentHTML(
              "beforeend",
              `
						<a class="list-group-item list-group-item-action" id="gameroom-${gameRoomID}-list" data-bs-toggle="list" href="#gameroom-${gameRoomID}" role="tab" aria-controls="gameroom-${gameRoomID}">${gameRoomData.name}</a>
						`
            );

            let gameRoomType;
            let gameRoomDifficulty;
            if (gameRoomData.type === 1) gameRoomType = "1 vs 1";
            else if (gameRoomData.type === 2) gameRoomType = "2 vs 2";
            else gameRoomType = "4-player tournament";
            if (gameRoomData.difficulty === 1) gameRoomDifficulty = "EASY";
            else if (gameRoomData.difficulty === 2)
              gameRoomDifficulty = "NORMAL";
            else gameRoomDifficulty = "HARD";

            gameRoomContent.insertAdjacentHTML(
              "beforeend",
              `
						<div class="tab-pane fade" id="gameroom-${gameRoomID}" role="tabpanel" aria-labelledby="gameroom-${gameRoomID}-list">
							<h3>${gameRoomData.name}</h3>
							<p>Difficulty: ${gameRoomDifficulty}</p>
							<p>Mode: ${gameRoomType}</p>
						</div>
						`
            );
          });
        } else if (response.status === 404) throw new Error(response.error);
        else throw new Error(response.statusText);
      } catch (error) {
        console.log(error.message);
      }
    })();
  }

  handleRoute() {
    this.reloadGameRoomList();

    const defenseXss = new DefenseXss();
    const gameRoomTitle = document.querySelector("#title-name");
    const gameRoomTitleDangerForm = document.querySelector(
      "#gameroom-title-danger"
    );
    const gameRoomSaveBtn = document.querySelector("#gameroom-save");
    const gameRoomTitleXss = (value) => {
      if (value.length < 1) {
        gameRoomTitleDangerForm.innerText =
          "방 타이틀은 최소 1글자 이상으로 구성되어야 합니다.";
        gameRoomSaveBtn.setAttribute("disabled", true);
      } else {
        gameRoomTitleDangerForm.innerText = "\u00A0";
        gameRoomSaveBtn.removeAttribute("disabled");
      }
    };
    gameRoomTitleXss(gameRoomTitle.value);
    gameRoomTitle.addEventListener("change", (e) => {
      gameRoomTitleXss(e.target.value);
    });

    const gameRoomListReloadBtn = document.querySelector(
      "#gameroom-list-reload"
    );
    gameRoomListReloadBtn.addEventListener("click", (event) => {
      this.reloadGameRoomList();
    });

    const gameRoomEnterBtn = document.querySelector("#gameroom-enter");
    gameRoomEnterBtn.addEventListener("click", (event) => {
      const selectGameRoom = document.querySelector("[aria-selected='true']");
      if (selectGameRoom) {
        const roomuuid = selectGameRoom.href.match(/#gameroom-(.*)/);
        if (roomuuid && roomuuid[1]) {
          (async function () {
            try {
              const response = await fetch_post(`${BACKEND_URL}/room/join/`, {
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  room_uuid: roomuuid[1],
                }),
              });
              if (response.ok) {
                navigateTo(`room/${roomuuid[1]}`);
              } else if (response.status === 404) {
                const data = await response.json();
                throw new Error(data.error);
              } else throw new Error(response.statusText);
            } catch (error) {
              alert(error);
            }
          })();
        }
      }
    });

    gameRoomSaveBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const openGameRoomModalBody = document.querySelector(
        "#openGameRoomModal .modal-body"
      );
      (async function () {
        try {
          const response = await fetch_post(`${BACKEND_URL}/room/create/`, {
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: openGameRoomModalBody.querySelector("#title-name").value,
              type: openGameRoomModalBody.querySelector(
                "input[name='flexRadioMode']:checked"
              ).value,
              difficulty: openGameRoomModalBody.querySelector(
                "input[name='flexRadioHC']:checked"
              ).value,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            navigateTo(`room/` + data.room_uuid);
          } else if (response.status === 404) throw new Error(response.error);
          else throw new Error(response.statusText);
        } catch (error) {
          console.log(error.message);
        }
      })();
    });
    document.removeEventListener("keydown", onlineContainerEventKeyDown);
    document.removeEventListener("keyup", onlineContainerEventKeyUp);
    document.removeEventListener("keydown", onlineContainerEventKeyDownM);
    document.removeEventListener("keyup", onlineContainerEventKeyUpM);
    document.removeEventListener("keydown", onlineContainerEventKeyDownT);
    document.removeEventListener("keyup", onlineContainerEventKeyUpT);
  }
}

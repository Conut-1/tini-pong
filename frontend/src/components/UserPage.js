import AbstractComponent from "./AbstractComponent.js";
import FetchModule from "../utils/fetchmodule.js";
import { BACKEND_URL } from "../index.js";

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("UserPage");
  }

  async getHtml() {
    return `
		<div class="container-fluid">
			<div class="row row-cols-1 row-cols-md-2 m-md-3 mt-3">
				<div class="col col-md-4 p-2" id="userpage-profile">
					<div class="text-center mb-3">
						<img id="userpage-profile-avatar" src="/src/img/default_profile.png" width="200px" height="200px" alt="profile thumbnail" style="border-radius: 20%;"/>
					</div>
					<div class="text-center">
						<h3 id="userpage-profile-nickname">Nickname</h3>
						<h4 class="text-secondary" id="userpage-profile-idtag">Tag</h3>
					</div>
					<div class="mx-2 border p-2" id="userpage-profile-message" style="word-break: break-all"></div>
					<div id="userpage-edit"></div>
				</div>
				<div class="col col-md-8 p-2">
					<div class="text-center mb-3">
						<div class="btn-group" id="log-btn-group" role="group" aria-label="Match Mode Select Btn">
							<input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked>
							<label class="btn common-radio-btn" for="btnradio1">1 VS 1</label>

							<input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off">
							<label class="btn common-radio-btn" for="btnradio2">2 VS 2</label>
						</div>
					</div>
					<div class="border border-3 p-2" style="--bs-border-color: #4D37C6;">
						<div class="mx-xl-3">
							<div class="row">
								<div class="col">승률</div>
								<div class="col" style="text-align: right" id="rate-progress">25%</div>
							</div>
							<div class="progress-stacked" id="winrate-progress">
								<div class="progress" role="progressbar" aria-label="Segment-win" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100" style="width: 15%">
									<div class="progress-bar progress-bar-striped">15</div>
								</div>
								<div class="progress" role="progressbar" aria-label="Segment-lose" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" style="width: 85%">
									<div class="progress-bar progress-bar-striped bg-danger">85</div>
								</div>
							</div>
						</div>
						<ul class="mt-4 overflow-auto" id="log-pannel" style="height: 500px; padding-left: 0;"></ul>
					</div>
				</div>
			</div>
		</div>
		`;
  }

  handleRoute(param) {
    const profileSetting = async () => {
      try {
        let fetchString = "";
        if (param.useruuid) fetchString = `?uuid=${param.useruuid}`;
        else {
          document.querySelector("#userpage-edit").insertAdjacentHTML(
            "beforeend",
            `
					<div class="m-3 text-end">
						<a class="btn common-radio-btn" href="/edit" data-href="/edit" role="button">edit</a>
					</div>
					`
          );
        }
        const fetchModule = new FetchModule();
        const response = await fetchModule.request(
          new Request(`${BACKEND_URL}/user/profile${fetchString}`, {
            method: "GET",
            credentials: "include",
          })
        );
        if (response.ok) {
          const data = await response.json();
          const userProfileNode = document.querySelector("#userpage-profile");

          userProfileNode.querySelector(
            "#userpage-profile-nickname"
          ).innerText = data.nickname;
          userProfileNode.querySelector("#userpage-profile-idtag").innerText =
            "#" + data.id_tag;
          userProfileNode.querySelector("#userpage-profile-message").innerHTML =
            data.message;
          if (data.avatar)
            userProfileNode.querySelector("#userpage-profile-avatar").src =
              data.avatar;
          LogSetting(data.game_history, data.uuid);
        } else throw new Error(response.statusText);
      } catch (error) {
        const profileNode = document.querySelector("#app .container-fluid");
        profileNode.replaceChildren();
        profileNode.insertAdjacentHTML(
          "beforeend",
          `
				<div class="d-flex justify-content-center align-items-center" style="min-height: 80dvh;">
					<div>유저가 존재하지 않습니다.</div>
				</div>
				`
        );
      }
    };

    const LogSetting = (game_history, uuid) => {
      const game1vs1 = [];
      const game1vs1Result = {
        win: 0,
        lose: 0,
      };
      const game2vs2 = [];
      const game2vs2Result = {
        win: 0,
        lose: 0,
      };

      game_history.forEach((element) => {
        const node = {};
        if (element.difficulty === 1) node.difficulty = "EASY";
        else if (element.difficulty === 2) node.difficulty = "NORMAL";
        else node.difficulty = "HARD";
        node.score = element.score;
        node.time = element.start_time;
        node.players = element.players;
        node.players.forEach((e) => {
          e.id_tag = e.uuid.substr(0, 4);
        });
        const selfnum = node.players.findIndex((e) => {
          return e.uuid === uuid;
        });
        if (element.type === 1) {
          if (selfnum + 1 === element.win) {
            node.result = "승";
            game1vs1Result.win++;
          } else {
            node.result = "패";
            game1vs1Result.lose++;
          }
          game1vs1.unshift(node);
        } else {
          if (
            (element.win === 1 && selfnum <= element.win) ||
            (element.win === 2 && selfnum >= element.win)
          ) {
            node.result = "승";
            game2vs2Result.win++;
          } else {
            node.result = "패";
            game2vs2Result.lose++;
          }
          game2vs2.unshift(node);
        }
      });

      const radioBtn = document.querySelector("#log-btn-group");
      const logPannel = document.querySelector("#log-pannel");
      const logSetting1vs1 = () => {
        logPannel.replaceChildren();
        game1vs1.forEach((element) => {
          const pannelNode = document.createElement("li");
          pannelNode.setAttribute("class", "d-flex align-items-center border");
          if (element.result === "승") {
            pannelNode.insertAdjacentHTML(
              "beforeend",
              `
						<div class="align-self-stretch bg-primary text-white p-2">승</div>
						`
            );
          } else {
            pannelNode.insertAdjacentHTML(
              "beforeend",
              `
						<div class="align-self-stretch bg-danger text-white p-2">패</div>
						`
            );
          }
          pannelNode.insertAdjacentHTML(
            "beforeend",
            `
					<div class="d-inline-flex justify-content-around align-items-center p-2" style="width: 40rem;">
						<div>
							<span>
								<a href="/users/${element.players[0].uuid}" data-href="/users/${element.players[0].uuid}" class="link-offset-2 link-underline link-underline-opacity-0 link-dark">${element.players[0].nickname}</a>
							</span>
							<span class="text-secondary">#${element.players[0].id_tag}</span>
						</div>
						<div class="mx-2">${element.score}</div>
						<div>
							<span>
								<a href="/users/${element.players[1].uuid}" data-href="/users/${element.players[1].uuid}" class="link-offset-2 link-underline link-underline-opacity-0 link-dark">${element.players[1].nickname}</a>
							</span>
							<span class="text-secondary">#${element.players[1].id_tag}</span>
						</div>
					</div>
					<div class="ms-auto p-2 text-end">
						<div>${element.time}</div>
						<div><b>${element.difficulty}</b></div>
					</div>
					`
          );
          logPannel.appendChild(pannelNode);
        });
        progressSetting(game1vs1Result.win, game1vs1Result.lose);
      };
      const logSetting2vs2 = () => {
        logPannel.replaceChildren();
        game2vs2.forEach((element) => {
          const pannelNode = document.createElement("li");
          pannelNode.setAttribute("class", "d-flex align-items-center border");
          if (element.result === "승") {
            pannelNode.insertAdjacentHTML(
              "beforeend",
              `
						<div class="align-self-stretch bg-primary text-white p-2">승</div>
						`
            );
          } else {
            pannelNode.insertAdjacentHTML(
              "beforeend",
              `
						<div class="align-self-stretch bg-danger text-white p-2">패</div>
						`
            );
          }
          pannelNode.insertAdjacentHTML(
            "beforeend",
            `
					<div class="d-inline-flex justify-content-around align-items-center p-2" style="width: 40rem;">
						<div class="d-flex flex-column justify-content-center">
							<div>
								<span>
									<a href="/users/${element.players[0].uuid}" data-href="/users/${element.players[0].uuid}" class="link-offset-2 link-underline link-underline-opacity-0 link-dark">${element.players[0].nickname}</a>
								</span>
								<span class="text-secondary">#${element.players[0].id_tag}</span>
							</div>
							<div>
								<span>
									<a href="/users/${element.players[1].uuid}" data-href="/users/${element.players[1].uuid}" class="link-offset-2 link-underline link-underline-opacity-0 link-dark">${element.players[1].nickname}</a>
								</span>
								<span class="text-secondary">#${element.players[1].id_tag}</span>
							</div>
						</div>
						<div class="mx-2">${element.score}</div>
						<div class="d-flex flex-column justify-content-center">
							<div>
								<span>
									<a href="/users/${element.players[2].uuid}" data-href="/users/${element.players[2].uuid}" class="link-offset-2 link-underline link-underline-opacity-0 link-dark">${element.players[2].nickname}</a>
								</span>
								<span class="text-secondary">#${element.players[2].id_tag}</span>
							</div>
							<div>
								<span>
									<a href="/users/${element.players[3].uuid}" data-href="/users/${element.players[3].uuid}" class="link-offset-2 link-underline link-underline-opacity-0 link-dark">${element.players[3].nickname}</a>
								</span>
								<span class="text-secondary">#${element.players[3].id_tag}</span>
							</div>
						</div>
					</div>
					<div class="ms-auto p-2 text-end">
						<div>${element.time}</div>
						<div><b>${element.difficulty}</b></div>
					</div>
					`
          );
          logPannel.appendChild(pannelNode);
        });
        progressSetting(game2vs2Result.win, game2vs2Result.lose);
      };

      logSetting1vs1();
      radioBtn.querySelector("#btnradio1").addEventListener("change", (e) => {
        if (e.currentTarget.checked) {
          logSetting1vs1();
        }
      });
      radioBtn.querySelector("#btnradio2").addEventListener("change", (e) => {
        if (e.currentTarget.checked) {
          logSetting2vs2();
        }
      });
    };

    const progressSetting = (winNum, loseNum) => {
      const progressBar = document.querySelector("#winrate-progress");
      let winRate = 0;
      if (winNum > 0 || loseNum > 0)
        winRate = Math.round((winNum / (winNum + loseNum)) * 100);
      const loseRate = 100 - winRate;

      const progressBarWin = progressBar.children[0];
      progressBarWin.setAttribute("aria-valuenow", `${winRate}`);
      progressBarWin.setAttribute("style", `width: ${winRate}%`);
      progressBarWin.children[0].innerText = `${winNum}`;
      const progressBarLose = progressBar.children[1];
      progressBarLose.setAttribute("aria-valuenow", `${loseRate}`);
      progressBarLose.setAttribute("style", `width: ${loseRate}%`);
      progressBarLose.children[0].innerText = `${loseNum}`;
      document.querySelector("#rate-progress").innerText = `${winRate}%`;
    };

    profileSetting();
  }
}

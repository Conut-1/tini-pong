import AbstractComponent from "./AbstractComponent.js";
import { BACKEND_URL, navigateTo } from "../index.js";
import { fetch_get } from "../utils/fetch.js";

export default class extends AbstractComponent {
  constructor() {
    super();
    this.setTitle("Tournament Data");
  }

  async getHtml() {
    return `

        <body>
        <div class="container">
            <div class="text-center" id="spinner">
                <div class="spinner-border" style="margin-top: 40px; width: 5rem; height: 5rem; border-width: 10px;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            <div class="b">
            <!-- 토너먼트 데이터가 입력되는 곳 -->
            </div>
        </div>
        
        <div class="container">
        <div class="texte" id="btn">
        <button type="button" class="btn common-btn" id="goBackButton">돌아가기</button>
        </div>
        <script src="tournamentData.js"></script>
        </div>
        
        </body>
		`;
  }

  populateFunction(data) {
    // console.log(typeof(data));
    document.getElementById("spinner").style.display = "none";

    let tbody = document.querySelector(".b");
    tbody.innerHTML = "";

    data.tournamentLog.forEach(function (tournamentData) {
      let ul = document.createElement("ul");
      ul.classList.add(
        "tdataBox",
        "list-group",
        "d-flex",
        "justify-content-between"
      );

      let div = document.createElement("div");
      div.classList.add("row");

      let col3 = document.createElement("div");
      col3.classList.add("col-3");

      let timestampDiv = document.createElement("div");
      timestampDiv.classList.add(
        "align-items-center",
        "timestemp",
        "noto-sans"
      );
      let timestamp = new Date(tournamentData.tournament[0].timestamp * 1000);
      let timestampOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };
      let timestampString = new Intl.DateTimeFormat(
        "en-US",
        timestampOptions
      ).format(timestamp);
      timestampString = timestampString.replace(",", "<br>");
      timestampDiv.innerHTML = timestampString;
      col3.appendChild(timestampDiv);

      div.appendChild(col3);

      let col9 = document.createElement("div");
      col9.classList.add("col-9");

      tournamentData.tournament.forEach(function (matchData) {
        if (matchData.hasOwnProperty("timestamp")) {
        } else {
          let game = document.createElement("div");
          game.classList.add(
            "gameLine",
            "justify-content-between",
            "align-items-center",
            "my-2",
            "row"
          );

          let rankSpan = document.createElement("span");
          rankSpan.classList.add("col-3", "textAlign", "game-rank");
          rankSpan.textContent =
            matchData.index === 1
              ? "1st"
              : matchData.index === 2
              ? "2nd"
              : matchData.index === 3
              ? "Final"
              : matchData.index + "th";

          let playerASpan = document.createElement("span");
          playerASpan.classList.add("col", "textAlign", "game-player");
          playerASpan.textContent = matchData.playerA.name;

          let scoreSpan = document.createElement("span");
          scoreSpan.classList.add("col-3", "textAlign", "game-score");
          scoreSpan.textContent =
            matchData.playerA.score + " : " + matchData.playerB.score;

          let playerBSpan = document.createElement("span");
          playerBSpan.classList.add("col", "textAlign", "game-opponent");
          playerBSpan.textContent = matchData.playerB.name;

          game.appendChild(rankSpan);
          game.appendChild(playerASpan);
          game.appendChild(scoreSpan);
          game.appendChild(playerBSpan);
          col9.appendChild(game);
        }
        ul.appendChild(div);
      });
      div.appendChild(col9);
      tbody.appendChild(ul);
    });
  }

  handleRoute() {
    (async function (callback) {
      try {
        const response = await fetch_get(
          `${BACKEND_URL}/dashboard/tournament/`
        );
        if (response.ok) {
          const data = await response.json();
          callback(data);
        } else throw new Error(response.statusText);
      } catch (error) {
        console.log(error.message);
      }
    })(this.populateFunction);

    const goBackBtn = document.querySelector("#goBackButton");
    goBackBtn.addEventListener("click", (event) => {
      navigateTo("/");
    });
  }
}

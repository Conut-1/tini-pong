import AbstractComponent from "./AbstractComponent.js";
import {containerEventKeyUp, containerEventKeyDown} from "../games/localPongBasic.js"
import {containerEventKeyUp as containerEventKeyUpM, containerEventKeyDown as containerEventKeyDownM} from "../games/localPongMultiple.js"
import {containerEventKeyUp as containerEventKeyUpT, containerEventKeyDown as containerEventKeyDownT} from "../games/localPongTournament.js"

export default class extends AbstractComponent {
	constructor() {
		super();
		this.setTitle("Main");
	}

	async getHtml() {
		return `
		<style>
		body {
			background-color: #4D37C6;
		}
		</style>
		<div class="container-fluid p-lg-5">
			<div class="row row-cols-1 row-cols-lg-2">
				<div class="col">
					<div class="d-flex flex-column ">
						<div class="d-flex flex-nowrap align-items-center">
							<img src="./src/img/racket.png" width="auto" height="100px" alt="racket" class="me-4"/>
							<a href="/local" class="link-offset-2 link-underline link-underline-opacity-0 link-light main-link" data-value="local">LOCAL</a>
						</div>
						<div class="d-flex flex-nowrap align-items-center">
							<img src="./src/img/racket.png" width="auto" height="100px" alt="racket"  class="me-4" style="transform: rotate(180deg);"/>
							<a href="/lobby" class="link-offset-2 link-underline link-underline-opacity-0 link-light main-link" data-value="online">ONLINE</a>
						</div>
					</div>
				</div>
				<div class="col bg-white d-flex align-items-center justify-content-center" id="link-image" style="min-height: 500px;">
				</div>
			</div>
		</div>
		`;
	}

	handleRoute() {
		window.document.removeEventListener('keydown', containerEventKeyDown);
		window.document.removeEventListener('keyup', containerEventKeyUp);
		window.document.removeEventListener('keydown', containerEventKeyDownM);
		window.document.removeEventListener('keyup', containerEventKeyUpM);
		window.document.removeEventListener('keydown', containerEventKeyDownT);
		window.document.removeEventListener('keyup', containerEventKeyUpT);

		const linkImageNode = document.querySelector("#link-image");

		const localLink = document.querySelector("a[data-value='local']");
		localLink.addEventListener("mouseover", e => {
			localLink.insertAdjacentHTML("afterend", `
			<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="white" class="bi bi-caret-right-fill link-cursor" viewBox="0 0 16 16">
  				<path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
			</svg>
			`);
			const linkImage = document.createElement("img");
			linkImage.setAttribute("src", "./src/img/Main_Local.png");
			linkImage.setAttribute("width", "450px");
			linkImage.setAttribute("height", "450px");
			linkImageNode.appendChild(linkImage);
		})
		localLink.addEventListener("mouseout", e => {
			const parentLink = localLink.parentNode;
			parentLink.removeChild(parentLink.querySelector(".link-cursor"));
			linkImageNode.replaceChildren();
		})

		const onlineLink = document.querySelector("a[data-value='online']");
		onlineLink.addEventListener("mouseover", e => {
			onlineLink.insertAdjacentHTML("afterend", `
			<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="white" class="bi bi-caret-right-fill link-cursor" viewBox="0 0 16 16">
  				<path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
			</svg>
			`);
			const linkImage = document.createElement("img");
			linkImage.setAttribute("src", "./src/img/Main_Online.png");
			linkImage.setAttribute("width", "450px");
			linkImage.setAttribute("height", "450px");
			linkImageNode.appendChild(linkImage);
		})
		onlineLink.addEventListener("mouseout", e => {
			const parentLink = onlineLink.parentNode;
			parentLink.removeChild(parentLink.querySelector(".link-cursor"));
			linkImageNode.replaceChildren();
		})
	}
}
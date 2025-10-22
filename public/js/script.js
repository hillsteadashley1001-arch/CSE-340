/* public/js/script.js */

function wireCardActivation() {
	const cards = document.querySelectorAll(".grid.upgrades .card");
	cards.forEach((card) => {
		card.tabIndex = 0;
		const link = card.querySelector("a");
		if (!link) return;

		card.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				link.click();
			}
		});

		card.addEventListener("click", (e) => {
			if (e.target.closest("a")) return;
			link.click();
		});
	});
}

function enhanceSkipLink() {
	const skip = document.querySelector(".skip-link");
	const main = document.querySelector("#main");
	if (!skip || !main) return;

	skip.addEventListener("click", () => {
		requestAnimationFrame(() => {
			main.setAttribute("tabindex", "-1");
			main.focus({ preventScroll: true });
			main.scrollIntoView({ behavior: "smooth", block: "start" });
			main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
		});
	});
}

function init() {
	wireCardActivation();
	enhanceSkipLink();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
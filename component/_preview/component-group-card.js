(function () {
	"use strict";

	const MESSAGE_NAMESPACE = "ai-one-component-catalog";
	const CARD_HASH_PREFIX = "card-";
	const DEFAULT_TITLE = "AI-ONE Component Catalog";
	const DEFAULT_DESCRIPTION = "모든 컴포넌트의 대표 형태를 한 페이지에서 직접 확인합니다.";
	const sections = Array.from(document.querySelectorAll(".component-catalog-section"));
	const cards = Array.from(document.querySelectorAll(".component-catalog-card"));
	const title = document.querySelector("[data-component-group-title]");
	const description = document.querySelector("[data-component-group-description]");

	function createSlug(value) {
		return value
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	function collectComponents() {
		const usedIds = new Map();

		return cards.map((card, index) => {
			const cardTitle = card.querySelector(".component-catalog-card-title")?.textContent.trim()
				|| `Component ${index + 1}`;
			const section = card.closest(".component-catalog-section");
			const category = section?.querySelector(".component-catalog-heading")?.textContent.trim() || "Components";
			const pageLink = Array.from(card.querySelectorAll(".component-catalog-links a"))
				.find((link) => link.textContent.trim() === "더보기");
			const baseId = createSlug(cardTitle) || `component-${index + 1}`;
			const duplicateCount = usedIds.get(baseId) || 0;
			const id = duplicateCount ? `${baseId}-${duplicateCount + 1}` : baseId;

			usedIds.set(baseId, duplicateCount + 1);
			card.dataset.catalogCardId = id;
			return {
				id,
				title: cardTitle,
				category,
				pageUrl: pageLink?.getAttribute("href") || "",
			};
		});
	}

	const components = collectComponents();

	function showAllCards() {
		document.body.classList.remove("is-single-card-view");
		sections.forEach((section) => { section.hidden = false; });
		cards.forEach((card) => { card.hidden = false; });
		if (title) title.textContent = DEFAULT_TITLE;
		if (description) description.textContent = DEFAULT_DESCRIPTION;
	}

	function showSection(sectionId) {
		const selectedSection = sections.find((section) => section.id === sectionId);
		if (!selectedSection) return false;

		document.body.classList.remove("is-single-card-view");
		sections.forEach((section) => { section.hidden = section !== selectedSection; });
		cards.forEach((card) => { card.hidden = false; });
		if (title) title.textContent = `${selectedSection.querySelector(".component-catalog-heading")?.textContent || "Component"} Components`;
		if (description) description.textContent = "선택한 분류의 컴포넌트 카드를 확인합니다.";
		return true;
	}

	function showCard(componentId) {
		const component = components.find((item) => item.id === componentId);
		const selectedCard = cards.find((card) => card.dataset.catalogCardId === componentId);
		if (!component || !selectedCard) return false;

		const selectedSection = selectedCard.closest(".component-catalog-section");
		document.body.classList.add("is-single-card-view");
		sections.forEach((section) => { section.hidden = section !== selectedSection; });
		cards.forEach((card) => { card.hidden = card !== selectedCard; });
		if (title) title.textContent = component.title;
		if (description) description.textContent = `${component.category} · 컴포넌트 단독 미리보기`;
		document.title = `${component.title} · AI-ONE 컴포넌트 카탈로그`;
		window.scrollTo({ top: 0, behavior: "auto" });
		return true;
	}

	function syncFromHash() {
		const hash = decodeURIComponent(window.location.hash.slice(1));
		if (hash.startsWith(CARD_HASH_PREFIX) && showCard(hash.slice(CARD_HASH_PREFIX.length))) return;
		if (showSection(hash)) return;
		showAllCards();
	}

	function notifyParent() {
		if (window.parent === window) return;
		window.parent.postMessage({
			namespace: MESSAGE_NAMESPACE,
			type: "ready",
			components,
		}, "*");
	}

	if (window.parent !== window) document.body.classList.add("is-component-index-embedded");

	window.addEventListener("hashchange", syncFromHash);
	window.addEventListener("message", (event) => {
		if (event.source !== window.parent || event.data?.namespace !== MESSAGE_NAMESPACE) return;
		if (event.data.type === "show-card") showCard(event.data.componentId);
		if (event.data.type === "request-components") notifyParent();
	});

	syncFromHash();
	notifyParent();
})();

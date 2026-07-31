(function () {
	"use strict";

	const MESSAGE_NAMESPACE = "ai-one-component-catalog";
	const HASH_PREFIX = "card-";
	const HOME_HASH = "home";
	const STORAGE_KEY = "component-catalog-sidebar-collapsed";
	const CARD_DOCUMENT_URL = "componentgroup-card.html?v=20260731-1";
	const HOME_DOCUMENT_URL = "../pages/ai-home.html?view=component-catalog&v=20260729-1";
	const CATEGORY_ORDER = Object.freeze(["Actions", "Display", "Forms", "Layouts", "Navigation"]);
	const ICONS = Object.freeze(["home", "document", "edit", "economy-trend", "chat"]);

	const sidebar = document.getElementById("componentIndexSidebar");
	const collapseButton = document.getElementById("componentIndexSidebarCollapseBtn");
	const brandButton = document.getElementById("componentIndexBrandButton");
	const navigation = document.getElementById("componentIndexNav");
	const frame = document.getElementById("componentGroupFrame");
	let components = [];

	function getComponentFromHash() {
		const hash = decodeURIComponent(window.location.hash.slice(1));
		if (!hash.startsWith(HASH_PREFIX)) return "";
		return hash.slice(HASH_PREFIX.length);
	}

	function setSidebarCollapsed(isCollapsed) {
		sidebar.classList.toggle("collapsed", isCollapsed);
		collapseButton.setAttribute("aria-expanded", String(!isCollapsed));
		collapseButton.setAttribute("aria-label", isCollapsed ? "사이드바 펼치기" : "사이드바 접기");
		collapseButton.title = isCollapsed ? "사이드바 펼치기" : "사이드바 접기";
		brandButton.setAttribute("aria-label", isCollapsed ? "사이드바 펼치기" : "AI-ONE 홈");
		brandButton.title = isCollapsed ? "사이드바 펼치기" : "AI-ONE 홈";

		try {
			localStorage.setItem(STORAGE_KEY, String(isCollapsed));
		} catch (error) {
			// 저장소를 사용할 수 없는 환경에서는 현재 화면 상태만 유지합니다.
		}
	}

	function createMenuButton(component, componentIndex) {
		const iconName = ICONS[componentIndex % ICONS.length];
		const button = document.createElement("button");
		const icon = document.createElement("img");
		const label = document.createElement("span");

		button.type = "button";
		button.className = "nav-link";
		button.dataset.componentCard = component.id;
		button.title = `${component.title} 컴포넌트`;

		icon.src = `../assets/icons/${iconName}.svg`;
		icon.dataset.icon = iconName;
		icon.alt = "";
		icon.setAttribute("aria-hidden", "true");
		if (iconName === "economy-trend") {
			icon.width = 22;
			icon.height = 22;
		}

		label.className = "nav-text";
		label.textContent = component.title;
		button.append(icon, label);
		button.addEventListener("click", () => {
			const nextHash = `${HASH_PREFIX}${component.id}`;
			if (window.location.hash === `#${nextHash}`) activateComponent(component.id);
			else window.location.hash = nextHash;
		});
		return button;
	}

	function renderNavigation() {
		const menuGroups = [];
		const componentsByCategory = new Map();
		let iconIndex = 0;

		components.forEach((component) => {
			const categoryComponents = componentsByCategory.get(component.category) || [];
			categoryComponents.push(component);
			componentsByCategory.set(component.category, categoryComponents);
		});

		const orderedCategories = [
			...CATEGORY_ORDER.filter((category) => componentsByCategory.has(category)),
			...Array.from(componentsByCategory.keys()).filter((category) => !CATEGORY_ORDER.includes(category)),
		];

		orderedCategories.forEach((category) => {
			const group = document.createElement("div");
			const groupLabel = document.createElement("span");

			group.className = "nav-group";
			groupLabel.className = "nav-group-label";
			groupLabel.textContent = category;
			group.append(groupLabel);
			componentsByCategory.get(category).forEach((component) => {
				group.append(createMenuButton(component, iconIndex));
				iconIndex += 1;
			});
			menuGroups.push(group);
		});

		navigation.replaceChildren(...menuGroups);
		navigation.setAttribute("aria-busy", "false");
	}

	function activateComponent(componentId) {
		const component = components.find((item) => item.id === componentId);
		if (!component) return;

		navigation.querySelectorAll("[data-component-card]").forEach((button) => {
			const isActive = button.dataset.componentCard === componentId;
			button.classList.toggle("active", isActive);
			if (isActive) button.setAttribute("aria-current", "page");
			else button.removeAttribute("aria-current");
		});

		if (component.pageUrl) {
			const isCurrentPage = frame.dataset.catalogView === "page"
				&& frame.dataset.activeComponent === componentId;
			if (!isCurrentPage) {
				frame.dataset.catalogView = "page";
				frame.dataset.activeComponent = componentId;
				frame.src = component.pageUrl;
			}
		} else if (frame.dataset.catalogView !== "cards") {
			frame.dataset.catalogView = "cards";
			frame.dataset.activeComponent = componentId;
			frame.src = `${CARD_DOCUMENT_URL}#${HASH_PREFIX}${componentId}`;
		} else {
			frame.dataset.activeComponent = componentId;
			frame.contentWindow?.postMessage({
				namespace: MESSAGE_NAMESPACE,
				type: "show-card",
				componentId,
			}, "*");
		}

		frame.title = `${component.title} 컴포넌트`;
		document.title = `${component.title} · AI-ONE 컴포넌트 카탈로그`;
	}

	function showHome() {
		navigation.querySelectorAll("[data-component-card]").forEach((button) => {
			button.classList.remove("active");
			button.removeAttribute("aria-current");
		});

		if (frame.dataset.catalogView !== "home") {
			frame.dataset.catalogView = "home";
			frame.dataset.activeComponent = "";
			frame.src = HOME_DOCUMENT_URL;
		}

		frame.title = "AI-ONE 홈";
		document.title = "AI-ONE 홈 · AI-ONE 컴포넌트 카탈로그";
	}

	function syncComponentSelection() {
		if (!components.length) return;
		const currentHash = decodeURIComponent(window.location.hash.slice(1));
		if (!currentHash || currentHash === HOME_HASH) {
			if (!currentHash) {
				window.history.replaceState(null, "", `#${HOME_HASH}`);
			}
			showHome();
			return;
		}

		const requestedComponent = getComponentFromHash();
		const selectedComponent = components.some((item) => item.id === requestedComponent)
			? requestedComponent
			: components[0].id;

		if (requestedComponent !== selectedComponent) {
			window.history.replaceState(null, "", `#${HASH_PREFIX}${selectedComponent}`);
		}
		activateComponent(selectedComponent);
	}

	function requestComponents() {
		if (frame.dataset.catalogView !== "cards") return;
		frame.contentWindow?.postMessage({
			namespace: MESSAGE_NAMESPACE,
			type: "request-components",
		}, "*");
	}

	function isCardDocumentReady() {
		try {
			return Boolean(frame.contentDocument?.querySelector("[data-component-group-title]"));
		} catch (error) {
			return false;
		}
	}

	function restoreCatalogNavigation() {
		if (components.length) {
			syncComponentSelection();
			return;
		}

		if (frame.dataset.catalogView !== "cards" || !isCardDocumentReady()) {
			frame.dataset.catalogView = "cards";
			frame.dataset.activeComponent = "";
			frame.src = CARD_DOCUMENT_URL;
			return;
		}

		requestComponents();
	}

	function handleFrameLoad() {
		try {
			if (frame.contentDocument?.getElementById("componentIndexSidebar")) {
				frame.dataset.catalogView = "nested-index";
				frame.dataset.activeComponent = "";
				syncComponentSelection();
				return;
			}
		} catch (error) {
			// 동일 출처가 아닌 문서를 여는 경우에는 현재 iframe 상태를 유지합니다.
		}
		requestComponents();
	}

	collapseButton.addEventListener("click", (event) => {
		event.stopPropagation();
		setSidebarCollapsed(!sidebar.classList.contains("collapsed"));
	});

	brandButton.addEventListener("click", () => {
		if (sidebar.classList.contains("collapsed")) {
			setSidebarCollapsed(false);
			return;
		}

		if (window.location.hash === `#${HOME_HASH}`) showHome();
		else window.location.hash = HOME_HASH;
	});

	window.addEventListener("hashchange", syncComponentSelection);
	window.addEventListener("pageshow", restoreCatalogNavigation);
	frame.addEventListener("load", handleFrameLoad);
	window.addEventListener("message", (event) => {
		if (event.source !== frame.contentWindow || event.data?.namespace !== MESSAGE_NAMESPACE) return;
		if (event.data.type !== "ready" || !Array.isArray(event.data.components)) return;

		const seenComponentIds = new Set();
		components = event.data.components.filter((component) => {
			const isValid = typeof component?.id === "string"
				&& typeof component?.title === "string"
				&& typeof component?.category === "string"
				&& (component.pageUrl === undefined || typeof component.pageUrl === "string");
			if (!isValid || seenComponentIds.has(component.id)) return false;
			seenComponentIds.add(component.id);
			return true;
		});
		renderNavigation();
		syncComponentSelection();
	});

	let shouldStartCollapsed = false;
	try {
		shouldStartCollapsed = localStorage.getItem(STORAGE_KEY) === "true";
	} catch (error) {
		// 저장소를 사용할 수 없는 환경에서는 기본 펼침 상태를 사용합니다.
	}
	setSidebarCollapsed(shouldStartCollapsed);
	requestComponents();
})();

(function () {
    "use strict";

    /* ========================================================================
     Route and page context
     ======================================================================== */
    const ROUTES = Object.freeze({
        home: "ai-home.html",
        intake: "pages/ai-intake.html",
        answer: "pages/ai-answer.html",
        chatbot: "pages/ai-chatbot.html",
        login: "pages/login.html",
    });

    function getRootPath() {
        return document.body.dataset.rootPath || ".";
    }

    const ICON_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    function resolveIconReferences(root = document) {
        const icons = [];

        if (root instanceof Element && root.matches("img[data-icon]")) icons.push(root);
        if ("querySelectorAll" in root) icons.push(...root.querySelectorAll("img[data-icon]"));

        icons.forEach((icon) => {
            const iconName = icon.dataset.icon;
            if (!ICON_NAME_PATTERN.test(iconName)) return;

            icon.src = `${getRootPath()}/assets/icons/${iconName}.svg`;
            if (!icon.hasAttribute("alt")) icon.alt = "";
        });
    }

    function observeIconReferences() {
        const observer = new MutationObserver((records) => {
            records.forEach((record) => {
                record.addedNodes.forEach((node) => {
                    if (node instanceof Element) resolveIconReferences(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function resolveRoute(route) {
        const path = ROUTES[route];
        return path ? `${getRootPath()}/${path}` : "#";
    }

    function logout() {
        localStorage.removeItem("sidebar-collapsed");
        window.location.href = resolveRoute("login");
    }

    function applyPageContext() {
        const currentPage = document.body.dataset.page || "";

        // Route URLs
        document.querySelectorAll("[data-route]").forEach((link) => {
            link.setAttribute("href", resolveRoute(link.dataset.route));
        });

        document.querySelectorAll('a[aria-disabled="true"]').forEach((link) => {
            link.addEventListener("click", (event) => event.preventDefault());
        });

        // Sidebar active menu
        document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
            const isCurrent = link.dataset.page === currentPage;
            link.classList.toggle("active", isCurrent);
            if (isCurrent) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });

        // Page-specific common elements
        document.querySelectorAll("[data-pages]").forEach((element) => {
            const pages = element.dataset.pages.split(",").map((page) => page.trim());
            if (!pages.includes(currentPage)) element.remove();
        });

        /* ----------------------------------------------------------------------
       Topbar
       ---------------------------------------------------------------------- */
        // Page title and subtitle
        // body에도 동일한 data 속성이 있으므로 렌더링된 topbar 내부로 범위를 제한한다.
        const title = document.querySelector(".topbar [data-topbar-title]");
        const subtitle = document.querySelector(".topbar [data-topbar-subtitle]");
        if (title && document.body.dataset.topbarTitle) title.textContent = document.body.dataset.topbarTitle;
        if (subtitle && document.body.dataset.topbarSubtitle) subtitle.textContent = document.body.dataset.topbarSubtitle;
    }

    /* ========================================================================
     Sidebar
     ======================================================================== */
    function setSidebarCollapsed(sidebar, isCollapsed) {
        const collapseButton = sidebar.querySelector("#sidebarCollapseBtn");

        sidebar.classList.toggle("collapsed", isCollapsed);
        if (isCollapsed) localStorage.setItem("sidebar-collapsed", "true");
        else localStorage.removeItem("sidebar-collapsed");

        if (collapseButton) collapseButton.setAttribute("aria-expanded", String(!isCollapsed));
    }

    function initSharedShell() {
        const sidebar = document.querySelector("[data-sidebar-variant], .app-sidebar");
        if (!sidebar) return;

        const variant = sidebar.dataset.sidebarVariant || "standard";
        const supportsCollapse = variant === "standard" && sidebar.classList.contains("app-sidebar");
        const collapseButton = sidebar.querySelector("#sidebarCollapseBtn");
        const brand = sidebar.querySelector(".sidebar-brand");
        const mobileToggle = document.querySelector(".app-topbar #sidebarToggle");

        // Brand navigation
        brand?.addEventListener("click", () => {
            if (supportsCollapse && sidebar.classList.contains("collapsed")) {
                setSidebarCollapsed(sidebar, false);
                return;
            }

            if (document.body.dataset.page !== "home") {
                window.location.href = resolveRoute("home");
            }
        });

        if (!supportsCollapse) return;

        // Collapse state
        const shouldStartCollapsed = document.body.dataset.page !== "home" && localStorage.getItem("sidebar-collapsed") === "true";
        setSidebarCollapsed(sidebar, shouldStartCollapsed);

        collapseButton?.addEventListener("click", (event) => {
            event.stopPropagation();
            setSidebarCollapsed(sidebar, !sidebar.classList.contains("collapsed"));
        });

        // Menu navigation
        sidebar.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (link.dataset.page !== "home") setSidebarCollapsed(sidebar, true);
            });
        });

        // Topbar mobile sidebar toggle
        mobileToggle?.addEventListener("click", () => {
            const isOpen = sidebar.classList.toggle("open");
            mobileToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    /* ========================================================================
     Common toast
     ======================================================================== */
    let commonToastTimer;

    function showCommonToast(message) {
        const toast = document.getElementById("toast");
        if (!toast) return;

        window.clearTimeout(commonToastTimer);
        toast.textContent = message;
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.classList.remove("hidden");
        commonToastTimer = window.setTimeout(() => toast.classList.add("hidden"), 2200);
    }

    /* ========================================================================
     Three-panel layout
     ======================================================================== */
    const THREE_PANEL_MIN = 220;
    const THREE_PANEL_HANDLE_WIDTH = 4;
    const THREE_PANEL_COLLAPSED_WIDTH = 44;
    const THREE_PANEL_FLEX_COLUMN = "minmax(0, 1fr)";
    const THREE_PANEL_HEAD_SELECTOR = ".panel-head, .center-header";
    const THREE_PANEL_INTERACTIVE_SELECTOR = "button, input, select, textarea, a, [contenteditable]";
    const PANEL_COLLAPSE_BUTTON_SELECTOR = '[data-panel-action="collapse"], #leftPanelCollapseBtn';

    function syncPanelCollapseButton(button, isCollapsed) {
        if (!button) return;

        const label = isCollapsed ? "패널 펼치기" : "패널 접기";
        button.setAttribute("aria-expanded", String(!isCollapsed));
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
    }

    function getThreePanel() {
        return document.querySelector('[data-component="three-panel"]');
    }

    function getThreePanelStorageKey() {
        return `panel-layout-${document.body.dataset.page || "default"}-v3`;
    }

    function getThreePanelChildren(container, className) {
        return [...container.children].filter((element) => element.classList.contains(className));
    }

    function getThreePanelPanels(container) {
        return getThreePanelChildren(container, "panel");
    }

    function getThreePanelHandles(container) {
        return getThreePanelChildren(container, "panel-resize-handle");
    }

    function createThreePanelColumns(left, center, right) {
        return `${left} ${THREE_PANEL_HANDLE_WIDTH}px ${center} ${THREE_PANEL_HANDLE_WIDTH}px ${right}`;
    }

    function readThreePanelWidths(container) {
        const columns = window.getComputedStyle(container).gridTemplateColumns.trim().split(/\s+/);
        if (columns.length < 5) return null;

        const left = Number.parseFloat(columns[0]);
        const right = Number.parseFloat(columns[4]);
        if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
        return { left: Math.round(left), right: Math.round(right) };
    }

    function getThreePanelResizeBounds(container) {
        const style = window.getComputedStyle(container);
        const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
        const handleWidth = getThreePanelHandles(container).length * THREE_PANEL_HANDLE_WIDTH;
        const availableWidth = Math.max(0, container.clientWidth - horizontalPadding - handleWidth);
        const minimum = Math.min(THREE_PANEL_MIN, Math.floor(availableWidth / 3));
        const maximumOuterWidth = Math.max(minimum * 2, availableWidth - minimum);
        return { minimum, maximumOuterWidth };
    }

    function syncThreePanelAria(container) {
        const widths = readThreePanelWidths(container);
        if (!widths) return;

        const handles = getThreePanelHandles(container);
        const bounds = getThreePanelResizeBounds(container);
        handles.forEach((handle, index) => {
            const maximum = index === 0 ? bounds.maximumOuterWidth - widths.right : bounds.maximumOuterWidth - widths.left;
            handle.setAttribute("aria-valuemin", String(bounds.minimum));
            handle.setAttribute("aria-valuemax", String(Math.max(bounds.minimum, Math.round(maximum))));
            handle.setAttribute("aria-valuenow", String(index === 0 ? widths.left : widths.right));
        });
    }

    function applyThreePanelWidths(container, left, right, changedSide = null) {
        const bounds = getThreePanelResizeBounds(container);
        let safeLeft = Math.max(bounds.minimum, Math.round(left));
        let safeRight = Math.max(bounds.minimum, Math.round(right));

        if (safeLeft + safeRight > bounds.maximumOuterWidth) {
            if (changedSide === "left") {
                safeLeft = Math.max(bounds.minimum, bounds.maximumOuterWidth - safeRight);
            } else if (changedSide === "right") {
                safeRight = Math.max(bounds.minimum, bounds.maximumOuterWidth - safeLeft);
            } else {
                const adjustableWidth = Math.max(0, bounds.maximumOuterWidth - bounds.minimum * 2);
                const requestedAdjustableWidth = Math.max(1, safeLeft + safeRight - bounds.minimum * 2);
                safeLeft = bounds.minimum + Math.round((adjustableWidth * (safeLeft - bounds.minimum)) / requestedAdjustableWidth);
                safeRight = bounds.maximumOuterWidth - safeLeft;
            }
        }

        container.style.gridTemplateColumns = createThreePanelColumns(`${safeLeft}px`, THREE_PANEL_FLEX_COLUMN, `${safeRight}px`);
        syncThreePanelAria(container);
    }

    function saveThreePanelLayout(container) {
        const widths = readThreePanelWidths(container);
        if (widths) container.dataset.panelWidths = JSON.stringify(widths);
    }

    function restoreThreePanelLayout(container = getThreePanel()) {
        if (!container) return false;

        // v3까지 저장하던 영구 너비는 제거하고 현재 문서 안에서만 상태를 유지합니다.
        localStorage.removeItem(getThreePanelStorageKey());
        const saved = container.dataset.panelWidths;
        if (!saved) {
            container.style.removeProperty("grid-template-columns");
            syncThreePanelAria(container);
            return false;
        }

        try {
            const widths = JSON.parse(saved);
            if (!Number.isFinite(Number(widths.left)) || !Number.isFinite(Number(widths.right))) {
                throw new Error("저장된 패널 너비가 올바르지 않습니다.");
            }
            applyThreePanelWidths(container, widths.left, widths.right);
            return true;
        } catch (error) {
            delete container.dataset.panelWidths;
            container.style.removeProperty("grid-template-columns");
            syncThreePanelAria(container);
            return false;
        }
    }

    function resetThreePanelLayout(container = getThreePanel()) {
        if (!container) return;

        localStorage.removeItem(getThreePanelStorageKey());
        delete container.dataset.panelWidths;
        container.style.removeProperty("grid-template-columns");
        getThreePanelPanels(container).forEach((panel) => panel.classList.remove("panel-collapsed"));
        container.querySelectorAll(PANEL_COLLAPSE_BUTTON_SELECTOR).forEach((button) => syncPanelCollapseButton(button, false));
        syncThreePanelAria(container);
    }

    function setThreePanelCollapsed(panel, isCollapsed, container = getThreePanel()) {
        if (!container || !panel || panel.parentElement !== container) return;

        const panels = getThreePanelPanels(container);
        const panelIndex = panels.indexOf(panel);
        const widths = readThreePanelWidths(container);
        if (panelIndex < 0 || !widths) return;

        panel.classList.toggle("panel-collapsed", isCollapsed);
        syncPanelCollapseButton(panel.querySelector(PANEL_COLLAPSE_BUTTON_SELECTOR), isCollapsed);

        if (!isCollapsed) {
            restoreThreePanelLayout(container);
        } else {
            const leftColumn = panelIndex === 0 ? `${THREE_PANEL_COLLAPSED_WIDTH}px` : `${widths.left}px`;
            const centerColumn = panelIndex === 1 ? `${THREE_PANEL_COLLAPSED_WIDTH}px` : THREE_PANEL_FLEX_COLUMN;
            const rightColumn = panelIndex === 2 ? `${THREE_PANEL_COLLAPSED_WIDTH}px` : `${widths.right}px`;
            container.style.gridTemplateColumns = createThreePanelColumns(leftColumn, centerColumn, rightColumn);
        }
        syncThreePanelAria(container);
    }

    function expandCollapsedThreePanelPanels(container) {
        getThreePanelPanels(container)
            .filter((panel) => panel.classList.contains("panel-collapsed"))
            .forEach((panel) => setThreePanelCollapsed(panel, false, container));
    }

    function rebuildThreePanel(container, panels) {
        const handles = getThreePanelHandles(container);
        container.replaceChildren();
        panels.forEach((panel, index) => {
            container.appendChild(panel);
            if (index < panels.length - 1 && handles[index]) container.appendChild(handles[index]);
        });
    }

    function rotateThreePanel(container) {
        const panels = getThreePanelPanels(container);
        if (panels.length < 2) return false;

        expandCollapsedThreePanelPanels(container);
        panels.push(panels.shift());
        rebuildThreePanel(container, panels);
        syncThreePanelAria(container);
        return true;
    }

    function initThreePanelDragDrop(container) {
        getThreePanelPanels(container).forEach((panel) => {
            const head = panel.querySelector(THREE_PANEL_HEAD_SELECTOR);
            if (!head) return;

            head.style.cursor = "grab";
            head.style.touchAction = "none";
            head.removeAttribute("draggable");
            head.querySelectorAll(THREE_PANEL_INTERACTIVE_SELECTOR).forEach((element) => {
                element.setAttribute("draggable", "false");
            });

            head.addEventListener("pointerdown", (event) => {
                if (event.button !== 0) return;
                if (event.target.closest(THREE_PANEL_INTERACTIVE_SELECTOR)) {
                    return;
                }

                const pointerId = event.pointerId;
                const startX = event.clientX;
                const startY = event.clientY;
                let isDragging = false;
                let targetPanel = null;

                const clearDragState = () => {
                    panel.style.opacity = "";
                    head.style.cursor = "grab";
                    document.body.style.userSelect = "";
                    getThreePanelPanels(container).forEach((item) => item.classList.remove("drag-over"));
                };

                const onPointerMove = (moveEvent) => {
                    if (moveEvent.pointerId !== pointerId) return;

                    const movedDistance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
                    if (!isDragging && movedDistance < 6) return;

                    isDragging = true;
                    moveEvent.preventDefault();
                    panel.style.opacity = "0.5";
                    head.style.cursor = "grabbing";
                    document.body.style.userSelect = "none";

                    const hoveredPanel = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest(".panel");
                    targetPanel = hoveredPanel?.parentElement === container && hoveredPanel !== panel ? hoveredPanel : null;
                    getThreePanelPanels(container).forEach((item) => item.classList.toggle("drag-over", item === targetPanel));
                };

                const onPointerUp = (upEvent) => {
                    if (upEvent.pointerId !== pointerId) return;

                    document.removeEventListener("pointermove", onPointerMove);
                    document.removeEventListener("pointerup", onPointerUp);
                    document.removeEventListener("pointercancel", onPointerUp);

                    const dropTarget = targetPanel;
                    clearDragState();
                    if (!isDragging || !dropTarget) return;

                    const panels = getThreePanelPanels(container);
                    const draggedIndex = panels.indexOf(panel);
                    const targetIndex = panels.indexOf(dropTarget);
                    if (draggedIndex < 0 || targetIndex < 0) return;

                    expandCollapsedThreePanelPanels(container);
                    [panels[draggedIndex], panels[targetIndex]] = [panels[targetIndex], panels[draggedIndex]];
                    rebuildThreePanel(container, panels);
                    syncThreePanelAria(container);
                    showCommonToast("패널 위치가 변경되었습니다.");
                };

                document.addEventListener("pointermove", onPointerMove, { passive: false });
                document.addEventListener("pointerup", onPointerUp);
                document.addEventListener("pointercancel", onPointerUp);
            });
        });
    }

    function bindThreePanelPointerResize(container) {
        container.addEventListener("mousedown", (event) => {
            const handle = event.target.closest(".panel-resize-handle");
            if (!handle || handle.parentElement !== container) return;

            const handles = getThreePanelHandles(container);
            const handleIndex = handles.indexOf(handle);
            const startWidths = readThreePanelWidths(container);
            if (handleIndex < 0 || !startWidths) return;

            event.preventDefault();
            const startX = event.clientX;
            handle.classList.add("active");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";

            const onMouseMove = (moveEvent) => {
                const difference = moveEvent.clientX - startX;
                if (handleIndex === 0) {
                    applyThreePanelWidths(container, startWidths.left + difference, startWidths.right, "left");
                } else {
                    applyThreePanelWidths(container, startWidths.left, startWidths.right - difference, "right");
                }
            };

            const onMouseUp = () => {
                handle.classList.remove("active");
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                saveThreePanelLayout(container);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
    }

    function bindThreePanelKeyboardResize(container) {
        getThreePanelHandles(container).forEach((handle) => {
            handle.addEventListener("keydown", (event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                const handleIndex = getThreePanelHandles(container).indexOf(handle);
                const widths = readThreePanelWidths(container);
                if (handleIndex < 0 || !widths) return;

                event.preventDefault();
                const difference = (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 32 : 16);
                if (handleIndex === 0) {
                    applyThreePanelWidths(container, widths.left + difference, widths.right, "left");
                } else {
                    applyThreePanelWidths(container, widths.left, widths.right - difference, "right");
                }
                saveThreePanelLayout(container);
            });
        });
    }

    function bindThreePanelCollapse(container) {
        container.querySelectorAll(PANEL_COLLAPSE_BUTTON_SELECTOR).forEach((collapseButton) => {
            syncPanelCollapseButton(collapseButton, false);
            collapseButton.addEventListener("click", () => {
                const panel = collapseButton.closest(".panel");
                if (panel) setThreePanelCollapsed(panel, !panel.classList.contains("panel-collapsed"), container);
            });
        });
    }

    function initStandalonePanels() {
        document.querySelectorAll('[data-component="panel"]').forEach((panel) => {
            if (panel.closest('[data-component="three-panel"]')) return;

            const collapseButton = panel.querySelector(PANEL_COLLAPSE_BUTTON_SELECTOR);
            if (!collapseButton || collapseButton.dataset.collapseInitialized === "true") return;

            collapseButton.dataset.collapseInitialized = "true";
            syncPanelCollapseButton(collapseButton, panel.classList.contains("panel-collapsed"));
            collapseButton.addEventListener("click", () => {
                const isCollapsed = panel.classList.toggle("panel-collapsed");
                syncPanelCollapseButton(collapseButton, isCollapsed);
            });
        });
    }

    function getSplitPanelParts(handle) {
        const container = handle.closest('[data-component="split-handler"]');
        if (!container) return null;

        const left = [...container.children].find((element) => element.classList.contains("split-handler-left"));
        const right = [...container.children].find((element) => element.classList.contains("split-handler-right"));
        if (!left || !right) return null;

        return { container, handle, left, right };
    }

    function getResizePanelParts(handle) {
        const container = handle.closest('[data-component="resize-panel-layout"]');
        if (!container || handle.parentElement !== container) return null;

        const panels = [...container.children].filter((element) => element.classList.contains("resize-panel"));
        if (panels.length !== 2) return null;

        return { container, handle, left: panels[0], right: panels[1] };
    }

    function getTwoPaneResizeParts(handle) {
        if (handle.classList.contains("split-handler-handle")) return getSplitPanelParts(handle);
        if (handle.classList.contains("panel-resize-handle")) return getResizePanelParts(handle);
        return null;
    }

    function getTwoPaneMinimum(container, totalWidth) {
        const configuredMinimum = Number.parseFloat(container.dataset.splitMin);
        const minimum = Number.isFinite(configuredMinimum) ? configuredMinimum : 160;
        return Math.min(Math.max(0, minimum), Math.max(0, totalWidth / 2));
    }

    function syncTwoPaneAria(parts) {
        const leftWidth = Math.round(parts.left.getBoundingClientRect().width);
        const rightWidth = Math.round(parts.right.getBoundingClientRect().width);
        const totalWidth = leftWidth + rightWidth;
        const minimum = getTwoPaneMinimum(parts.container, totalWidth);

        parts.handle.setAttribute("aria-valuemin", String(Math.round(minimum)));
        parts.handle.setAttribute("aria-valuemax", String(Math.round(totalWidth - minimum)));
        parts.handle.setAttribute("aria-valuenow", String(leftWidth));
    }

    function applyTwoPaneWidths(parts, requestedLeftWidth, totalWidth) {
        const minimum = getTwoPaneMinimum(parts.container, totalWidth);
        const leftWidth = Math.min(Math.max(requestedLeftWidth, minimum), totalWidth - minimum);
        const rightWidth = totalWidth - leftWidth;

        parts.left.style.flex = "none";
        parts.left.style.width = `${Math.round(leftWidth)}px`;
        parts.right.style.flex = "none";
        parts.right.style.width = `${Math.round(rightWidth)}px`;
        syncTwoPaneAria(parts);
    }

    function initTwoPaneResizers() {
        if (document.documentElement.dataset.twoPaneResizersInitialized === "true") return;
        document.documentElement.dataset.twoPaneResizersInitialized = "true";

        document.querySelectorAll(".split-handler-handle, .resize-panel-layout > .panel-resize-handle").forEach((handle) => {
            const parts = getTwoPaneResizeParts(handle);
            if (parts) syncTwoPaneAria(parts);
        });

        document.addEventListener("pointerdown", (event) => {
            const handle = event.target.closest(".split-handler-handle, .resize-panel-layout > .panel-resize-handle");
            if (!handle || event.button !== 0) return;

            const parts = getTwoPaneResizeParts(handle);
            if (!parts) return;

            event.preventDefault();
            const pointerId = event.pointerId;
            const startX = event.clientX;
            const startLeftWidth = parts.left.getBoundingClientRect().width;
            const startRightWidth = parts.right.getBoundingClientRect().width;
            const totalWidth = startLeftWidth + startRightWidth;

            handle.classList.add("active");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";

            const onPointerMove = (moveEvent) => {
                if (moveEvent.pointerId !== pointerId) return;
                moveEvent.preventDefault();
                applyTwoPaneWidths(parts, startLeftWidth + moveEvent.clientX - startX, totalWidth);
            };

            const onPointerUp = (upEvent) => {
                if (upEvent.pointerId !== pointerId) return;

                handle.classList.remove("active");
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
                document.removeEventListener("pointermove", onPointerMove);
                document.removeEventListener("pointerup", onPointerUp);
                document.removeEventListener("pointercancel", onPointerUp);
            };

            document.addEventListener("pointermove", onPointerMove, { passive: false });
            document.addEventListener("pointerup", onPointerUp);
            document.addEventListener("pointercancel", onPointerUp);
        });

        document.addEventListener("keydown", (event) => {
            const handle = event.target.closest(".split-handler-handle, .resize-panel-layout > .panel-resize-handle");
            if (!handle || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;

            const parts = getTwoPaneResizeParts(handle);
            if (!parts) return;

            event.preventDefault();
            const leftWidth = parts.left.getBoundingClientRect().width;
            const rightWidth = parts.right.getBoundingClientRect().width;
            const difference = (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 32 : 16);
            applyTwoPaneWidths(parts, leftWidth + difference, leftWidth + rightWidth);
        });
    }

    function bindThreePanelToolbar(container) {
        document.getElementById("panelSwapBtn")?.addEventListener("click", () => {
            if (rotateThreePanel(container)) showCommonToast("패널 위치가 변경되었습니다.");
        });

        document.getElementById("layoutResetBtn")?.addEventListener("click", () => {
            resetThreePanelLayout(container);
            showCommonToast("레이아웃이 기본값으로 초기화되었습니다.");
        });
    }

    function initThreePanel() {
        const container = getThreePanel();
        if (!container || container.dataset.initialized === "true") return;
        container.dataset.initialized = "true";

        restoreThreePanelLayout(container);
        bindThreePanelPointerResize(container);
        bindThreePanelKeyboardResize(container);
        bindThreePanelCollapse(container);
        bindThreePanelToolbar(container);
        initThreePanelDragDrop(container);
        syncThreePanelAria(container);
    }

    /* ========================================================================
     Shared fragment include loader
     ======================================================================== */
    const INCLUDE_SOURCES = Object.freeze({
        html: Object.freeze({
            directory: "components",
            extension: "html",
        }),
        jsp: Object.freeze({
            directory: "includes/jsp",
            extension: "jspf",
        }),
    });
    function getIncludeUrl(componentPath, sourceName = "html") {
        if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/i.test(componentPath)) {
            throw new Error(`잘못된 공통 컴포넌트 경로: ${componentPath}`);
        }

        const source = INCLUDE_SOURCES[sourceName];

        if (!source) {
            throw new Error(`지원하지 않는 공통 컴포넌트 형식: ${sourceName}`);
        }

        return `${getRootPath()}/${source.directory}/${componentPath}.${source.extension}`;
    }

    const INCLUDE_FETCH_ATTEMPTS = 3;
    const INCLUDE_RETRY_DELAY = 120;
    const INCLUDE_CONTROL_ATTRIBUTES = new Set(["data-include", "data-include-source"]);

    async function fetchFragmentMarkup(componentName, sourceName) {
        const url = getIncludeUrl(componentName, sourceName);
        let lastError;

        for (let attempt = 1; attempt <= INCLUDE_FETCH_ATTEMPTS; attempt += 1) {
            try {
                const response = await window.fetch(url, { cache: "no-cache" });
                if (!response.ok) throw new Error(`${componentName} 공통 컴포넌트를 불러오지 못했습니다. (${response.status})`);
                return await response.text();
            } catch (error) {
                lastError = error;

                // Live Server가 파일 변경을 감지하는 순간에는 fragment 요청이 잠시 실패할 수 있습니다.
                if (attempt < INCLUDE_FETCH_ATTEMPTS) {
                    await new Promise((resolve) => window.setTimeout(resolve, INCLUDE_RETRY_DELAY * attempt));
                }
            }
        }

        throw lastError;
    }

    function applyIncludeHostAttributes(placeholder, fragment) {
        const componentRoots = [...fragment.children];
        if (componentRoots.length !== 1) return;

        const componentRoot = componentRoots[0];
        [...placeholder.attributes].forEach(({ name, value }) => {
            if (INCLUDE_CONTROL_ATTRIBUTES.has(name)) return;

            if (name === "class") {
                componentRoot.classList.add(...placeholder.classList);
                return;
            }

            if (name === "style") {
                componentRoot.style.cssText = [componentRoot.style.cssText, value].filter(Boolean).join("; ");
                return;
            }

            componentRoot.setAttribute(name, value);
        });
    }

    async function loadFragment(placeholder) {
        const componentName = placeholder.dataset.include;
        const sourceName = placeholder.dataset.includeSource || "html";
        const markup = await fetchFragmentMarkup(componentName, sourceName);

        const slotContents = new Map();
        placeholder.querySelectorAll("template[data-slot]").forEach((slotTemplate) => {
            if (slotTemplate.closest("[data-include]") !== placeholder) return;
            slotContents.set(slotTemplate.dataset.slot, slotTemplate.content.cloneNode(true));
        });
        [...placeholder.children].forEach((slotElement) => {
            if (!slotElement.dataset.slot || slotElement.tagName === "TEMPLATE") return;

            const content = document.createDocumentFragment();
            const clonedElement = slotElement.cloneNode(true);
            clonedElement.removeAttribute("data-slot");
            content.appendChild(clonedElement);
            slotContents.set(slotElement.dataset.slot, content);
        });

        const template = document.createElement("template");
        if (sourceName === "html") {
            const componentDocument = new DOMParser().parseFromString(markup, "text/html");

            // 컴포넌트 HTML의 CSS/JS는 부모 페이지에서 한 번만 로드합니다.
            componentDocument.querySelectorAll("script").forEach((script) => script.remove());
            template.innerHTML = componentDocument.body.innerHTML.trim();
        } else {
            template.innerHTML = markup.trim();
        }

        const targetSlots = [...template.content.querySelectorAll("[data-slot]")];
        if (!slotContents.size && targetSlots.length === 1 && targetSlots[0].dataset.slot === "content") {
            const content = document.createDocumentFragment();
            [...placeholder.childNodes].forEach((child) => content.appendChild(child.cloneNode(true)));
            slotContents.set("content", content);
        }

        targetSlots.forEach((targetSlot) => {
            const slotContent = slotContents.get(targetSlot.dataset.slot);
            if (!slotContent) throw new Error(`${componentName} 컴포넌트의 ${targetSlot.dataset.slot} 슬롯이 비어 있습니다.`);
            targetSlot.replaceWith(slotContent);
        });

        applyIncludeHostAttributes(placeholder, template.content);
        placeholder.replaceWith(template.content);
    }

    async function loadAllFragments() {
        const maxDepth = 10;

        for (let depth = 0; depth < maxDepth; depth += 1) {
            const allPlaceholders = [...document.querySelectorAll("[data-include]")];
            if (!allPlaceholders.length) return;

            const placeholders = allPlaceholders.filter((placeholder) => !placeholder.parentElement?.closest("[data-include]"));
            if (!placeholders.length) break;
            await Promise.all(placeholders.map(loadFragment));
        }

        if (document.querySelector("[data-include]")) {
            throw new Error("공통 컴포넌트 include 중첩 깊이가 허용 범위를 초과했습니다.");
        }
    }

    /* ========================================================================
     File upload
     ======================================================================== */
    function initFileUploadZones() {
        document.querySelectorAll("[data-file-upload-zone]").forEach((zone) => {
            const input = zone.querySelector('input[type="file"]');
            if (!input) return;

            const emitFiles = (fileList, source) => {
                const files = Array.from(fileList || []);
                if (!files.length) return;
                zone.dispatchEvent(
                    new CustomEvent("app:file-upload", {
                        detail: { files, source },
                    }),
                );
            };

            zone.addEventListener("click", (event) => {
                if (event.target === input) return;
                input.click();
            });

            zone.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                input.click();
            });

            input.addEventListener("change", () => {
                emitFiles(input.files, "picker");
                input.value = "";
            });

            zone.addEventListener("dragenter", (event) => {
                event.preventDefault();
                zone.classList.add("dragover");
            });

            zone.addEventListener("dragover", (event) => {
                event.preventDefault();
                zone.classList.add("dragover");
            });

            zone.addEventListener("dragleave", (event) => {
                if (event.relatedTarget && zone.contains(event.relatedTarget)) return;
                zone.classList.remove("dragover");
            });

            zone.addEventListener("drop", (event) => {
                event.preventDefault();
                zone.classList.remove("dragover");
                emitFiles(event.dataTransfer?.files, "drop");
            });
        });
    }

    /* ========================================================================
    Form field components
     ======================================================================== */
    function initFormFields() {
        document.querySelectorAll("[data-character-count]").forEach((field) => {
            const textarea = field.querySelector("textarea[maxlength]");
            const currentCount = field.querySelector("[data-character-current]");
            if (!textarea || !currentCount) return;

            const syncCharacterCount = () => {
                currentCount.textContent = String(textarea.value.length);
            };

            textarea.addEventListener("input", syncCharacterCount);
            syncCharacterCount();
        });
    }

    /* ========================================================================
     Application initialization and public API
     ======================================================================== */
    function notifyReady(isReady) {
        document.documentElement.dataset.includesReady = isReady ? "true" : "error";
        if (isReady) document.dispatchEvent(new CustomEvent("app:includes-ready"));
    }

    async function init() {
        let isReady = false;

        try {
            observeIconReferences();
            resolveIconReferences();
            await loadAllFragments();
            resolveIconReferences();
            applyPageContext();
            initSharedShell();
            initThreePanel();
            initStandalonePanels();
            initTwoPaneResizers();
            initFileUploadZones();
            initFormFields();
            isReady = true;
        } catch (error) {
            console.error("[AI-ONE] 공통 UI include 로드 실패:", error);
            document.querySelectorAll("[data-include]").forEach((placeholder) => {
                if (!placeholder.isConnected) return;
                placeholder.innerHTML = '<p class="include-error" role="alert">공통 UI를 불러오지 못했습니다.</p>';
            });
        } finally {
            notifyReady(isReady);
        }
    }

    window.AppCommon = Object.freeze({
        logout,
        resolveRoute,
        resetThreePanelLayout,
        restoreThreePanelLayout,
        setThreePanelCollapsed,
        showToast: showCommonToast,
        whenReady(callback) {
            const status = document.documentElement.dataset.includesReady;
            if (status === "true") callback();
            else if (status !== "error") document.addEventListener("app:includes-ready", callback, { once: true });
        },
    });

    init();
})();

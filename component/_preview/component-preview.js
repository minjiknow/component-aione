(function () {
    "use strict";

    /* ========================================================================
     Route and page context
     ======================================================================== */
    const ROUTES = Object.freeze({
        home: "html/ai-home.html",
        intake: "html/ai-intake.html",
        answer: "html/ai-answer.html",
        chatbot: "html/ai-chatbot.html",
        login: "html/login.html",
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
        const brandButton = sidebar.querySelector(".sidebar-brand");

        sidebar.classList.toggle("collapsed", isCollapsed);
        if (isCollapsed) localStorage.setItem("sidebar-collapsed", "true");
        else localStorage.removeItem("sidebar-collapsed");

        if (collapseButton) collapseButton.setAttribute("aria-expanded", String(!isCollapsed));
        if (brandButton) {
            const label = isCollapsed ? "사이드바 펼치기" : "AI-ONE 홈";
            brandButton.setAttribute("aria-label", label);
            brandButton.setAttribute("title", label);
        }
    }

    function initSharedShell() {
        const sidebar = document.getElementById("sidebar");
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
    const THREE_PANEL_WIDTH_MODE = Object.freeze({ FIXED: "fixed", FLEX: "flex" });
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

    function ensureThreePanelWidthRoles(container) {
        const panels = getThreePanelPanels(container);
        let flexiblePanel = panels.find((panel) => panel.dataset.panelWidthMode === THREE_PANEL_WIDTH_MODE.FLEX);
        if (!flexiblePanel) {
            flexiblePanel = panels.find((panel) => panel.dataset.panel === "center") || panels[1] || panels[0] || null;
        }

        panels.forEach((panel, index) => {
            panel.dataset.panelWidthMode = panel === flexiblePanel ? THREE_PANEL_WIDTH_MODE.FLEX : THREE_PANEL_WIDTH_MODE.FIXED;
            panel.dataset.panelLayoutKey ||= panel.dataset.panel || `panel-${index}`;
            panel.dataset.panelInitialIndex ||= String(index);
        });
        return flexiblePanel;
    }

    function readThreePanelPanelWidths(container) {
        return new Map(
            getThreePanelPanels(container).map((panel) => [panel, Math.round(panel.getBoundingClientRect().width)]),
        );
    }

    function createThreePanelColumns(panelColumns) {
        return panelColumns
            .flatMap((column, index) => (index < panelColumns.length - 1 ? [column, `${THREE_PANEL_HANDLE_WIDTH}px`] : [column]))
            .join(" ");
    }

    function getThreePanelMinimum(container) {
        const style = window.getComputedStyle(container);
        const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
        const handleWidth = getThreePanelHandles(container).length * THREE_PANEL_HANDLE_WIDTH;
        const availableWidth = Math.max(0, container.clientWidth - horizontalPadding - handleWidth);
        return Math.min(THREE_PANEL_MIN, Math.floor(availableWidth / Math.max(1, getThreePanelPanels(container).length)));
    }

    function syncThreePanelAria(container) {
        const panels = getThreePanelPanels(container);
        const handles = getThreePanelHandles(container);
        const minimum = getThreePanelMinimum(container);
        handles.forEach((handle, index) => {
            const leftPanel = panels[index];
            const rightPanel = panels[index + 1];
            if (!leftPanel || !rightPanel) return;

            const leftWidth = Math.round(leftPanel.getBoundingClientRect().width);
            const adjacentWidth = leftWidth + Math.round(rightPanel.getBoundingClientRect().width);
            handle.setAttribute("aria-valuemin", String(minimum));
            handle.setAttribute("aria-valuemax", String(Math.max(minimum, adjacentWidth - minimum)));
            handle.setAttribute("aria-valuenow", String(leftWidth));
        });
    }

    function applyThreePanelLayout(container, requestedWidths = readThreePanelPanelWidths(container)) {
        const flexiblePanel = ensureThreePanelWidthRoles(container);
        const minimum = getThreePanelMinimum(container);
        const columns = getThreePanelPanels(container).map((panel) => {
            if (panel.classList.contains("panel-collapsed")) return `${THREE_PANEL_COLLAPSED_WIDTH}px`;
            if (panel === flexiblePanel) return THREE_PANEL_FLEX_COLUMN;

            const requestedWidth = requestedWidths.get(panel) ?? Number.parseFloat(panel.dataset.panelWidth);
            const safeWidth = Math.max(minimum, Math.round(Number.isFinite(requestedWidth) ? requestedWidth : minimum));
            panel.dataset.panelWidth = String(safeWidth);
            return `${safeWidth}px`;
        });

        container.style.gridTemplateColumns = createThreePanelColumns(columns);
        syncThreePanelAria(container);
    }

    function applyThreePanelResize(container, handleIndex, requestedLeftWidth, adjacentWidth, baseWidths) {
        const panels = getThreePanelPanels(container);
        const leftPanel = panels[handleIndex];
        const rightPanel = panels[handleIndex + 1];
        if (!leftPanel || !rightPanel) return;

        const minimum = Math.min(getThreePanelMinimum(container), Math.floor(adjacentWidth / 2));
        const leftWidth = Math.min(Math.max(Math.round(requestedLeftWidth), minimum), adjacentWidth - minimum);
        const widths = new Map(baseWidths);
        widths.set(leftPanel, leftWidth);
        widths.set(rightPanel, adjacentWidth - leftWidth);
        applyThreePanelLayout(container, widths);
    }

    function saveThreePanelLayout(container) {
        ensureThreePanelWidthRoles(container);
        const widths = readThreePanelPanelWidths(container);
        const savedWidths = {};
        getThreePanelPanels(container).forEach((panel) => {
            if (panel.dataset.panelWidthMode === THREE_PANEL_WIDTH_MODE.FIXED) {
                savedWidths[panel.dataset.panelLayoutKey] = widths.get(panel);
            }
        });
        container.dataset.panelWidths = JSON.stringify(savedWidths);
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
            const savedWidths = JSON.parse(saved);
            const widths = new Map();
            getThreePanelPanels(container).forEach((panel) => {
                if (panel.dataset.panelWidthMode !== THREE_PANEL_WIDTH_MODE.FIXED) return;
                const width = Number(savedWidths[panel.dataset.panelLayoutKey]);
                if (!Number.isFinite(width)) throw new Error("저장된 패널 너비가 올바르지 않습니다.");
                widths.set(panel, width);
            });
            applyThreePanelLayout(container, widths);
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
        const panels = getThreePanelPanels(container);
        panels.forEach((panel) => panel.classList.remove("panel-collapsed"));
        container.querySelectorAll(PANEL_COLLAPSE_BUTTON_SELECTOR).forEach((button) => syncPanelCollapseButton(button, false));

        const isInitialOrder = panels.every((panel, index) => Number(panel.dataset.panelInitialIndex) === index);
        if (isInitialOrder) {
            panels.forEach((panel) => delete panel.dataset.panelWidth);
            container.style.removeProperty("grid-template-columns");
            syncThreePanelAria(container);
        } else {
            applyThreePanelLayout(container);
            saveThreePanelLayout(container);
        }
    }

    function setThreePanelCollapsed(panel, isCollapsed, container = getThreePanel()) {
        if (!container || !panel || panel.parentElement !== container) return;

        const panels = getThreePanelPanels(container);
        if (!panels.includes(panel)) return;

        const widths = readThreePanelPanelWidths(container);
        if (isCollapsed) saveThreePanelLayout(container);
        panel.classList.toggle("panel-collapsed", isCollapsed);
        syncPanelCollapseButton(panel.querySelector(PANEL_COLLAPSE_BUTTON_SELECTOR), isCollapsed);

        if (!isCollapsed) {
            restoreThreePanelLayout(container);
        } else {
            applyThreePanelLayout(container, widths);
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

    function moveThreePanel(container, panel, targetPanel) {
        const panels = getThreePanelPanels(container);
        const draggedIndex = panels.indexOf(panel);
        const targetIndex = panels.indexOf(targetPanel);
        if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return false;

        expandCollapsedThreePanelPanels(container);
        const widths = readThreePanelPanelWidths(container);
        panels.splice(draggedIndex, 1);
        panels.splice(targetIndex, 0, panel);
        rebuildThreePanel(container, panels);
        applyThreePanelLayout(container, widths);
        saveThreePanelLayout(container);
        return true;
    }

    function rotateThreePanel(container) {
        const panels = getThreePanelPanels(container);
        if (panels.length < 2) return false;

        expandCollapsedThreePanelPanels(container);
        const widths = readThreePanelPanelWidths(container);
        panels.push(panels.shift());
        rebuildThreePanel(container, panels);
        applyThreePanelLayout(container, widths);
        saveThreePanelLayout(container);
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

                    if (moveThreePanel(container, panel, dropTarget)) {
                        showCommonToast("패널 순서가 변경되었습니다.");
                    }
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
            const panels = getThreePanelPanels(container);
            const leftPanel = panels[handleIndex];
            const rightPanel = panels[handleIndex + 1];
            if (handleIndex < 0 || !leftPanel || !rightPanel) return;

            event.preventDefault();
            const startX = event.clientX;
            const startWidths = readThreePanelPanelWidths(container);
            const startLeftWidth = startWidths.get(leftPanel);
            const adjacentWidth = startLeftWidth + startWidths.get(rightPanel);
            handle.classList.add("active");
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";

            const onMouseMove = (moveEvent) => {
                const difference = moveEvent.clientX - startX;
                applyThreePanelResize(container, handleIndex, startLeftWidth + difference, adjacentWidth, startWidths);
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
                const panels = getThreePanelPanels(container);
                const leftPanel = panels[handleIndex];
                const rightPanel = panels[handleIndex + 1];
                if (handleIndex < 0 || !leftPanel || !rightPanel) return;

                event.preventDefault();
                const widths = readThreePanelPanelWidths(container);
                const leftWidth = widths.get(leftPanel);
                const adjacentWidth = leftWidth + widths.get(rightPanel);
                const difference = (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 32 : 16);
                applyThreePanelResize(container, handleIndex, leftWidth + difference, adjacentWidth, widths);
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

        ensureThreePanelWidthRoles(container);
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
            directory: "component",
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
     Tabs
     ======================================================================== */
    function initTabs() {
        document.querySelectorAll("[data-tabs]").forEach((tabsRoot) => {
            if (tabsRoot.dataset.tabsInitialized === "true") return;

            const tabs = [...tabsRoot.querySelectorAll('[role="tab"]')].filter(
                (tab) => tab.closest("[data-tabs]") === tabsRoot,
            );
            if (!tabs.length) return;

            const isDisabled = (tab) => tab.disabled || tab.getAttribute("aria-disabled") === "true";
            const getEnabledTabs = () => tabs.filter((tab) => !isDisabled(tab));

            const activateTab = (nextTab, { focus = false, emitChange = true } = {}) => {
                if (!nextTab || isDisabled(nextTab)) return;

                tabs.forEach((tab) => {
                    const isActive = tab === nextTab;
                    tab.classList.toggle("is-active", isActive);
                    tab.setAttribute("aria-selected", String(isActive));
                    tab.tabIndex = isActive ? 0 : -1;

                    const panelId = tab.getAttribute("aria-controls");
                    const panel = panelId ? document.getElementById(panelId) : null;
                    if (panel && tabsRoot.contains(panel)) {
                        panel.hidden = !isActive;
                        panel.classList.toggle("is-active", isActive);
                    }
                });

                if (focus) nextTab.focus();
                if (emitChange) {
                    tabsRoot.dispatchEvent(
                        new CustomEvent("app:tab-change", {
                            detail: {
                                tab: nextTab,
                                value: nextTab.dataset.tabValue || nextTab.id,
                            },
                        }),
                    );
                }
            };

            tabs.forEach((tab) => {
                tab.addEventListener("click", () => activateTab(tab));
                tab.addEventListener("keydown", (event) => {
                    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

                    const enabledTabs = getEnabledTabs();
                    if (!enabledTabs.length) return;

                    event.preventDefault();
                    const currentIndex = Math.max(0, enabledTabs.indexOf(tab));
                    let nextIndex = currentIndex;

                    if (event.key === "Home") nextIndex = 0;
                    else if (event.key === "End") nextIndex = enabledTabs.length - 1;
                    else {
                        const direction = event.key === "ArrowRight" ? 1 : -1;
                        nextIndex = (currentIndex + direction + enabledTabs.length) % enabledTabs.length;
                    }

                    activateTab(enabledTabs[nextIndex], { focus: true });
                });
            });

            const initialTab =
                tabs.find((tab) => tab.getAttribute("aria-selected") === "true" && !isDisabled(tab)) ||
                getEnabledTabs()[0];
            activateTab(initialTab, { emitChange: false });
            tabsRoot.dataset.tabsInitialized = "true";
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
            initTabs();
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

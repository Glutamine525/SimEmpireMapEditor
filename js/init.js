function drawChessboard() {
    let chessboard = document.createElement("div");
    chessboard.id = "chessboard";
    chessboard.style.lineHeight = "0px";
    for (let i = 1; i <= 116; i++) {
        let line = document.createElement("div");
        line.style.whiteSpace = "nowrap";
        line.id = i;
        for (let j = 1; j <= 116; j++) {
            let cell = document.createElement("span");
            cell.classList.add("border-full");
            cell.id = getID(i, j);
            line.appendChild(cell);
            setMiniMapPixel(i, j, color_chessboard_main);
        }
        chessboard.appendChild(line);
    }
    document.getElementById("map-chessboard").appendChild(chessboard);
}

function clipEdge() {
    for (let i = 1; i <= 58; i++) {
        for (let j = 1; j <= 59 - i; j++) {
            getElementByCoord(i, j).classList.remove("border-full");
            getElementByCoord(i, j).classList.add("border-all-missing");
            getElementByCoord(i, j).setAttribute("out_of_boundary", "true");
            setMiniMapPixel(i, j, color_chessboard_edge);
        }
        for (let j = i + 59; j <= 116; j++) {
            getElementByCoord(i, j).classList.remove("border-full");
            getElementByCoord(i, j).classList.add("border-all-missing");
            getElementByCoord(i, j).setAttribute("out_of_boundary", "true");
            setMiniMapPixel(i, j, color_chessboard_edge);
        }
    }
    for (let i = 60; i <= 116; i++) {
        for (let j = 1; j <= i - 59; j++) {
            getElementByCoord(i, j).classList.remove("border-full");
            getElementByCoord(i, j).classList.add("border-all-missing");
            getElementByCoord(i, j).setAttribute("out_of_boundary", "true");
            setMiniMapPixel(i, j, color_chessboard_edge);
        }
    }
    for (let i = 59; i <= 116; i++) {
        for (let j = 116; j >= -i + 175; j--) {
            getElementByCoord(i, j).classList.remove("border-full");
            getElementByCoord(i, j).classList.add("border-all-missing");
            getElementByCoord(i, j).setAttribute("out_of_boundary", "true");
            setMiniMapPixel(i, j, color_chessboard_edge);
        }
    }
}

function drawBoundary() {
    for (let i = 1; i <= 116; i++) {
        for (let j = 1; j <= 116; j++) {
            if (getElementByCoord(i, j).classList.contains("border-all-missing")) {
                continue;
            }
            if (getElementByCoord(i, j - 1) && getElementByCoord(i, j - 1).classList.contains("border-all-missing")) {
                setMiniMapPixel(i, j, color_chessboard_boundary);
                getElementByCoord(i, j).setAttribute("boundary", "true");
                getElementByCoord(i, j).setAttribute("out_of_boundary", "true");
                if (i < 59 && i > 1) {
                    getElementByCoord(i, j).classList.add("triangle-bottomright");
                } else if (i > 59 && i < 116) {
                    getElementByCoord(i, j).classList.add("triangle-topright");
                }
                continue;
            }
            if (getElementByCoord(i, j + 1) && getElementByCoord(i, j + 1).classList.contains("border-all-missing")) {
                setMiniMapPixel(i, j, color_chessboard_boundary);
                getElementByCoord(i, j).setAttribute("boundary", "true");
                getElementByCoord(i, j).setAttribute("out_of_boundary", "true");
                if (i < 59) {
                    getElementByCoord(i, j).classList.add("triangle-bottomleft");
                } else {
                    getElementByCoord(i, j).classList.add("triangle-topleft");
                }
                continue;
            }
        }
    }
    getElementByCoord(1, 59).classList.add("angle-top");
    getElementByCoord(1, 58).classList.add("angle-top-ancilla");
    getElementByCoord(58, 116).style["margin-right"] = "8px";
    getElementByCoord(58, 116).setAttribute("modify", "false");
    setMiniMapPixel(58, 116, color_chessboard_boundary);
    getElementByCoord(58, 116).setAttribute("boundary", "");
    getElementByCoord(58, 116).classList.add("angle-right");
    getElementByCoord(59, 116).classList.add("angle-right-ancilla");
    getElementByCoord(116, 58).classList.add("angle-bottom");
    setMiniMapPixel(59, 1, color_chessboard_boundary);
    getElementByCoord(59, 1).setAttribute("boundary", "");
    getElementByCoord(59, 1).setAttribute("modify", "false");
    getElementByCoord(59, 1).classList.add("angle-left");
    getElementByCoord(60, 1).classList.add("angle-left-ancilla");
}

function assignEvent() {
    for (let i = 1; i <= 116; i++) {
        for (let j = 1; j <= 116; j++) {
            let cell = getElementByCoord(i, j);
            if (cell.getAttribute("out_of_boundary") === "true") continue;
            if (cell.getAttribute("modify") === "false") continue;
            cell.onclick = () => {
                if (cursor.hold === "删除建筑") return;
                cursor.select = cell.id;
            };
            cell.onmouseenter = () => {
                if (!cursor.hold) {
                    return;
                }
                if (cursor.hold === "删除建筑") return;
                if (cursor.hold === "道路") {
                    if (isMouseDown) {
                        if (insertBuilding(i, j, 1, "true", "道路", "#000000", color_road, "#000000")) {
                            roadsBuffer.push({ li: i, co: j });
                            cursor.select = cell.id + "-1";
                            return;
                        }
                    }
                    if (insertBuilding(i, j, 1, "true", "道路", "#000000", color_road, "#000000", 0, true)) {
                        getElementByCoord(i, j, 1, true).style.pointerEvents = "none";
                        return;
                    }
                }
                let label = cursor.hold.split("-");
                let building_info = getBuildingInfo(label[0], label[1]);
                if (isMouseDown) {
                    if (
                        insertBuilding(
                            i,
                            j,
                            building_info.size,
                            "true",
                            building_info.text,
                            building_info.color,
                            building_info.background_color,
                            building_info.border_color,
                            building_info.range_size
                        )
                    ) {
                        cursor.select = cell.id + "-" + building_info.size;
                        return;
                    }
                }
                if (
                    insertBuilding(
                        i,
                        j,
                        building_info.size,
                        "true",
                        building_info.text,
                        building_info.color,
                        building_info.background_color,
                        building_info.border_color,
                        building_info.range_size,
                        true
                    )
                ) {
                    nowLi = i;
                    nowCo = j;
                    nowSize = building_info.size;
                    getElementByCoord(i, j, building_info.size, true).style.pointerEvents = "none";
                }
            };
            cell.onmouseleave = () => {
                if (!cursor.hold) return;
                if (cursor.hold === "删除建筑") return;
                if (cursor.hold === "道路") {
                    removeBuilding(i, j, 1, true);
                    return;
                }
                let label = cursor.hold.split("-");
                let building_info = getBuildingInfo(label[0], label[1]);
                removeBuilding(i, j, building_info.size, true);
            };
            cell.onmousedown = (e) => {
                if (cursor.hold === "删除建筑") return;
                cursor.select = cell.id;
                if (!cursor.hold) return;
                if (cursor.hold === "道路") {
                    if (insertBuilding(i, j, 1, "true", "道路", "#000000", color_road, "#000000")) {
                        roadsBuffer.push({ li: i, co: j });
                        cursor.select = cell.id + "-1";
                        return;
                    }
                }
                let label = cursor.hold.split("-");
                let building_info = getBuildingInfo(label[0], label[1]);
                if (
                    insertBuilding(
                        i,
                        j,
                        building_info.size,
                        "true",
                        building_info.text,
                        building_info.color,
                        building_info.background_color,
                        building_info.border_color,
                        building_info.range_size
                    )
                ) {
                    cursor.select = cell.id + "-" + building_info.size;
                }
            };
        }
    }
}

function drawBarrier(type) {
    coord_barrier_road[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], 1, "false", "道路", "#000000", color_road, "#000000");
        getElementByCoord(unit[0], unit[1], 1).setAttribute("barrier", "true");
        setMiniMapPixel(unit[0], unit[1], color_road);
    });
    coord_barrier_mountain[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], 1, "false", "", "#000000", color_mountain, "#000000");
        getElementByCoord(unit[0], unit[1], 1).setAttribute("barrier", "true");
        optimizeBarrierBoundary(unit[0], unit[1], color_mountain);
        setMiniMapPixel(unit[0], unit[1], color_mountain);
    });
    coord_barrier_tree[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], 1, "false", "", "#000000", color_tree, "#000000");
        getElementByCoord(unit[0], unit[1], 1).setAttribute("barrier", "true");
        optimizeBarrierBoundary(unit[0], unit[1], color_tree);
        setMiniMapPixel(unit[0], unit[1], color_tree);
    });
    coord_barrier_water[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], 1, "false", "", "#000000", color_water, "#000000");
        getElementByCoord(unit[0], unit[1], 1).setAttribute("barrier", "true");
        optimizeBarrierBoundary(unit[0], unit[1], color_water);
        setMiniMapPixel(unit[0], unit[1], color_water);
    });
}

function drawFixedBuilding(type) {
    coord_building_stone[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], unit[2], "false", text_stone, "#000000", color_stone, "#000000");
    });
    coord_building_copper[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], unit[2], "false", text_copper, "#000000", color_copper, "#000000");
    });
    coord_building_wood[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], unit[2], "false", text_wood, "#000000", color_wood, "#000000");
    });
    coord_building_clay[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], unit[2], "false", text_clay, "#000000", color_clay, "#000000");
    });
    coord_building_wharf[type - 3].map(function (v) {
        let unit = v.split("-");
        insertBuilding(unit[0], unit[1], unit[2], "false", text_wharf, "#000000", color_wharf, "#000000");
    });
}

function drawBottomNav(reset) {
    if (reset) {
        document.getElementById("bottom-nav").removeChild(document.getElementById("bottom-nav-ul"));
    }
    let container = document.createElement("ul");
    container.id = "bottom-nav-ul";
    let tmp = document.createElement("li");
    tmp.classList.add("splitter");
    if (document.getElementById("dark-mode").checked) tmp.classList.add("bottom-nav-splitter-dark");
    tmp.id = "道路";
    tmp.innerHTML = "道路";
    tmp.onclick = () => onClickBuilding("道路");
    container.appendChild(tmp);
    label_building.map((v) => {
        let tmp = document.createElement("li");
        tmp.classList.add("splitter");
        if (document.getElementById("dark-mode").checked) tmp.classList.add("bottom-nav-splitter-dark");
        tmp.id = v;
        tmp.innerHTML = v;
        container.appendChild(tmp);
    });
    label_util.map((v, i) => {
        let tmp = document.createElement("li");
        tmp.classList.add("splitter");
        if (document.getElementById("dark-mode").checked) tmp.classList.add("bottom-nav-splitter-dark");
        tmp.id = v;
        tmp.innerHTML = v;
        tmp.style.color = "#f54d4d";
        switch (i) {
            case 0:
                tmp.onclick = () => onClickSpecialBuilding();
                break;
            case 1:
                tmp.onclick = () => onClickExport(Number(document.getElementById("type").value));
                break;
            case 2:
                tmp.onclick = () => onClickImport(Number(document.getElementById("type").value));
                let input = document.createElement("input");
                input.type = "file";
                input.id = "load-file";
                input.style.display = "none";
                tmp.appendChild(input);
                break;
            case 3:
                tmp.onclick = () => screenshot();
                break;
            case 4:
                tmp.onclick = () => onClickCancle();
                tmp.style.fontSize = "12px";
                tmp.style.lineHeight = "20px";
                tmp.style.whiteSpace = "normal";
                break;
            case 5:
                tmp.onclick = () => onClickRemove();
                tmp.style.borderRight = "none";
                break;
        }
        container.appendChild(tmp);
    });
    document.getElementById("bottom-nav").appendChild(container);
    label_building.map((v) => {
        let label = document.getElementById(v);
        let div = document.createElement("div");
        let ul = document.createElement("ul");
        let count = 0;
        div.classList.add("submenu");
        div.classList.add("submenu-position");
        if (document.getElementById("dark-mode").checked) div.classList.add("submenu-dark");
        building_all[document.getElementById("nationality").value][v].map((w) => {
            let li = document.createElement("li");
            li.id = v + "-" + w.name;
            li.innerHTML = w.name;
            li.onclick = () => onClickBuilding(li.id);
            ul.appendChild(li);
            count++;
        });
        div.style.setProperty("--count", -count - 1);
        div.appendChild(ul);
        label.appendChild(div);
    });
}

cursor.firstSelect = true;
cursor.firstHold = true;
cursor.isRangeShowed = false;
cursor.focus = null;
Object.defineProperty(cursor, "select", {
    get: function () {
        if (cursor.firstSelect) {
            select = "59-1";
            cursor.firstSelect = false;
        }
        return select;
    },
    set: function (newValue) {
        if (cursor.firstSelect) {
            select = "59-1";
            cursor.firstSelect = false;
        }
        if (document.getElementById(newValue).getAttribute("out_of_boundary") === "true") {
            return;
        }
        clearBuildingRange();
        if (document.getElementById(cursor.select)) {
            document.getElementById(cursor.select).classList.remove("cell-selected");
        }
        select = newValue;
        document.getElementById(newValue).classList.add("cell-selected");
        if (newValue) {
            document.getElementById("coord").innerHTML = newValue;
        } else {
            document.getElementById("coord").innerHTML = "无";
        }
        let range_size = document.getElementById(newValue).getAttribute("range_size");
        if (range_size) {
            let unit = newValue.split("-");
            showBuildingRange(unit[0], unit[1], unit[2], range_size);
            cursor.isRangeShowed = true;
        }
    },
});

Object.defineProperty(cursor, "hold", {
    get: function () {
        if (cursor.firstHold) {
            hold = null;
            cursor.firstHold = false;
        }
        return hold;
    },
    set: function (newValue) {
        if (cursor.firstHold) {
            hold = null;
            cursor.firstHold = false;
        }
        hold = newValue;
        if (!hold) {
            document.getElementById("hold").innerHTML = "无";
            document.getElementById("hold").style.color = "";
            document.getElementById("map-chessboard").style.cursor = "";
        } else {
            document.getElementById("hold").innerHTML = newValue;
            if (newValue === "删除建筑") {
                document.getElementById("hold").style.color = "red";
            } else {
                document.getElementById("hold").style.color = "";
                document.getElementById("map-chessboard").style.cursor = "";
            }
        }
    },
});

document.body.onmousedown = (e) => {
    isMouseDown = true;
    // if (e.path[0].id.search(pattern_id) > -1) {
    if (e.path[1].id === "map-mini-container") {
        isDragging = true;
        dragMapMiniFocus(e);
        return;
    }
    if (e.path[0].tagName !== "A" && e.path[3].id === "map-chessboard") {
        isDragging = true;
        if (!cursor.hold) {
            startScrollLeft = html.scrollLeft;
            startScrollTop = html.scrollTop;
            startX = e.clientX;
            startY = e.clientY;
            nowX = startX;
            nowY = startY;
        } else if (cursor.hold === "删除建筑") {
            deletionBlockBuffer.startX = e.pageX - 8;
            deletionBlockBuffer.startY = e.pageY - 49;
            deletionBlockBuffer.li = Math.ceil((e.pageY - 48) / 30);
            deletionBlockBuffer.co = Math.ceil((e.pageX - 7) / 30);
            toggleDeletionBlock(true);
            clearBuildingRange();
            cursor.select = e.path[0].id;
        }
    }
};

document.body.onmouseup = (e) => {
    isMouseDown = false;
    if (isDragging) {
        isDragging = false;
        if (!cursor.hold) {
            startScrollLeft = -1;
            startScrollTop = -1;
            startX = -1;
            startY = -1;
            nowX = -1;
            nowY = -1;
        } else if (cursor.hold === "删除建筑") {
            deletionBlockBuffer.width = e.pageX - deletionBlockBuffer.startX - 8;
            deletionBlockBuffer.height = e.pageY - deletionBlockBuffer.startY - 49;
            setDeletionBlock(
                deletionBlockBuffer.startX,
                deletionBlockBuffer.startY,
                deletionBlockBuffer.width,
                deletionBlockBuffer.height
            );
            let li = Math.ceil((e.pageY - 48) / 30);
            let co = Math.ceil((e.pageX - 7) / 30);
            removeBuildingsInBlock(
                deletionBlockBuffer.li,
                deletionBlockBuffer.co,
                co - deletionBlockBuffer.co,
                li - deletionBlockBuffer.li
            );
            deletionBlockBuffer = {};
            setDeletionBlock(0, 0, 0, 0);
            toggleDeletionBlock(false);
            let cell = document.getElementById(li + "-" + co);
            if (cell.hasAttribute("occupied")) {
                cursor.select = cell.getAttribute("occupied");
            } else {
                cursor.select = li + "-" + co;
            }
            return;
        }
    }
};

document.body.onmousemove = (e) => {
    if (isDragging) {
        if (!cursor.hold && e.path[3].id === "map-chessboard") {
            nowX = e.clientX;
            nowY = e.clientY;
            html.scrollLeft = startScrollLeft + (startX - nowX);
            html.scrollTop = startScrollTop + (startY - nowY);
            return;
        }
        if (cursor.hold === "删除建筑") {
            deletionBlockBuffer.width = e.pageX - deletionBlockBuffer.startX - 8;
            deletionBlockBuffer.height = e.pageY - deletionBlockBuffer.startY - 49;
            setDeletionBlock(
                deletionBlockBuffer.startX,
                deletionBlockBuffer.startY,
                deletionBlockBuffer.width,
                deletionBlockBuffer.height
            );
            return;
        }
        if (e.path[1].id === "map-mini-container") {
            dragMapMiniFocus(e);
            return;
        }
    }
};

document.onkeydown = (e) => {
    if (isDragging) return;
    let keyCode = e.keyCode || e.which || e.charCode;
    let ctrlKey = e.ctrlKey || e.metaKey;
    let spaceKey = e.spaceKey;
    //Space 取消放置
    if (keyCode === 32) {
        e.preventDefault();
        let building = getElementByCoord(nowLi, nowCo, nowSize, true);
        if (building) {
            removeBuilding(nowLi, nowCo, nowSize, true);
            nowLi = -1;
            nowCo = -1;
            nowSize = -1;
        }
        onClickCancle();
    }
    //Ctrl+C 复制选中的建筑
    if (ctrlKey && keyCode === 67) {
        let unit = cursor.select.split("-");
        if (unit.length === 2) return;
        let building = getElementByCoord(unit[0], unit[1], unit[2]);
        if (building.getAttribute("modify") !== "true") return;
        if (building.hasAttribute("road")) return;
        copiedBuilding = {};
        copiedBuilding.size = Number(unit[2]);
        copiedBuilding.text = building.firstElementChild
            ? building.innerHTML.substring(0, building.innerHTML.indexOf("<"))
            : building.innerHTML;
        copiedBuilding.modify = "true";
        copiedBuilding.color = building.style.color;
        copiedBuilding.background_color = building.style.backgroundColor;
        copiedBuilding.border_color = building.style.borderColor;
        if (building.hasAttribute("range_size")) {
            copiedBuilding.range_size = Number(building.getAttribute("range_size"));
        } else {
            copiedBuilding.range_size = 0;
        }
    }
    //Ctrl+V 在选中位置粘贴已复制的建筑
    if (ctrlKey && keyCode === 86 && copiedBuilding) {
        let unit = cursor.select.split("-");
        if (unit.length === 3 && getElementByCoord(unit[0], unit[1], unit[2]).hasAttribute("general")) {
            let building = getElementByCoord(unit[0], unit[1], unit[2]);
            let innerHTML = building.innerHTML;
            building.innerHTML =
                copiedBuilding.text + (innerHTML.indexOf("<") > -1 ? innerHTML.substr(innerHTML.indexOf("<")) : "");
            building.style.color = copiedBuilding.color;
            building.style.backgroundColor = copiedBuilding.background_color;
            building.style.borderColor = copiedBuilding.border_color;
            building.removeAttribute("general");
            if (copiedBuilding.range_size) {
                building.setAttribute("range_size", copiedBuilding.range_size);
            }
            if (isPortectionBuilding(copiedBuilding.text)) {
                building.innerHTML = copiedBuilding.text;
                building.setAttribute("protection", "true");
                setAroundBuildingProtectionNumber(unit[0], unit[1], copiedBuilding.size, copiedBuilding.range_size);
            }
            return;
        }
        if (unit.length === 3) return;
        insertBuilding(
            unit[0],
            unit[1],
            copiedBuilding.size,
            copiedBuilding.modify,
            copiedBuilding.text,
            copiedBuilding.color,
            copiedBuilding.background_color,
            copiedBuilding.border_color,
            copiedBuilding.range_size
        );
    }
};

window.onscroll = (e) => {
    freshMapMiniFocus(false);
    if (getScrollTop() <= 6) {
        document.getElementById("top-nav").classList.remove("top-nav-shadow");
        if (document.getElementById("dark-mode").checked) {
            document.getElementById("top-nav").classList.remove("top-nav-shadow-dark");
        }
    } else {
        if (!document.getElementById("top-nav").classList.contains("top-nav-shadow")) {
            document.getElementById("top-nav").classList.add("top-nav-shadow");
        }
        if (document.getElementById("dark-mode").checked) {
            if (!document.getElementById("top-nav").classList.contains("top-nav-shadow-dark")) {
                document.getElementById("top-nav").classList.add("top-nav-shadow-dark");
            }
        }
    }
    if (getScrollTop() + getWindowHeight() >= getScrollHeight() - 6) {
        document.getElementById("bottom-nav").classList.remove("bottom-nav-shadow");
        if (document.getElementById("dark-mode").checked) {
            document.getElementById("bottom-nav").classList.remove("bottom-nav-shadow-dark");
        }
    } else {
        if (!document.getElementById("bottom-nav").classList.contains("bottom-nav-shadow")) {
            document.getElementById("bottom-nav").classList.add("bottom-nav-shadow");
        }
        if (document.getElementById("dark-mode").checked) {
            if (!document.getElementById("bottom-nav").classList.contains("bottom-nav-shadow-dark")) {
                document.getElementById("bottom-nav").classList.add("bottom-nav-shadow-dark");
            }
        }
    }
};

window.onresize = () => {
    freshMapMiniFocus(true);
};

function init(type) {
    drawChessboard();
    clipEdge();
    drawBoundary();
    assignEvent();
    drawBarrier(type);
    drawFixedBuilding(type);
    drawBottomNav();
    onChangeScale();
    history.scrollRestoration = "manual";
    document.getElementById("44-90").scrollIntoView();
    forgeSign();
    freshMapMiniFocus(true);
}

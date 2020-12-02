function getID(li, co, size, tmp) {
    if (size && tmp) {
        return li.toString() + "-" + co.toString() + "-" + size.toString() + "-tmp";
    }
    if (size) {
        return li.toString() + "-" + co.toString() + "-" + size.toString();
    }
    if (tmp) {
        return li.toString() + "-" + co.toString() + "-tmp";
    }
    return li.toString() + "-" + co.toString();
}

function getElementByCoord(li, co, size, tmp) {
    return document.getElementById(getID(li, co, size, tmp));
}

function colorRGB2Hex(color) {
    var rgb = color.split(",");
    var r = parseInt(rgb[0].split("(")[1]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2].split(")")[0]);
    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
}

function optimizeBarrierBoundary(li, co, background_color) {
    let grid, adjGrid;
    grid = getElementByCoord(li, co, 1);
    adjGrid = getElementByCoord(li, co - 1, 1);
    if (
        adjGrid &&
        adjGrid.getAttribute("barrier") === "true" &&
        colorRGB2Hex(adjGrid.style.backgroundColor) === background_color
    ) {
        adjGrid.style.borderRight = "none";
        grid.style.borderLeft = "none";
    }
    adjGrid = getElementByCoord(li, co + 1, 1);
    if (
        adjGrid &&
        adjGrid.getAttribute("barrier") === "true" &&
        colorRGB2Hex(adjGrid.style.backgroundColor) === background_color
    ) {
        adjGrid.style.borderLeft = "none";
        grid.style.borderRight = "none";
    }
    adjGrid = getElementByCoord(li - 1, co, 1);
    if (
        adjGrid &&
        adjGrid.getAttribute("barrier") === "true" &&
        colorRGB2Hex(adjGrid.style.backgroundColor) === background_color
    ) {
        adjGrid.style.borderBottom = "none";
        grid.style.borderTop = "none";
    }
    adjGrid = getElementByCoord(li + 1, co, 1);
    if (
        adjGrid &&
        adjGrid.getAttribute("barrier") === "true" &&
        colorRGB2Hex(adjGrid.style.backgroundColor) === background_color
    ) {
        adjGrid.style.borderTop = "none";
        grid.style.borderBottom = "none";
    }
}

function isDirRoad(li, co, direction) {
    let grid = getElementByCoord(li, co, 1);
    if (direction) {
        return grid && grid.hasAttribute("road") && getRoadDir(li, co) == direction;
    }
    return grid && grid.hasAttribute("road");
}

function getRoadDir(li, co) {
    if (isDirRoad(li, co - 1) || isDirRoad(li, co + 1)) {
        return "horizontal";
    }
    if (isDirRoad(li - 1, co) && !isDirRoad(li - 1, co - 1) && !isDirRoad(li - 1, co + 1)) {
        return "vertical";
    }
    if (isDirRoad(li + 1, co) && !isDirRoad(li + 1, co - 1) && !isDirRoad(li + 1, co + 1)) {
        return "vertical";
    }
    return "null";
}

function setRoadCount(li, co, count) {
    getElementByCoord(li, co, 1).setAttribute("road_count", count);
}

function getRoadCount(li, co) {
    let count = Number(getElementByCoord(li, co, 1).getAttribute("road_count"));
    return count === 1 ? 0 : count;
}

function toggleRoadCount(li, co, show) {
    let grid = getElementByCoord(li, co, 1);
    if (!show) {
        grid.firstElementChild.innerHTML = "";
    } else {
        grid.firstElementChild.innerHTML = grid.getAttribute("road_count");
    }
}

function setDeletionBlock(left, top, width, height) {
    if (width < 0 && height > 0) {
        width = -width;
        left -= width;
    }
    if (width > 0 && height < 0) {
        height = -height;
        top -= height;
    }
    if (width < 0 && height < 0) {
        width = -width;
        left -= width;
        height = -height;
        top -= height;
    }
    deletionBlock.style.left = left + "px";
    deletionBlock.style.top = top + "px";
    deletionBlock.style.width = width + "px";
    deletionBlock.style.height = height + "px";
}

function toggleDeletionBlock(show) {
    if (show) {
        deletionBlock.style.display = "block";
    } else {
        deletionBlock.style.display = "none";
    }
}

function removeBuildingsInBlock(li, co, width, height) {
    if (width < 0 && height >= 0) {
        width = -width;
        co -= width;
    }
    if (width >= 0 && height < 0) {
        height = -height;
        li -= height;
    }
    if (width < 0 && height < 0) {
        width = -width;
        co -= width;
        height = -height;
        li -= height;
    }
    for (let i = li; i <= li + height; i++) {
        for (let j = co; j <= co + width; j++) {
            let cell = document.getElementById(i + "-" + j);
            if (cell.hasAttribute("occupied")) {
                let unit = cell.getAttribute("occupied").split("-");
                let building = getElementByCoord(Number(unit[0]), Number(unit[1]), Number(unit[2]));
                if (isPortectionBuilding(building.innerHTML)) {
                    clearAroundBuildingProtectionNumber(
                        Number(unit[0]),
                        Number(unit[1]),
                        Number(unit[2]),
                        Number(building.getAttribute("range_size"))
                    );
                }
                removeBuilding(Number(unit[0]), Number(unit[1]), Number(unit[2]));
            }
        }
    }
}

function isGridEmpty(li, co, size) {
    for (let i = li; i < li + size; i++) {
        for (let j = co; j < co + size; j++) {
            let cell = getElementByCoord(i, j);
            if (cell.getAttribute("modify") === "false") {
                return false;
            }
            if (cell.getAttribute("out_of_boundary") === "true") {
                return false;
            }
            if (cell.hasAttribute("occupied")) {
                return false;
            }
        }
    }
    return true;
}

function insertBuilding(li, co, size, modify, text, color, background_color, border_color, range_size, tmp, special) {
    if (!isGridEmpty(li, co, size)) return false;
    let building = document.createElement("span");
    building.classList.add("building");
    building.style.setProperty("--count", size);
    if (text === "道路") {
        building.innerHTML = "";
        building.setAttribute("road", "true");
        building.classList.add("road");
        if (!tmp) {
            let road_counter = document.createElement("span");
            building.appendChild(road_counter);
            building.setAttribute("road_count", 1);
            if (isDirRoad(li, co - 1)) {
                getElementByCoord(li, co - 1, 1).style.borderRight = "none";
                building.style.borderLeft = "none";
            }
            if (isDirRoad(li, co + 1)) {
                getElementByCoord(li, co + 1, 1).style.borderLeft = "none";
                building.style.borderRight = "none";
            }
            if (isDirRoad(li - 1, co)) {
                getElementByCoord(li - 1, co, 1).style.borderBottom = "none";
                building.style.borderTop = "none";
            }
            if (isDirRoad(li + 1, co)) {
                getElementByCoord(li + 1, co, 1).style.borderTop = "none";
                building.style.borderBottom = "none";
            }
        }
    } else {
        building.innerHTML = text;
        building.style.color = color;
        building.style.backgroundColor = background_color;
        building.style.borderColor = border_color;
    }
    if (text === "2x2" || text === "3x3" || text === "4x4" || text === "5x5") {
        building.setAttribute("general", size);
    }
    building.id = li.toString() + "-" + co.toString() + "-" + size.toString();
    if (tmp) {
        building.id += "-tmp";
    }
    building.setAttribute("modify", modify);
    let building_deleter = () => {
        if (cursor.hold === "删除建筑") {
            onDoubleClickBuilding();
        }
    };
    let building_replacer = (tmp, recovery) => {
        if (cursor.hold && cursor.hold !== "删除建筑") {
            let building_info = getBuildingInfo(cursor.hold.split("-")[0], cursor.hold.split("-")[1]);
            if (building_info.text !== text && building.hasAttribute("general") && building_info.size === size) {
                let innerHTML = building.innerHTML;
                if (tmp && recovery) {
                    let general_size = building.getAttribute("general");
                    building_info = getBuildingInfo("通用", general_size + "x" + general_size + "建筑");
                }
                building.innerHTML =
                    building_info.text + (innerHTML.indexOf("<") > -1 ? innerHTML.substr(innerHTML.indexOf("<")) : "");
                building.style.color = building_info.color;
                building.style.backgroundColor = building_info.background_color;
                building.style.borderColor = building_info.border_color;
                if (!tmp) {
                    building.removeAttribute("general");
                    if (building_info.range_size) {
                        building.setAttribute("range_size", building_info.range_size);
                    }
                    if (isPortectionBuilding(building_info.text)) {
                        building.innerHTML = building_info.text;
                        building.setAttribute("protection", "true");
                        setAroundBuildingProtectionNumber(li, co, size, building_info.range_size);
                    }
                    cursor.select = building.id;
                }
            }
        }
    };
    building.ondblclick = () => {
        onDoubleClickBuilding();
        onClickCancle();
    };
    building.onclick = () => {
        if (cursor.hold === "删除建筑") return;
        cursor.select = building.id;
        // building_deleter();
    };
    building.onmouseenter = () => {
        if (isMouseDown && modify === "true") {
            // if (cursor.hold === "删除建筑") cursor.select = building.id;
            // building_deleter();
            building_replacer();
            return;
        }
        building_replacer(true);
    };
    building.onmouseleave = () => {
        building_replacer(true, true);
    };
    building.onmousedown = () => {
        if (cursor.hold === "删除建筑") return;
        cursor.select = building.id;
        // building_deleter();
        building_replacer();
    };
    building.onmouseup = () => {
        if (cursor.hold === "道路" && roadsBuffer.length > 1) {
            if (li === roadsBuffer[0].li) {
                if (roadsBuffer[0].co > co) {
                    for (let k = roadsBuffer[0].co; k >= co; k--) {
                        if (!isGridEmpty(li, k, 1) && !isDirRoad(li, k)) return;
                    }
                    for (let k of roadsBuffer) {
                        removeBuilding(k.li, k.co, 1);
                    }
                    for (let k = roadsBuffer[0].co; k >= co; k--) {
                        insertBuilding(li, k, 1, "true", "道路", "#000000", color_road, "#000000");
                    }
                } else {
                    for (let k = roadsBuffer[0].co; k <= co; k++) {
                        if (!isGridEmpty(li, k, 1) && !isDirRoad(li, k)) return;
                    }
                    for (let k of roadsBuffer) {
                        removeBuilding(k.li, k.co, 1);
                    }
                    for (let k = roadsBuffer[0].co; k <= co; k++) {
                        insertBuilding(li, k, 1, "true", "道路", "#000000", color_road, "#000000");
                    }
                }
            }
            if (co === roadsBuffer[0].co) {
                if (roadsBuffer[0].li > li) {
                    for (let k = roadsBuffer[0].li; k >= li; k--) {
                        if (!isGridEmpty(k, co, 1) && !isDirRoad(k, co)) return;
                    }
                    for (let k of roadsBuffer) {
                        removeBuilding(k.li, k.co, 1);
                    }
                    for (let k = roadsBuffer[0].li; k >= li; k--) {
                        insertBuilding(k, co, 1, "true", "道路", "#000000", color_road, "#000000");
                    }
                } else {
                    for (let k = roadsBuffer[0].li; k <= li; k++) {
                        if (!isGridEmpty(k, co, 1) && !isDirRoad(k, co)) return;
                    }
                    for (let k of roadsBuffer) {
                        removeBuilding(k.li, k.co, 1);
                    }
                    for (let k = roadsBuffer[0].li; k <= li; k++) {
                        insertBuilding(k, co, 1, "true", "道路", "#000000", color_road, "#000000");
                    }
                }
            }
        }
        roadsBuffer = [];
    };
    if (range_size) {
        building.setAttribute("range_size", range_size);
    }
    if (!tmp) {
        for (let i = li; i < li + size; i++) {
            for (let j = co; j < co + size; j++) {
                getElementByCoord(i, j).setAttribute("occupied", building.id);
                getElementByCoord(i, j).classList.remove("border-full");
                getElementByCoord(i, j).classList.add("border-all-missing");
            }
        }
    }
    document.getElementById(li).insertBefore(building, getElementByCoord(li, co));
    if (text === "道路" && !tmp) {
        updateRoadsCount(li, co);
    }
    if (!tmp && isPortectionBuilding(text)) {
        building.setAttribute("protection", "true");
        setAroundBuildingProtectionNumber(li, co, size, range_size);
    } else if (!tmp && text != "道路" && background_color != color_tree) {
        for (let i = li; i < li + size; i++) {
            for (let j = co; j < co + size; j++) {
                let cell = getElementByCoord(i, j);
                label_protection_all[document.getElementById("nationality").value].map((v) => {
                    if (cell.hasAttribute(v) && cell.getAttribute(v).split("|").length > 0) {
                        let arr1 = cell.getAttribute(v).split("|");
                        let arr2 = building.hasAttribute(v) ? building.getAttribute(v).split("|") : [];
                        building.setAttribute(v, concat(arr1, arr2).join("|"));
                    }
                });
            }
        }
        let count = 0;
        label_protection_all[document.getElementById("nationality").value].map((v) => {
            if (building.hasAttribute(v)) count++;
        });
        if (count > 0) {
            let protection_number = document.createElement("span");
            protection_number.innerHTML = count;
            building.appendChild(protection_number);
        }
    }
    return true;
}

function removeBuilding(li, co, size, tmp, compulsory) {
    if (getElementByCoord(li, co).getAttribute("out_of_boundary") === "true") {
        return false;
    }
    if (getElementByCoord(li, co).getAttribute("modify") === "false" && !compulsory) {
        return false;
    }
    let building = getElementByCoord(li, co, size);
    if (tmp) {
        building = getElementByCoord(li, co, size, tmp);
    }
    if (!building) {
        return false;
    }
    if (building.getAttribute("modify") === "false" && !compulsory) {
        console.log("固定建筑，无法删除！");
        return false;
    }
    if (building.getAttribute("road") === "true" && !tmp) {
        if (isDirRoad(li, co - 1)) {
            getElementByCoord(li, co - 1, 1).style.borderRight = "";
        }
        if (isDirRoad(li, co + 1)) {
            getElementByCoord(li, co + 1, 1).style.borderLeft = "";
        }
        if (isDirRoad(li - 1, co)) {
            getElementByCoord(li - 1, co, 1).style.borderBottom = "";
        }
        if (isDirRoad(li + 1, co)) {
            getElementByCoord(li + 1, co, 1).style.borderTop = "";
        }
    }
    if (!tmp) {
        for (let i = li; i < li + size; i++) {
            for (let j = co; j < co + size; j++) {
                getElementByCoord(i, j).removeAttribute("occupied");
                getElementByCoord(i, j).classList.remove("border-all-missing");
                getElementByCoord(i, j).classList.add("border-full");
            }
        }
    }
    document.getElementById(li).removeChild(building);
    if (building.getAttribute("road") === "true" && !tmp) {
        updateRoadsCount(li, co);
    }
    return true;
}

function showBuildingRange(li, co, size, range_size) {
    for (let i = li - range_size; i < li; i++) {
        for (
            let j = co - range_size + Math.max(li - i - range_size + 4, 0);
            j < co + range_size + size - Math.max(li - i - range_size + 4, 0);
            j++
        ) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            let cell = getElementByCoord(i, j);
            if (cell.getAttribute("out_of_boundary") === "true") continue;
            cell.classList.add("building-range");
            if (cell.hasAttribute("occupied")) {
                document.getElementById(cell.getAttribute("occupied")).classList.add("building-range");
            }
        }
    }
    for (let i = li; i < li + size; i++) {
        for (let j = co - range_size; j < co + range_size + size; j++) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            let cell = getElementByCoord(i, j);
            if (cell.getAttribute("out_of_boundary") === "true") continue;
            cell.classList.add("building-range");
            if (cell.hasAttribute("occupied")) {
                document.getElementById(cell.getAttribute("occupied")).classList.add("building-range");
            }
        }
    }
    for (let i = li + size; i < li + size + range_size; i++) {
        for (
            let j = co - range_size + Math.max(i - li - range_size + 5 - size, 0);
            j < co + range_size + size - Math.max(i - li - range_size + 5 - size, 0);
            j++
        ) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            let cell = getElementByCoord(i, j);
            if (cell.getAttribute("out_of_boundary") === "true") continue;
            cell.classList.add("building-range");
            if (cell.hasAttribute("occupied")) {
                document.getElementById(cell.getAttribute("occupied")).classList.add("building-range");
            }
        }
    }
}

function clearBuildingRange() {
    if (cursor.isRangeShowed) {
        let unit = cursor.select.split("-");
        clearBuildingRangeCore(
            Number(unit[0]),
            Number(unit[1]),
            Number(unit[2]),
            Number(document.getElementById(cursor.select).getAttribute("range_size"))
        );
        cursor.isRangeShowed = false;
    }
}

function clearBuildingRangeCore(li, co, size, range_size) {
    for (let i = li - range_size; i < li + range_size + size; i++) {
        for (let j = co - range_size; j < co + range_size + size; j++) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            if (getElementByCoord(i, j).classList.contains("building-range")) {
                getElementByCoord(i, j).classList.remove("building-range");
            }
            if (getElementByCoord(i, j).hasAttribute("occupied")) {
                document
                    .getElementById(getElementByCoord(i, j).getAttribute("occupied"))
                    .classList.remove("building-range");
            }
        }
    }
}

function exportRaw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(ev);
}

function getBuildingInfo(building_label, building_name) {
    if (building_label == "道路") {
        return {
            text: "道路",
        };
    }
    let nationality = document.getElementById("nationality").value;
    for (let i = 0; i < building_all[nationality][building_label].length; i++) {
        if (building_all[nationality][building_label][i].name === building_name) {
            return building_all[nationality][building_label][i];
        }
    }
}

function getBuildingInfoByText(building_text) {
    let nationality = document.getElementById("nationality").value;
    for (let label in building_all[nationality]) {
        for (let i = 0; i < building_all[nationality][label].length; i++) {
            if (building_all[nationality][label][i].text === building_text) {
                return [label, building_all[nationality][label][i].name];
            }
        }
    }
    return [];
}

function clearChessboard(barrier) {
    clearBuildingRange();
    for (let i = 1; i <= 116; i++) {
        for (let j = 1; j <= 116; j++) {
            if (getElementByCoord(i, j).getAttribute("out_of_boundary") === "true") continue;
            let cell = getElementByCoord(i, j);
            if (cell.hasAttribute("occupied")) {
                let unit = cell.getAttribute("occupied").split("-");
                removeBuilding(Number(unit[0]), Number(unit[1]), Number(unit[2]), false, barrier);
            }
            label_protection_all[document.getElementById("nationality").value].map((v) => {
                if (cell.hasAttribute(v)) cell.removeAttribute(v);
            });
        }
    }
}

function isPortectionBuilding(text) {
    return label_protection_all[document.getElementById("nationality").value].indexOf(text) > -1 ? true : false;
}

function setAroundBuildingProtectionNumberProcess1(li, co, self_id, self_text) {
    let cell = getElementByCoord(li, co);
    if (cell.getAttribute("out_of_boundary") === "true") return;
    if (cell.hasAttribute("occupied")) {
        if (document.getElementById(cell.getAttribute("occupied")).getAttribute("protection") === "true") return;
        if (document.getElementById(cell.getAttribute("occupied")).getAttribute("barrier") === "true") return;
        if (document.getElementById(cell.getAttribute("occupied")).getAttribute("road") === "true") return;
        let building = document.getElementById(cell.getAttribute("occupied"));
        if (building.hasAttribute(self_text) && building.getAttribute(self_text).split("|").length > 0) {
            let protection = building.getAttribute(self_text).split("|");
            if (protection.indexOf(self_id) > -1) return;
            protection.push(self_id);
            building.setAttribute(self_text, protection.join("|"));
            return;
        }
        if (building.firstElementChild) {
            building.firstElementChild.innerHTML = Number(building.firstElementChild.innerHTML) + 1;
            building.setAttribute(self_text, self_id);
            return;
        }
        let protection_number = document.createElement("span");
        protection_number.innerHTML = 1;
        building.appendChild(protection_number);
        building.setAttribute(self_text, self_id);
    }
}

function setAroundBuildingProtectionNumberProcess2(li, co, self_id, self_text) {
    let cell = getElementByCoord(li, co);
    if (cell.getAttribute("out_of_boundary") === "true") return;
    if (cell.hasAttribute(self_text) && cell.getAttribute(self_text).split("|").length > 0) {
        let protection = cell.getAttribute(self_text).split("|");
        if (protection.indexOf(self.id) > -1) return;
        protection.push(self_id);
        cell.setAttribute(self_text, protection.join("|"));
        return;
    }
    cell.setAttribute(self_text, self_id);
}

function setAroundBuildingProtectionNumber(li, co, size, range_size) {
    let self = getElementByCoord(li, co, size);
    let text = self.innerHTML;
    if (!isPortectionBuilding(self.innerHTML)) return;
    for (let i = li - range_size; i < li; i++) {
        for (
            let j = co - range_size + Math.max(li - i - range_size + 4, 0);
            j < co + range_size + size - Math.max(li - i - range_size + 4, 0);
            j++
        ) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            setAroundBuildingProtectionNumberProcess1(i, j, self.id, text);
            setAroundBuildingProtectionNumberProcess2(i, j, self.id, text);
        }
    }
    for (let i = li; i < li + size; i++) {
        for (let j = co - range_size; j < co + range_size + size; j++) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            setAroundBuildingProtectionNumberProcess1(i, j, self.id, text);
            setAroundBuildingProtectionNumberProcess2(i, j, self.id, text);
        }
    }
    for (let i = li + size; i < li + size + range_size; i++) {
        for (
            let j = co - range_size + Math.max(i - li - range_size + 5 - size, 0);
            j < co + range_size + size - Math.max(i - li - range_size + 5 - size, 0);
            j++
        ) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            setAroundBuildingProtectionNumberProcess1(i, j, self.id, text);
            setAroundBuildingProtectionNumberProcess2(i, j, self.id, text);
        }
    }
}

function clearAroundBuildingProtectionNumberProcess1(li, co, self_id, self_text) {
    let cell = getElementByCoord(li, co);
    if (cell.getAttribute("out_of_boundary") === "true") return;
    if (cell.hasAttribute("occupied")) {
        if (document.getElementById(cell.getAttribute("occupied")).getAttribute("barrier") === "true") return;
        if (document.getElementById(cell.getAttribute("occupied")).getAttribute("road") === "true") return;
        if (document.getElementById(cell.getAttribute("occupied")).getAttribute("protection") === "true") return;
        let building = document.getElementById(cell.getAttribute("occupied"));
        if (building.hasAttribute(self_text)) {
            let protection = building.getAttribute(self_text).split("|");
            let flag = protection.indexOf(self_id);
            if (flag > -1) {
                protection.splice(flag, 1);
                building.setAttribute(self_text, protection.join("|"));
            }
            if (protection.length === 0) {
                let count = 0;
                label_protection_all[document.getElementById("nationality").value].map((v) => {
                    if (building.hasAttribute(v) && building.getAttribute(v).indexOf("-") > -1) count++;
                });
                if (count > 0) {
                    building.firstElementChild.innerHTML = count;
                } else if (count === 0 && building.firstElementChild) {
                    building.removeChild(building.firstElementChild);
                }
                building.removeAttribute(self_text);
            }
        }
    }
}

function clearAroundBuildingProtectionNumberProcess2(li, co, self_id, self_text) {
    let cell = getElementByCoord(li, co);
    if (cell.getAttribute("out_of_boundary") === "true") return;
    let protection = cell.getAttribute(self_text).split("|");
    let flag = protection.indexOf(self_id);
    protection.splice(flag, 1);
    if (protection.length === 0) {
        cell.removeAttribute(self_text);
    } else {
        cell.setAttribute(self_text, protection.join("|"));
    }
}

function clearAroundBuildingProtectionNumber(li, co, size, range_size) {
    let self = getElementByCoord(li, co, size);
    let text = self.innerHTML;
    if (!isPortectionBuilding(self.innerHTML)) return;
    for (let i = li - range_size; i < li; i++) {
        for (
            let j = co - range_size + Math.max(li - i - range_size + 4, 0);
            j < co + range_size + size - Math.max(li - i - range_size + 4, 0);
            j++
        ) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            clearAroundBuildingProtectionNumberProcess1(i, j, self.id, text);
            clearAroundBuildingProtectionNumberProcess2(i, j, self.id, text);
        }
    }
    for (let i = li; i < li + size; i++) {
        for (let j = co - range_size; j < co + range_size + size; j++) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            clearAroundBuildingProtectionNumberProcess1(i, j, self.id, text);
            clearAroundBuildingProtectionNumberProcess2(i, j, self.id, text);
        }
    }
    for (let i = li + size; i < li + size + range_size; i++) {
        for (
            let j = co - range_size + Math.max(i - li - range_size + 5 - size, 0);
            j < co + range_size + size - Math.max(i - li - range_size + 5 - size, 0);
            j++
        ) {
            if (i < 1 || j < 1) continue;
            if (i > 116 || j > 116) continue;
            clearAroundBuildingProtectionNumberProcess1(i, j, self.id, text);
            clearAroundBuildingProtectionNumberProcess2(i, j, self.id, text);
        }
    }
}

function refreshRoadsBorder(li, co) {
    if (isDirRoad(li - 1, co)) {
        getElementByCoord(li - 1, co, 1).style.borderBottom = "1px solid #a8a8a8";
        getElementByCoord(li, co, 1).style.borderTop = "1px solid #a8a8a8";
        if (isDirRoad(li - 1, co, "vertical") || isDirRoad(li - 1, co, "null")) toggleRoadCount(li, co, true);
    }
    if (isDirRoad(li + 1, co)) {
        getElementByCoord(li, co, 1).style.borderBottom = "1px solid #a8a8a8";
        getElementByCoord(li + 1, co, 1).style.borderTop = "1px solid #a8a8a8";
        if (isDirRoad(li + 1, co, "vertical") || isDirRoad(li + 1, co, "null")) toggleRoadCount(li, co, true);
    }
}

function updateRoadsCount(li, co) {
    let neighbors = [];
    let ancillary = [-1, 0, 1];
    for (let i = 0; i < ancillary.length; i++) {
        for (let j = 0; j < ancillary.length; j++) {
            if (isDirRoad(li + ancillary[i], co + ancillary[j])) {
                neighbors.push({ li: li + ancillary[i], co: co + ancillary[j] });
            }
        }
    }
    for (let v of neighbors) {
        if (getRoadDir(v.li, v.co) == "horizontal") {
            let hasLeft = false;
            if (isDirRoad(v.li, v.co - 1)) {
                let count = getRoadCount(v.li, v.co - 1);
                if (!count) {
                    setRoadCount(v.li, v.co - 1, 1);
                    setRoadCount(v.li, v.co, 2);
                    toggleRoadCount(v.li, v.co - 1, true);
                } else {
                    setRoadCount(v.li, v.co, count + 1);
                    if (count > 1) toggleRoadCount(v.li, v.co - 1, false);
                }
                toggleRoadCount(v.li, v.co, true);
                getElementByCoord(v.li, v.co - 1, 1).style.borderRight = "none";
                getElementByCoord(v.li, v.co, 1).style.borderLeft = "none";
                refreshRoadsBorder(v.li, v.co - 1);
                refreshRoadsBorder(v.li, v.co);
                hasLeft = true;
            }
            if (isDirRoad(v.li, v.co + 1)) {
                let count = getRoadCount(v.li, v.co);
                if (!count || !hasLeft) {
                    setRoadCount(v.li, v.co, 1);
                    setRoadCount(v.li, v.co + 1, 2);
                    toggleRoadCount(v.li, v.co, true);
                    count = 1;
                } else {
                    setRoadCount(v.li, v.co + 1, count + 1);
                    if (count > 1) toggleRoadCount(v.li, v.co, false);
                }
                toggleRoadCount(v.li, v.co + 1, true);
                getElementByCoord(v.li, v.co, 1).style.borderRight = "none";
                getElementByCoord(v.li, v.co + 1, 1).style.borderLeft = "none";
                refreshRoadsBorder(v.li, v.co);
                refreshRoadsBorder(v.li, v.co + 1);
                count += 2;
                let co_idx = v.co + 2;
                while (isDirRoad(v.li, co_idx, "horizontal")) {
                    setRoadCount(v.li, co_idx, count);
                    toggleRoadCount(v.li, co_idx - 1, false);
                    toggleRoadCount(v.li, co_idx, true);
                    getElementByCoord(v.li, co_idx, 1).style.borderLeft = "none";
                    refreshRoadsBorder(v.li, co_idx - 1);
                    count++;
                    co_idx++;
                }
            }
        }
    }
    for (let v of neighbors) {
        if (getRoadDir(v.li, v.co) == "vertical") {
            let hasTop = false;
            if (isDirRoad(v.li - 1, v.co, "vertical")) {
                let count = getRoadCount(v.li - 1, v.co);
                if (!count) {
                    setRoadCount(v.li - 1, v.co, 1);
                    setRoadCount(v.li, v.co, 2);
                    toggleRoadCount(v.li - 1, v.co, true);
                } else {
                    setRoadCount(v.li, v.co, count + 1);
                    if (count > 1) toggleRoadCount(v.li - 1, v.co, false);
                }
                toggleRoadCount(v.li, v.co, true);
                getElementByCoord(v.li - 1, v.co, 1).style.borderBottom = "none";
                getElementByCoord(v.li, v.co, 1).style.borderTop = "none";
                hasTop = true;
            }
            if (isDirRoad(v.li + 1, v.co, "vertical")) {
                let count = getRoadCount(v.li, v.co);
                if (!count || !hasTop) {
                    setRoadCount(v.li, v.co, 1);
                    setRoadCount(v.li + 1, v.co, 2);
                    toggleRoadCount(v.li, v.co, true);
                    count = 1;
                } else {
                    setRoadCount(v.li + 1, v.co, count + 1);
                    if (count > 1) toggleRoadCount(v.li, v.co, false);
                }
                toggleRoadCount(v.li + 1, v.co, true);
                getElementByCoord(v.li, v.co, 1).style.borderBottom = "none";
                getElementByCoord(v.li + 1, v.co, 1).style.borderTop = "none";
                count += 2;
                let li_idx = v.li + 2;
                while (isDirRoad(li_idx, v.co, "vertical")) {
                    setRoadCount(li_idx, v.co, count);
                    toggleRoadCount(li_idx - 1, v.co, false);
                    toggleRoadCount(li_idx, v.co, true);
                    getElementByCoord(li_idx, v.co, 1).style.borderTop = "none";
                    count++;
                    li_idx++;
                }
            }
        }
        if (getRoadDir(v.li, v.co) == "null") {
            setRoadCount(v.li, v.co, "");
            toggleRoadCount(v.li, v.co, false);
            refreshRoadsBorder(v.li, v.co);
        }
    }
}

function concat(arr1, arr2) {
    var arr = arr1.slice(0);
    for (var i = 0; i < arr2.length; i++) {
        arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
    }
    return arr;
}

function restoreAfterScreenshot(scale, isRotated) {
    document.getElementById(cursor.select).classList.add("cell-selected");
    document.getElementById("scale").value = scale;
    document.getElementById("rotate").checked = isRotated;
    onChangeScale();
    onClickRotate();
    document.getElementById("top-nav").classList.remove("frosted-glass");
    document.getElementById("map-chessboard").classList.remove("frosted-glass");
    document.getElementById("bottom-nav").classList.remove("frosted-glass");
    document.getElementById("image-transition").style.display = "none";
    document.getElementById("loading").style.display = "none";
}

function downloadScreenshot(filename, blob) {
    let url = URL.createObjectURL(blob);
    document.getElementById("download").setAttribute("href", url);
    document.getElementById("download").setAttribute("download", filename);
    document.getElementById("download").click();
}

function forgeSign() {
    if (document.getElementById("sign")) {
        document.getElementById("map-chessboard").removeChild(document.getElementById("sign"));
    }
    let signHtml = document.createElement("div");
    signHtml.id = "sign";
    let span0 = document.createElement("span");
    let span1 = document.createElement("span");
    let span2 = document.createElement("span");
    let span3 = document.createElement("span");
    let a0 = document.createElement("a");
    let a1 = document.createElement("a");
    let a2 = document.createElement("a");
    let aType = document.createElement("a");
    let aNationality = document.createElement("a");
    let aLabel = document.createElement("a");
    span0.innerHTML = "From the Map Editor " + versionNum + " Implemented by ";
    span1.innerHTML = "Github: ";
    span2.innerHTML = "Email: ";
    a0.innerHTML = "Glutamine525";
    a1.innerHTML = "https://github.com/Glutamine525/SimEmpireMapEditor";
    a1.href = "https://github.com/Glutamine525/SimEmpireMapEditor";
    a0.id = "sign-name";
    a1.id = "sign-github";
    a2.id = "sign-email";
    a2.innerHTML = "glutamine525@gmail.com";
    aType.innerHTML = document.getElementById("type").value.toString() + "木";
    aNationality.innerHTML = label_nationality[document.getElementById("nationality").value];
    aLabel.innerHTML = "地图布局";
    aType.style.color = "#4b4bfd";
    aNationality.style.color = "#f54d4d";
    aLabel.style.color = "inherit";
    span3.style.fontSize = "100px";
    if (document.getElementById("dark-mode").checked) {
        a0.classList.toggle("a-dark");
        a1.classList.toggle("a-dark");
        a2.classList.toggle("a-dark");
    }
    span0.appendChild(a0);
    span1.appendChild(a1);
    span2.appendChild(a2);
    span3.append(aNationality, aType, aLabel);
    signHtml.appendChild(span3);
    signHtml.appendChild(span0);
    signHtml.appendChild(span1);
    signHtml.appendChild(span2);
    document.getElementById("map-chessboard").appendChild(signHtml);
}

function screenshot() {
    let loading = document.getElementById("loading");
    let record_scale = document.getElementById("scale").value;
    let record_isRotated = document.getElementById("rotate").checked;
    let sign = document.getElementById("sign");
    clearBuildingRange();
    document.getElementById(cursor.select).classList.remove("cell-selected");
    document.getElementById("scale").value = 1;
    document.getElementById("rotate").checked = false;
    onChangeScale();
    onClickRotate();
    document.getElementById("top-nav").classList.add("frosted-glass");
    document.getElementById("map-chessboard").classList.add("frosted-glass");
    document.getElementById("bottom-nav").classList.add("frosted-glass");
    loading.style.display = "block";
    let config1 = {
        useCORS: true,
        width: 116 * 30,
        scale: 2,
        backgroundColor: "#eef1f1",
    };
    if (record_isRotated) {
        sign.classList.add("sign-rotate");
        config1.width = 116 * 30 + 300;
    }
    if (document.getElementById("dark-mode").checked) {
        config1.backgroundColor = "#1b1e2b";
    }
    html2canvas(document.querySelector("#map-chessboard"), config1).then(function (canvas1) {
        let timers = new Date();
        let fullYear = timers.getFullYear();
        let month = timers.getMonth() + 1;
        let date = timers.getDate() < 10 ? "0" + timers.getDate() : timers.getDate();
        let randoms = Math.random() + "";
        let numberFileName = fullYear + "" + month + date + randoms.slice(3, 10);
        let filename = numberFileName + ".jpeg";
        let img = document.getElementById("image-transition");
        img.style.display = "block";
        canvas1.toBlob((blob) => {
            if (record_isRotated) {
                img.src = URL.createObjectURL(blob);
                img.style.transform = "rotate(45deg)";
                img.setAttribute("crossOrigin", "anonymous");
                let config2 = {
                    useCORS: true,
                    x: 499,
                    y: 3811,
                    width: 6151,
                    height: 6151,
                    backgroundColor: "#eef1f1",
                };
                if (document.getElementById("dark-mode").checked) {
                    config2.backgroundColor = "#1b1e2b";
                }
                html2canvas(img, config2).then((canvas2) => {
                    canvas2.toBlob((blob) => {
                        downloadScreenshot(filename, blob);
                        restoreAfterScreenshot(record_scale, record_isRotated);
                    });
                });
            } else {
                downloadScreenshot(filename, blob);
                restoreAfterScreenshot(record_scale, record_isRotated);
            }
        });
    });
}

function getScrollTop() {
    let scrollTop = 0,
        bodyScrollTop = 0,
        documentScrollTop = 0;
    if (document.body) {
        bodyScrollTop = document.body.scrollTop;
    }
    if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = bodyScrollTop - documentScrollTop > 0 ? bodyScrollTop : documentScrollTop;
    return scrollTop;
}

function getScrollHeight() {
    let scrollHeight = 0,
        bodyScrollHeight = 0,
        documentScrollHeight = 0;
    if (document.body) {
        bodyScrollHeight = document.body.scrollHeight;
    }
    if (document.documentElement) {
        documentScrollHeight = document.documentElement.scrollHeight;
    }
    scrollHeight = bodyScrollHeight - documentScrollHeight > 0 ? bodyScrollHeight : documentScrollHeight;
    return scrollHeight;
}

function getWindowHeight() {
    var windowHeight = 0;
    if (document.compatMode == "CSS1Compat") {
        windowHeight = document.documentElement.clientHeight;
    } else {
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}

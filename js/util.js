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

function isDirRoad(li, co, direction) {
    if (direction) {
        return (
            getElementByCoord(li, co, 1) &&
            getElementByCoord(li, co, 1).hasAttribute("road") &&
            getRoadDir(li, co) == direction
        );
    }
    return getElementByCoord(li, co, 1) && getElementByCoord(li, co, 1).hasAttribute("road");
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
    getElementByCoord(li, co, 1).firstElementChild.innerHTML = count;
}

function getRoadCount(li, co) {
    if (getElementByCoord(li, co, 1).firstElementChild.innerHTML)
        return Number(getElementByCoord(li, co, 1).firstElementChild.innerHTML);
    else return 0;
}

function insertBuilding(li, co, size, modify, text, color, background_color, border_color, range_size, tmp, special) {
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
    // if (modify && special) {
    //     building.setAttribute("belong", "special")
    // } else if (modify) {
    //     building.setAttribute("belong", getBuildingInfoByText(text).join("-"))
    // }
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
                if (!tmp) building.removeAttribute("general");
            }
        }
    };
    building.ondblclick = () => {
        onDoubleClickBuilding();
        onClickCancle();
    };
    building.onclick = () => {
        cursor.select = building.id;
        building_deleter();
    };

    building.onmouseenter = () => {
        if (isMouseDown) {
            cursor.select = building.id;
            building_deleter();
            building_replacer();
            return;
        }
        building_replacer(true);
    };
    building.onmouseleave = () => {
        building_replacer(true, true);
    };
    building.onmousedown = () => {
        cursor.select = building.id;
        building_deleter();
        building_replacer();
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
            cell.classList.add("building-range");
            if (cell.hasAttribute("occupied")) {
                document.getElementById(cell.getAttribute("occupied")).classList.add("building-range");
            }
        }
    }
}

function clearBuildingRange(li, co, size, range_size) {
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
    if (cursor.isRangeShowed) {
        let unit = select.split("-");
        clearBuildingRange(
            Number(unit[0]),
            Number(unit[1]),
            Number(unit[2]),
            Number(document.getElementById(select).getAttribute("range_size"))
        );
        cursor.isRangeShowed = false;
    }
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
        getElementByCoord(li - 1, co, 1).style.borderBottom = "1px dotted";
        getElementByCoord(li, co, 1).style.borderTop = "1px dotted";
    }
    if (isDirRoad(li + 1, co)) {
        getElementByCoord(li, co, 1).style.borderBottom = "1px dotted";
        getElementByCoord(li + 1, co, 1).style.borderTop = "1px dotted";
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
                } else setRoadCount(v.li, v.co, count + 1);
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
                    count = 1;
                } else setRoadCount(v.li, v.co + 1, count + 1);
                getElementByCoord(v.li, v.co, 1).style.borderRight = "none";
                getElementByCoord(v.li, v.co + 1, 1).style.borderLeft = "none";
                refreshRoadsBorder(v.li, v.co);
                refreshRoadsBorder(v.li, v.co + 1);
                if (v.li != li) continue;
                count += 2;
                let co_idx = v.co + 2;
                while (isDirRoad(v.li, co_idx, "horizontal")) {
                    setRoadCount(v.li, co_idx, count);
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
                } else setRoadCount(v.li, v.co, count + 1);
                getElementByCoord(v.li - 1, v.co, 1).style.borderBottom = "none";
                getElementByCoord(v.li, v.co, 1).style.borderTop = "none";
                hasTop = true;
            }
            if (isDirRoad(v.li + 1, v.co, "vertical")) {
                let count = getRoadCount(v.li, v.co);
                if (!count || !hasTop) {
                    setRoadCount(v.li, v.co, 1);
                    setRoadCount(v.li + 1, v.co, 2);
                    count = 1;
                } else setRoadCount(v.li + 1, v.co, count + 1);
                getElementByCoord(v.li, v.co, 1).style.borderBottom = "none";
                getElementByCoord(v.li + 1, v.co, 1).style.borderTop = "none";
                count += 2;
                let li_idx = v.li + 2;
                while (isDirRoad(li_idx, v.co, "vertical")) {
                    setRoadCount(li_idx, v.co, count);
                    getElementByCoord(li_idx, v.co, 1).style.borderTop = "none";
                    count++;
                    li_idx++;
                }
            }
        }
        if (getRoadDir(v.li, v.co) == "null") {
            setRoadCount(v.li, v.co, "");
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

function screenshot() {
    let loading = document.getElementById("loading");
    let record_scale = document.getElementById("scale").value;
    let record_isRotated = document.getElementById("rotate").checked;
    if (cursor.isRangeShowed) {
        let unit = cursor.select.split("-");
        clearBuildingRange(
            Number(unit[0]),
            Number(unit[1]),
            Number(unit[2]),
            Number(document.getElementById(select).getAttribute("range_size"))
        );
        cursor.isRangeShowed = false;
    }
    document.getElementById(cursor.select).classList.remove("cell-selected");
    document.getElementById("scale").value = 1;
    document.getElementById("rotate").checked = false;
    onChangeScale();
    onClickRotate();
    document.getElementById("top-nav").classList.add("frosted-glass");
    document.getElementById("map-chessboard").classList.add("frosted-glass");
    document.getElementById("bottom-nav").classList.add("frosted-glass");
    loading.style.display = "block";
    html2canvas(document.querySelector("#map-chessboard"), {
        useCORS: true,
        width: 116 * 30,
    }).then(function (canvas1) {
        let timers = new Date();
        let fullYear = timers.getFullYear();
        let month = timers.getMonth() + 1;
        let date = timers.getDate();
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
                html2canvas(img, { useCORS: true }).then((canvas2) => {
                    canvas2.toBlob((blob) => {
                        var url = URL.createObjectURL(blob);
                        document.getElementById("download").setAttribute("href", url);
                        document.getElementById("download").setAttribute("download", filename);
                        document.getElementById("download").click();
                        document.getElementById(cursor.select).classList.add("cell-selected");
                        document.getElementById("scale").value = record_scale;
                        document.getElementById("rotate").checked = record_isRotated;
                        onChangeScale();
                        onClickRotate();
                        document.getElementById("top-nav").classList.remove("frosted-glass");
                        document.getElementById("map-chessboard").classList.remove("frosted-glass");
                        document.getElementById("bottom-nav").classList.remove("frosted-glass");
                        img.style.display = "none";
                        loading.style.display = "none";
                    });
                });
            } else {
                var url = URL.createObjectURL(blob);
                document.getElementById("download").setAttribute("href", url);
                document.getElementById("download").setAttribute("download", filename);
                document.getElementById("download").click();
                document.getElementById(cursor.select).classList.add("cell-selected");
                document.getElementById("scale").value = record_scale;
                document.getElementById("rotate").checked = record_isRotated;
                onChangeScale();
                onClickRotate();
                document.getElementById("top-nav").classList.remove("frosted-glass");
                document.getElementById("map-chessboard").classList.remove("frosted-glass");
                document.getElementById("bottom-nav").classList.remove("frosted-glass");
                img.style.display = "none";
                loading.style.display = "none";
            }
        });
    });
}

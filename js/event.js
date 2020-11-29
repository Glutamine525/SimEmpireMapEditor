function onClickBuilding(building) {
    cursor.hold = building
}

function onClickCancle() {
    cursor.hold = null
}

function onClickRemove() {
    cursor.hold = "删除建筑"
}

function onDoubleClickBuilding() {
    if (!cursor.select) return
    let unit = cursor.select.split("-")
    let building = document.getElementById(cursor.select)
    if (unit.length !== 3) {
        return
    }
    if (cursor.isRangeShowed) {
        clearBuildingRange(
            Number(unit[0]),
            Number(unit[1]),
            Number(unit[2]),
            Number(document.getElementById(cursor.select).getAttribute("range_size"))
        )
        cursor.isRangeShowed = false
    }
    cursor.select = unit[0] + "-" + unit[1]
    if (isPortectionBuilding(building.innerHTML)) {
        clearAroundBuildingProtectionNumber(
            Number(unit[0]),
            Number(unit[1]),
            Number(unit[2]),
            Number(building.getAttribute("range_size"))
        )
    }
    if (!removeBuilding(
            Number(unit[0]),
            Number(unit[1]),
            Number(unit[2])
        )) {
        cursor.select = unit.join("-")
    }
}

function onClickNoWood(type) {
    if (document.getElementById("no-wood").checked) {
        coord_barrier_tree[type - 3].map(function(v) {
            let unit = v.split("-")
            removeBuilding(Number(unit[0]), Number(unit[1]), 1, false, true)
        })
    } else {
        coord_barrier_tree[type - 3].map(function(v) {
            let cell = document.getElementById(v)
            if (cell.hasAttribute("occupied")) {
                let unit = cell.getAttribute("occupied").split("-")
                removeBuilding(Number(unit[0]), Number(unit[1]), Number(unit[2]), false, true)
            }
            let unit = v.split("-")
            insertBuilding(Number(unit[0]), Number(unit[1]), 1, "false", "", "#000000", color_tree, "#000000")
            getElementByCoord(Number(unit[0]), Number(unit[1]), 1).setAttribute("barrier", "true")
        })
    }
}

function onClickRotate() {
    if (document.getElementById("rotate").checked) {
        document.getElementById("map-chessboard").classList.add("rotate")
    }
    else {
        document.getElementById("map-chessboard").classList.remove("rotate")
    }
}

function onChangeNationality() {
    drawBottomNav(true)
}

var last_info = "/3/true/衙门-高宅/#ff0000/#ffff00/#ff0000/0"

function onClickSpecialBuilding() {
    let hint = "请输入代码, '/'分割, 各数据意义如下:\n" +
        "第1位: 横坐标, 第2位: 纵坐标, 第3位: 建筑大小\n" +
        "第4位: 默认填true, 第5位: 显示的名字, 第6位: 名字颜色\n" +
        "第7位: 背景颜色, 第8位: 边框颜色, 第9位: 建筑影响范围\n示例如下: "
    let unit = cursor.select.split("-")
    let sample = unit[0] + "/" + unit[1] + last_info
    let str = prompt(hint, sample)
    if (!str) return
    let data = str.split("/")
    if (data.length !== 9) {
        return
    }
    last_info = "/" + data[2] + "/" + data[3] + "/" + data[4] + "/" + data[5] + "/" + data[6] + "/" + data[7] + "/" + data[8]
    if (insertBuilding(
            Number(data[0]),
            Number(data[1]),
            Number(data[2]),
            data[3],
            data[4],
            data[5],
            data[6],
            data[7],
            Number(data[8]),
            false,
            true
        )) {
        cursor.select = data[0] + "-" + data[1] + "-" + data[2]
    }
}

function onChangeScale() {
    let scale = document.getElementById("scale").value
    document.getElementById("scale-value").value = scale
    document.getElementById("map-chessboard").style.setProperty("--scale", scale)
}

function onClickExport(type) {
    let data = {}
    data.type = type
    data.nationality = document.getElementById("nationality").value
    data.no_wood = document.getElementById("no-wood").checked
    let standard_buildings = {}
    let buildings = {}
    let road = new Array()
    for (let i = 1; i <= 116; i++) {
        for (let j = 1; j <= 116; j++) {
            let cell = getElementByCoord(i, j)
            if (cell.hasAttribute("occupied")) {
                let building = document.getElementById(cell.getAttribute("occupied"))
                if (building.getAttribute("modify") === "false") continue
                if (building.getAttribute("road") === "true") {
                    road.push(getID(i, j))
                    continue
                }
                let belong = building.getAttribute("belong")
                if (!building.hasAttribute("belong") || belong === "special" || belong === "") {
                    let unit = cell.getAttribute("occupied").split("-")
                    let tmp = {}
                    tmp.size = Number(unit[2])
                    tmp.text = building.firstElementChild ? building.innerHTML.substring(0, building.innerHTML.indexOf("<")) : building.innerHTML
                    tmp.modify = building.getAttribute("modify")
                    tmp.color = building.style.color
                    tmp.background_color = building.style.backgroundColor
                    tmp.border_color = building.style.borderColor
                    if (building.hasAttribute("range_size")) {
                        tmp.range_size = Number(building.getAttribute("range_size"))
                    } else {
                        tmp.range_size = 0
                    }
                    buildings[unit[0] + "-" + unit[1]] = tmp
                } else {
                    let unit = cell.getAttribute("occupied").split("-")
                    let tmp = unit[0] + "-" + unit[1]
                    if (belong in standard_buildings) {
                        if (standard_buildings[belong].indexOf(tmp) === -1) standard_buildings[belong].push(tmp)
                    } else {
                        standard_buildings[belong] = new Array()
                        standard_buildings[belong].push(tmp)
                    }
                }
            }
        }
    }
    data.road = road
    data.standard_buildings = standard_buildings
    data.buildings = buildings
    exportRaw(document.getElementById("type").value.toString() + "木图建筑数据.txt", JSON.stringify(data))
}

function onClickImport(type) {
    let file = document.getElementById("load-file")
    file.click()
    file.onchange = () => {
        var fr = new FileReader()
        fr.onload = function(e) {
            let data = JSON.parse(e.target.result)
            if (data.type !== type) {
                type = data.type
                document.getElementById("type").value = data.type
                onChangeType(data.type)
            } else {
                clearChessboard()
            }
            document.getElementById("nationality").value = data.nationality
            drawBottomNav(true)
            document.getElementById("no-wood").checked = data.no_wood
            onClickNoWood(type)
            data.road.map(function(v) {
                let unit = v.split("-")
                insertBuilding(Number(unit[0]), Number(unit[1]), 1, "true", "道路", "#000000", color_road, "#000000")
            })
            if (data.standard_buildings) {
                Object.keys(data.standard_buildings).forEach(function(key) {
                    let building_info = getBuildingInfo(key.split("-")[0], key.split("-")[1])
                    data.standard_buildings[key].map(function(v) {
                        let unit = v.split("-")
                        insertBuilding(
                            Number(unit[0]),
                            Number(unit[1]),
                            building_info.size,
                            "true",
                            building_info.text,
                            building_info.color,
                            building_info.background_color,
                            building_info.border_color,
                            building_info.range_size
                        )
                    })
                })
            }
            Object.keys(data.buildings).forEach(function(key) {
                let unit = key.split("-")
                let tmp = data.buildings[key]
                insertBuilding(
                    Number(unit[0]),
                    Number(unit[1]),
                    tmp.size,
                    tmp.modify,
                    tmp.text,
                    tmp.color,
                    tmp.background_color,
                    tmp.border_color,
                    tmp.range_size
                )
            })
        }
        fr.readAsText(file.files[0])
        let tmp = document.createElement("input")
        tmp.type = "file"
        tmp.id = "load-file"
        tmp.style.display = "none"
        file.replaceWith(tmp)
    }
}

function onChangeType(type) {
    clearChessboard(true)
    drawBarrier(type)
    drawFixedBuilding(type)
}
function setMiniMapPixel(li, co, color, size) {
    li = +li;
    co = +co;
    size = size || 1;
    let ctx = document.getElementById("map-mini").getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(co - 1, li - 1, size, size);
}

function freshMapMiniFocus(isResize) {
    if (isResize) {
        mapMiniFocus.style.width = `${Math.ceil((window.innerWidth - 16) / 30)}px`;
        mapMiniFocus.style.height = `${Math.ceil((window.innerHeight - 49 * 2) / 30)}px`;
    }
    mapMiniFocus.style.left = `${Math.floor(html.scrollLeft / 30) + 9}px`;
    mapMiniFocus.style.top = `${Math.floor(html.scrollTop / 30) + 50}px`;
}

function dragMapMiniFocus(event) {
    let width = +mapMiniFocus.style.width.substring(0, mapMiniFocus.style.width.length - 2);
    let height = +mapMiniFocus.style.height.substring(0, mapMiniFocus.style.height.length - 2);
    let left = 0;
    let top = 0;
    if (event.clientX - 8 - width / 2 < 0) left = 8;
    else if (event.clientX - 8 + width / 2 >= 116) left = 126 - width;
    else left = event.clientX - width / 2;
    if (event.clientY - 49 - height / 2 < 0) top = 49;
    else if (event.clientY - 49 + height / 2 >= 116) top = 167 - height;
    else top = event.clientY - height / 2;
    html.scrollTo((left - 8) * 30, (top - 49) * 30);
}

var color_chessboard_main = "#f5fafa";
var color_chessboard_edge = "#eef1f1";
var color_chessboard_boundary = "#000000";

var last_special_info = "/3/true/衙门-高宅/#ff0000/#ffff00/#ff0000/0";

var html = document.querySelector("html");
var isMouseDown = false;
var isDragging = false;
var startScrollLeft = -1;
var startScrollTop = -1;
var startX = -1;
var startY = -1;
var nowX = -1;
var nowY = -1;
var copiedBuilding = undefined;
var roadsBuffer = [];
var deletionBlockBuffer = {};
var deletionBlock = document.getElementById("deletion-block");
var cursor = {};

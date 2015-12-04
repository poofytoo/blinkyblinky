const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "silver"]

var root = new Firebase("https://blinkyblinky.firebaseio.com")
var colorsLED = {};

root.child("colorsLED").on("value", function(ss) {
    temp = ss.val()
    for (color in temp) {
        colorsLED[color] = temp[color].split(" ")
        for (channel in colorsLED[color]) {
            $("input#" + color + "-" + channel).val(colorsLED[color][channel])
        }
    }
});

$(document).ready(function() {
    $(".color-input>input").on("change", function() {
        color = $(this).attr("id").split("-")[0];
        R = $("#" + color + "-0").val()
        G = $("#" + color + "-1").val()
        B = $("#" + color + "-2").val()
        o = {}
        o[color] = [R, G, B].join(" ")
        root.child("colorsLED").update(o)
    })
});


colorsCSS = {}
colorsCSS["red"] = "#ff1744"
colorsCSS["orange"] = "#ff9800"
colorsCSS["yellow"] = "#ffeb3b"
colorsCSS["green"] = "#4caf50"
colorsCSS["blue"] = "#03a9f4"
colorsCSS["purple"] = "#d500f9"
colorsCSS["silver"] = "#9e9e9e"
colorsCSS["pink"] = "#ff4081"
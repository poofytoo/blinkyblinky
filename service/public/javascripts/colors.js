const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "silver"]

var root = new Firebase("https://blinkyblinky.firebaseio.com")
var colorsLED = {"blue":["0","10","50"],"green":["5","50","10"],"orange":["40","30","0"],"pink":["50","20","40"],"purple":["20","0","40"],"red":["50","0","0"],"silver":["25","40","40"],"yellow":["30","50","5"]}

root.child("colorsLED").on("value", function(ss) {
    temp = ss.val();
    if (!$.isEmptyObject(temp)) {
        for (color in temp) {
            colorsLED[color] = temp[color].split(" ")
            for (channel in colorsLED[color]) {
                $("input#" + color + "-" + channel).val(colorsLED[color][channel])
            }
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
colorsCSS["blue"] = "#1f61d9"
colorsCSS["purple"] = "#d500f9"
colorsCSS["silver"] = "#9e9e9e"
colorsCSS["pink"] = "#ff4081"

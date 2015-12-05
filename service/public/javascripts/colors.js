const colors = ["red", "orange", "yellow", "green", "blue", "silver", "pink", "purple"]

var root = new Firebase("https://blinkyblinky.firebaseio.com")
var colorsLED = {
    "blue": ["0", "10", "50"],
    "green": ["5", "50", "5"],
    "orange": ["40", "28", "0"],
    "pink": ["50", "20", "40"],
    "purple": ["16", "0", "42"],
    "red": ["50", "4", "4"],
    "silver": ["24", "48", "48"],
    "yellow": ["32", "48", "0"]
}
var colorsFlicker = {
    "blue": ["0", "30", "FF"],
    "green": ["10", "FF", "20"],
    "orange": ["40", "28", "0"],
    "pink": ["50", "20", "40"],
    "purple": ["40", "0", "FF"],
    "red": ["FF", "12", "12"],
    "silver": ["24", "48", "48"],
    "yellow": ["32", "48", "0"]
}
var BLACKOUT_COMMAND = {
    s: "37 37 0 4 B B 2B"
}
var DIM_COMMAND = {
    s: "37 37 0 4 B B 2B"
}

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

root.child("BLACKOUT").on("value", function(ss) {
    BLACKOUT_COMMAND = {
        s: "37 37 0 " + ss.val() + " 2B"
    }
    DIM_COMMAND = {
        s: "37 37 0 " + ss.val() + " 2B"
    }
    temp = ss.val().split(" ");
    for (channel in temp) {
        $("input#blackout-" + channel).val(temp[channel])
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
    });
    $(".control-blackout>input").on("change", function() {
        R = $("#blackout-0").val();
        G = $("#blackout-1").val();
        B = $("#blackout-2").val();
        o = {
            BLACKOUT: [R, G, B].join(" ")
        }
        root.update(o)
    })
});


colorsCSS = {}
colorsCSS["red"] = "#d61b29"
colorsCSS["orange"] = "#f8660a"
colorsCSS["yellow"] = "#f6c900"
colorsCSS["green"] = "#2bb20a"
colorsCSS["blue"] = "#1f5cd4"
colorsCSS["purple"] = "#9100ff"
colorsCSS["silver"] = "#9e9e9e"
colorsCSS["pink"] = "#fc40be"

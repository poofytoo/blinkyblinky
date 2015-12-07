const colors = ["red", "orange", "yellow", "green", "blue", "silver", "pink", "purple"]
const waveOrder = ["red", "orange", "yellow", "green", "blue", "purple", "silver", "pink"]

var root = new Firebase("https://blinkyblinky.firebaseio.com")
var colorsLED = {
    "blue": ["0", "10", "50"],
    "green": ["5", "50", "5"],
    "orange": ["40", "28", "0"],
    "pink": ["50", "20", "40"],
    "purple": ["16", "0", "42"],
    "red": ["50", "4", "4"],
    "silver": ["24", "48", "48"],
    "yellow": ["32", "48", "0"],
    "white": ["60", "FF", "FF"]
}
var colorsFlicker = {
    "blue": ["0", "30", "FF"],
    "green": ["10", "FF", "20"],
    "orange": ["40", "28", "0"],
    "pink": ["50", "20", "40"],
    "purple": ["40", "0", "FF"],
    "red": ["FF", "12", "12"],
    "silver": ["24", "48", "48"],
    "yellow": ["32", "48", "0"],
    "white": ["60", "FF", "FF"]
}
var BLACKOUT_COMMAND = {
    s: "37 37 0 3 9 9 2B"
}
var BLACKOUT_LED = ["3", "9", "9"]

var DIM_COMMAND = {
    s: "37 37 0 6 12 12 2B"
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
    BLACKOUT_LED = ss.val().split(" ");
    for (channel in BLACKOUT_LED) {
        $("input#blackout-" + channel).val(BLACKOUT_LED[channel])
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
colorsCSS["white"] = "#ffffff"

function shuffle(array) {
    var counter = array.length, temp, index;
    var shuffled = array;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        shuffled[counter] = array[index];
        shuffled[index] = temp;
    }

    return shuffled;
}
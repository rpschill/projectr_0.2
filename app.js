$(document).ready(function() {


    $("button.close-menu").click(function(e) {
        $("div.project-menu").hide("slide", function() {
            $("div.list-content").toggleClass("col-11 col-9");
        });
    });

    $("button.open-menu").click(function(e) {
        e.preventDefault();
        $("div.project-menu").toggle("slide", function() {
            e.stopPropagation();
            $("div.list-content").toggleClass("col-11 col-9");
        });
    });
});
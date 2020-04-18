$(document).ready(function () {

    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#dismiss').on('click', function () {
        $('#sidebar').removeClass('active');
    });

    $(".sidebar-dismiss").on('click', function () {
        $('#sidebar').removeClass('active');
    });

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').addClass('active');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });

    $("#searchPlayerInput").on("keypress", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("searchPlayerButton").click();
        }
    })

    $("#searchPlayerButton").on("click", function () {
        var input =  $("#searchPlayerInput");
        if(!input.val()|| !RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile().test(input.val()))
            input.addClass("is-invalid");
        else
            window.location.href = "/player/" + input.val();
    })
});

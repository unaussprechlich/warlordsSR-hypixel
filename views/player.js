$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$(document).ready(function () {
    $("#reloadButton").on("click", function () {
        const url = new URL(window.location.href);
        url.searchParams.set('reload', "true");
        window.location.href = url
    });
})

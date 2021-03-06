// Get references to page elements
var scrapeWeb = $("scrapeButton");
var articlesDiv = $("#articlesDiv");

// scrape website on click
// $(document).on("click", scrapeWeb, function() {
    // Grab the articles as a json
    $.getJSON("/api/articles", function(data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
            var booleanSaved = data[i].saved;
            booleanSaved = false;
            // Display the information on the page
            // articlesDiv.append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
            // articlesDiv.append("<div id='articleBox'  data-saved='false' data-id='" + data[i]._id + "'>" + 
            articlesDiv.append("<div id='articleBox'>" + 
            "<h3>" + data[i].title + "</h3><br />" + 
            "<a href=" + data[i].link + ">" + data[i].link + "</a>" + "<br />" +
            "<p>" + data[i].published + "</p>");
            // +
            // ========== test boostrap modal =========
            //Save Article Button Test
            // "<button data-id='" + data[i]._id + "' data-saved='" + booleanSaved + "' id='saveArticle'>Save Article</button>" +
            //====================modal code starts========================================
            // <!-- Button trigger modal -->
            // "<button id='addNote' data-id='" + data[i]._id + "' type='button' class='btn btn-primary' data-toggle='modal' data-target='#exampleModalCenter'>" +
            //     "Add Note" +
            // "</button>" +

            // <!-- Modal -->
            // "<div class='modal fade' id='exampleModalCenter' tabindex='-1' role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>" +
            // "<div class='modal-dialog modal-dialog-centered' role='document'>" +
            //     "<div class='modal-content'>" +
            //     "<div class='modal-header'>" +
            //         "<h5 class='modal-title' id='exampleModalLongTitle'>Modal title</h5>" +
            //         "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
            //         "<span aria-hidden='true'>&times;</span>" +
            //         "</button>" +
            //     "</div>" +
            //     "<div class='modal-body'>" +
            //         "..." +
            //     "</div>" +
                // "<div class='modal-footer'>" +
                //     "<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>" +
                //     "<button data-id='" + data[i]._id + "' id='savenote' type='button' class='btn btn-primary'>Save Note</button>" +
                // "</div>" +
            //     "</div>" +
            // "</div>" +
            // "</div>" +
            // ====================modal ends =========================
            // // "<button id='addNote'  data-id='" + data[i]._id + "'> href='/articles/:id'>Save</button>" +
            // "<button id='addNote'  data-id='" + data[i]._id + "'>Save</button>" +
            // "</div>" +
            // "<br /><br />");
        }
    });
// });

// Grab the notes as a json (test)
// $.getJSON("/api/notes", function(data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {



//     }
// });  //api/notes ends

// Whenever someone clicks an articlesDiv/#addNote display a modal for the user to add a note for the clicked article
$(document).on("click", "#addNote", function() {
    // Empty the notes from the note section
    $(".modal-body").empty();
     // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log(thisId);

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    // With that done, add the note information to the modal
    .then(function(data) {
        console.log(data);
        // The title of the article
        $(".modal-body").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        // $(".modal-body").append("<input id='titleinput' name='title' >");
        $(".modal-body").append(
            // empty div to display the added note/s
            "<div" +
                "<h3 id='storedNoteTitle'></h3>" +
                "<p id='storedNoteBody'></p>" +
                "</div>" +
            //Bostrap input field with label for title
            "<div class='input-group input-group-sm mb-3'>" +
                "<div class='input-group-prepend'>" +
                    "<span class='input-group-text' id='inputGroup-sizing-sm'>Title</span>" +
                "</div>" +
                "<input id='titleinput' type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm'>" +
            "</div>" 
        );
        // A textarea to add a new note body
        // $(".modal-body").append("<textarea id='bodyinput' name='body'></textarea>");
        $(".modal-body").append(
            //Bostrap input field with label for note body
            "<div class='input-group input-group-sm mb-3'>" +
                "<div class='input-group-prepend'>" +
                    "<span class='input-group-text' id='inputGroup-sizing-sm'>Note</span>" +
                "</div>" +
                "<input id='bodyinput' type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm'>" +
            "</div>" 
        );
        // A button to submit a new note, with the id of the article saved to it
        $(".modal-body").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
            // Place the title of the note in the title input
            $("#storedNoteTitle").val(data.note.title);
            // Place the body of the note in the body textarea
            $("#storedNoteBody").val(data.note.body);
        }
        console.log(data._id);
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log(thisId);
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
    // With that done
    .then(function(data) {
        // Log the response
        console.log(data);
        // // Empty the notes section
        $("#notes").empty();
        if (data.note) {
            // Place the title of the note in the title input
            $("#storedNoteTitle").val(data.note.title);
            // Place the body of the note in the body textarea
            $("#storedNoteBody").val(data.note.body);
        }
    });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
    // If there's a note in the article
});

// on #saveArticle click event, set data-saved to true
$(document).on("click", "#saveArticle", function() {
    var thisSaved = $(this).attr("data-saved");
    console.log(thisSaved);
    thisSaved = true;
    console.log(thisSaved);

}); //click event ends

//function: if data-saved is true send the article to the saved div in saved handlebars
// function saved() {
//     if(thisSaved) {
        
//     }
// }
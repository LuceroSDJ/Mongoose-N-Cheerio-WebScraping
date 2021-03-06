// require dependencies
var express = require("express");
// var logger = require("morgan");
var exphbs  = require('express-handlebars');
const mongoose = require('mongoose');

// initialize express
var app = express(); //allows us to add routes & start our server
// require routes from routes.js in order to render handlebars files 
/* ======= Documentation: ==========
Routing refers to how an application’s endpoints (URIs) respond to client requests.
You define routing using methods of the Express app object that correspond to HTTP methods; 
for example, app.get() to handle GET requests and app.post to handle POST requests.
You can use app.use() to specify middleware as the callback function.
Bind application-level middleware to an instance of the app object by using the app.use() and app.METHOD() functions
*/

// **** Our scraping tools!!! ****
//require npm dependencies
var cheerio = require("cheerio");
var axios = require("axios");

require("./config/htmlroutes")(app);

// Require all models [captionSchemas & noteSchema]
var db = require("./models");


// set up port  to 3000 or process.env.PORT for deployment
var PORT = process.env.PORT || 3000;


// ==================== Configure middleware =====================================================
// Use morgan logger for logging requests
// app.use(logger("dev"));
//Set up the Express app to handle data parsing
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// create publi static folder
app.use(express.static("public"));



// =================== CREATE  A LOCATION FOR MONGO DATABASE & STABLISH CONNECTION TO IT =========
/* Documentation: Connecting to MongoDB
First, we need to define a connection. 
If your app uses only one database, you should use mongoose.connect. 
If you need to create additional connections, use mongoose.createConnection.
Both connect and createConnection take a mongodb:// URI, or the parameters host, database, port, options.
*/
// Connect to the Mongo DB 
// mongoose.connect('mongodb://localhost/my_database', {useNewUrlParser: true});

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database, which is the name of my mongo database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
//mongo.connect opens up our mongodb local instance
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
  // debug cli mssg: [(node:1336) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.]
//   useCreateIndex: true
});

// Register `hbs.engine` with the Express app
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
// documentation: create views/layouts/main.handlebars


// ====================== ROUTES ================================================================

// What it the server.js file doing?
console.log("\n********************\n" +
        "Grabbing data\n" +
        "from website :" +
        "\n**********************\n");

// ============= /scrape ===========================
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    
    axios.get("https://www.npr.org/sections/music-videos/").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        $("article").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children()
                .find("h2")
                .text()
                .trim();
            result.link = $(this)
                .children().find("h2 a")
                .attr("href");
            result.published = $(this)
                .children()
                .find("p time")
                .text()
                .trim();
            console.log(result);

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
            .then(function(dbArticles) {
                // View the added result in the console
                console.log(dbArticles);
            })
            .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
            });
        }); //grabbing html tags with cheerio ends

        // Send a message to the client
        res.render("home");
    }); //axios ends
});  //scrape route ends

// Route for getting all Articles from the db
app.get("/api/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticles) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticles);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});

// Route for getting all notes from the db
app.get("/api/notes", function(req, res) {
    // Grab every document in the Articles collection
    db.Note.find({})
      .then(function(dbNotes) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbNotes);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});

// Route for deleting all articles
app.get("/deleteAll", function(req, res) {
    db.Article.deleteMany({})
    .then(function(dbArticles) {
        // res.json(dbArticles);
        res.render("home");
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
        // console.log(err);
    });
});

// class activity: Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function(dbArticles) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticles);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// class activity: Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
    .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticles) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticles);
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});

// Route for deleting an article
app.put("/articles/:id", function(req, res) {
    db.Article.deleteOne({ _id: req.params.id })
    .then(function(dbArticles) {
        res.json(dbArticles);
    }).catch(function(err) {console.log(err);
        res.json(err);
    });
});

//start server & let me know that the server has been started by console.logging the port 
app.listen(process.env.PORT || 3000, function() {
    console.log("App listening on PORT: " + PORT);  //app listening ✓
})

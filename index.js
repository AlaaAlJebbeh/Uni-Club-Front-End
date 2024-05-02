import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path  from "path";
import mysql from "mysql";
import bodyParser from "body-parser";
import { constrainedMemory } from "process";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies


  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "clm",
  });

  connection.connect((err) => {
    if (err) {
      console.error("cant connect to the database", err);
      return;
    }
    console.log("connected successfully to the database");
  });

app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/myclubpage", (req, res) => {
   
    const data = {
        pageTitle: 'My Club Page',
        message: "dfdf"
        // Add more data as needed
    };

    res.render('myclubpage.ejs', data); 
});

app.use('/views', express.static(path.join(__dirname, '/views')));
app.use(express.static("views"));
app.get("/createclub", (req, res) => {

    res.render("on_click_create_club.ejs");
});

app.post("/createclub", function(req, res){


    var sql = "INSERT INTO club(club_id, club_name, category, bio, contact, social_media1, social_media2, social_media3, email) VALUES(null, '"+ req.body.name +"', '"+ req.body.cars +"','"+ req.body.bio +"','"+ req.body.contact +"','"+ req.body.media1 +"','"+ req.body.media2 +"','"+ req.body.media3 +"','"+ req.body.email +"')";
    connection.query(sql, [req.body.name, req.body.cars, req.body.bio, req.body.contact, req.body.media1, req.body.media2, req.body.media3, req.body.email], function(error, result){
        if(error) {
            console.error("Error inserting club:", error);
            res.status(500).send("Error creating club");
            return;
        }
        console.log("Club successfully created");
        res.send('Club successfully created');
    });
});

app.get("/comparing", (req, res) => {
    let data = {}; // Initialize an empty data object

    // Query to retrieve data from the 'TempEvents' table
    connection.query("select * from TempClubEdit ", (err, tempResult) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send("Internal Server Error2");
        }

        // Assign the 'tempResult' to the 'data' object
        data.tempResult = tempResult;   

        // Render the 'StatusManager.ejs' template with the populated 'data' object
        res.render("StatusManager.ejs", data);
    });
});


app.get("/on_click_create_club", (req, res) => {
    res.render("on_click_create_club.ejs");
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
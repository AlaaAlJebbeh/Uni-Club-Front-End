import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path  from "path";
import mysql from "mysql";
import bodyParser from "body-parser";
import { constrainedMemory } from "process";
import { name } from "ejs";
const __dirname = dirname(fileURLToPath(import.meta.url));
import {ROLE} from "./data.js"
import { authRole } from "./authontication.js";

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
// Apply middleware
app.use(express.json()); // For parsing application/json
app.use(setUser); // Apply setUser middleware before route handlers


app.get("/", (req, res) => {
    res.render("home.ejs"); 
});

app.post("/clubRoleTest", authRole(ROLE.club), (req, res) => {
   
    const data = {
        pageTitle: 'Club Role Test ',
        message: "You did it"
        // Add more data as needed
    };

    res.render('clubRoleTest.ejs', data); 
});

app.post("/myclubpage", authRole(ROLE.club), (req, res) => {
   
    const data = {
        pageTitle: 'My Club Page',
        message: "dfdf"
        // Add more data as needed
    };

    res.render('myclubpage.ejs', data); 
});


app.get("/myclubpage", authRole(ROLE.club), (req, res) => {
   
    const data = {
        pageTitle: 'My Club Page',
        message: "dfdf"
        // Add more data as needed
    };

    res.render('myclubpage.ejs', data); 
});

app.get("/eventRequests", (req, res) => {
   
    const data = {
        pageTitle: 'My Club Page',
        message: "dfdf"
        // Add more data as needed
    };

    res.render('eventRequests.ejs', data); 
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

//event request page starts here
app.get("/eventrequest", (req, res) => {
    res.render("eventRequest.ejs");
});

app.get("/comparing", (req, res) => {
    // Query to retrieve data from the 'TempEvents' table
    connection.query("SELECT * FROM TempClubEdit", (err, tempResult) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send("Internal Server Error2");
        }

        // Array to store promises for fetching club names
        const promises = [];

        // Iterate over each item in tempResult to fetch club names asynchronously
        tempResult.forEach(item => {
            // Create a promise for each query to fetch club name
            const promise = new Promise((resolve, reject) => {
                connection.query("SELECT club_name FROM club WHERE club_id = ?", item.club_id, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Resolve the promise with club name or null if not found
                        resolve(result.length > 0 ? result[0].club_name : null);
                    }
                });
            });
            // Push the promise to the array of promises
            promises.push(promise);
        });

        // Wait for all promises to resolve using Promise.all
        Promise.all(promises)
            .then(clubNames => {
                // Render the 'StatusManager.ejs' template with the populated data
                res.render("StatusManager.ejs", { tempResult, clubNames });
            })
            .catch(err => {
                console.error(err);
                // Handle error appropriately
                return res.status(500).send("Internal Server Error");
            });
    });
});


app.get("/on_click_create_club", (req, res) => {
    res.render("on_click_create_club.ejs");
});


function setUser(req, res, next) {
    const userEmail = req.body.email; // Assuming email is passed in the request body
    console.log('Received userEmail:', userEmail);

    if (userEmail) {
        const query = `SELECT user_id, email, ROLE FROM users WHERE email = ?`;
        connection.query(query, [userEmail], (err, results) => {
            if (err) {
                console.error('Error retrieving user from database:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length > 0) {
                req.user = results[0];
                console.log('User found:', req.user);
            } else {
                console.log('User not found for email:', userEmail);
            }

            next();
        });
    } else {
        next();
    }
}





app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function clubname(id){
    connection.query('select club_name from clubs where club_id =' + id, (err, res) => {
            return res.club_name;
        
    });
}


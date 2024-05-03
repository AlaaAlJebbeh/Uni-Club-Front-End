import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path  from "path";
import mysql from "mysql";
import { constrainedMemory } from "process";
import { name } from "ejs";
const __dirname = dirname(fileURLToPath(import.meta.url));
import {ROLE} from "./data.js"
import { authRole } from "./authontication.js";

const app = express();
const port = 8000;


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

app.get("/createclub", (req, res) => {

    res.render("on_click_create_club.ejs");
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

app.get("/ezz", (req, res) => {
    connection.query("select * from event where clm_id = 1", (err, result) => {
        if(err){
            console.log(err.message);
        }
        connection.query("select club_name from club where clm_id = 1", (err, clubname) => {
            console.log(clubname);
            res.render("showingezz.ejs", {result,clubname});
        });
    });
   
});
app.get("/getOldPicture", (req, res) => {
    const clubId = req.query.clubId;
  
    connection.query("SELECT old_picture_url FROM club WHERE club_id = ?", [clubId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      
      // Assuming result is an array with a single object containing the old picture URL
      const oldPictureUrl = result.length > 0 ? result[0].old_picture_url : null;
      
      res.json({ oldPictureUrl });
    });
  });
  

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



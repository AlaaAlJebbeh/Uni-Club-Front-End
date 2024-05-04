//Importing libraries
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
import bcrypt from "bcrypt";

//Constants
const app = express();
const port = 8000;


//Body barser use
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

//Connection To Database
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

//Uses public - views - json - serUser middleware
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(express.static("public"));
app.use('/views', express.static(path.join(__dirname, '/views')));
app.use(express.static("views"));
// Apply middleware
app.use(express.json()); // For parsing application/json
app.use(setUser); // Apply setUser middleware before route handlers
app.use(express.urlencoded({extended: false}))
// Set 'ejs' as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));


//Rout to home page
app.get("/", (req, res) => {
    res.render("home.ejs"); 
});

//Route Register user
app.get("/register", (req, res) => {
   
    const data = {
        pageTitle: 'User Registration ',
        message: "Register user"
        // Add more data as needed
    };

    res.render('register', data); 
});

app.post("/register", async (req,res) =>{

    
    try{
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10)
        let tableName = '';
        if (role === 'clubManager') {
            tableName = 'club_manager';
        } else if (role === 'sksAdmin') {
            tableName = 'sks_admin';
        } else {
            return res.status(400).send('Invalid role specified');
        }

        connection.query(
            `INSERT INTO ${tableName} (name, password, email ) VALUES (?, ?, ?)`,
            [name, hashedPassword, email],
            (error, results, fields) => {
              if (error) {
                console.error('Error inserting into database:', error);
                return res.status(500).send('Failed to register');
              }
              res.status(200).send('Registration successful');
            }
          );

        console.log("user registered sucssessfully");

    } catch(e){
        console.log(e);
    }

})


//Route Testing club role
app.post("/clubRoleTest", authRole(ROLE.club), (req, res) => {
   
    const data = {
        pageTitle: 'Club Role Test ',
        message: "You did it"
        // Add more data as needed
    };

    res.render('clubRoleTest.ejs', data); 
});

/*
//Rout my clubPage (club role)
app.post("/myclubpage", authRole(ROLE.club), (req, res) => {
   
    const data = {
        pageTitle: 'My Club Page',
        message: "dfdf"
        // Add more data as needed
    };

    res.render('myclubpage.ejs', data); 
});

*/
app.get("/myclubpage", (req, res) => {
    connection.query("SELECT * FROM club WHERE club_id = 1", (err, clubInformation) => {
        if (err) {
            console.error("Error fetching club information:", err);
            return res.status(500).send("Internal Server Error");
        }

        connection.query("SELECT IMAGE_ID FROM IMG_CLUB WHERE club_id = 1", (err, imageID) => {
            if (err) {
                console.error("Error fetching image ID:", err);
                return res.status(500).send("Internal Server Error");
            }

            const imageIDValue = imageID.length > 0 ? imageID[0].IMAGE_ID : null;

            if (!imageIDValue) {
                console.error("No image ID found for club");
                return res.status(404).send("Image not found");
            }

            connection.query("SELECT IMG_URL FROM UPLOADED_IMG WHERE IMAGE_ID = ?", imageIDValue, (err, ImageURL) => {
                if (err) {
                    console.error("Error fetching image URL:", err);
                    return res.status(500).send("Internal Server Error");
                }

                res.render("myclubpage.ejs", { clubInformation, ImageURL });
            });
        });
    });
});


//to open social media link sin the database
app.get("/socialmedia/:link",(req, res) => {
    
    res.redirect("https://" + req.params.link);
});
app.get("/socialmedia/:link/:link2",(req, res) => {
    
    res.redirect("https://" + req.params.link + "/" +req.params.link2);
});

//Route eventRequests 

app.get("/eventRequests", (req, res) => {
   
    const data = {
        pageTitle: 'EventRequests',
        message: "dfdf"
        // Add more data as needed
    };

    res.render('eventRequests.ejs', data); 
});

//Route createClub
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

//Route Comparing 
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

//Route on click create club
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
  

//listining to the port 
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
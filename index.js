//Importing libraries
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import mysql from "mysql";
import bodyParser from "body-parser";
const __dirname = dirname(fileURLToPath(import.meta.url));
import session from "express-session";
import fileUpload from "express-fileupload";
import multer from "multer"
import fs from "fs";


//Constants
const app = express();
const port = 8000;


//Body barser use
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, '/views')));
app.use(express.static("views"));
// Apply middleware
app.use(express.json()); // For parsing application/json
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    console.log('Incoming request body:', req.body);
    console.log(req.session.email);
    next();
  });
app.use(fileUpload());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Specify the destination directory
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'upload-' + Date.now() + ext); // Specify the file naming scheme
    }
});

const upload = multer({ storage: storage });


app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        if (req.session.role === 'club') {
            res.render('home', { loggedIn: true, role: "club", email: req.session.email });
        } else if (req.session.role === 'sks') {
            res.render('home', { loggedIn: true, role: "sks", email: req.session.email });
        }
    } else {
        res.render('home', { loggedIn: false, role: null, email: null });
    }
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email && password) {
        connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
            if (results.length > 0) {
                req.session.loggedIn = true;
                req.session.loggedIn = true;
                req.session.email = email;
                req.session.role = results[0].role; // Add this line
                console.log(req.session.email);
                res.render('home', { loggedIn: true, role:results[0].role, email: req.session.email });
            } else {
                res.send('Incorrect email and/or password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter email and password!');
        res.end();
    }
});

// Add a logout route
app.get('/logout', (req, res) => {
    // Clear the session
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            // Redirect to the login page
            res.render('home', { loggedIn: false, role: null, email: null });
        }
    });
});

app.get('/register', (req, res) => {
    res.render("register.ejs");
});


// Register route
app.post("/register", async (req, res) => {


    try {
        const { name, password, email, university_id, role } = req.body;
        let tableName = '';
        if (role === 'clubManager') {
            tableName = 'club_manager';
        } else if (role === 'sksAdmin') {
            tableName = 'sks_admin';
        } else {
            return res.status(400).send('Invalid role specified');
        }

        connection.query(
            `INSERT INTO ${tableName} (name, password, email, uni_id ) VALUES (?, ?, ?, ?)`,
            [name, password, email, university_id],
            (error, results, fields) => {
                if (error) {
                    console.error('Error inserting into database:', error);
                    return res.status(500).send('Failed to register');
                }
                res.status(200).send('Registration successful');
            }
        );

        console.log("user registered sucssessfully");

    } catch (e) {
        console.log(e);
    }

})
app.get("/myclubpage", (req, res) => {
    if (!req.session.loggedIn) {
        res.render('home.ejs', { loggedIn: false, role: null, email: null });
        return; // Make sure to return after sending the response
    }

    let email = req.session.email;
    getUserID(email, (err, userId) => {
        if (err) {
            console.error("Error getting user ID:", err);
            return res.status(500).send("Error getting user ID");
        }
        if (userId === null || userId === undefined) {
            return res.status(404).send("User ID not found");
        }
        
        // All code depending on userId should be inside this callback function
        const UserID = userId;
        connection.query("SELECT club_id from club_manager where clm_id = ?", UserID, (err, result) => {
            if (err) {
                console.error("Error fetching club id:", err);
                return res.status(500).send("Internal Server Error");
            }
            let clubID = result[0].club_id;
            console.log("club ID " + clubID);
            connection.query("SELECT * FROM club WHERE club_id = ?", clubID, (err, clubInformation) => {
                if (err) {
                    console.error("Error fetching club information:", err);
                    return res.status(500).send("Internal Server Error");
                }
                if(clubInformation.length === 0){
                    return res.status(500).send("Club Dosent Exist");
                }
                console.log(clubInformation + "club info")
                connection.query("select name from club_manager where club_id = ?", [clubID], (err, name) => {
                    if (err) {
                        console.error("Error fetching Club manager name:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log(clubInformation);
                    connection.query("select * from event where club_id = ?", [clubID], (err, event) => {
                        if (err) {
                            console.error("Error fetching events:", err);
                            return res.status(500).send("Internal Server Error");
                        }
                        res.render("myclubpage.ejs", { clubInformation, name, role: 'club', email: req.session.email, loggedIn: req.session.loggedIn, event });
                    });
                    
                });
            });
        });
    });
});


//to open social media link sin the database
app.get("/socialmedia/:link", (req, res) => {

    res.redirect("https://" + req.params.link);
});
app.get("/socialmedia/:link/:link2", (req, res) => {

    res.redirect("https://" + req.params.link + "/" + req.params.link2);
});

//Route eventRequests 

app.get("/eventRequests", (req, res) => {
    connection.query(`SELECT * FROM tempevents`, (err, results) => {
        if (err) {
            console.error("Error fetching temp events:", err);
            return res.status(500).send("Internal Server Error");
        }
        console.log(results);
        // Extracting event IDs from the results of the first query
        const eventIds = results.map(row => row.eventid);
        console.log(eventIds);
    
        // Performing a second query to fetch events based on the event IDs
        connection.query(`SELECT * FROM event WHERE event_id IN (?)`, [eventIds], (err, events) => {
            if (err) {
                console.error("Error fetching events:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log(events);
            res.render('eventRequests.ejs', { role: 'sks', email: req.session.email, loggedIn: true, tempevents: results, events: events });
        });
    });
    

    
});

app.get("/createEvent", (req, res) => {
    res.render('createEvent.ejs');
});

app.post("/createEvent", async (req, res) => {

    const email = req.session.email; // Retrieve email from request body
    const { eventName, guestName, eventDate, eventTime, eventLocation, capacity, description, notes, category, uploadImage } = req.body;
    const language = req.body.language; // Get the selected language

    connection.query("SELECT user_id FROM users WHERE email = ?", [email], (err, userResult) => {
        if (err) {
            console.error("Error fetching userID:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (userResult.length === 0) {
            return res.status(404).send("User not found");
        }

        const userId = userResult[0].user_id;

        connection.query("SELECT club_id FROM club WHERE clm_id = ?", [userId], (err, clubResult) => {
            if (err) {
                console.error("Error fetching club id:", err);
                return res.status(500).send("Internal Server Error");
            }
            if (clubResult.length === 0) {
                return res.status(404).send("Club not found for the user");
            }

            const clubId = clubResult[0].club_id;

            connection.query(
                `INSERT INTO event (club_id, event_name, guest_name, date, time, language, location, capacity, description, notes, category, event_img) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [clubId, eventName, guestName, eventDate, eventTime, language, eventLocation, capacity, description, notes, category, uploadImage],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting event into database:', error);
                        return res.status(500).send('Failed to insert');
                    }
                    res.redirect("/myclubpage");
                });
        });
    });
});


//Route createClub
app.get("/createclub", (req, res) => {

    res.render("on_click_create_club.ejs",{role:'sks', email: req.session.email, loggedIn:true});
});

app.post("/createclub", function (req, res) {

    var sql = "INSERT INTO club(club_id, club_name, category, bio, contact, social_media1, social_media2, social_media3, email) VALUES(null, '" + req.body.name + "', '" + req.body.cars + "','" + req.body.bio + "','" + req.body.contact + "','" + req.body.media1 + "','" + req.body.media2 + "','" + req.body.media3 + "','" + req.body.email + "')";
    connection.query(sql, [req.body.name, req.body.cars, req.body.bio, req.body.contact, req.body.media1, req.body.media2, req.body.media3, req.body.email], function (error, result) {
        if (error) {
            console.error("Error inserting club:", error);
            res.status(500).send("Error creating club");
            return;
        }
        console.log("Club successfully created");
        res.send('Club successfully created');
    });
});

app.post("/rejectMessage", async (req, res)=> {
    const rejectionReason = req.body.rejectionReason;
    const eventid=req.query.eventid;
    console.log(rejectionReason);
    console.log(eventid);

    connection.query('SELECT sks_id from sks_admin WHERE email=?', [req.session.email],(err, result) => {
        if (err) {
            console.error("Error getting sks id:", error);
            res.status(500).send("Error creating club");
            return;
        }
        const sksid=result[0].sks_id;
        connection.query('SELECT club_id from event WHERE event_id = ?', [eventid],(err, club) => {
            if (err) {
                console.error("error getting club id:", error);
                res.status(500).send("Error creating club");
                return;
            }
            const clubid = club[0].club_id;
            connection.query('INSERT INTO history_event(status_condition, sks_id, club_id, comment) VALUES(?,?,?,?)', [1,sksid,clubid,rejectionReason], (error,results)=>{
                if(error){
                    console.log("couldn't insert to database",error)
                }
                else{
                    res.send("message sent to database");
                }
        });
    });


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


app.get("/ezz", (req, res) => {
    connection.query("select * from event where clm_id = 1", (err, result) => {
        if (err) {
            console.log(err.message);
        }
        connection.query("select club_name from club where clm_id = 1", (err, clubname) => {
            console.log(clubname);
            res.render("showingezz.ejs", { result, clubname });
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

  function getUserID(email, callback) {
    connection.query("SELECT user_id FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error(err);
            callback(err, null);
            return;
        }
        const userId = result.length > 0 ? result[0].user_id : null;
        callback(null, userId);
    });
}

app.get("/tryID", (req, res) => {
    let email = req.session.email;
    getUserID(email, (err, userId) => {
        if (userId !== null && userId !== undefined) {
            res.send(userId.toString()); // Assuming userId is a number
            console.log("User ID:", userId);
        } else {
            res.status(404).send("Error"); // Or another appropriate status code
        }
    });
});


  

//listining to the port 
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
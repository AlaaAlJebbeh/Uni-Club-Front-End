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
import { constrainedMemory } from "process";

//Constants
const app = express();
const port = 8000;


//Body barser use
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

//Connection To Database
const connection = mysql.createConnection({
    host: "club.clmoo8csmsef.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "asdf2024",
    database: "clm",
    port: 3306,
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

app.use(fileUpload());

app.get('/', (req, res) => {

    connection.query("select * from event", (err, Events) => {

        if(err){

            console.log("Error fetching events for homepage: " + err.message);
            return res.status(404).send("Internal Server Error");
        }
        if (req.session.loggedIn) {
            if (req.session.role === 'club') {
                res.render('home', { loggedIn: true, role: "club", email: req.session.email, Events });
            } else if (req.session.role === 'sks') {
                res.render('home', { loggedIn: true, role: "sks", email: req.session.email, Events });
            }
        } else {
            res.render('home', { loggedIn: false, role: null, email: null, Events });
        }

    });

  
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email && password) {
        connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
            if (err) {
                console.log("Error occurred: " + err.message);
                return res.status(500).send("Internal Server Error");
            }
            if (results.length > 0) {
                req.session.loggedIn = true;
                req.session.email = email;
                req.session.role = results[0].role;
                req.session.userID = results[0].user_id;
                if (req.session.role === 'club') {
                    connection.query("select * from club_manager where clm_id = ?", [req.session.userID], (err, results) => {
                        if (err) {
                            console.log("Error fetching club manager information: " + err.message);
                            return res.status(500).send("Internal Server Error");
                        }
                        req.session.clubID = results[0].club_id;
                        const clubID = req.session.clubID;
                        connection.query("select * from club where club_id = ?", [clubID], (err, result) => {
                            if (err) {
                                console.log("Error fetching imageURL: " + err.message);
                                return res.status(500).send("Internal Server Error");
                            }
                            if (!result[0].clubImageUrl) {
                                console.log("This club doesn't have an image and it will be set to null");
                                req.session.ImageURL = null;
                            } else {
                                req.session.ImageURL = result[0].clubImageUrl;
                            }
                            req.session.clubName = result[0].club_name;
                            console.log(req.session.email + req.session.ImageURL + req.session.clubName);
                            res.redirect("/");
                        });
                    });
                } else {
                    res.redirect("/");
                }
            } else {
                res.send('Incorrect email and/or password!');
            }
        });
    } else {
        res.send('Please enter email and password!');
    }
});


// Add a logout route
app.get('/logout', (req, res) => {
            req.session.loggedIn = false;
            req.session.role = null;
            req.session.email = null;
            // Redirect to the login page
    // Clear the session
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            
            res.redirect("/");
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

    connection.query("SELECT club_id from club_manager where email = ?", [email], (err, result) => {
        if (err) {
            console.error("Error fetching club id:", err);
            return res.status(500).send("Internal Server Error");
        }
        let clubID = result[0].club_id;
        connection.query("SELECT * FROM club WHERE club_id = ?", clubID, (err, clubInformation) => {
            if (err) {
                console.error("Error fetching club information:", err);
                return res.status(500).send("Internal Server Error");
            }
            if (clubInformation.length === 0) {
                return res.status(500).send("Club Dosent Exist");
            }
            connection.query("select * from club_manager where club_id = ?", [clubID], (err, clubManager) => {
                if (err) {
                    console.error("Error fetching Club manager name:", err);
                    return res.status(500).send("Internal Server Error");
                }
                connection.query("select * from event where club_id = ?", [clubID], (err, event) => {
                    if (err) {
                        console.error("Error fetching events:", err);
                        return res.status(500).send("Internal Server Error");
                    }

                    connection.query(`SELECT event_name FROM tempevents WHERE club_id = ?`, [clubID], (err, resultsTemp) => {
                        if (err) {
                            console.error("Error fetching temp events:", err);
                            return res.status(500).send("Internal Server Error");
                        }
                        // Extracting event IDs from the results of the first query

                        connection.query(`SELECT event_name, status, event_id FROM history_event WHERE club_id = ?`, [clubID], (err, resultsHistory) => {
                            if (err) {
                                console.error("Error fetching temp events:", err);
                                return res.status(500).send("Internal Server Error");
                            }

                            connection.query(`SELECT event_name, event_id FROM toshareevents WHERE club_id = ?`, [clubID], (err, resultsToShare) => {
                                if (err) {
                                    console.error("Error fetching temp events:", err);
                                    return res.status(500).send("Internal Server Error");
                                }
                                connection.query("Select * from posts where club_id = ?", [clubID], (err,Posts) => {
                                    if(err){
                                        console.log("Error fetching posts: " + err.message);
                                        return res.status(404).send("Internal Server Error");
                                    }
                                    res.render("myclubpage.ejs", { clubInformation, clubManager, role: 'club', email: req.session.email, loggedIn: req.session.loggedIn, event, resultsTemp, resultsHistory, resultsToShare, Posts });
                                });
                                
                            });
                        });



                    });


                });
            });
        });
    });
});

app.post("/deleteEvent", (req, res) => {

    const eventID = parseInt(req.query.eventID);
    connection.query("DELETE From event WHERE event_id = ?", [eventID], (err, resultsToDelete) => {
        if (err) {
            console.log("Error deleting row " + err.message);
            res.status(500).send("Internal Error");
        }

        res.redirect("/myclubpage");
    });
});

app.post("/ToShareEvent", (req, res) => {
    const eventId = req.query.eventId;
    connection.query("SELECT * FROM toshareevents where event_id = ?", [eventId], (err, result) => {
        console.log("the selected result is");
        console.log(result);
        if (err) {
            console.log("error selecting from history event");
        } else {

            const eventData = result[0];
            console.log(eventData.club_id);
            const clubId = eventData.club_id;
            const eventId = eventData.event_id;
            const eventName = eventData.event_name;
            const guestName = eventData.guest_name;
            const eventDate = eventData.date;
            const eventTime = eventData.time;
            const eventLocation = eventData.location;
            const capacity = eventData.capacity;
            const description = eventData.description;
            const notes = eventData.notes;
            const category = eventData.category;
            const language = eventData.language;
            const uploadImage1 = eventData.uploadImage1;
            const clubMId = eventData.clm_id;

            connection.query(`INSERT INTO event (club_id, event_id, event_name, guest_name, date, time, language, location, capacity, description, notes, category,clm_id, imageURL) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [clubId, eventId, eventName, guestName, eventDate, eventTime, language, eventLocation, capacity, description, notes, category, clubMId, uploadImage1],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting event into database:', error);
                        return res.status(500).send('Failed to insert');
                    } else {
                        connection.query("Delete FROM toshareevents where event_id = ?", [eventId], (err, result) => {
                            if (err) {
                                console.error('Error inserting event into database:', error);
                                return res.status(500).send('Failed to insert');
                            } else {
                                res.redirect("/myclubpage");
                            }
                        });
                    }

            });
        }

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
        // Extracting event IDs from the results of the first query

            connection.query("Select * from tempeventedits", (err, tempeventedits) => {
                if (err){
                    console.error("Error fetching temp event Edits:", err);
                    return res.status(500).send("Internal Server Error");
                }

                res.render('eventRequests.ejs', { role: 'sks', email: req.session.email, loggedIn: true, results, tempeventedits });

            });
        }); 
    
});


app.get("/clubManagerSks", (req, res) => {
    const email = req.session.email;
    connection.query("SELECT club_id, clm_id, clubImageUrl, category, club_name FROM club", (err, resultClubs) => {
        if (err) {
            console.log("Error fetching clubs:", err);
            return res.status(500).send("Internal Server Error");
        }

        const clubNamesPromises = resultClubs.map((club) => {
            const clubManagerID = club.clm_id;
            return new Promise((resolve, reject) => {
                connection.query("SELECT name FROM club_manager WHERE clm_id = ?", [clubManagerID], (error, resultClubName) => {
                    if (error) {
                        console.error("Error fetching club manager name:", error);
                        reject(error); // Reject the promise on error
                    } else {
                        if (resultClubName && resultClubName.length > 0) {
                            const clubName = resultClubName[0].name;
                            resolve(clubName); // Resolve the promise with clubName
                        } else {
                            console.log("No club manager found for ID:", clubManagerID);
                            resolve(null); // Resolve with null if no club manager found
                        }
                    }
                });
            });
        });

        Promise.all(clubNamesPromises)
            .then((clubNames) => {
                console.log("All club names resolved:", clubNames);
                // Now we render the template after all promises are resolved
                res.render("clubManagerSks.ejs", { resultClubs, clubNames,  role: 'sks', email: req.session.email, loggedIn: true });
            })
            .catch((error) => {
                console.log("Error resolving club manager names:", error);
                res.status(500).send("Internal Server Error");
            });
    });
});

app.get("/popupContent", (req, res) => {
    const buttonId = req.query.buttonId;
    const lastIndex = buttonId.lastIndexOf('_');
    const eventId = buttonId.substring(lastIndex + 1); // Extract the substring after the last '_'
    // Get the button ID from the query string

    console.log(eventId);
    // Fetch popup content based on button ID from the database or any other source
    console.log("this is the button id" + eventId);
    connection.query('SELECT * FROM tempevents where event_id = ?', [eventId], (err, results) => {
        if (err) {
            console.log('didnt get', err);
        }
        console.log({ results });
        res.render('popupContent.ejs', { results });
    });

});

app.get("/popupContentedit", (req, res) => {
    const buttonId = req.query.buttonId;
    const lastIndex = buttonId.lastIndexOf('_');
    const eventId = buttonId.substring(lastIndex + 1); // Extract the substring after the last '_'

    connection.query('SELECT * FROM tempeventedits where event_id = ?', [eventId], (err, newEvent) => {
        if (err) {
            console.log('error fetching old event ', err);
            return res.status(404).send("Internal Server Error");
        }
        console.log("NEW EVENT:");
            console.log(newEvent);
        connection.query("Select * from event where event_id = ?", [eventId], (err,oldEvent) =>{
            if (err) {
                console.log('error fetching new event ', err);
                return res.status(404).send("Internal Server Error");
            }
            console.log("OLD EVENT:");
            console.log(oldEvent);
            res.render('popupContentedit.ejs', { newEvent,  oldEvent});
        });
        
    });

});

app.post("/approveEvent", (req, res) => {
    const eventId = parseInt(req.query.eventID);
    connection.query("select club_id from tempevents where event_id = ?", [eventId], (err, clubID) => {
        if (err){
            console.log("Error fetching club_id from event", err);
            return res.status(404).send("Internal Server Error");
        }
        const clubId = clubID[0].club_id;
        connection.query("select * from club where club_id = ?", [clubId], (err,clubInfo) => {
            if (err){
                console.log("Error fetching club Information from club", err);
                return res.status(404).send("Internal Server Error");
            }
            const clubName = clubInfo[0].club_name;
            connection.query("select * from tempevents where event_id = ?", [eventId], (err,eventInfo) => {
                if (err){
                    console.log("Error fetching event Information from temp Events", err);
                    return res.status(404).send("Internal Server Error");
                }
                connection.query("INSERT INTO history_event (event_id, language, date, time, guest_name, description, event_name, notes, location, capacity, category, imageUrl, club_id, status, comment, notificationstatus, club_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [eventId, eventInfo[0].language, eventInfo[0].date, eventInfo[0].time, eventInfo[0].guest_name, eventInfo[0].description, eventInfo[0].event_name, eventInfo[0].notes, eventInfo[0].location, eventInfo[0].capacity, eventInfo[0].category, eventInfo[0].imageUrl, clubId, 1, "", 0, clubName], (err, result) => {
                    if (err) {
                        console.log("Error Inserting into history_event ", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    connection.query("INSERT INTO event (event_id, language, date, time, guest_name, description, event_name, notes, location, capacity, category, imageUrl, club_id, club_name, clm_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )", [eventId, eventInfo[0].language, eventInfo[0].date, eventInfo[0].time, eventInfo[0].guest_name, eventInfo[0].description, eventInfo[0].event_name, eventInfo[0].notes, eventInfo[0].location, eventInfo[0].capacity, eventInfo[0].category, eventInfo[0].imageUrl, clubId, clubName, clubInfo[0].clm_id], (err, result) => {
                        if (err) {
                            console.log("Error Inserting into event ", err);
                            return res.status(500).send("Internal Server Error");
                        }
                        connection.query("DELETE from tempevents WHERE event_id = ?", [eventId], (err, result) => {
                            if (err) {
                                console.log("Error deleteing the requst from temp event edit : ", err);
                                return res.status(500).send("Internal Server Error");
                            }
                            res.redirect("/eventRequests");
                        });

                    });
                });

            });
        });
    });


});



app.post("/approveEventedit", (req, res) => {

    const eventId = parseInt(req.query.eventID); // Retrieve eventId from the query string

    connection.query("select club_id from event where event_id = ?", [eventId], (err, clubID) => {
        if (err){
            console.log("Error fetching club_id from event", err);
            return res.status(404).send("Internal Server Error");
        }
        const clubId = clubID[0].club_id;
        connection.query("select * from club where club_id = ?", [clubId], (err,clubInfo) => {
            if (err){
                console.log("Error fetching club Information from club", err);
                return res.status(404).send("Internal Server Error");
            }
            const clubName = clubInfo[0].club_name;
            connection.query("select * from tempeventedits where event_id = ?", [eventId], (err,eventInfo) => {
                if (err){
                    console.log("Error fetching event Information from temp Events", err);
                    return res.status(404).send("Internal Server Error");
                }

                connection.query("INSERT INTO history_eventEdits (event_id, language, date, time, guest_name, description, event_name, notes, location, capacity, category, imageUrl, club_id, status, comment, notificationstatus, club_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [eventId, eventInfo[0].language, eventInfo[0].date, eventInfo[0].time, eventInfo[0].guest_name, eventInfo[0].description, eventInfo[0].event_name, eventInfo[0].notes, eventInfo[0].location, eventInfo[0].capacity, eventInfo[0].category, eventInfo[0].imageUrl, clubId, 1, "", 0, clubName], (err, result) => {
                    if (err) {
                        console.log("Error Inserting into history_eventEdits ", err);
                        return res.status(500).send("Internal Server Error");
                    }

                    connection.query("UPDATE event SET clm_id = ?, language = ?, date = ?, time = ?, guest_name = ?, description = ?, event_name = ?, notes = ?, location = ?, capacity = ?, category = ?, imageUrl = ?, club_id = ?, club_name = ? WHERE event_id = ?",[clubInfo[0].clm_id, eventInfo[0].language, eventInfo[0].date, eventInfo[0].time, eventInfo[0].guest_name, eventInfo[0].description, eventInfo[0].event_name, eventInfo[0].notes, eventInfo[0].location, eventInfo[0].capacity, eventInfo[0].category, eventInfo[0].imageUrl, clubId, clubName, eventId], (err,result) => {
                        if (err) {
                            console.log("Error Updating Event Information: ", err);
                            return res.status(500).send("Internal Server Error");
                        }

                        connection.query("DELETE from tempeventedits WHERE event_id = ?", [eventId], (err, result) => {
                            if (err) {
                                console.log("Error deleteing the requst from temp event edit : ", err);
                                return res.status(500).send("Internal Server Error");
                            }
                            else{
                                const notificationType = "Edit Event Approved";
                                connection.query("INSERT INTO notifications_clm (notificationType, event_name, club_id) VALUES (?, ?, ?)" , [notificationType, event_name, clubId], (err) =>{
                                    if(err){
                                        console.log("error inseting to notifications: " + err.message);
                                    } else{
                                        res.redirect("/eventRequests");
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});
    

app.get("/statusClubManager", (req, res) => {

    connection.query("SELECT club_id FROM club_manager WHERE email = ?", [email], (err, userResult) => {
        if (err) {
            console.error("Error fetching userID:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (userResult.length === 0) {
            return res.status(404).send("User not found");
        }

        const clubId = userResult[0].club_id;

        connection.query(`SELECT event_name FROM tempevents WHERE club_id(?)`, [clubId], (err, results) => {
            if (err) {
                console.error("Error fetching temp events:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log(results);
            // Extracting event IDs from the results of the first query
            const eventIds = results.map(row => row.eventid);
            console.log(eventIds);
            res.render('statusClubManager.ejs', { role: 'club', email: req.session.email, loggedIn: true, tempevents: results });
        });
    });
});


app.get("/createEvent", (req, res) => {
    console.log(req.session.userID);
    res.render('createEvent.ejs');
});

app.post("/createEvent", async (req, res) => {
    const { uploadImage1 } = req.files;
    const imgPath = __dirname + '/public/images' + uploadImage1.name
    // Move the uploaded image to our upload folder
    uploadImage1.mv(imgPath);
    const imageName  = uploadImage1.name;
    const notificationType = "Create New Event";

    const email = req.session.email; // Retrieve email from request body
    const { eventName, guestName, eventDate, eventTime, eventLocation, capacity, description, notes, category } = req.body;
    const language = req.body.language; // Get the selected language

    const userId = req.session.userID;

    connection.query("SELECT club_name FROM club WHERE clm_id = ?", [userId], (err, resultClubName) => {
        const clubName = resultClubName[0].club_name;

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
                `INSERT INTO tempevents (club_id, event_name, guest_name, date, time, language, location, capacity, description, notes, category, clm_id,  imageUrl, club_name, request_type, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [clubId, eventName, guestName, eventDate, eventTime, language, eventLocation, capacity, description, notes, category, userId, imageName, clubName, "New Event", 0],
                `INSERT INTO tempevents (club_id, event_name, guest_name, date, time, language, location, capacity, description, notes, category, clm_id,  imageUrl, club_name, request_type, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [clubId, eventName, guestName, eventDate, eventTime, language, eventLocation, capacity, description, notes, category, userId, imageName, clubName, "New Event", 0],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting event into database:', error);
                        return res.status(500).send('Failed to insert');
                    }
                    else{
                        connection.query("INSERT INTO notifications_sks (notificationType, club_name, club_id) VALUES (?, ?, ?)" , [notificationType, clubName, clubId], (err) =>{
                            if(err){
                                console.log("error inseting to notifications: " + err.message);
                            } else{
                                res.redirect("/myclubpage");
                            }
                        });
                    }
            });
        });

    });

});

app.post('/updateEvent', (req, res) => {
    // Extract data from the request body
    console.log(req.body);
    const eventID          = parseInt(req.body.eventID);
    const clubName         = req.body.clubName;
    const eventName        = req.body.eventName;
    const eventDate        = req.body.eventDate;
    const eventTime        = req.body.eventTime;
    const eventLocation    = req.body.eventLocation;
    const eventLanguage    = req.body.eventLanguage;
    const eventGuest       = req.body.eventGuest;
    const eventDescription = req.body.eventDescription;
    const eventCapacity    = parseInt(req.body.eventCapacity);
    const eventNotes       = req.body.eventNotes;
    const eventCategory    = req.body.eventCategory;
    let imgName;
    const userID           = req.session.userID;
    const clubImage        =  req.body.clubImage;
    if (req.files != null){
        const { uploadImage1 } = req.files;
        const imgPath = __dirname + '/public/images' + uploadImage1.name
        uploadImage1.mv(imgPath);
        imgName = uploadImage1.name;
    }else {
         imgName = clubImage;
    }

    const queryString = `INSERT INTO tempeventedits (event_id, club_name, event_name, date, time, location, language, guest_name, description, capacity, notes, imageUrl, clm_id, status, request_type, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    console.log("this is the event image name:  " , imgName + "and this is the Date: " , eventDate);
    connection.query(queryString, [eventID, clubName, eventName, eventDate, eventTime, eventLocation, eventLanguage, eventGuest, eventDescription, eventCapacity, eventNotes, imgName, userID, 0, "Event Edits", eventCategory], (error, results, fields) => {
        if (error) {
            console.error('Error inserting into tempeventedits table:', error);
            return res.status(404).send("Internal Server Error");
        }
        const notificationType = "Edit Event Request";
        connection.query("INSERT INTO notifications_sks (notificationType, club_name, club_id) VALUES (?, ?, ?)" , [notificationType, clubName, req.session.clubID], (err) =>{
            if(err){
                console.log("error inseting to notifications: " + err.message);
            } else{
                res.redirect("/myclubpage");
            }
        });
            // Send back a response indicating success or failure
            
    });

});

app.get("/createPost", (req, res) => {
    res.render('createPost.ejs');
});

app.post("/createPost", async (req, res) => {
    console.log("The requuest is");
    const { ImagePost } = req.files;

    const imgPath = __dirname + '/public/images' + ImagePost.name
    // Move the uploaded image to our upload folder
    ImagePost.mv(imgPath);
    const imgName = ImagePost.name;

    const email = req.session.email; // Retrieve email from request body
    const postText = req.body.postText;

    connection.query("SELECT user_id FROM users WHERE email = ?", [email], (err, userResult) => {
        if (err) {
            console.error("Error fetching userID:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (userResult.length === 0) {
            return res.status(404).send("User not found");
        }

        const userId = userResult[0].user_id;
        console.log("\n\nuser id", userId);

        connection.query("SELECT club_name FROM club WHERE clm_id = ?", [userId], (err, resultClubName) => {
            const clubName = resultClubName[0].club_name;

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
                    `INSERT INTO tempposts (clm_id, club_id, club_name, postText, postImageUrl) VALUES (?, ?, ?, ?, ?)`,
                    [userId, clubId, clubName, postText, imgName],
                    (error, results, fields) => {
                        if (error) {
                            console.error('Error inserting event into database:', error);
                            return res.status(500).send('Failed to insert');
                        }
                        const notificationType = "Create New Post";
                        connection.query("INSERT INTO notifications_sks (notificationType, club_name, club_id) VALUES (?, ?, ?)" , [notificationType, clubName, clubId], (err) =>{
                            if(err){
                                console.log("error inserting to notification");
                            } else{
                                res.redirect("/myclubpage");
                            }
                        
                        });
                });

            });

        });
    });
});


//Route createClub
app.get("/createclub", (req, res) => {

    res.render("on_click_create_club.ejs", { role: 'sks', email: req.session.email, loggedIn: true });
});

app.post("/clubform", async (req, res) => {
    const name = req.body.name;
    const cars = req.body.cars;
    const manager = req.body.manager;
    const bio = req.body.bio;
    const number = req.body.number;
    const media1 = req.body.media1;
    const media2 = req.body.media2;
    const media3 = req.body.media3;
    const email = req.body.email;

    const { ImagePost } = req.files;
    const imgPath = __dirname + '/public/images' + ImagePost.name
    // Move the uploaded image to our upload folder
    ImagePost.mv(imgPath);
    const imgName = ImagePost.name;




    connection.query('INSERT INTO club(club_name, category, clm_id, bio, contact, social_media1, social_media2, social_media3, email) VALUES(?,?,?,?,?,?,?,?,?)',
        [name, cars, manager, bio, number, media1, media2, media3, email], (err, result) => {
            if (err) {
                console.error("Error inserting club:", error);
                res.status(500).send("Error creating club");
                return;
            }
            console.log("Club successfully created");
            res.send('Club successfully created');
        });
});

app.post('/rejectMessage', (req, res) => {
    const eventID = parseInt(req.query.eventID);
    const message = req.body.rejectionReason;

    connection.query('Select * from tempevents where event_id = ?', [eventID], (err,eventInfo) => {
        if(err) {
            console.log("Error fetching event from temp Events: " + err.message);
            return res.status(500).send("Internal Server Error");
        }

        console.log("Fetched Event from temp Events: " , eventInfo);
        connection.query("INSERT INTO history_event (event_id, language, date, time, guest_name, description, event_name, notes, location, capacity, category, imageUrl, club_id, status, comment, notificationstatus, club_name, clm_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [eventID, eventInfo[0].language, eventInfo[0].date, eventInfo[0].time, eventInfo[0].guest_name, eventInfo[0].description, eventInfo[0].event_name, eventInfo[0].notes, eventInfo[0].location, eventInfo[0].capacity, eventInfo[0].category, eventInfo[0].imageUrl, clubId, 0, "", 0, clubName, eventInfo[0].clm_id], (err, result) => {
            if (err) {
                console.log("Error Inserting into history_event ", err);
                return res.status(500).send("Internal Server Error");
            }

            connection.query("Delete from tempevents where event_id = ?", [eventID], (err, result) => {

                if (err) {
                    console.log("Error deleteing from temp event ", err);
                    return res.status(500).send("Internal Server Error");
                }
                res.redirect("/eventRequests");
            });
        });

    });
});
 
//Route Comparing 
app.get("/comparing", (req, res) => {

    if(!(req.session.loggedIn)){
        res.redirect("/");
    }  
    connection.query(`SELECT club_id FROM club`, (err, clubNames) => {
        if (err) {
            console.error("Error fetching temp posts:", err);
            return res.status(500).send("Internal Server Error");
        }

    connection.query(`SELECT * FROM tempposts`, (err, results) => {
        if (err) {
            console.error("Error fetching temp posts:", err);
            return res.status(500).send("Internal Server Error");
        }

        connection.query("Select * from tempprofile", (err, tempprofileedits) => {
            if (err){
                console.error("Error fetching temp profile:", err);
                return res.status(500).send("Internal Server Error");
            }
                    res.render("StatusManager.ejs", { clubNames, loggedIn: req.session.loggedIn, role: "sks", tempposts:results, tempprofileedits, results});
                })
                
        });
    });
});

// Route to handle approving a new post
app.post("/approvePost", (req, res) => {
    const postId = req.query.postId; 

    console.log("Received postId:", postId);
    connection.query('SELECT * FROM tempposts WHERE PostID = ?', [postId], (err, results) => {
        if (err) {
            console.error('Error fetching post data:', err);
            return res.status(500).send("Internal Server Error");
        }

        console.log("Fetched post data:", results);
            results[0].Status = 'approved';
            const { PostID, clubid, club_name, postText, postImageURL } = results[0];

            connection.query('INSERT INTO posts (PostID, club_id, club_name, postText, postImageURL) VALUES (?, ?, ?, ?, ?)',
                [PostID, clubid, club_name, postText, postImageURL], (err, result) => {
                    if (err) {
                        console.error("Error inserting post data into Posts table:", err);
                        return res.status(500).send("Internal Server Error");
                    }

                });

            connection.query('INSERT INTO history_post (PostID, club_name, club_id, postText, postImageURL, Status) VALUES (?, ?, ?, ?, ?, ?)',
                [PostID, club_name, clubid, postText, postImageURL, 'approved'], (err, result) => {
                    if (err) {
                        console.error("Error inserting post data into History_post table:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Post approved and moved to History_post table successfully!");
                    

                });

            connection.query('DELETE FROM tempposts WHERE PostID = ?', [postId], (err, result) => {
                if (err) {
                    console.error("Error deleting post from tempposts table:", err);
                    return res.status(500).send("Internal Server Error");
                }
                console.log("Post deleted from tempposts table successfully!");
               
            });
            
    });
    res.redirect("/comparing")
});

app.post("/rejectPost", (req, res) => {
    const postId = req.query.postId;
    const rejectionReason = req.body.rejectionReason;

    console.log("Received post rejection for Id:", postId);

    connection.query('SELECT * FROM tempprofile WHERE temp_id = ?', [postId], (err, postRejectionResults) => {
        if (err) {
            console.error('Error fetching profile edit data:', err);
            return res.status(500).send("Internal Server Error");
        }

        if (postRejectionResults.length === 0) {
            return res.status(404).send("Profile edit not found in tempprofile table");
        }

        const postReject = postRejectionResults[0];
        const { club_id, input, RequestType } = postReject;

        connection.query('INSERT INTO history_post (PostID, club_name, club_id, postText, postImageURL, Status, rejectionReason) VALUES (?, ?, ?, ?, ?, ?,?)',
        [PostID, club_name, clubid, postText, postImageURL, 'rejected',rejectionReason],
            (err, insertResult) => {
                if (err) {
                    console.error('Error inserting into history_profile:', err);
                    return res.status(500).send("Internal Server Error");
                }

                connection.query('DELETE FROM temppost WHERE PostID = ?', [postId], (err, deleteResult) => {
                    if (err) {
                        console.error("Error deleting post from temppost table:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("post rejected and removed from temppost table");
                    
                });
        });
    });
});

app.post("/approveProfileEdit", (req, res) => {
    const RequestId = req.query.temp_id;
    
    console.log("Received profile edit Id:", RequestId);

    connection.query('SELECT * FROM tempprofile WHERE temp_id = ?', [RequestId], (err, results) => {
        if (err) {
            console.error('Error fetching post data:', err);
            return res.status(500).send("Internal Server Error");
        }
        
        if (results.length === 0) {
            return res.status(404).send("Profile edit not found");
        }
        
        const profileEdit = results[0];
        const { club_id, RequestType, input } = profileEdit;

        if (RequestType === 'New Club Name') {
            connection.query('UPDATE club SET club_name = ? WHERE club_id = ?', [input, club_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating club name:', err);
                    return res.status(500).send("Internal Server Error");
                }
                const historyRecord = {
                    club_id: club_id,
                    temp_id: RequestId,
                    Status: 'approved',
                    RequestType: RequestType,
                    input: input
                };
                connection.query('INSERT INTO history_profile SET ?', historyRecord, (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting into history_profile:', err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Profile edit approved and history record inserted");
                   
                });
            });
        } else if (RequestType === 'New Category') {
            connection.query('UPDATE club SET category = ? WHERE club_id = ?', [input, club_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating category:', err);
                    return res.status(500).send("Internal Server Error");
                }
                const historyRecord = {
                    club_id: club_id,
                    temp_id: RequestId,
                    Status: 'approved',
                    RequestType: RequestType,
                    input: input                  
                };
                connection.query('INSERT INTO history_profile SET ?', historyRecord, (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting into history_profile:', err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Profile edit approved and history record inserted");
                    
                });
            });
        } else if (RequestType === 'New BIO') {
            connection.query('UPDATE club SET bio = ? WHERE club_id = ?', [input, club_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating bio:', err);
                    return res.status(500).send("Internal Server Error");
                }
                const historyRecord = {
                    club_id: club_id,
                    temp_id: RequestId,
                    Status: 'approved',
                    RequestType: RequestType,
                    input: input
                };
                connection.query('INSERT INTO history_profile SET ?', historyRecord, (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting into history_profile:', err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Profile edit approved and history record inserted");
                    
                });
            });
        } else if (RequestType === 'New Email') {
            connection.query('UPDATE club SET email = ? WHERE club_id = ?', [input, club_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating email:', err);
                    return res.status(500).send("Internal Server Error");
                }
                const historyRecord = {
                    club_id: club_id,
                    temp_id: RequestId,
                    Status: 'approved',
                    RequestType: RequestType,
                    input: input
                };
                connection.query('INSERT INTO history_profile SET ?', historyRecord, (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting into history_profile:', err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Profile edit approved and history record inserted");
                    
                });
            });
        } 
        else if (RequestType === 'New Club Image') {
            connection.query('UPDATE club SET clubImageUrl = ? WHERE club_id = ?', [input, club_id], (err, updateResult) => {
                if (err) {
                    console.error('Error updating club image:', err);
                    return res.status(500).send("Internal Server Error");
                }
                const historyRecord = {
                    club_id: club_id,
                    temp_id: RequestId,
                    Status: 'approved',
                    RequestType: RequestType,
                    input: input
                };
                connection.query('INSERT INTO history_profile SET ?', historyRecord, (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting into history_profile:', err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Profile edit approved and history record inserted");
                    
                });
            });
        }
        else {
            return res.status(400).send("Invalid RequestType");
        }

        connection.query('DELETE FROM tempprofile WHERE temp_id= ?', [RequestId], (err, result) => {
            if (err) {
                console.error("Error deleting post from tempprofile table:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log("Profile edit deleted from tempprofile table successfully!");
           
        });
    });
    res.redirect("/comparing")
});


app.post("/rejectProfileEdit", (req, res) => {
    const RequestId = req.query.temp_id;
    const rejectionReason = req.body.rejectionReason;

    console.log("Received profile edit rejection for Id:", RequestId);

    connection.query('SELECT * FROM tempprofile WHERE temp_id = ?', [RequestId], (err, profileEditResults) => {
        if (err) {
            console.error('Error fetching profile edit data:', err);
            return res.status(500).send("Internal Server Error");
        }

        if (profileEditResults.length === 0) {
            return res.status(404).send("Profile edit not found in tempprofile table");
        }

        const profileEdit = profileEditResults[0];
        const { club_id, input, RequestType } = profileEdit;

        connection.query('INSERT INTO history_profile (club_id, temp_id, Status, RequestType, input, rejectionReason) VALUES (?, ?, ?, ?, ?, ?)', 
            [club_id, RequestId, 'rejected', RequestType, input, rejectionReason],
            (err, insertResult) => {
                if (err) {
                    console.error('Error inserting into history_profile:', err);
                    return res.status(500).send("Internal Server Error");
                }

                connection.query('DELETE FROM tempprofile WHERE temp_id = ?', [RequestId], (err, deleteResult) => {
                    if (err) {
                        console.error("Error deleting profile edit from tempprofile table:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Profile edit rejected and removed from tempprofile table");
                    
                });
        });
    });
    res.redirect("/comparing")
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


app.post('/singleclubpage', (req, res) => {
    const clubID = req.query.club_id;

    connection.query("SELECT * FROM club WHERE club_id = ?", clubID, (err, clubInformation) => {
        if (err) {
            console.error("Error fetching club information:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (clubInformation.length === 0) {
            return res.status(500).send("Club Dosent Exist");
        }
        connection.query("select * from club_manager where club_id = ?", [clubID], (err, clubManager) => {
            if (err) {
                console.error("Error fetching Club manager name:", err);
                return res.status(500).send("Internal Server Error");
            }
            connection.query("select * from event where club_id = ?", [clubID], (err, event) => {
                if (err) {
                    console.error("Error fetching events:", err);
                    return res.status(500).send("Internal Server Error");
                }

                connection.query(`SELECT event_name FROM tempevents WHERE club_id = ?`, [clubID], (err, resultsTemp) => {
                    if (err) {
                        console.error("Error fetching temp events:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    // Extracting event IDs from the results of the first query

                    connection.query(`SELECT event_name, status, event_id FROM history_event WHERE club_id = ?`, [clubID], (err, resultsHistory) => {
                        if (err) {
                            console.error("Error fetching temp events:", err);
                            return res.status(500).send("Internal Server Error");
                        }

                        connection.query(`SELECT event_name, event_id FROM toshareevents WHERE club_id = ?`, [clubID], (err, resultsToShare) => {
                            if (err) {
                                console.error("Error fetching temp events:", err);
                                return res.status(500).send("Internal Server Error");
                            }
                            connection.query("Select * from posts where club_id = ?", [clubID], (err,Posts) => {
                                if(err){
                                    console.log("Error fetching posts: " + err.message);
                                    return res.status(404).send("Internal Server Error");
                                }
                                res.render("myclubpage.ejs", { clubInformation, clubManager, role: 'club', email: req.session.email, loggedIn: req.session.loggedIn, event, resultsTemp, resultsHistory, resultsToShare, Posts });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.post('/updateProfile', (req, res) => {
    // Extract data from the request body
    const email = req.session.email;
    connection.query("SELECT club_id FROM club_manager WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.log("Error fetching club id:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        const clubid = result[0].club_id;
        connection.query("SELECT * FROM club WHERE club_id = ?", [clubid], (err, clubResult) => {
            if (err) {
                console.log("Error fetching club details:", err.message);
                return res.status(500).send("Internal Server Error");
            }

            if(req.files){
                const { uploadImage1 } = req.files;
                console.log(uploadImage1.name);
                const imgPath = __dirname + '/public/' + uploadImage1.name
                uploadImage1.mv(imgPath);
                let imageName = uploadImage1.name;
                connection.query("INSERT INTO tempprofile (club_id, input, RequestType) VALUES (?, ?, ?)", [clubid, imageName, "New Club Image"], (err, result) => {
                    if(err){
                        console.log("Error Inserting Image: " + err.message);
                        return res.status(404).send("Internal Server Error");
                    }
                });

            }

            // Extract content from the request body
            const contentKeys = Object.keys(req.body).filter(key => key.endsWith('_content'));
            const contents = contentKeys.map(key => req.body[key].trim());

            // Extract content from the club details fetched from the database
            const clubContents = clubResult.map(row => Object.values(row)).flat();

            // Check if any content is found in the club details
            const newContents = contents.filter(content => !clubContents.includes(content));

            // Map contentKeys to requestType
            const requestTypeMap = {
                'club_name_content': 'New Club Name',
                'category_content': 'New Category',
                'bio_content': 'New BIO',
                'email_content': 'New Email'
            };

            // Insert new contents into the database
            for (const contentKey of contentKeys) {
                const requestType = requestTypeMap[contentKey];
                const newContent = req.body[contentKey].trim();
                if (newContents.includes(newContent) && newContents !== "") {
                    // Insert data into tempprofile table
                    connection.query("INSERT INTO tempprofile (club_id, input, RequestType) VALUES (?, ?, ?)", [clubid, newContent, requestType], (err, result) => {
                        if (err) {
                            console.log("Error inserting data:", err.message);
                            return res.status(500).send("Internal Server Error");
                        }
                    });
                }
            }
            // Render the home page after all inserts are done
            res.redirect("/myclubpage");
        });
    });
});


app.get("/notificationsClub", (req, res) => {
    const email = req.session.email;
    connection.query("SELECT club_id from club_manager where email = ?", [email], (err, result) => {
        if (err) {
            console.error("Error fetching club id:", err);
            return res.status(500).send("Internal Server Error");
        }
        let clubID = result[0].club_id;

        connection.query(`SELECT event_name, status, comment, event_id, notificationstatus FROM history_event WHERE club_id = ?`, [clubID], (err, resultsHistoryNot) => {
            if (err) {
                console.error("Error fetching temp events:", err);
                return res.status(500).send("Internal Server Error");
            } else {
                connection.query(`SELECT Status, rejectionReason, PostID, notificationstatus FROM history_post WHERE club_id = ?`, [clubID], (err, resultsHistoryPostNot) => {
                    if (err) {
                        console.error("Error fetching temp events:", err);
                        return res.status(500).send("Internal Server Error");
                    } else {
                        connection.query(`SELECT status, rejectionReason, edit_id, notificationstatus, requestType FROM historyprofileEdits WHERE club_id = ?`, [clubID], (err, resultsHistoryPostEditsNot) => {
                            if (err) {
                                console.error("Error fetching temp events:", err);
                                return res.status(500).send("Internal Server Error");
                            } else {
                                res.render("notifications.ejs", { loggedIn: true, role: "club", email: email, resultsHistoryNot, resultsHistoryPostNot,resultsHistoryPostEditsNot });
                            }
                        });
                    }
                });
            }
        });
    });
});

app.post("/changeNotificationStatusEvents", (req, res) => {
    const email = req.session.email;
    const eventID = req.query.eventId;

    connection.query("UPDATE history_event SET notificationstatus = 1 WHERE event_id = ?", [eventID], (err) => {
        if (err) {
            console.log("can't update the notifiction status")
        } else {
            console.log("The status has been updated");

            connection.query("SELECT club_id from club_manager where email = ?", [email], (err, result) => {
                if (err) {
                    console.error("Error fetching club id:", err);
                    return res.status(500).send("Internal Server Error");
                }
                let clubID = result[0].club_id;
        
                connection.query(`SELECT event_name, status, comment, event_id, notificationstatus FROM history_event WHERE club_id = ?`, [clubID], (err, resultsHistoryNot) => {
                    if (err) {
                        console.error("Error fetching temp events:", err);
                        return res.status(500).send("Internal Server Error");
                    } else {
                        connection.query(`SELECT Status, rejectionReason, PostID, notificationstatus FROM history_post WHERE club_id = ?`, [clubID], (err, resultsHistoryPostNot) => {
                            if (err) {
                                console.error("Error fetching temp events:", err);
                                return res.status(500).send("Internal Server Error");
                            } else {
                                connection.query(`SELECT status, rejectionReason, edit_id, notificationstatus, requestType FROM historyprofileEdits WHERE club_id = ?`, [clubID], (err, resultsHistoryPostEditsNot) => {
                                    if (err) {
                                        console.error("Error fetching temp events:", err);
                                        return res.status(500).send("Internal Server Error");
                                    } else {
                                        res.render("notifications.ejs", { loggedIn: true, role: "club", email: email, resultsHistoryNot, resultsHistoryPostNot,resultsHistoryPostEditsNot });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
});

app.post("/changeNotificationStatusPosts", (req, res) => {
    console.log("form has been sent");
    const email = req.session.email;
    const PostID = req.query.PostID;

    connection.query("UPDATE history_post SET notificationstatus = 1 WHERE PostID = ?", [PostID], (err) => {
        if (err) {
            console.log("can't update the notifiction status")
        } else {
            console.log("The status has been updated");

            connection.query("SELECT club_id from club_manager where email = ?", [email], (err, result) => {
                if (err) {
                    console.error("Error fetching club id:", err);
                    return res.status(500).send("Internal Server Error");
                }
                let clubID = result[0].club_id;
        
                connection.query(`SELECT event_name, status, comment, event_id, notificationstatus FROM history_event WHERE club_id = ?`, [clubID], (err, resultsHistoryNot) => {
                    if (err) {
                        console.error("Error fetching temp events:", err);
                        return res.status(500).send("Internal Server Error");
                    } else {
                        connection.query(`SELECT Status, rejectionReason, PostID, notificationstatus FROM history_post WHERE club_id = ?`, [clubID], (err, resultsHistoryPostNot) => {
                            if (err) {
                                console.error("Error fetching temp events:", err);
                                return res.status(500).send("Internal Server Error");
                            } else {
                                connection.query(`SELECT status, rejectionReason, edit_id, notificationstatus, requestType FROM historyprofileEdits WHERE club_id = ?`, [clubID], (err, resultsHistoryPostEditsNot) => {
                                    if (err) {
                                        console.error("Error fetching temp events:", err);
                                        return res.status(500).send("Internal Server Error");
                                    } else {
                                        res.render("notifications.ejs", { loggedIn: true, role: "club", email: email, resultsHistoryNot, resultsHistoryPostNot,resultsHistoryPostEditsNot });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
});

app.post("/changeNotificationStatusPostEdits", (req, res) => {
    console.log("form has been sent");
    const email = req.session.email;
    const edit_id = req.query.edit_id;

    connection.query("UPDATE historyprofileEdits SET notificationstatus = 1 WHERE edit_id = ?", [edit_id], (err) => {
        if (err) {
            console.log("can't update the notifiction status")
        } else {
            console.log("The status has been updated");

            connection.query("SELECT club_id from club_manager where email = ?", [email], (err, result) => {
                if (err) {
                    console.error("Error fetching club id:", err);
                    return res.status(500).send("Internal Server Error");
                }
                let clubID = result[0].club_id;
        
                connection.query(`SELECT event_name, status, comment, event_id, notificationstatus FROM history_event WHERE club_id = ?`, [clubID], (err, resultsHistoryNot) => {
                    if (err) {
                        console.error("Error fetching temp events:", err);
                        return res.status(500).send("Internal Server Error");
                    } else {
                        connection.query(`SELECT Status, rejectionReason, PostID, notificationstatus FROM history_post WHERE club_id = ?`, [clubID], (err, resultsHistoryPostNot) => {
                            if (err) {
                                console.error("Error fetching temp events:", err);
                                return res.status(500).send("Internal Server Error");
                            } else {
                                connection.query(`SELECT status, rejectionReason, edit_id, notificationstatus, requestType FROM historyprofileEdits WHERE club_id = ?`, [clubID], (err, resultsHistoryPostEditsNot) => {
                                    if (err) {
                                        console.error("Error fetching temp events:", err);
                                        return res.status(500).send("Internal Server Error");
                                    } else {
                                        res.render("notifications.ejs", { loggedIn: true, role: "club", email: email, resultsHistoryNot, resultsHistoryPostNot,resultsHistoryPostEditsNot });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
});


app.post("/ToEditManager", (req, res) => {
    const clubId = req.query.clubId;
    console.log("To edit manager " + clubId);
    res.send("entered to edit manager");
});

app.get("/popupEditManager", (req, res) => {
    const buttonId = req.query.clubId;
    console.log("Button Id" + buttonId);
    const lastIndex = buttonId.lastIndexOf('_');
    const clubId = buttonId.substring(lastIndex + 1); // Extract the substring after the last '_'
    console.log("Club Id" + clubId);

    // Get the button ID from the query string

    console.log("club Id from pop up edit manager is " + clubId);
    // Fetch popup content based on button ID from the database or any other source
    connection.query('SELECT clm_id FROM club_manager', (err, resultsClubManagers) => {
        if (err) {
            console.log("couldn't fetch club managers", err);
        }
        console.log({ resultsClubManagers });
        res.render('popupEditManager.ejs', { resultsClubManagers, clubId });
    });

});


app.post("/EditManagerRequest", (req, res) => {
    const clubId = req.query.clubId;
    const newManagerID = req.body.newManagerID;
    console.log("club Id from post path in index " + clubId);

    connection.query('UPDATE club SET clm_id = ? WHERE club_id = ?', [newManagerID, clubId], (err, result) => {
        if (err) {
            console.log("couldn't update manager");
        }
        else {
            res.redirect('/clubManagerSks');
        }

    });
});

app.get("/popupDeleteClub", (req, res) => {
    const buttonId = req.query.clubId;
    console.log("Button Id" + buttonId);
    const lastIndex = buttonId.lastIndexOf('_');
    const clubId = buttonId.substring(lastIndex + 1); // Extract the substring after the last '_'
    console.log("Club Id" + clubId);

    // Get the button ID from the query string

    console.log("club Id from pop up delete club is " + clubId);
    // Fetch popup content based on button ID from the database or any other source
    res.render('popupDeleteClub.ejs', {clubId });

});

app.post("/DeleteClubRequest", (req, res) => {
    const clubId = req.query.clubId;
    console.log("Entered the delete path. Club ID:", clubId);
        connection.query('DELETE FROM club WHERE club_id = ?', [clubId], (err, result) => {
        if (err) {
            console.log("couldn't delete club");
        }
        else {
            res.redirect('/clubManagerSks');
        }
    });
});

app.get("/clubs", (req, res) => {
    if (!req.session.loggedIn) {
        connection.query("SELECT category, clubImageUrl, club_name, bio, club_id FROM club", (error, resultClubs) => {
            if (error) {
                console.log("Error fetching categories");
            } else {
                res.render("clubs.ejs", { loggedIn: false, role: null, email: null, resultClubs });
            }
        });
    }
    else{
        connection.query("SELECT category, clubImageUrl, club_name, bio, club_id FROM club", (error, resultClubs) => {
            if (error) {
                console.log("Error fetching categories");
            } else {
                res.render("clubs.ejs", { role: req.session.role, email: req.session.email, loggedIn: req.session.loggedIn, resultClubs });
            }
        });

    }

});

app.get("/homepage", (req, res) => {
   
   
    connection.query('SELECT * FROM event ', (err, contents) => {
        if (err) {
            console.log('didnt get', err);
        }
        console.log({ contents });

        res.render('home.ejs', {contents});
    });

});

app.post('/singleclubpage', (req, res) => {

    const clubID = req.query.club_id;
    console.log("club id from single page is " + clubID);
    connection.query("SELECT * FROM club WHERE club_id = ?", clubID, (err, clubInformation) => {
        if (err) {
            console.error("Error fetching club information:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (clubInformation.length === 0) {
            return res.status(500).send("Club Dosent Exist");
        }
        console.log("clubInformation");

        console.log(clubInformation);
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

                connection.query(`SELECT event_name FROM tempevents WHERE club_id = ?`, [clubID], (err, resultsTemp) => {
                    if (err) {
                        console.error("Error fetching temp events:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log(resultsTemp);
                    // Extracting event IDs from the results of the first query

                    connection.query(`SELECT event_name, status, event_id FROM history_event WHERE club_id = ?`, [clubID], (err, resultsHistory) => {
                        if (err) {
                            console.error("Error fetching temp events:", err);
                            return res.status(500).send("Internal Server Error");
                        }
                        console.log(resultsHistory);

                        connection.query(`SELECT event_name, event_id FROM toshareevents WHERE club_id = ?`, [clubID], (err, resultsToShare) => {
                            if (err) {
                                console.error("Error fetching temp events:", err);
                                return res.status(500).send("Internal Server Error");
                            }
                            console.log(resultsToShare);
                            res.render("myclubpage.ejs", { clubInformation, name, role: 'club', email: req.session.email, loggedIn: false, event, resultsTemp, resultsHistory, resultsToShare });

                        });
                    });
                });
            });
        });
    });
});

app.get("/notificationsSks", (req, res) =>{
    const email = req.session.email;
    
    connection.query("SELECT n.notificationType, n.club_name, n.notify_id, n.club_id, n.status_notification,c.clubImageUrl FROM notifications_sks n JOIN club c ON n.club_id = c.club_id", (err, resultNotiNewEvent)=>{
        if(err){
            console.log("error with join");
        } else{
            res.render("notificationsSks.ejs", { loggedIn: true, role: "sks", email: email, resultNotiNewEvent});
        }
    });
});

app.post("/changeNotificationStatusSks", (req, res) =>{
    console.log("Entered the notificatio edit sks");
    const email = req.session.email;
    const notify_id = req.query.notify_id;

    connection.query("UPDATE notifications_sks SET status_notification = 1 WHERE notify_id = ?", [notify_id], (err) => {
        if(err){
            console.log("Error notification updated" + err.message);
        }else{
            connection.query("SELECT n.notificationType, n.club_name, n.notify_id, n.club_id, n.status_notification,c.clubImageUrl FROM notifications_sks n JOIN club c ON n.club_id = c.club_id", (err, resultNotiNewEvent)=>{
                if(err){
                    console.log("error with join");
                } else{
                    res.render("notificationsSks.ejs", { loggedIn: true, role: "sks", email: email, resultNotiNewEvent});
                }
            });
        }  
    }); 
});

app.get("/album", (req, res) => {
    const event_id = req.query.event_id;
   
    console.log(event_id);
    // Fetch popup content based on button ID from the database or any other source
    console.log("this is the button id: " + event_id);
    connection.query('SELECT * FROM event_album where event_id = ?', [event_id], (err, results) => {
        if (err) {
            console.log('didnt get', err);
        }
        console.log({ results });
        res.render('album.ejs', { results });
    });

});


//listining to the port 
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
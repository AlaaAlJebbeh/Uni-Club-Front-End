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

app.post("/deletepost", (req, res) => {

    const postID = parseInt(req.query.postID);
    console.log("Post ID: " + postID);

    connection.query("DELETE FROM posts WHERE PostID = ?", [postID], (err, result) => {
        if(err){
            console.log("There was an error deleting the post " + err.message);
            return res.status(404).send("Internal Server Error");
        }
        console.log("Deleted Successfully");
        res.redirect("/myclubpage");

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
    console.log("To share " + eventId);
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
            res.render('eventRequests.ejs', { role: 'sks', email: req.session.email, loggedIn: true, tempevents: results, events });

        });

        connection.query(`SELECT * FROM event WHERE event_id IN (?)`, [eventIds], (err, events) => {
            if (err) {
                console.error("Error fetching events:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log(events);
            res.render('eventRequests.ejs', { role: 'sks', email: req.session.email, loggedIn: true, tempevents: results, events });

        }); 



    });



});


app.get("/clubManagerSks", (req, res) => {
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
                res.render("clubManagerSks.ejs", { resultClubs, clubNames });
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


app.post("/approveEvent", (req, res) => {
    const eventId = req.query.eventId; // Retrieve eventId from the query string

    console.log("Received eventId:", eventId);

    connection.query('SELECT * FROM tempevents where event_id = ?', [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event data:', err);
            return res.status(500).send("Internal Server Error");
        }

        console.log("Fetched event data:", results);

        // Assuming you want to insert the entire event data into the toshareevents table
        const eventData = JSON.stringify(results);

/*
        connection.query('UPDATE tempevents SET status = 1 WHERE event_id = ?', [eventId], (err, result) => {
            if (err) {
                console.error("Error updating status in temporary events table:", err);
                return res.status(500).send("Internal Server Error");
            }

            console.log("Status updated in temporary events table");

*/
            results.forEach(event => {

                        event.status = 1;
                        // Insert each event from the results array into the toshareevents table
                        connection.query('INSERT INTO toshareevents SET ?', [event], (err, result) => {
                            if (err) {
                                console.error("Error inserting event data into toshareevents:", err);
                                return res.status(500).send("Internal Server Error");
                            }

                            console.log("Event approved successfully!");
                            // Optionally, handle the result or send a response to the client
                        });

                        connection.query('INSERT INTO history_event SET ?', [event], (err, result) => {
                            if (err) {
                                console.error("Error inserting event data into history of events", err);
                                return res.status(500).send("Internal Server Error");
                            }
                            console.log("Event approved successfully!");
                            // Optionally, handle the result or send a response to the client
                        });


                        console.log("Event approved successfully!");

                            connection.query("Delete FROM tempevents where event_id = ?", [eventId], (err, result) => {
                                if (err) {
                                    console.error('Error deleting from  database:', error);
                                    return res.status(500).send('Failed to delete');
                                } else {
                                    res.redirect("/eventRequests");
                                }

                              
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
                `INSERT INTO tempevents (club_id, event_name, guest_name, date, time, language, location, capacity, description, notes, category, clm_id,  imageUrl, club_name)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [clubId, eventName, guestName, eventDate, eventTime, language, eventLocation, capacity, description, notes, category, userId, imageName, clubName],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting event into database:', error);
                        return res.status(500).send('Failed to insert');
                    }
                    else{
                        connection.query("INSERT INTO notifications_sks(notificationType, club_name, club_id,   )")
                        res.redirect("/myclubpage");

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
    let imgName;
    const userID           = req.session.userID;
    const clubImage        =  req.body.clubImage;
    if (req.files != null){
        const { uploadImage1 } = req.files;
        const imgPath = __dirname + '/public/' + uploadImage1.name
        imgName = uploadImage1.name;
        // Move the uploaded image to our upload folder
        uploadImage1.mv(imgPath);
    }else {
         imgName = clubImage;
    }

    const queryString = `INSERT INTO tempeventedits (event_id, club_name, event_name, date, time, location, language, guest_name, description, capacity, notes, imageUrl, clm_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;


    connection.query(queryString, [eventID, clubName, eventName, eventDate, eventTime, eventLocation, eventLanguage, eventGuest, eventDescription, eventCapacity, eventNotes, imgName, userID, 0 ], (error, results, fields) => {
        if (error) {
            console.error('Error inserting into tempeventedits table:', error);
            return res.status(404).send("Internal Server Error");
        }
            // Send back a response indicating success or failure
            res.redirect('/myclubpage');
            console.log("Data inserted Successfully");
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
                        res.redirect("/myclubpage");
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
    const event_id = req.body.event_id;
    const rejectionReason = req.body.rejectionReason;

    // Update the event status to 'rejected' in history_event table
    const rejectQuery = `
        INSERT INTO history_event (event_id, clm_id, language, date, time, guest_name, description, event_name, notes, location, capacity, category, imageUrl, club_id, status, comment)
        SELECT event_id, clm_id, language, date, time, guest_name, description, event_name, notes, location, capacity, category, imageUrl, club_id, '0',  ? FROM tempevents WHERE event_id = ?;
    `;

    // Delete the event from the event table
    const deleteEventQuery = `
        DELETE FROM tempevents WHERE event_id = ?;
    `;

    connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            res.status(500).send('Error rejecting event');
            return;
        }

        connection.query(rejectQuery, [rejectionReason, event_id], (err, results) => {
            if (err) {
                console.error('Error moving event to history_event:', err);
                connection.rollback(() => {
                    res.status(500).send('Error rejecting event');
                });
            } else {
                connection.query(deleteEventQuery, [event_id], (err, results) => {
                    if (err) {
                        console.error('Error deleting event:', err);
                        connection.rollback(() => {
                            res.status(500).send('Error rejecting event');
                        });
                    } else {
                        connection.commit(err => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                connection.rollback(() => {
                                    res.status(500).send('Error rejecting event');
                                });
                            } else {
                                console.log('Event rejected and deleted successfully');
                                res.status(200).send('Event rejected and deleted successfully');
                            }
                        });
                    }
                });
            }

        });



    });

        });
 




//Route Comparing 
app.get("/comparing", (req, res) => {

    if(!(req.session.loggedIn)){
        res.redirect("/");
    }
    // Query to retrieve data from the 'TempPosts' table
    connection.query("SELECT * FROM tempposts", (err, TempPosts) => {
        if (err) {
            console.log(err.message);
            return res.status(500).send("Internal Server Error2");
        }

        // Query to retrieve data from the 'PostEditRequests' table
        connection.query("SELECT * FROM posteditrequests", (err, PostEditRequests) => {
            if (err) {
                console.log(err.message);
                return res.status(500).send("Internal Server Error2");
            }

            // Array to store promises for fetching club names for TempPosts
            const tempPromises = [];

            // Iterate over each item in TempPosts to fetch club names asynchronously
            TempPosts.forEach(item => {
                // Create a promise for each query to fetch club name
                const promise = new Promise((resolve, reject) => {
                    connection.query("SELECT club_name FROM club WHERE club_id = ?", [item.club_id], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            // Resolve the promise with club name or null if not found
                            resolve(result.length > 0 ? result[0].club_name : null);
                        }
                    });
                });
                // Push the promise to the array of promises
                tempPromises.push(promise);
            });

            // Array to store promises for fetching club names for PostEditRequests
            const postPromises = [];

            // Iterate over each item in PostEditRequests to fetch club names asynchronously
            PostEditRequests.forEach(item => {
                // Create a promise for each query to fetch club name
                const promise = new Promise((resolve, reject) => {
                    connection.query("SELECT club_name FROM club WHERE club_id = ?", [item.club_id], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            // Resolve the promise with club name or null if not found
                            resolve(result.length > 0 ? result[0].club_name : null);
                        }
                    });
                });
                // Push the promise to the array of promises
                postPromises.push(promise);
            });

            // Wait for all promises to resolve using Promise.all
            Promise.all([...tempPromises, ...postPromises])
                .then(clubNames => {
                    // Combine data from TempPosts and PostEditRequests into a single array
                    const combinedData = [...TempPosts, ...PostEditRequests];
                    // Render the 'StatusManager.ejs' template with the combined data and club names
                    res.render("StatusManager.ejs", { combinedData, clubNames, email: req.session.email, loggedIn: true, role: "sks" });
                })
                .catch(err => {
                    console.error(err);
                    // Handle error appropriately
                    return res.status(500).send("Internal Server Error");
                });
        });
    });
});

// Route to handle approving a new post
app.post("/approvePost", (req, res) => {
    const postId = req.query.postId; // Retrieve postId from the query string

    console.log("Received postId:", postId);

    // Fetch the post data from the tempposts table based on the postId
    connection.query('SELECT * FROM tempposts WHERE PostID = ?', [postId], (err, results) => {
        if (err) {
            console.error('Error fetching post data:', err);
            return res.status(500).send("Internal Server Error");
        }

        console.log("Fetched post data:", results);

        // Iterate over the fetched results
            
            // Update the status of each post to 'approved'
            results[0].Status = 'approved';

            // Extract required data for insertion into Posts table
            const { PostID, clubid, club_name, postText, postImageURL } = results[0];

            // Insert the post into the Posts table
            connection.query('INSERT INTO posts (PostID, club_id, club_name, postText, postImageURL) VALUES (?, ?, ?, ?, ?)',
                [PostID, clubid, club_name, postText, postImageURL], (err, result) => {
                    if (err) {
                        console.error("Error inserting post data into Posts table:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                   
                
                // Extract required data for insertion into History_post table
                const  club_id  = results[0].club_id;

                // Insert the post into the History_post table
                connection.query('INSERT INTO history_post (PostID, club_name, club_id, postText, postImageURL, Status) VALUES (?, ?, ?, ?, ?, ?)',
                    [PostID, club_name, club_id, postText, postImageURL, 'approved'], (err, result) => {
                        if (err) {
                            console.error("Error inserting post data into History_post table:", err);
                            return res.status(500).send("Internal Server Error");
                        }
                        console.log("Post approved and moved to History_post table successfully!");
                        
                        // Delete the post from the tempposts table
                        connection.query('DELETE FROM tempposts WHERE PostID = ?', [postId], (err, result) => {
                            if (err) {
                                console.error("Error deleting post from tempposts table:", err);
                                return res.status(500).send("Internal Server Error");
                            }
                            console.log("Post deleted from tempposts table successfully!");
                            res.redirect("/comparing");
                        });
                    });
                }); 

    });
  
});

// Route to handle approving a post edit request
app.post("/approvePostEditRequest", (req, res) => {
    const requestId = req.query.requestId; // Retrieve requestId from the query string

    console.log("Received requestId:", requestId);

    // Fetch the edit request data from posteditrequests based on the requestId
    connection.query('SELECT * FROM posteditrequests WHERE RequestID = ?', [requestId], (err, results) => {
        if (err) {
            console.error('Error fetching post edit request data:', err);
            return res.status(500).send("Internal Server Error");
        }
        console.log("Fetched post edit request data:", results);
        // Iterate over the fetched results
        results.forEach(request => {
            // Extract required data for insertion into tempprofile table
            const { club_id, newImage, newBio, newPhone, newEmail, newSC1, newSC2, newSC3, requestType, clm_id } = request;

            // Insert the edit request data into the tempprofile table
            connection.query('INSERT INTO tempprofile (club_id, newImage, newBio, newPhone, newEmail, newSC1, newSC2, newSC3, requestType, clm_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [club_id, newImage, newBio, newPhone, newEmail, newSC1, newSC2, newSC3, requestType, clm_id], (err, result) => {
                    if (err) {
                        console.error("Error inserting edit request data into tempprofile table:", err);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("Post edit request approved and moved to tempprofile table successfully!");
                });

            // Delete the edit request from posteditrequests table
            connection.query('DELETE FROM posteditrequests WHERE RequestID = ?', [requestId], (err, result) => {
                if (err) {
                    console.error("Error deleting edit request from posteditrequests table:", err);
                    return res.status(500).send("Internal Server Error");
                }
                console.log("Post edit request deleted from posteditrequests table successfully!");
            });
        });
    });
});


app.post('/reject', (req, res) => {
    const postId = req.body.postId;
    const rejectionReason = req.body.rejectionReason;

    // Update the post status to 'rejected' in History_post table
    const rejectQuery = `INSERT INTO history_post (PostID, Status, rejectionReason)
                         VALUES (?, 'rejected', ?);
                        `;

    // Move post from TempPosts to History_post
    const movePostQuery = `
    INSERT INTO history_post (PostID, clm_id, club_id, club_name, postText, postImageURL, Status, rejectionReason)
    SELECT PostID, clm_id, club_id, club_name, postText, postImageURL, 'rejected', ? FROM tempposts WHERE PostID = ?;
    `;


    connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            res.status(500).send('Error rejecting post');
            return;
        }

        connection.query(movePostQuery, [rejectionReason, postId], (err, results) => {
            if (err) {
                console.error('Error moving post to History_post:', err);
                connection.rollback(() => {
                    res.status(500).send('Error rejecting post');
                });
            } else {
                connection.query(`DELETE FROM tempposts WHERE PostID = ?`, [postId], (err, results) => {
                    if (err) {
                        console.error('Error deleting post from TempPosts:', err);
                        connection.rollback(() => {
                            res.status(500).send('Error rejecting post');
                        });
                    } else {
                        connection.commit(err => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                connection.rollback(() => {
                                    res.status(500).send('Error rejecting post');
                                });
                            } else {
                                console.log('Post rejected and deleted successfully');
                                res.status(200).send('Post rejected and deleted successfully');
                            }
                        });
                    }
                });
            }
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


app.get('/singleclubpage', (req, res) => {

    let email = req.session.email;

    connection.query("SELECT club_id from club_manager where email = ?", [email], (err, result) => {
        if (err) {
            console.error("Error fetching club id:", err);
            return res.status(500).send("Internal Server Error");
        }
        let clubID = 23;
        console.log("club ID " + clubID);
        connection.query("SELECT * FROM club WHERE club_id = ?", clubID, (err, clubInformation) => {
            if (err) {
                console.error("Error fetching club information:", err);
                return res.status(500).send("Internal Server Error");
            }
            if (clubInformation.length === 0) {
                return res.status(500).send("Club Dosent Exist");
            }
            connection.query("select name from club_manager where club_id = ?", [clubID], (err, name) => {
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
                                res.render("myclubpage.ejs", { clubInformation, name, role: 'club', email: req.session.email, loggedIn: false, event, resultsTemp, resultsHistory, resultsToShare });
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
                connection.query("INSERT INTO tempprofile (club_id, input, requestType) VALUES (?, ?, ?)", [clubid, imageName, "New Club Image"], (err, result) => {
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
                    connection.query("INSERT INTO tempprofile (club_id, input, requestType) VALUES (?, ?, ?)", [clubid, newContent, requestType], (err, result) => {
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


app.get("/notifications", (req, res) => {
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
    console.log("form has been sent");
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
                res.render("clubs.ejs", { role: 'club', email: req.session.email, loggedIn: req.session.loggedIn, resultClubs });
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
    console.log("club ID " + clubID);
    connection.query("SELECT * FROM club WHERE club_id = ?", clubID, (err, clubInformation) => {
        if (err) {
            console.error("Error fetching club information:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (clubInformation.length === 0) {
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

//listining to the port 
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
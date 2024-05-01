import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path  from "path";
import mysql from "mysql";
import { constrainedMemory } from "process";
import { name } from "ejs";
const __dirname = dirname(fileURLToPath(import.meta.url));

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
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function clubname(id){
    connection.query('select club_name from clubs where club_id =' + id, (err, res) => {
            return res.club_name;
        
    });
}


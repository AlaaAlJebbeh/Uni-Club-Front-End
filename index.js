import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path  from "path";
import mysql from "mysql";
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
        message: 'Welcome to my club page!'
        // Add more data as needed
    };

    res.render('myclubpage.ejs', data); 

});

app.get("/createclub", (req, res) => {

    res.render("on_click_create_club.ejs");
});

app.get("/on_click_create_club", (req, res) => {
    res.render("on_click_create_club.ejs");
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get("/comparing", (req, res) => {

    res.render("Compare.ejs");

});

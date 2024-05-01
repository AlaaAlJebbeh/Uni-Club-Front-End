import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path  from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 8000;

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

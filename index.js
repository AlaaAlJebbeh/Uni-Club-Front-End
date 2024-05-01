import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;



app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home.ejs");
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

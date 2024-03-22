import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("aboutUs.ejs");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

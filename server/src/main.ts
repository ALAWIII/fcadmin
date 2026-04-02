import express from "express";

let app = express();
app.get("/hello", (req, resp) => {
  resp.send("hello mama!");
});

app.listen(9009, "localhost");

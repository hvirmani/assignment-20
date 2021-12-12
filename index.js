const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const methodOverride = require("method-override");

let todos = [];

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

function read() {
  return new Promise(function (resolve, reject) {
    fs.readFile("db.txt", "utf-8", function (err, data) {
      if (err) {
        reject();
      }
      if (data.length > 0 && data[0] == "[" && data[data.length - 1] == "]") {
        todos = JSON.parse(data);
      }
      resolve(todos);
    });
  });
}

function write(todos) {
  return new Promise(function (resolve, reject) {
    fs.writeFile("db.txt", JSON.stringify(todos), function (err) {
      if (err) {
        console.log("err");
      }
      resolve();
    });
  });
}

app.get("/", function (req, res) {
  read()
    .then(function (todos) {
      res.render("todos", { todos });
    })
    .catch(function (err) {
      res.send("err");
    });
});

app.post("/todo", upload.single("profile"), function (req, res) {
  const { todo } = req.body;
  read()
    .then(function (todos) {
      todos.push({ task: todo, img: req.file.filename, id: uuid() });
      return todos;
    })
    .then(write)
    .then(function () {
      console.log("Done");
      res.redirect("/");
    })
    .catch(function (err) {
      res.send(err);
    });
});

app.delete("/todos/:id", function (req, res) {
  const { id } = req.params;
  read()
    .then(function (todos) {
      todos = todos.filter(function (todo) {
        return todo.id != id;
      });
      return todos;
    })
    .then(write)
    .then(function () {
      console.log("Deleted");
      res.redirect("/");
    })
    .catch(function (err) {
      res.send(err);
    });
});

app.listen(3300, function () {
  console.log("listening on port 3300");
});

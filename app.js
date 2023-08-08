const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/todoListDB', {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
  console.log("CONNECTION OPEN!!!");
}).catch(err => {
  console.log("OH NO ERROR!!!");
  console.log(err);
})

const app = express();

// New items can be pushed to an array that is a const variable, but
// the variable cannot be reassigned
// const items = ["Work Out",
//               "Read the first chapter of 'Growth: From Microorganisms to Megacities'",
//               "Code for 2 hours"
//             ];
const workItems = [];

const todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name']
  }
})

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const Todo = mongoose.model('Todo', todoSchema)

const item1 = new Todo({
  name: "Welcome to your todolist"
})

const item2 = new Todo({
  name: "Hit the + button to add a new item"
})

const item3 = new Todo({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

// console.log(defaultItems);

// Todo.insertMany([
//   {name: 'Code for 2 hours'},
//   {name: 'Iron all washed clothes'},
//   {name: 'Go shopping'},
//   {name: 'Complete pending school projects'}
// ]).then((data) => console.log(data))

//


app.get("/", function(req, res){

  let day = date.getDate();
  Todo.find().then((Todoitems) => {
    if (Todoitems.length === 0) {
      Todo.insertMany(defaultItems).then(() => console.log(""))
      res.redirect("/")
    } else {
      res.render('list', {listTitle: day, newListItems: Todoitems})
    }
  })
  // res.render('list', {listTitle: day, newListItems: items})


});

app.post("/", function(req, res){


  let newTask = req.body.newItem;
    // if (req.body.list === "Work List"){
    //   workItems.push(item);
    //   res.redirect("/work");
    // } else {
    //   items.push(item);
    //   res.redirect("/");
    // }

    itemy = new Todo({
      name: newTask
    })

    itemy.save()
    res.redirect('/')

});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox
  Todo.deleteOne({_id: checkedItem})
  .then((data) => console.log(data, 'Successfully deleted'))
  .catch((err) => console.log(err))
  res.redirect("/");
})


app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});

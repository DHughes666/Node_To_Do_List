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


const todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name']
  }
})

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name']
  },
  items: [todoSchema]
})

const Listy = mongoose.model("Listy", listSchema)

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


});

//Creating Dynamic routes
app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

    Listy.findOne({name: customListName})
      .then(itemFound => {
        if (itemFound) {
          //Show an existing list
          res.render("list", {listTitle: itemFound.name, newListItems: itemFound.items})
        } else {
          //Create a new list
          const list = new Listy({
            name: customListName,
            items: defaultItems
          })
          list.save()
          res.redirect("/" + customListName)
        }
      })
      .catch(error => {
        console.error(error);
      })

  })


app.post("/", function(req, res){


  const newTask = req.body.newItem;
  const listName = req.body.list;

    itemy = new Todo({
      name: newTask
    })

    if (listName === "Today") {
      itemy.save();
      res.redirect('/');
    } else {
      Listy.findOne({name: listName}).then(fItem => {
        fItem.items.push(itemy);
        fItem.save();
        res.redirect("/" + listName);
      })
    }

});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox
  const listName = req.body.listName

  if (listName === 'Today') {
    // Todo.deleteOne({_id: checkedItem})
    // .then((data) => console.log(data, 'Successfully deleted'))
    // .catch((err) => console.log(err))

    //Method TWO
    Todo.findByIdAndRemove({_id: checkedItem})
    .then(() => console.log("Successfully deleted checked item."))
    .catch((err) => console.log("Delete Unsuccessfull"))
    res.redirect("/")
  } else {
    Listy.findOneAndUpdate(
      {name: listName}, {$pull: {items: {_id: checkedItem}}}).then(f_item => {
        res.redirect("/" + listName)
      }).catch((err) => console.log(err))
  }


})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
});

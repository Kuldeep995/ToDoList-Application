//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
mongoose.connect('mongodb+srv://kuldeep:cloud0pass@cluster0.tp9rn.mongodb.net/tododb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = {
  name: String
};


const Item = mongoose.model("Item", itemSchema);


const aSchema = {
  name: String,
  items: [itemSchema]
};

const Aitem = mongoose.model("Aitem", aSchema);

const item1 = new Item({
  name: "Wake-up"
});
const item2 = new Item({
  name: "Read Book"
});
const item3 = new Item({
  name: "Workout"
});


const defaultItems = [item1, item2, item3];


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


const workItems = [];

app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({}, function(err, items) {

    if (err)
      console.log(err);
    else {
      if (items.length === 0) {

        Item.insertMany(defaultItems, function(err) {

          if (err)
          {  console.log(err); console.log("items not added succesfully"); }
          else
            console.log("items added succesfully");
            res.redirect("/");
        })


      }
      else{
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
    }
  })


});

app.post("/", function(req, res) {

 const listname=req.body.list;
  const item = new Item({
    name: req.body.newItem
 });


  if(listname === "Today")
  {
    item.save();
      res.redirect("/");

  }
  else{

    Aitem.findOne({name:listname}, function(err, result){

        if(result)
        {
          console.log("camehere");
          result.items.push(item);
          result.save();
        }
        res.redirect("/"+ listname);
    })

  }


});

app.post("/new", function(req, res){

console.log(req.body.listName[0]);
  if(req.body.listName[0] === "Today")
  {
    Item.findByIdAndRemove(req.body.v1,function(err){

       if(err)
       console.log("could not delete");
       else
       console.log("deleted item");
    });
    res.redirect("/");
  }
  else{

    Aitem.findOneAndUpdate({name:req.body.listName[0]}, {$pull: {items: {_id:req.body.v1}}}, function(err, result){
      if(!err)
      {
        res.redirect("/"+req.body.listName[0]);
      }
    })

  }


});

app.get("/:name", function(req, res) {

var pname=_.capitalize(req.params.name);
  Aitem.findOne({name:pname}, function(err, result){

     if(!result)
     {
       const aitem= new Aitem({
         name:pname,
         items:defaultItems
       });

       aitem.save();
       var path="/" + pname;
       res.redirect(path);
     }
     else{
       res.render("list", {
         listTitle: result.name,
         newListItems: result.items
       });
     }
  });


});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

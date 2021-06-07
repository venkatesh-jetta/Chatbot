//packages
const express = require('express');
const app = express();
const { WebhookClient } = require("dialogflow-fulfillment");
const { Payload } = require("dialogflow-fulfillment");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/customerDB");

const ticketSchema = new mongoose.Schema({
  issue: String
});
const userSchema = new mongoose.Schema({
  name: String,
  mobile: Number,
  ticket: ticketSchema
});



const userModel = mongoose.model("User", userSchema);

const ticketModel = mongoose.model("Ticket", ticketSchema);
const user1 = new userModel({
  name: "Hinata",
  mobile: 9110586278
});

const user2 = new userModel({
  name: "Eren",
  mobile: 9949133496
});
const user3 = new userModel({
  name: "Miya Atsumu",
  mobile: 9848571213
});

const users = [user1, user2, user3];

// userModel.insertMany(users, function(err){
//   if(err){
//     console.log(err);
//   }
// });


var user_name = ""; //global variable to store the name of the user_name

app.post('/dialogflow', express.json(), function(req,res){
  console.log("posted");
  const agent = new WebhookClient({
    request : req,                           //creating a webhook object that carries data back to dialogflow
    response : res
  });

  async function identify_user(agent){
    console.log("identify_user()");
    const mob = agent.parameters.mobilenumber;
    console.log(mob);
    // mongoose.connect("mongodb://localhost:27017/customerDB");
    userModel.find(function(err, users){
      if(err){
        console.log(err);
      }
      else{
        console.log(users);
        if(users.mobile===mob){
        console.log(users);
        }

      }
    })
    var snap = "";
    await userModel.findOne({mobile: mob}, function(err, user){
       if(err){
         console.log(err);
       }
       else{
         snap = user.name;
       }
     });
     console.log(snap.name);

    if(snap == null){
      agent.add("No user found, re-enter your mobile number");
    }
    else{
      user_name = snap.name;
      agent.add("Hello! " + user_name);
      generate_ticket(agent, mob);

    }
    // mongoose.connection.close();
  }

  function generate_ticket(agent, mob){
    console.log("generate_ticket");
    const issue1 = new ticketModel({
      issue: "Internet issue"
    });
    issue1.save();
    userModel.findOneAndUpdate({mobile: mob}, {ticket: issue1}, function(err, doc){
      if(err){
        console.log(err);
      }
    });
    agent.add("Your issue has been noticed, your ticket id is:"  + issue1._id);
  }

var intentMap = new Map();
intentMap.set("my internet is slow-user identification", identify_user);
agent.handleRequest(intentMap);

});

app.listen(8080);
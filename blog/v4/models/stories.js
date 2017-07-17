var mongoose = require("mongoose");
 
var storiesSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   author:{
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments:{
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
         
      }
   }
});

var Stories = mongoose.model("Stories", storiesSchema);



module.exports = Stories;
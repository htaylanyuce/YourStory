var mongoose = require("mongoose");
 
var commentsSchema = new mongoose.Schema({
 
   description: String,
 
   author:{
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }
});

var Comment = mongoose.model("Stories", commentsSchema);



module.exports = Comment;
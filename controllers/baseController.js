const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  res.render("index", {title: "Home", nav})
=======
=======
>>>>>>> Stashed changes
  req.flash("notice",  "This is a flash message.")
  res.render("index", 
    {title: "Home",
    nav,
    errors: null,
  })
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}

module.exports = baseController
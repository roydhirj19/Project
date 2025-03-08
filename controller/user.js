const User = require("../models/user.js");

module.exports.renderSignUpForm  =  (req, res) => {
    res.render("users/signup.ejs")
}


module.exports.signUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username })
        const registeredUser = await User.register(newUser, password)
        req.login(registeredUser, (err) => { // sign after auto login and redirect to all listings
            if (err) {
                return next(err);
            }
            req.flash("success", "welcome to wanderlust")
            res.redirect("/listings")
        })

    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup")
    }
};


module.exports.renderLoginForm =  (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login =  async (req, res) => {
    req.flash("success", "welcome back to wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl)
} 

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out")
        res.redirect("/listings")
    })
}
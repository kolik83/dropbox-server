const User = require('../models/userModel');

const auth = async (req, res) => {
    let body = req.body
	try {
        console.log(req)
		let user = await User.findOne(({name: body.userName, password: body.userPassword}))
        //console.log(user)
		if(!user) {
            throw new Error();  
		}
		req.user = user;
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: "not authenticate",
		});
	}
};

module.exports = auth;
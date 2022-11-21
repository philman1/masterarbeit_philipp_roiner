const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");
const encrypt = require("../middleware/encrypt");

const multipleUpload = async (req, res, err) => {
	if (err) {
		console.log(err);
		return res.send({
			msg: `Error when trying upload many files: ${err}`,
		});
	} else {
		console.log(req.body);
	}
};

module.exports = {
	multipleUpload: multipleUpload,
};

const router = require('express').Router();
const File = require('../models/file');
const User = require('../models/user');
const fs = require('fs');

function add(a, b) {
	console.log(`${a} + ${b} = ${a+b}`);
}

router.delete('/file/:uuid', (req, res) => {
	// console.log(req.user);
	const uuid = req.params.uuid;
	User.findOne({ '_id': req.user.id })
		.then(user => {
			// console.log('Files Created by the user: ', user.files_created);
			user.files_created.forEach(async (file, index) => {
				if (file.uuid === uuid) {
					await user.files_created.splice(index, 1);
					await user.save();
				}
			});

			File.findOne({ uuid }, (err, file) => {
				if (err) throw err;

				try {
					fs.unlinkSync(__dirname + '/../' + file.path);
					console.log('File removed');
				} catch (e) {
					console.log(e);
				}
			})

			res.json({ msg: 'File Deleted Succesfully' });

		}).catch(err => console.log(err.message));
})


module.exports = router;
const router = require("express").Router();
const File = require("../models/file");

router.get("/:uuid", (req, res) => {
    // try {
    //     const file = await File.findOne({ uuid: req.params.uuid });
    //     console.log('File found ' +  file);
    //     const fileInfo = {
    //         uuid: file.uuid,
    //         fileName: file.filename,
    //         fileSize: file.size,
    //         downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
    //     }
    //     // Link expired
    //     if(file !== null) {
    //         await res.render('download', {fileInfo: fileInfo});
    //     } else {
    //         console.log('ERROR occurred')
    //         await res.render('download', { error: 'Link has been expired.'});
    //     }

    // } catch(err) {
    //     await res.render('download', { error: 'Something went wrong.'});
    // }

    File.findOne({ uuid: req.params.uuid }, (err, file) => {
        console.log(req.params.uuid + file);
        
        if (err) {
            return res.send('File not found!')
        } else {
            if (file !== null) {
                const fileInfo = {
                    uuid: file.uuid,
                    fileName: file.filename,
                    fileSize: file.size,
                    downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
                };
                return res.render("download", { fileInfo });
            } else {
                res.send('File not found!');
            }
        }
    })
});

module.exports = router;

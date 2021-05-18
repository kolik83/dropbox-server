const express = require('express');
const{Readable} = require('stream')
//const mongoose = require('mongoose');
const { uploadFilesToS3, deleteImageFromS3, getImageFromS3} = require('../middleware/s3-handler');
const File = require('../models/fileModel');
const User = require('../models/userModel')


const router = new express.Router();

router.post('/upload-files', uploadFilesToS3, async (req, res) => {
    const session = await User.startSession();
    session.startTransaction()
    let body = req.body
    let user
	try {
		user = await User.findOne(({name: body.userName, password: body.userPassword}))
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
    if (!req.file) {
        res.status(422).send({
            code: 422,
            message: "File not uplpaded"
        });
    }

    const file = new File({
        originalName: req.file.originalname,
        storageName: req.file.key.split("/")[1],
        bucket: process.env.S3_BUCKET,
        region: process.env.AWS_REGION,
        key: req.file.key
    });
    user.files.push(file)
    try {
        await user.save()
        await file.save();
        await session.commitTransaction()
        session.endSession()
        res.send(file);
    } catch (err) {
        await session.abortTransaction()
        await session.endSession()
        
        const Key = req.body.key;
    
        try {
            await s3.deleteObject({
                Key,
                Bucket: process.env.S3_BUCKET
            }).promise();
        } catch (err) {
            res.status(404).send({
            message: "File not found"
            }); 
        }
        res.status(404).send({
            message: "File not found"
            })
    }
});

router.get('/get-file',getImageFromS3, async (req, res) => {
    const fileKey = 'images/' +  encodeURI(req.query.key.split('/')[1])
    let flag = false
    try {
        let user = await User.findById(req.query.userId)
        let file =  await File.findOne({key:fileKey})
        user.files.forEach((fileOfUser) =>{              
            if(fileOfUser._id.toString() === file._id.toString()){
                flag  = true
            }
        })
        if(!flag){
            res.status(500).send()
            return
        }
    }
    catch (error) {
        res.status(500).send()
        return    
    }
    const stream = Readable.from(req.fileBuffer);
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + encodeURI(req.query.key.split('-')[1])
    )
    stream.pipe(res);
})

router.post('/get-files', async (req, res) => {
    let body = req.body
    let user

	try {
		user = await User.findOne(({name: body.name, password: body.password}))
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
    const files= user.files
    let result = []
    let _ids=[]
    files && files.forEach(file_id => {
       _ids.push(file_id._id)
    });
    try {
        result = await File.find({_id: {$in: _ids}})

    } catch (error) {
        res.status(400).send({
			status: 400,
			message: "Critical error",
		});
    }
    res.send(result)
});


router.delete('/delete-files', deleteImageFromS3, async (req, res) => {
    try {
        let user = await User.findById(req.body.userId)
        const session = await User.startSession();
        session.startTransaction()
        user.files = user.files.filter((element) => element._id.toString() !== req.body.id)

        await File.findByIdAndDelete(req.body.id);
        await user.save()
        await session.commitTransaction()
        session.endSession()
        res.send();
    } catch (err) {
        uploadFilesToS3()
        await session.abortTransaction()
        await session.endSession()
        console.log(err);
    }
});

module.exports = router;
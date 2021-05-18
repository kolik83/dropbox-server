const express = require('express');
const User = require('../models/userModel')

const router = new express.Router()

let user = new User

router.post('/connect', async(req, res)=>{
    const body = req.body
    if(!body){
        res.status(422).send({
            code:422,
            message: 'User not found'
        })
    } 
    if(body.userName){
        try {
            let user = await User.findOne({name: body.userName, password: body.password})
            if(!user){
                res.status(401).send()
            }
            else{
               res.send(user)
            }
            res.send(user)
        } catch (error) {
            res.status(401).send()
        }
    }
    else{
        try {
            user = await User.find({name: body.newUserName})
            if(user.length !== 0){
                res.status(401).send()
            }
            else{
                user = new User({
                    name: req.body.newUserName,
                    password: req.body.newPassword,
                })
                await user.save()
                res.send(user)
            }
        } catch (error) {
            console.log(error)
            res.status(401).send()    
        }
    }
})

module.exports = router
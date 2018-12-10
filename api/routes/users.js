const express = require('express');
const router = express.Router();  
const User = require('../models/user');
 const { isEmpty } = require('lodash');
 const Validator = require('is_js');
 var mongoose = require('mongoose');

 // Get Users //
router.get('/',(req, res) =>{
    var query = req.query['query'];
	var search = query ? { title: { $regex: `${query}` } } : {};

	User.find(search, function(error, users) {
		if (error) throw error;

		const totalUsers = users.length;
		var pages = Math.ceil(totalUsers / 10);

		var currentPage = 1;
		if (req.query['page']) {
			currentPage = req.query['page'];
		}

		var users = User.find(search, function(err, data) {
            if (err) throw err;
            User.find()
                .select("name age email")
                .exec()
                .then(users => {
                    console.log(users,'users')
                res.status(200).json({
                        users: data,
                        pages: pages,
                        currentPage: currentPage,
                        query: query,
                    });
                })
		   })
			.limit(10)
			.skip(10 * (currentPage - 1))
             .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            })
        })
  
 // show user by ID//
 router.get('/:id', async (req, res)=>{
    const users = await getUser(req.params.id);
    res.status(200).json({
        users
    })
  })

    async function getUser(id) {
    try{
    const user = await User.findOne({ _id: id }).exec();
    return user;
    } catch(err) {
     throw err;
    }
 }


 // Add new users//
router.post('/', (req, res, next) => {
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    
    if (!isValid) {
		res.status(500).json({
            err: errors,
            user: {}
        });
    }
 else
     {
        var user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            age: req.body.age,
            email: req.body.email
        })
        user.save()
        .then(result => {
           console.log(result);
         res.status(200).json({
             message: 'User Added Successfully!'
         });
     })
           .catch(err =>{
               console.log(err);
              res.status(500).json({
                  err: errors
              })
           });
        
        }
    }
    );
       
    //post user by Id and Update//
//     router.get('/:id', async (req, res)=>{
//         const users = await getUser(req.params.id);
//         res.status(200).json({
//             title: 'User',
//             users
//         })
//     });  
    
      
// async function getUser(id) {
//     try{
//         const user = await User.findOne({ _id: id }).exec();
//         return user;
//     } catch(err) {
//         throw err;
//     }
// }
//

router.put('/:userId', (req, res, next)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    if (!isValid) {
            res.status(500).json({
                err: errors,
               user: {}
            });
        }
     else
    {
    const id = req.params.userId;
    const userUpdate = {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    }

    User.findByIdAndUpdate({_id: id}, {$set: userUpdate})
        .exec()
        .then(result => {
            console.log(result, "result")
            res.status(201).json({
                msg: "User Updated Successfully!",
            })
        })
        .catch(err=> {
            console.log(err, "errrr")
            res.status(500).json({
                mag: 'User not found!',
                error: err
            })
        })
    }
});



//delete user by Id//
router.delete('/:id', (req,res)=>{
    User.remove({ _id: req.params.id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User Deleted'
        });
    })
    .catch(err => {
        res.status(500).json({
        err: errors
    });
  })
})


//Validation function//
function validator(data) {
    let errors = {};

    if(Validator.empty(data.name)) {
        errors.name = "Name is required!"
    }
    if(Validator.empty(data.age)) {
        errors.age = "Age is required!"
    }

    if(Validator.not.empty(data.age) && !parseInt(data.age)) {
        errors.age = "Age should be in numeric form!"
    }

    if(Validator.empty(data.email)) {
        errors.email = "Email is required!  "
    }

    if(data.email && !Validator.email(data.email)) {
        errors.email = "Email does not appear valid!"
    }

    return {
        isValid: isEmpty(errors),
        errors
    }
}

 
module.exports = router;

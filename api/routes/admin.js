var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var _ = require('lodash');
const Utils = require('../../utils/index');
const randomstring = require("randomstring");
const btoa = require('btoa');
var jwt = require('jsonwebtoken');
var Admin = require('../models/admin');
var express = require('express');
var router = express.Router();
var checkAuth = require('../middleware/check-auth');
const { validateBody,  validateParams, schemas } = require('../../Helpers/routeHelpers');
/**
   * signup request.
   */
  
	router.post('/signup',validateBody(schemas.signupSchema), (req, res, next) => {
		Admin.find({ email: req.body.email })
	    .exec()
	    .then(admin => {
		 if(admin.length >= 1) {
			 return res.status(409).json({
				 message: 'Mail exists'
			 });
		 } else {
			 bcrypt.hash(req.body.password, 10, (err,hash) => {
				 if (err){
					 return res.status(500).json({
						 error: err
					 });
					 } else {
						 const token = randomstring.generate(50);
						 var admin = new Admin({
							 _id: new mongoose.Types.ObjectId(),
							 name: req.body.name,
							 email: req.body.email,
							 password: hash,
							 token: token
					 });
					 const newToken = btoa(JSON.stringify({
					   token,
					   email: req.body.email
					 }));
					 admin
					 .save()
					 .then(res => {
						 Utils.sendMail({
						   to: 'reply.vipinrai@gmail.com',//req.body.email,
						   subject: 'Account Verification',
						   message: { token: newToken, email: req.body.email },
						   template: 'accountCreation'
						 });
						 res.status(201).json({
							 message: 'Admin created'
						 });
					 })
					 .catch(err => {
						 res.status(500).json({
							 error: err
						 });
					 });
				 }
			 });
		 };
   })
 })
	
	router.get('/signup', (req, res, next) => {
		var query = req.query['query'];
		var search = query ? { title: { $regex: `${query}` } } : {};
	
		Admin.find(search, function(error, admin) {
			if (error) throw error;
	
			const totalAdmin = admin.length;
			var pages = Math.ceil(totalAdmin / 10);
	
			var currentPage = 1;
			if (req.query['page']) {
				currentPage = req.query['page'];
			}
	
			var admin = Admin.find(search, function(err, data) {
				if (err) throw err;
				Admin.find()
				.exec().then(admin => { console.log(admin)
					res.status(200).json({
						admin: data,
						pages: pages,
						currentPage: currentPage,
						query: query,
					});
				})
			 })
				.limit(10)
				.skip(10 * (currentPage - 1))
				.catch(err => {
					res.status(500).json({error: err});
				});
		    });
	    });

	//get admin by Id//
	router.get('/:id', async (req, res)=>{
		const admin = await getAdmin(req.params.id);
		res.status(200).json({
			admin
		})
	  })
	
		async function getAdmin(id) {
		try{
		const admin = await Admin.findOne({ _id: id }).exec();
		return admin;
		} catch(err) {
		 throw err;
		}
	 }

 /**
   * login account request.
   */
  router.post("/login",validateBody(schemas.loginSchema), (req, res, next) => {
    Admin.find({ email: req.body.email})
    .exec()
    .then(admin => {
        if(admin.length < 1){
           return res.status(404).json({
               message: 'Auth failed'
            });
        }
        bcrypt.compare(req.body.password, admin[0].password, (err, result) => {
            if(err) {
                return res.status(404).json({
                    message: 'Password Wrong!'
                });
			}
			const JWT_KEY = "codingapp"
            if (result) {
				const token = jwt.sign(
				  {
					email: admin[0].email,
					adminId: admin[0]._id
				  },
				  JWT_KEY,
				  {
					  expiresIn: "1h"
				  },
				);
				return res.status(200).json({
				  message: "Auth successful",
				  token: token
				});
			  }
			  res.status(401).json({
				message: "Auth failed"
			  });
			});
		  })
		  .catch(err => {
			console.log(err);
			res.status(500).json({
			  error: err
			});
		  });
	  })

	   /**
   * Process to account verification.
   */
	router.get('/verifyaccount/:token',validateParams(schemas.accountVerificationSchema),(req, res, next) => { 
	Admin.findOne({ token: req.params.token })
	.exec()
	.then(result => {
		if(!result) {
			return res.status(401).json({
				message: 'Invalid Token.'
			});
		}

		if(!result.active) {

			Admin.update({ token: req.params.token }, { $set: { token: '', active: true } })
			.exec()
			.then(res => {
				return res.status(200).json({
					message: 'Congratulations, Account has been verified.'
				});
			})
			.catch(err => {
				return res.status(500).json({
					message: 'Invalid Token.'
				})
			});
		} else {
			return res.status(500).json({
				message: 'Account is already active.'
			});
		}

	})
	.catch(err => {
		return res.status(500).json({
			message: 'Invalid Token.'
		})
	})
})

 
 /**
   * Process the delete account request.
   */
  router.delete("/:adminId", (req, res, next) => {
    Admin.findByIdAndRemove({ _id: req.params.adminId})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Admin deleted'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

});

 /**
   * Process to forgotpassword request.
   */
router.post('/forgotpassword',validateBody(schemas.forgotpasswordSchema),(req, res, next) => {
	const token = randomstring.generate(50);
	Admin.findOneAndUpdate({ email: req.body.email }, { $set: { token: token } })
	.exec()
	.then(result => {
		if(!result) {
			return res.status(400).json({
				message: 'Email doesn\'t exists.'
			});
		}

		Utils.sendMail({
			to: 'reply.vipinrai@gmail.com',//req.body.email,
			subject: 'Reset Password',
			message: { token: token, email: req.body.email },
			template: 'forgotPassword'
		});
		return res.status(200).json({
			message: 'Verification email has been sent.'
		});
	})
	.catch(err => {
		return res.status(500).json({
			message: 'Email doesn\'t exists.'
		});
	});
})

 /**
   * Process to resetpassword request.
   */
router.post('/resetpassword', validateBody(schemas.resetpasswordSchema),(req, res, next)  =>  {
	bcrypt.hash(req.body.password, 10, (err, hash) => {
		if(err) {
			return res.status(500).json({
				error: err
			});
		} else {
			Admin.findOneAndUpdate({ token: req.body.token }, { $set: { password: hash, token: '' }})
			.exec()
			.then(result => {
				if(!result) {
					return res.status(400).json({
						message: 'Invalid Token.'
					})
				}

				return res.status(200).json({
					message: 'Password has been updated.'
				})
			})
			.catch(err => {
				return res.status(500).json({
					message: 'Invalid Token.'
				});
			});
		}
	})
})

 /**
   * Process resendverification request.
   */
router.post('/resendverification', validateBody(schemas.resendVerificationEmailSchema),(req, res, next) => {
	const token = randomstring.generate(50);
	Admin.findOneAndUpdate({ email: req.body.email }, { $set: { token: token }})
	.exec()
	.then(result => {
		if(!result) {
			return res.status(400).json({
				message: 'Email Doesn\'t exists.'
			});
		}

		const newToken = btoa(JSON.stringify({
			token,
			email: req.body.email
		}));

		Utils.sendMail({
			to: 'reply.vipinrai@gmail.com',//req.body.email,
			subject: 'Account Verification',
			message: { token: newToken, email: req.body.email },
			template: 'resendVerification'
		});

		return res.status(200).json({
			message: 'Email sent successfully.'
		})
	})
	.catch(err => {console.log(err)
		return res.status(400).json({
			message: 'Email Doesn\'t exists.'
		});
	});
})

module.exports = router;


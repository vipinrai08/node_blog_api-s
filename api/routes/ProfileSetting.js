var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var _ = require('lodash');
const ProfileSetting = require('../models/ProfileSetting')
const Utils = require('../../utils/index');
var express = require('express');
var router = express.Router();
const { validateBody, validateHeaders, schemas } = require('../../Helpers/routeHelpers');


//RESET ADMIN PASSWORD//
router.post("/resetadminPassword"),validateHeaders(schemas.resetadminPasswordHeaderSchema), validateBody(schemas.resetadminPasswordSchema),(req, res, next) => {
	Utils.verifyToken(req.headers.token, res, (admin) => { 
		bcrypt.hash(req.body.password, 10, (err, hash) => {
			if(err) {
				return res.status(500).json({
					error: err
				});
			} else {
				Admin.findOneAndUpdate({ _id: admin.adminId }, { $set: { password: hash }})
				.exec()
				.then(result => {
					if(!result) {
						return res.status(400).json({
							message: 'Admin Doesn\'t exists.'
						});
					}

					return res.status(200).json({
						message: 'Password has been reset.'
					});
				})
				.catch(err => {
					return res.status(400).json({
						message: 'Admin Doesn\'t exists.'
					});
				})
			}
		});
	});
}

module.exports = router;
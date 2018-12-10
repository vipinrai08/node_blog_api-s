const Joi = require('joi');

module.exports = {
  validateBody: (schema) => {
    return (req, res, next) => {
      const result = Joi.validate(req.body, schema);
      if (result.error) {
        return res.status(400).json({ message: result.error.details[0].message });
      }

      if (!req.value) { req.value = {}; }
      req.value['body'] = result.value;
      next();
    }
  },
  validateHeaders: (schema) => {
    return (req, res, next) => {
      const result = Joi.validate({ token: req.headers.token }, schema);
      if (result.error) {
        return res.status(400).json({ message: result.error.details[0].message });
      }

      if (!req.value) { req.value = {}; }
      req.value['headers'] = result.value;
      next();
    }
  },
  validateParams: (schema) => {
    return (req, res, next) => {
      const result = Joi.validate(req.params, schema);
      if (result.error) {
        return res.status(400).json({ message: result.error.details[0].message });
      }

      if (!req.value) { req.value = {}; }
      req.value['params'] = result.value;
      next();
    }
  },
  schemas: {
    loginSchema: Joi.object().keys({
      email: Joi.string().email({ minDomainAtoms: 2}).required(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{4,10}$/).required()
    }),
    signupSchema: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2}).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{4,10}$/).required(),
        repassword: Joi.string().required()
    }),
    accountVerificationSchema: Joi.object().keys({
        token: Joi.string().required()
    }),
    forgotpasswordSchema: Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2}).required()
    }),
    resetpasswordSchema: Joi.object().keys({
        password: Joi.string().required(),
        token: Joi.string().required()
    }),
    getUserSchema: Joi.object().keys({
        token: Joi.string().required()
    }),
    resendVerificationEmailSchema: Joi.object().keys({
      email: Joi.string().required()
    }),
    resetadminPasswordSchema: Joi.object().keys({
      password: Joi.string().required()
    }),
    resetadminPasswordHeaderSchema: Joi.object().keys({
      token: Joi.string().required()
    }),
  }
}
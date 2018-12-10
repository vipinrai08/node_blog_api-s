var jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
        const JWT_KEY = "codingapp";
        var token = token.headers.authorization.split(" ")[1];
        var decoded = jwt.verify(token, JWT_KEY);
        req.adminData = decoded;
        next(adminData);
    }
    catch  (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};
/**
 * Module dependencies.
 */
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')
var morgon = require('morgan');
var errorHandler = require('errorhandler');
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var admin = require('./api/models/admin');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect('mongodb://admin:admin1234@ds155150.mlab.com:55150/blogs',{ useNewUrlParser: true });
mongoose.Promise = global.Promise;

// web routes//
var admin = require('./api/routes/admin'); 
var users = require('./api/routes/users');
var pages = require('./api/routes/pages');
var posts = require('./api/routes/posts');
var categories = require('./api/routes/categories');
var tags = require('./api/routes/tags');
var ProfileSetting = require('./api/routes/ProfileSetting');



app.use(morgon('dev'));
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json());      

//cors//
app.use((req,res,next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Origin-Headers', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, PATCH, DELETE');
    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods",'PUT, PATCH, POST, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// routes which should handle request
app.use('/admin', admin);
app.use('/users', users);
app.use('/pages', pages);
app.use('/posts', posts);
app.use('/categories', categories);
app.use('/tags', tags);
app.use('/ProfileSetting', ProfileSetting);


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());


app.use(flash());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use(express.static('./public'));

app.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'its work!'
    });
});

/**
 * Error Handler.
 */
app.use(errorHandler());
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })

});


/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

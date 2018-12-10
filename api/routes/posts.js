const express = require('express');
const router = express.Router();  
const Post = require('../models/post');
const { isEmpty } = require('lodash');
const Validator = require('is_js');
const multer = require('multer');
var mongoose = require('mongoose');
const Tag = require('../models/tag');

 
//FILE UPLOAD USING MULTER//
 const storage = multer.diskStorage({
     destination: function(req, file, cb) {
         cb(null, './public/uploads/')
     },
     filename: function(req, file, cb) {
         cb(null, new Date().toISOString() + file.originalname)
     }
 });
 
 const filefilter = function(req, file, cb){
     //reject a file
     if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
         cb(null, true);
     }
     else{
         cb(null, false);
     }    
 };
 
 var upload = multer({ storage: storage,
      limits: {
      fileSize: 1024*1024*5
      },
    fileFilter: filefilter
 });

//GET POSTS//
router.get('/',(req, res) =>{
    var query = req.query['query'];
	var search = query ? { title: { $regex: `${query}` } } : {};

	Post.find(search, function(error, posts) {
		if (error) throw error;

		const totalPosts = posts.length;
		var pages = Math.ceil(totalPosts / 10);

		var currentPage = 1;
		if (req.query['page']) {
			currentPage = req.query['page'];
		}

		var posts = Post.find(search, function(err, data) {
            if (err) throw err;
            Post.find()
            .select("title content image tags")
            .exec()
            .then(posts => {
                console.log(posts,'posts')
                res.status(200).json({
                        posts: data,
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
        
        
 // show post by ID
 router.get('/:id', async (req, res)=>{
    const posts = await getPost(req.params.id);
    res.status(200).json({
        posts
    })
  })
    async function getPost(id) {
    try{
    const post = await post.findOne({ _id: id }).exec();
    return post;
    } catch(err) {
      throw err;
 }
    }
    


//ADD NEW POST//
router.post('/', upload.single('image'),  (req, res, next) => {
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    
    if (!isValid) {
		res.status(500).json({
            err: errors,
            post: {}
        });
    }
 else
     {
        var post = new Post({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            content: req.body.content
        })
        post.save()
        .then(result => {
           console.log(result);
         res.status(200).json({
             message: 'Post Added Successfully!'
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
       
       

    //POST BY ID AND UPDATE//
//         router.get('/edit/:id', async (req, res)=>{
//             const posts = await getPost(req.params.id);
//             res.status(200).json({
//                 title: 'Edit',
//                 posts
//             })
//         });  
    
      
// async function getPost(id) {
//     try{
//         const post = await Post.findOne({ _id: id }).exec();
//         return post;
//     } catch(err) {
//         throw err;
//     }
// }

router.put('/:postId', (req, res, next)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    
	if (!isValid) {
    
		res.status(500).json({
            err: errors,
            post: { title: req.body.title, content: req.body.content }
        });
    } else {
            const id = req.params.postId;
            const postUpdate = {
                title: req.body.title,
            content: req.body.content
            }
        
            Post.findByIdAndUpdate({_id: id}, {$set: postUpdate})
                .exec()
                .then(result => {
                    console.log(result)
                    res.status(201).json({
                        msg: "Post Updated Successfully!",
                    })
                })
                .catch(err=> {
                    console.log(err, "errrr")
                    res.status(500).json({
                        mag: 'Post not found!',
                        error: err
                    })
                })
            }
        });
        
        
        
        //delete post by Id//
        router.delete('/:id', (req,res)=>{
            Post.remove({ _id: req.params.id})
            .exec()
            .then(result => {
                res.status(200).json({
                    message: 'Post Deleted Successfully!'
                });
            })
            .catch(err => {
                res.status(500).json({
                err: errors
            });
          })
        })
        

//Add tags on the basis of posts Id//
// router.post('/post/:id', async(req, res)=>{
//     const post = await Post.findOne({_id: req.params.postId});
//     const tag = new Tag();
//     tag.content = req.body.content;
//     tag.post = post._id;
//     await tag.save();

//     //associated post with tag//
//     post.tags.push(tag._id);
//     post.save();
//     res.send(tag);
// })

//   //read tag//
//   router.get('/post/:id', async(req, res)=>{
//     const post = await Post.findOne({_id: req.params.postId}).populate("tags");
//     res.send(post);
// });


//GET POST BY ID //
router.get('/:id', async (req, res)=>{
    const posts = await getPost(req.params.id);
    res.status(200).json({
        title: 'posts',
        posts
    });
  });

async function getPost(id) {
try{
const post = await Post.findOne({ _id: id }).exec();
return post;
} catch(err) {
 throw err;
 }
}


//ADD TAG ON POST //
router.post('/:postId/tag', async (req, res)=>{
    let post = await Post.findOne({ _id: req.params.postId});
    //create tag//
        const { content } = req.body;
        const { postId } = req.params;
        const tag = new Tag({
            _id: new mongoose.Types.ObjectId(),
            tag : content,
            postId
        })
        console.log(post, tag, "tag");
        
        await tag.save()
       //associated post with tag//
            //post.tags.push(tag._id);
            post = {...post.toObject(), tags: [...(post.toObject().tags), tag._id]};
             /* await post.save()
                .then(result => {
                    console.log(result);
                    res.status(200).json({
                        message: 'Tag Added'
                });
            
            })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        err: errors
                    })
                }); */
                Post.updateOne({_id: postId}, {$set: post})
                .exec()
                .then(result => {
                    console.log(result, "result")
                    res.status(201).json({
                        msg: "Tag Added Successfully!",
                    })
                })
                .catch(err=> {
                    console.log(err, "errrr")
                    res.status(500).json({
                        msg: 'Something went wrong!',
                        error: err
                    })
                })
            });
        

        //read tag//
  router.get('/:postId/tag', async (req, res)=>{
    const post = await Post.findOne({_id: req.params.postId}).populate("tags");
    res.status(200).json({
        post
        
    })
}); 


//Validation function//
function validator(data) {
    let errors = {};

    if(Validator.empty(data.title)) {
        errors.title = "Title is required!"
    }

    if(Validator.empty(data.content)) {
        errors.content = "Content is required!"
    }

    return {
        isValid: isEmpty(errors),
        errors
    }
}

 
module.exports = router;

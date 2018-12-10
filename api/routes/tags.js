const express = require('express');
const router = express.Router();
const Tag = require('../models/tag');
// const { isEmpty } = require('lodash');
// const Validator = require('is_js');
var mongoose = require('mongoose');

//GET Tags//
router.get('/', (req, res) =>{
    var query = req.query['query'];
	var search = query ? { title: { $regex: `${query}` } } : {};

	Tag.find(search, function(error, tags) {
		if (error) throw error;

		const totalTags = tags.length;
		var pages = Math.ceil(totalTags / 10);

		var currentPage = 1;
		if (req.query['page']) {
			currentPage = req.query['page'];
		}

		var tags = Tag.find(search, function(err, data) {
            if (err) throw err;
            Tag.find()
            .select("tag")
            .exec()
            .then(tags => { console.log(tags) 
                res.status(200).json({
					tags: data,
					pages: pages,
					currentPage: currentPage,
					query: query,
                })
		   })
        })
            .limit(10)
			.skip(10 * (currentPage - 1))
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
        })
    })


 //view Tag by ID//
router.get('/:id', async (req, res)=>{
    const tags = await getTag(req.params.id);
    res.status(500).json({
        tags
    })
});

async function getTag(id) {
    try{
        const tag = await Tag.findOne({ _id: id }).exec();
        return tag;
    } catch(err) {
        throw err;
    }
}

// router.get('/add', (req, res)=>{
//     res.render('tags/add',{
//         title: 'Add'
//     })
// })


//ADD new tags //

router.post('/', (req, res)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    
    if (!isValid) {
		res.status(500).json({
            err: errors,
            tag: { tag: req.body.tag}
        });
    }
 else
{
    var tag= new Tag({
        _id: new mongoose.Types.ObjectId(),
        tag: req.body.tag,
    });
         tag.save()
        .then(result => {
           console.log(result);
         res.status(200).json({
             message: 'Tag Added Successfully!'
          });
        })
           .catch(err =>{
               console.log(err);
             res.status(500).json({
                 err: errors
             })
           });
        } 
})

// post tag by Id and update//
// router.get('/:id', async (req, res)=>{
//     const tags = await getTag(req.params.id);
//     res.status(500).json({
//         title: 'Edit',
//         tags
//     })
// });

// async function getTag(id) {
//     try{
//         const tag = await Tag.findOne({ _id: id }).exec();
//         return tag;
//     } catch(err) {
//         throw err;
//     }
// }

router.put('/:tagId', (req, res, next)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    if (!isValid) {
            res.status(500).json({
                err: errors,
                tag: { tag: req.body.tag}
            });
        }
     else
    {
    const id = req.params.tagId;
    const tagUpdate = {
        tag: req.body.tag,
    
    }

    Tag.findByIdAndUpdate({_id: id}, {$set: tagUpdate})
        .exec()
        .then(result => {
            console.log(result, "Result")
            res.status(201).json({
                msg: "Tag Updated Successfully!",
            })
        })
        .catch(err=> {
            console.log(err, "errrr")
            res.status(500).json({
                mag: 'Tag not found!',
                error: err
            })
        })
    }
});



//delete tag by Id//
router.delete('/:id', (req,res)=>{
  Tag.remove({ _id: req.params.id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Tag Deleted Successfully!'
        });
    })
    .catch(err => {
        res.status(500).json({
        err: errors
    });
  })
})



// Validation function//
// function validator(data) {
//     let errors = {};

//     if (Validator.empty(data.tag)){
//         errors.tag = "Tag is required!"
//     }
//     return {
//         isValid: isEmpty(errors),
//         errors
//     }
// }
 
module.exports = router;
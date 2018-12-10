const express = require('express');
const router = express.Router();
const Categories = require('../models/categories');
const { isEmpty } = require('lodash');
const Validator = require('is_js');
var mongoose = require('mongoose');

//GET CATEGORIES//
router.get('/', (req, res) =>{
    var query = req.query['query'];
	var search = query ? { title: { $regex: `${query}` } } : {};
	Categories.find(search, function(error, categories) {
		if (error) throw error;

		const totalCategories = categories.length;
		var pages = Math.ceil(totalCategories / 10);

		var currentPage = 1;
		if (req.query['page']) {
			currentPage = req.query['page'];
		}

		var categories = Categories.find(search, function(err, data) {
            if (err) throw err;
            Categories.find()
            .select("name")
            .exec()
            .then(categories => { console.log(categories) 
                res.status(200).json({
                    categories: data,
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
            });
        });
      })


 //view Categories by ID//
 router.get('/:id', async (req, res)=>{
    const categories = await getCategories(req.params.id);
    res.status(500).json({
        categories
    })
  })


async function getCategories(id) {
    try{
        const categories = await Categories.findOne({ _id: id }).exec();
        return categories;
    } catch(err) {
        throw err;
    }
}


//ADD NEW CATEGORIES//
router.post('/', (req, res)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    
    if (!isValid) {
		res.status(500).json({
            err: errors,
            categories: { name: req.body.name}
        });
    }
 else
{
    var categories = new Categories({
        _id: new mongoose.Types.ObjectId(),
         name : req.body.name,
    });
       categories.save()
        .then(result => {
           console.log(result);
         res.status(200).json({
             message: 'Categories Added Successfully!'
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

//GET CATEGORIES BY ID AND UPDATE//
// router.get('/:id', async (req, res)=>{
//     const categories = await getCategories(req.params.id);
//     res.status(500).json({
//         title: 'Categories',
//         categories
//     })
// });

// async function getCategories(id) {
//     try{
//         const categories = await Categories.findOne({ _id: id }).exec();
//         return categories;
//     } catch(err) {
//         throw err;
//     }
// }

router.put('/:categoriesId', (req, res)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    if (!isValid) {
            res.status(500).json({
                err: errors,
                categories: { name: req.body.name}
            });
        }
     else
    {
        const id = req.params.categoriesId;
        const categoriesUpdate = {
            name: req.body.name,
           
        }
    
        Categories.findByIdAndUpdate({_id: id}, {$set: categoriesUpdate})
            .exec()
            .then(result => {
                console.log(result, "Result")
                res.status(201).json({
                    msg: "Categories Updated Successfully!"
                })
            })
            .catch(err=> {
                console.log(err, "errrr")
                res.status(500).json({
                    mag: 'Categories not found!',
                    error: err
                })
            })
        }
    });
    

//DELETE CATEGORIES BY ID//
router.delete('/:id', (req,res)=>{
   Categories.remove({ _id: req.params.id})
    .exec()
    .then(result => {
       res.status(200).json({
           message: 'Categories Deleted Successfully!'
       });
    })
    .catch(err => {
        console.log(err);
       res.status(500).json({
           err: errors
       });
    });
})



// Validation function//
function validator(data) {
    let errors = {};

    if (Validator.empty(data.name)){
        errors.name = "Name is required!"
    }
    return {
        isValid: isEmpty(errors),
        errors
    }
}
 
module.exports = router;
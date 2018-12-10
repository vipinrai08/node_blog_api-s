const express = require('express');
const router = express.Router();  
const Page = require('../models/page');
const { isEmpty } = require('lodash');
const Validator = require('is_js');
var mongoose = require('mongoose');

//GET PAGES//
router.get('/',(req, res) =>{
    const { query='', active } = req.query;
    console.log(active, { title: { $regex: `${query}` }, active })
    var search = query ? { title: { $regex: `${query}` }, active } : { active };

    search = JSON.parse(JSON.stringify(search));

	Page.find(search, function(error, pages) {
		if (error) throw error;

		const totalPages = pages.length;
		var pages = Math.ceil(totalPages / 10);

		var currentPage = 1;
		if (req.query['page']) {
			currentPage = req.query['page'];
		}

		var pages = Page.find(search, function(err, data) {
            if (err) throw err
            Page.find()
            .select("title description active")
            .exec()
            .then(pages => {
                console.log(pages,'pages')
                res.status(200).json({
					pages: data,
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
        


  
 // show page by ID//
 router.get('/:id', async (req, res)=>{
    const pages = await getPage(req.params.id);
    res.status(200).json({
        pages
    })
  }) 

    async function getPage(id) {
    try{
    const page = await Page.findOne({ _id: id }).exec();
    return page;
    } catch(err) {
      throw err;
 }
    }
    


//ADD NEW PAGES//
router.post('/', (req, res)=>{

    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
   
	if (!isValid) {
      
		res.status(500).json({
            err: errors,
            page: { title: req.body.title, description: req.body.description }
        });
    } else {
       
        var page = new Page({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            active: req.body.active
        });
       page.save()
        .then(result => {
           console.log(result);
         res.status(200).json({
             message: 'Page Added Successfully!'
         });
     })
           .catch(err =>{
               console.log(err);
               res.status(500).json({
                   err: errors
               })
           });
        
        }
    });
       
    //GET PAGE BY ID AND UPDATE//
//         router.get('/:id', async (req, res)=>{
//             const pages = await getPage(req.params.id);
//             res.status(200).json({
//                 title: 'Page',
//                 pages
//             })
//         });  
    
      
// async function getPage(id) {
//     try{
//         const page = await Page.findOne({ _id: id }).exec();
//         return page;
//     } catch(err) {
//         throw err;
//     }
// }

// update Active state//
router.put('/:pageId/:active', (req, res) => {
    console.log(res , "res")
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    
	if (!isValid) {
    
		res.status(500).json({
            err: errors,
            page: { title: req.body.title, description: req.body.description }
        });
    } else {
        const id = req.params.pageId;
        const active = req.params.active;
        const pageUpdate = {
            title: req.body.title,
            description: req.body.description,
            active: req.body.active
        }
    
        Page.update({_id: id, active: active}, {$set: pageUpdate})
            .exec()
            .then(response => {
                console.log(response, "Response")
                res.status(201).json({
                    msg: "State Updated Successfully!",
                    response: response
                })
            })
            .catch(err=> {
                console.log(err, "errrr")
                res.status(500).json({
                    mag: 'Page not found!',
                    error: err
                })
            })
        }
    });


 //process to update pages//
router.put('/:pageId', (req, res)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    
	if (!isValid) {
    
		res.status(500).json({
            err: errors,
            page: { title: req.body.title, description: req.body.description }
        });
    } else {
        const id = req.params.pageId;
        const pageUpdate = {
            title: req.body.title,
            description: req.body.description
        }
    
        Page.findByIdAndUpdate({_id: id}, {$set: pageUpdate}, {new: true})
            .exec()
            .then(result => {
                console.log(result, "result")
                res.status(201).json({
                    msg: "Page Updated Successfully!",
                })
            })
            .catch(err=> {
                console.log(err, "errrr")
                res.status(500).json({
                    mag: 'Page not found!',
                    error: err
                })
            })
        }
    });
    
//DELETE PAGE BY ID//
router.delete('/:id', (req,res)=>{
    Page.remove({ _id: req.params.id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Page Deleted Successfully!'
        });
    })
    .catch(err => {
        res.status(500).json({
        err: errors,
    });
  })
})


//Validation function//
function validator(data) {
    let errors = {};

    if(Validator.empty(data.title)) {
        errors.title = "Title is required!"
    }

    if(Validator.empty(data.description)) {
        errors.description = "Description is required!"
    }

    return {
        isValid: isEmpty(errors),
        errors
    }
}
    
 
module.exports = router;

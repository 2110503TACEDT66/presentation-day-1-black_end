const Company = require('../models/Company.js');
const vacCenter = require('../models/VacCenter.js');

//@desc         Get all companys
//@route        GET /api/v1/companys
//@access       Public
exports.getCompanys= async (req, res, next)=>{
    let query;

    //Copy req.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);

    //Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Finding resource
    query = Hospital.find(JSON.parse(queryStr)).populate('interviews');

    //Select fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    //Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('name');
    }

    //Pagination
    const page = parseInt(req.query.page, 10)||1;
    const limit = parseInt(req.query.limit, 10)||25;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;

    try {
        const total = await Company.countDocuments();
        query = query.skip(startIndex).limit(limit);
        //Execute query
        const companys = await query;

        //Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page:page+1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page:page-1,
                limit
            }
        }
        res.status(200).json({
            success: true,
            count: companys.length,
            pagination,
            data: companys
        });
    } catch(err) {
        res.status(400).json({success: false});
    }
};
//@desc         Get single company
//@route        GET /api/v1/companys/:id
//@access       Public
exports.getCompany= async (req, res, next)=>{
    try {
        const company = await Hospital.findById(req.params.id);

        if (!company) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data:company});
    } catch(err) {
        res.status(400).json({success: false});
    }
};
//@desc         Create new company
//@route        POST /api/v1/company
//@access       Private
exports.createCompany= async (req, res, next)=>{
    const company = await Company.create(req.body);
    res.status(201).json({
        success: true,
        data: company
    });
};
//@desc         Update hospital
//@route        PUT /api/v1/hospitals/:id
//@access       Private
exports.updateHospital= async (req, res, next)=>{
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hospital) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data:hospital});
    } catch(err) {
        res.status(400).json({success: false});
    }
};
//@desc         Delete hospital
//@route        DELETE /api/v1/hospitals/:id
//@access       Private
exports.deleteHospital= async (req, res, next)=>{
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({success: false, message: `Bootcamp not found with id of ${req.params.id}`});
        }

        await hospital.deleteOne();
        res.status(200).json({success: true, data:hospital});   
    } catch {
        res.status(400).json({success: false});
    }
};
//@desc         Get Vaccine Centers
//@route        GET /api/v1/hospitals/vacCenters/
//@access       Public
exports.getVacCenters= async (req, res, next)=>{
    vacCenter.getAll((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || 'Some error occurred while retrieving Vaccine Centers.'
            });
        } else {
            res.send(data);
        }
    });
};
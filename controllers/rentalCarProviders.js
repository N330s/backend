const Booking = require('../models/Booking');  // Changed from Appointment
const RentalCarProvider = require('../models/RentalCarProvider');  // Changed from Hospital

exports.getRentalCarProviders = async (req, res, next) => {  // Changed from getHospitals
    try {
        let query;
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);
        console.log(reqQuery);

        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = RentalCarProvider.find(JSON.parse(queryStr)).populate({
            path: 'bookings',
            select: 'date user'
        });

        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await RentalCarProvider.countDocuments();  // Changed from Hospital

        query = query.skip(startIndex).limit(limit);

        const rentalCarProviders = await query;  // Changed from hospitals

        const pagination = {};
        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({ success: true, count: rentalCarProviders.length, pagination, data: rentalCarProviders});  // Changed variable name
    }
    catch(err) {
        console.error(err);
        res.status(400).json({ success: false});
    }
};

exports.getRentalCarProvider = async (req, res, next) => {  // Changed from getHospital
    try {
        const rentalCarProvider = await RentalCarProvider.findById(req.params.id);  // Changed variable and model name

        if(!rentalCarProvider) {
            return res.status(400).json({ success: false});
        }

        res.status(200).json({ success: true, data: rentalCarProvider});  // Changed variable name
    }
    catch(err) {
        res.status(400).json({success: false});
    }
};

exports.createRentalCarProvider = async (req, res, next) => {  // Changed from createHospital
    const rentalCarProvider = await RentalCarProvider.create(req.body);  // Changed variable and model name
    res.status(201).json({ success: true, data: rentalCarProvider});  // Updated message
};

exports.updateRentalCarProvider = async (req, res, next) => {  // Changed from updateHospital
    try {
        const rentalCarProvider = await RentalCarProvider.findByIdAndUpdate(req.params.id, req.body, {  // Changed variable and model name
            new: true,
            runValidators: true
        });
        if(!rentalCarProvider) {
            return res.status(400).json({ success: false});
        }
        res.status(200).json({ success: true, data: rentalCarProvider});  // Changed variable name
    }
    catch(err) {
        res.status(400).json({ success: false});
    }
};

exports.deleteRentalCarProvider = async(req, res, next) => {  // Changed from deleteHospital
    try {
        const rentalCarProvider = await RentalCarProvider.findByIdAndDelete(req.params.id);  // Changed variable and model name
        if(!rentalCarProvider) {
            return res.status(404).json({ success: false, message: `Rental car provider not found with id of ${req.params.id}`});  // Updated message
        }
        await Booking.deleteMany({ rentalCarProvider: req.params.id});  // Changed from Appointment and hospital
        await RentalCarProvider.deleteOne({ _id: req.params.id});  // Changed from Hospital
        res.status(200).json({ success: true, data: {}});
    }
    catch(err) {
        return res.status(400).json({ success: false});
    }
};
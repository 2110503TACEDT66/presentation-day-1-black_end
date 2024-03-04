const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxLength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    website: {
        type: String,
        required: [true, 'Please add a link to your website'],
        match:[
            /^(http\:\/\/|https\:\/\/)?([a-z0-9][a-z0-9\-]*\.)+[a-z0-9][a-z0-9\-]*$/i,
            'Please add a valid link'
            ]
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    tel: {
        type: String,
        required: [true, 'Please add a telephone number']
    },
    quote: {
        type: String
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals
CompanySchema.virtual('interviews', {
    ref: 'Interview',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

//Cascade delete interviews when a company is deleted
CompanySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    console.log(`Interview sessions being removed from Company ${this._id}`);
    await this.model('Interview').deleteMany({company: this._id});
    next();
})

module.exports = mongoose.model('Company', CompanySchema);
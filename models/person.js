
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

mongoose.set('strictQuery',false)
mongoose.connect(process.env.MONGODB_URI).then(result => {
    console.log('connected to MongoDB')
})
    .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
})

const personSchema = new mongoose.Schema({
    id: String,
    name: {
        type: String,
        minLength: 3,
        unique: true,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: function(v) {
              return /\d{3,4}-\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
    },
})
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
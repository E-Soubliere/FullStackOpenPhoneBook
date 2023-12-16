const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }
  
  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
  }
  
  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.use(cors())
app.use(express.static('dist'))
app.use(requestLogger)
app.use(bodyParser.json());

morgan.token('body', req => {  
    return (Object.keys(req.body).length) ? JSON.stringify(req.body) : ""
})
app.use(morgan(':method :url :body'))

app.get('/info', (request, response) => {
    const date = new Date()
    Person.countDocuments()
        .then(count => {
            response.send(`<p>Phonebook has info for ${count} people</p><p>${date.toDateString()} ${date.toTimeString()} ${date.toLocaleString()}</p>`)
        })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(p => {
            if (p) {
                response.json(p)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
        
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    if (body.number) {
        Person.findByIdAndUpdate(request.params.id, {number: body.number}, {new: true})
            .then(result => {
                response.json(result)
            })
            .catch(err => next(err))

    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name && body.number) {

        const person = new Person({
            name: request.body.name,
            number: request.body.number
        })

        Person.exists({name: person.name}).then((ex) => {
            if (ex) {
                response.status(400).json({error: "Name must be unique"})
            } else {
                person.save().then(result => {
                    response.status(200).json(person).end()
                })
            }
        })
    } else {
        response.status(400).json({error: "Name or number missing"})
    }
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
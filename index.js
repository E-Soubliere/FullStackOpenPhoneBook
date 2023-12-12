const express = require('express')
const bodyParser = require("body-parser");
var morgan = require('morgan')
const app = express()

const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))
app.use(bodyParser.json());

morgan.token('body', req => {
    
    return (Object.keys(req.body).length) ? JSON.stringify(req.body) : ""
})

app.use(morgan(':method :url :body'))

let persons = [
    { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
    },
    { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
    },
    { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
    },
    { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date.toDateString()} ${date.toTimeString()} ${date.toLocaleString()}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    
    response.status(204).end()
})

app.put('/api/persons/:id', (request, response) => {
    const body = request.body

    if (body.name && body.number) {
        const person = persons.find(p => p.name === body.name)
        person.number = body.number
        if (person) {
            persons = persons.map(p => p.name === person.name ? {...p, number: person.number} : p)
            response.status(200).end()
        } else {
            response.status(402).json({error: "User not found"})
        }
    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name && body.number) {
        const person = {
            id: persons.length + 1,
            name: request.body.name,
            number: request.body.number
        }
        
        if (persons.map(p => p.name).includes(person.name)) {
            response.status(400).json({error: "Name must be unique"})
        } else {
            persons = [
                ...persons,
                person
            ]
            response.status(200).json(person).end()
        }
    } else {
        response.status(400).json({error: "Name or number missing"})
    }
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
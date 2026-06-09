const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors') // Added cors dependency
const port = 3019

const app = express()

// Middleware
app.use(cors())
app.use(express.static('Frontend')) // Serves front-end files directly from this directory
app.use(express.json()) // Crucial: allows server to read JSON sent by fetch()
app.use(express.urlencoded({ extended: true }))

// Your working fallback connection string
const atlasConnectionString = 'mongodb://tonygeorge9545_db_user:Wby36GlB26JncFAj@ac-bo3cgtq-shard-00-00.4dny25k.mongodb.net:27017,ac-bo3cgtq-shard-00-01.4dny25k.mongodb.net:27017,ac-bo3cgtq-shard-00-02.4dny25k.mongodb.net:27017/feedback_collector?ssl=true&replicaSet=atlas-8jeh4g-shard-0&authSource=admin&appName=Cluster0'

mongoose.connect(atlasConnectionString)
    .then(() => console.log("Mongoose connected to Atlas successfully!"))
    .catch((err) => console.error("❌ Database connection error:", err.message))

// Database Schema & Model matching page 3 requirements
const feedbackSchema = new mongoose.Schema({
    name: String,
    message: String
}, { timestamps: true }); 
const Feedback = mongoose.model("Feedback", feedbackSchema)

// Serve the front-end page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'))
})

// 1. API: Add Feedback (POST /addFeedback)
app.post('/addFeedback', async (req, res) => {
    try {
        const { name, message } = req.body
        const newFeedback = new Feedback({ name, message })
        await newFeedback.save()
        res.status(201).json({ success: true, data: newFeedback })
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
})


// 2. API: View Feedbacks (GET /feedbacks)
app.get('/feedbacks', async (req, res) => {
    try {
        // -1 tells MongoDB to sort in descending order (newest first)
        const feedbacks = await Feedback.find().sort({ createdAt: -1 })
        res.status(200).json(feedbacks)
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

// 3. API: Delete Feedback (DELETE /feedback/:id)
app.delete('/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletedFeedback = await Feedback.findByIdAndDelete(id)
        if (!deletedFeedback) {
            return res.status(404).json({ success: false, message: "Feedback not found" })
        }
        res.status(200).json({ success: true, message: "Feedback removed successfully" })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message })
    }
})

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
})
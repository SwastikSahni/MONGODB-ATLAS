const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4
});

let studentsCollection;

// Connect to MongoDB
async function connectDB() {

    try {

        await client.connect();

        const db = client.db("collegeDB");

        studentsCollection = db.collection("students");

        console.log("Connected to MongoDB Atlas");

        // Start server only after MongoDB connection
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error("MongoDB connection error:", error);

    }
}

connectDB();


// ========================================
// CREATE - Add Student
// ========================================

app.post("/students", async (req, res) => {

    try {

        const student = req.body;

        const result =
            await studentsCollection.insertOne(student);

        res.json({

            message: "Student added successfully",

            id: result.insertedId

        });

    } catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

});


// ========================================
// READ - Get All Students
// ========================================

app.get("/students", async (req, res) => {

    try {

        const students =
            await studentsCollection.find().toArray();

        res.json(students);

    } catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

});


// ========================================
// DELETE - Delete Student
// ========================================

app.delete("/students/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const result =
            await studentsCollection.deleteOne({

                _id: new ObjectId(id)

            });

        res.json({

            message: "Student deleted successfully",

            deletedCount: result.deletedCount

        });

    } catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

});
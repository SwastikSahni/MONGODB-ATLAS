
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4
});

let studentsCollection = null;
let localStudents = [];

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

async function connectDB() {
    try {
        await client.connect();

        const db = client.db("collegeDB");
        studentsCollection = db.collection("students");

        console.log("Connected to MongoDB Atlas");
    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
}

connectDB();

// CREATE - Add Student
app.post("/students", async (req, res) => {
    try {
        if (studentsCollection) {
            const result = await studentsCollection.insertOne(req.body);

            return res.json({
                message: "Student added successfully",
                id: result.insertedId
            });
        }

        const student = {
            ...req.body,
            _id: new ObjectId().toString()
        };

        localStudents.push(student);

        res.json({
            message: "Student added successfully",
            student
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ - Get All Students
app.get("/students", async (req, res) => {
    try {
        if (studentsCollection) {
            const students = await studentsCollection.find().toArray();
            return res.json(students);
        }

        res.json(localStudents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Delete Student
app.delete("/students/:id", async (req, res) => {
    try {
        if (studentsCollection) {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    error: "Invalid student ID"
                });
            }

            const result = await studentsCollection.deleteOne({
                _id: new ObjectId(req.params.id)
            });

            return res.json({
                message: "Student deleted successfully",
                deletedCount: result.deletedCount
            });
        }

        const previousLength = localStudents.length;

        localStudents = localStudents.filter(
            student => student._id !== req.params.id
        );

        res.json({
            message: "Student deleted successfully",
            deletedCount: previousLength - localStudents.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

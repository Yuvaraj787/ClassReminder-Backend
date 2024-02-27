import mongoose from "mongoose";

const url = "mongodb+srv://yuvarajv787:test123@cluster0.qmwbm47.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(url)

const conn = mongoose.connection;

conn.on("connected", () => {
    console.log("SUCCESS: Connected to MongoDB")
})

conn.on("disconnected", () => {
    console.log("INFO: disConnected to MongoDB")
})

conn.on("error", (err) => {
    console.log("ERROR: " + err.message)
})

export default conn;
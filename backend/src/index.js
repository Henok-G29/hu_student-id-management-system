const express = require('express')
const cors = require("cors")

const env = require('./config/env')
const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");

const app = express()

app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "HU Student ID Management API is running ...!",
    });
});

app.use("/api/auth", authRoutes)
app.use("/api/test", testRoutes)

app.listen(env.port, () => {
    console.log(`API Server is runnig on PORT ${env.port}`);
    console.log(`Server Address http://127.0.0.1:${env.port}`);

})

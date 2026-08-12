const express = require('express')
const env = require('./config/env')
const app = express()

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "HU Student ID Management API is running ...!",
    });
});

app.listen(env.port, () => {
    console.log(`API Server is runnig on PORT ${env.port}`);
    
})
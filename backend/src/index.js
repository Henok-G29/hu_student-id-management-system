const express = require('express')

const app = express() 

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "HU Student ID Management API is running ...!",
    });
});

app.listen(PORT, () => {
    console.log(`API Server is runnig on PORT ${PORT}`);
    
})
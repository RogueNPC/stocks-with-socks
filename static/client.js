const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({repsonse: "In stocks page."})
})

module.exports = router;
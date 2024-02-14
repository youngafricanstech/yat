const express = require('express')
const router = express.Router()


router.get("/", (req, res) => {
    res.render("contactus", {layout: false})
})

module.exports = router;
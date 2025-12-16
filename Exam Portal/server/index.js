const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")
const superAdminRoutes = require("./routes/superAdminRoutes")
const invigilatorRoutes = require("./routes/invigilatorRoutes")
const cors = require('cors')
const userAuthController = require("./common_files/userAuthController.js"); 

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use("/api/user",userRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/super-admin",superAdminRoutes)
app.use("/api/invigilator",invigilatorRoutes)
app.use("/api/auth", userAuthController); 
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const express = require("express");

// Router
const debugRouter = express.Router();

debugRouter.get("/", (req, res, next) => {
  res.send(
    `Debug router is working fine. You can try requesting GET on /debug/auth to check if are you authenticated or not.`
  );
});

debugRouter.get("/auth", (req, res, next) => {
  var auth = req.currentUser;
  if (auth) {
    // res.send(`[DEBUG] You're authenticated.`);
    res.json(auth);
  } else {
    res.send(`[DEBUG] You're not authenticated.`);
  }
});

module.exports = debugRouter;

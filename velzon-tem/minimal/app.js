const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const express = require('express');
const app = express();
const path = require('path');
const pageRouter = require('./routes/routes');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const upload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });
const flash = require("connect-flash");
const i18n = require("i18n-express");
const bodyParser = require('body-parser');
const urlencodeParser = bodyParser.urlencoded({ extended: true });
const ngrok = require('ngrok'); // เพิ่มการ import ngrok
app.use(urlencodeParser);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(upload());

app.use(express.json());
app.use(session({ resave: false, saveUninitialized: true, secret: 'nodedemo' }));
app.use(cookieParser());

app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(flash());

app.use(express.static(__dirname + '/public'));

/* ---------for Local database connection---------- */
const DB = process.env.DATABASE_URL;
mongoose.connect(DB, {
    useNewUrlParser: true
}).then((con) => console.log("DB connection successfully..!"));

// for i18 use
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'), 
    siteLangs: ["ar", "ch", "en", "fr", "ru", "it", "gr", "sp"],
    textsVarName: 'translation'
}));

// Define All Route 
pageRouter(app);

app.all("*", function (req, res) {
    res.locals = { title: "Error 404" };
    res.render("auth/auth-404", { layout: "layouts/layout-without-nav" });
});

const http = require("http").createServer(app);
const port = process.env.PORT || 3000;

http.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    
    // เริ่มการเชื่อมต่อกับ ngrok
    /*try {
        const url = await ngrok.connect({
            addr: port,
            authtoken: '2oPlculO2pNOrfuOlKHzqvYZNBS_2VCmKnX3rMXT75ZtZmFVH'
        });
        console.log(`ngrok tunnel opened at: ${url}`);
    } catch (error) {
        console.error("Error starting ngrok:", error);
    }*/
});

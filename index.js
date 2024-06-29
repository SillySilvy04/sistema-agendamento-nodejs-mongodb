const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const appointmentService = require('./services/AppointmentService.js');
const AppointmentService = require('./services/AppointmentService.js');
const { stat } = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/agendamentos');

app.get('/', (req, res) => {
    res.render('index');
});

app.get("/cadastro", (req, res) => {
    res.render("create");
});

app.post("/create", async (req, res) => {
    var status = await appointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
    );

    if (status) {
        res.redirect("/");
    } else {
        res.send("deu ruim");
    }
});

app.get("/getcalendar", async (req, res) => {
    console.log("getcalendar");
    var appointments = await appointmentService.GetAll(false);
    res.json(appointments);
});

app.get("/event/:id", async (req, res) => {
    var appointment;
    try {
        appointment = await AppointmentService.GetById(req.params.id);
        if (appointment === undefined) {
            return res.status(404).redirect("/");
        }
    } catch (error) {
        console.error(error);
        res.status(505).redirect("/");
    }
    res.render("event", {appo: appointment});
});

app.post("/finish", async (req, res) => {
    var id = req.body.id;
    var status = await AppointmentService.Finish(id);
    if(!status){
        res.status(404).redirect("/");
    }

    if (status) {
        res.redirect("/");
    } else {
        res.send("deu ruim");
    }
});

app.get("/list", async (req, res) => {

    //await AppointmentService.Search("aaaaaa@345.com");

    var appointments = await AppointmentService.GetAll(true);
    res.render("list", {appos: appointments});
});

app.get("/search_result", async (req, res) => {
    var appos = await AppointmentService.Search(req.query.search);
    res.render("list", {appos: appos});
});

setInterval(async () => {
    await AppointmentService.SendNotification();
},5000)

app.listen(8080, () => {
    console.log('rodo');
});
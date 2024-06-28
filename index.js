const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const appointmentService = require('./services/AppointmentService.js');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/agendamentos', { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.render('index');
});

app.get("/cadastro", (req, res) => {
    res.render("create");
});

app.post("/create",async (req,res) => {
    var status = await appointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
    );

    if(status){
        res.redirect("/");
    }else{
        res.send("deu ruim");
    
    }
});

app.listen(8080, () => {
    console.log('rodo');
});
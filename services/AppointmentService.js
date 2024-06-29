const appointment = require('../models/Appointments');
const mongoose = require('mongoose');
const AppointmentFactory = require('../factories/AppointmentFactory.js');
const mailer = require('nodemailer');

const Appo = mongoose.model('Appointment', appointment);

class AppointmentService {
    async Create(name, email, description, cpf, date, time) {
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        });
        try {
            await newAppo.save();
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async GetAll(showFinished) {
        if (showFinished) {
            return await Appo.find();
        } else {
            var appos = await Appo.find({ finished: false });
            var appointments = [];

            appos.forEach(appointment => {
                if (appointment.date != undefined) {
                    appointments.push(AppointmentFactory.Build(appointment));
                }
            });

            return appointments;
        }
    }

    async GetById(id) {
        try {
            var event = await Appo.findOne({ _id: id });
            return event;
        } catch (error) {
            console.log(error);
        }
    }

    async Finish(id) {
        try {
            await Appo.findByIdAndUpdate(id, { finished: true });
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async Search(query) {
        try {
            var appos = await Appo.find().or([{ email: query }, { cpf: query }]);
            return appos;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async SendNotification() {
        var transporter = mailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "ad0bd6da30a07b",
                pass: "06fb4c00215451"
            }
        });

        var appos = await this.GetAll(false);
        appos.forEach(async (app) => {
            var date = app.start.getTime();
            var hour = 1000 * 60 * 60;
            var gap = date - Date.now();

            

            if ((gap <= hour) && (!app.notified) && (gap >= 0)) {
                await Appo.findByIdAndUpdate(app.id, { notified: true }).then(() => {}).catch((err) => {
                    console.log(err);
                });
                transporter.sendMail({
                    from: "Silvy <sillylyly@gmail.com>",
                    to: app.email,
                    subject: "Sua consulta acontecerá em breve",
                    text: "Sua consulta acontecerá em aproximadamente 1 hora"
                }).then(() => {

                }).catch((err) => {
                    console.log(err);
                });
            }
        });

    }
}

module.exports = new AppointmentService();
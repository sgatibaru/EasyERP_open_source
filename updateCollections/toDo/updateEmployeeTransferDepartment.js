var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var async = require('async');
var _ = require('lodash');
var moment = require('../../public/js/libs/moment/moment');

require('../../models/index.js');

var EmployeeSchema = mongoose.Schemas['Employee'];
var DepartmentSchema = mongoose.Schemas['Department'];
var connectOptions = {
    user: 'easyErp',
    pass: '1q2w3e!@#',
    w   : 1,
    j   : true
};

//var dbObject = mongoose.createConnection('localhost', 'production', 28017, connectOptions);
var dbObject = mongoose.createConnection('localhost', 'production');

dbObject.on('error', console.error.bind(console, 'connection error:'));
dbObject.once('open', function callback() {
    console.log("Connection to production is success");
});

var Employee = dbObject.model("Employees", EmployeeSchema);
var Department = dbObject.model("Department", DepartmentSchema);

var query = Employee.find().lean();

query.exec(function (error, _res) {
    if (error) {
        return console.dir(error);
    }

    async.eachLimit(_res, 50, function (emp, callback) {
        var objectToSave;
        var transfer = emp.transfer;
        var newTransfer = [];
        var newTr;

        transfer = transfer.forEach(function (tr, i) {
            if (i !== 0) {
                if (tr.department.toString() !== transfer[i - 1].department.toString()) {
                    newTr = JSON.parse(JSON.stringify(transfer[i - 1]));

                    newTr.status = 'transfer';
                    newTr.manager = ObjectId(newTr.manager);
                    newTr.jobPosition = ObjectId(newTr.jobPosition);
                    newTr.date = moment(tr.date);
                    newTr.date = newTr.date.subtract(1, 'days');
                    newTransfer.push(newTr);
                }
            }

            if (tr.status !== 'transfer') {
                newTransfer.push(tr);
            }
        });

        objectToSave = {
            transfer: newTransfer
        };

        Employee.update({_id: emp._id}, objectToSave, callback);
        //callback();
    }, function (err) {
        if (err) {
            return console.dir(err);
        }

        console.dir('Good');
    });
});

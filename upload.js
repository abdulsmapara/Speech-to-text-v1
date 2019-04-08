var multer = require('multer');
var path = require('path');
var fs = require('fs');
var extension = "";
var fileName = "";
var ret = [];

exports.uploadFile = function (fieldname, destination) {
    var storageCriteria = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destination);
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
            fileName = file.originalname;

        }

    });

    var uploadCriteria = multer({
        storage: storageCriteria
    });

    var upload = uploadCriteria.fields([{name: fieldname, maxCount: 5}]);

    return upload;


};

exports.ext = function () {
    return extension;
};

exports.name = function () {
    return fileName;
}

exports.empty = function() {
    ret = [];
}

exports.getAllFiles = function(pa) {
    var files = fs.readdirSync(pa);
    if (files.length == 0)
    {
        files = ["none"];
    }
    ret.push(files);
    // console.log(files);
};

exports.returnFiles = function() {
    return ret;
};
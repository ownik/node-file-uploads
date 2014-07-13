var express = require('express'),
    router = express.Router(),
    multiparty = require('multiparty');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Node.js File Uploads' });
});

router.post('/', function(req, res, next) {
    // create a form to begin parsing
    var form = new multiparty.Form();
    var uploadFile = {uploadPath: '', type: '', size: 0};
    var maxSize = 2 * 1024 * 1024; //2MB
    var supportMimeTypes = ['image/jpg', 'image/png'];
    var errors = [];

    form.on('error', function(err){
        fs.unlinkSync(uploadImage.path);
    });

    form.on('close', function() {
        if(errors.length == 0) {
            res.send({status: 'ok', text: 'Success'});
        }
        else {
            fs.unlinkSync(uploadImage.path);
            res.send({status: 'bad', errors: errors});
        }
    });

    // listen on part event for image file
    form.on('part', function(part) {
        uploadFile.size = part.byteCount;
        uploadFile.type = part.headers['content-type'];
        uploadFile.path = './files/' + part.filename;

        if(uploadFile.size > maxSize) {
            errors.push('File size is ' + uploadFile.size + '. Limit is' + (maxSize / 1024 / 1024) + 'MB.');
        }

        if(supportMimeTypes.indexOf(uploadFile.type) == -1) {
            errors.push('Unsupported mimetype ' + uploadFile.type);
        }

        if(errors.length == 0) {
            var out = fs.createWriteStream(uploadImage.path);
            part.pipe(out);
        }
    });

    // parse the form
    form.parse(req);
});

module.exports = router;

function JSUploader() {
    this.allFiles = [];
    var baseClass = this;

    this.addFiles = function(files) {
        $.each(files, function(i, file) {
            var temp = {file: file, progressTotal: 0, progressDone: 0, element: null, valid: false};

            temp.valid = (file.type == 'image/png'
                || file.type == 'image/jpeg'
                || file.type == 'image/jpg') && file.size / 1024 / 1024 < 2;

            temp.element = baseClass.attachFileToView(temp);
            baseClass.allFiles.unshift(temp);
        });
    };

    this.uploadFile =  function(index) {
        var file = baseClass.allFiles[index];

        if(file.valid) {
            var data = new FormData();
            data.append('uploadFile', file.file);

            $.ajax({
                url: '/',
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function (response) {
                    var message = file.element.find('td.message');
                    if (response.status == 'ok') {
                        message.html(response.text);
                        file.element.find('button.uploadButton').remove();
                    }
                    else {
                        message.html(response.errors);
                    }
                },
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();

                    if (xhr.upload) {
                        console.log('xhr upload');

                        xhr.upload.onprogress = function (e) {
                            file.progressDone = e.position || e.loaded;
                            file.progressTotal = e.totalSize || e.total;
                            baseClass.updateFileProgress(index, file.progressDone, file.progressTotal, file.element);
                            baseClass.totalProgressUpdated();
                            console.log('xhr.upload progress: ' + file.progressDone + ' / ' + file.progressTotal + ' = ' + (Math.floor(file.progressDone / file.progressTotal * 1000) / 10) + '%');
                        };
                    }

                    return xhr;
                }
            });
        }
    };

    this.uploadAllFiles =  function() {
        $.each(baseClass.allFiles, function(i, file) {
            baseClass.uploadFile(i);
        });
    };

    this.updateFileProgress = function(index, done, total, view) {
        var percent = (Math.floor(done/total*1000)/10);

        var progress = view.find('div.progress-bar');

        progress.width(percent + '%');
        progress.html(percent + '%');
    };

    this.updateTotalProgress = function(done, total) {
        var percent = (Math.floor(done/total*1000)/10);
        $('#progress').width(percent + '%');
        $('#progress').html(percent + '%');
    };

    this.totalProgressUpdated = function() {
        var done = 0.0;
        var total = 0.0;

        $.each(baseClass.allFiles, function(i, file) {
            done += file.progressDone;
            total += file.progressTotal;
        })

        baseClass.updateTotalProgress(done, total);
    };

    this.attachFileToView = function(file) {
        var row = $('<tr>');
        row.hide();

        var isValidType = (file.file.type == 'image/png'
            || file.file.type == 'image/jpeg'
            || file.file.type == 'image/jpg');

        var isValidSize = file.file.size / 1024 / 1024 < 2;

        //create preview
        var preview = $('<td>');
        preview.width('100px');
        if(isValidType)
        {
            var img = $('<img>');
            img.attr('class', 'img-fullsize');

            var reader = new FileReader();
            reader.onload = function (e) {
                img.attr('src', e.target.result);
            }
            reader.readAsDataURL(file.file);

            preview.append(img);
        }

        //create file info column
        var fileInfo = $('<td>');
        fileInfo.width('200px');

        var fileName = $('<div>');
        fileName.html(file.file.name);

        var fileType = $('<div>');
        fileType.html(file.file.type);

        var fileSize = $('<div>');
        var size = file.file.size;

        if((file.file.size / 1024 / 1024) > 1.0) {
            fileSize.html(Math.floor(file.file.size / 1024 / 1024) + ' MB');
        }
        else if((file.file.size / 1024) > 1.0) {
            fileSize.html(Math.floor(file.file.size / 1024) + ' KB');
        }
        else {
            fileSize.html(file.file.size + ' bytes');
        }


        fileInfo.append(fileName);
        fileInfo.append(fileType);
        fileInfo.append(fileSize);

        //create message column
        var messageColumn = $('<td>');
        messageColumn.attr('class', 'message');
        messageColumn.width('200px');
        if(!isValidType)
        {
            messageColumn.html('Unsupported mimetype ' + file.file.type);
        }
        if(!isValidSize) {
            messageColumn.html(messageColumn.html() + 'File size is ' + Math.floor(file.file.size / 1024 / 1024) + ' MB. Limit is2 MB.');
        }

        //create progress
        var progressColumn = $('<td>');
        progressColumn.attr('style', 'vertical-align: middle;');
        if(file.valid) {
            var progress = $('<div>');

            progress.attr('class', 'progress');

            var progressBar = $('<div>');
            progressBar.attr('class', 'progress-bar');
            progressBar.attr('role', 'progressbar');
            progressBar.html('0%');

            progress.append(progressBar);
            progressColumn.append(progress);
        }

        //create buttons
        var button1 = $('<td>');
        button1.attr('style', 'vertical-align: middle; width:50px');

        var uploadButton = $('<button>');
        uploadButton.attr('class', 'btn btn-primary uploadButton');
        uploadButton.html('Upload');
        uploadButton.click(function(){
            baseClass.uploadFile(row.index());
        });
        if(file.valid) {
            button1.append(uploadButton);
        }

        var button2 = $('<td>');
        button2.width('50px');

        var removeButton = $('<button>');
        removeButton.attr('class', 'close');
        removeButton.html('&times');
        removeButton.click(function(){
            baseClass.allFiles.splice(row.index(), 1);
            row.fadeOut(300, function(){
                $(this).remove();
            });
        });
        button2.append(removeButton);

        row.append(preview);
        row.append(fileInfo);
        row.append(messageColumn);
        row.append(progressColumn);
        row.append(button1);
        row.append(button2);
        row.fadeIn();

        $('#files').prepend(row);

        return row;
    };
}

var uploader = new JSUploader();

$(document).ready(function()
{
    $("#addFilesButton").click(function() {
        $("#uploadFiles").replaceWith($("#uploadFiles").clone(true));
        $("#uploadFiles").click();
    });

    $("#uploadAllFilesButton").click(function() {
        uploader.uploadAllFiles();
    });

    $("#uploadFiles").change(function() {
        var files = this.files;

        uploader.addFiles(files);
    });

});


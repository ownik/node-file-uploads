$(document).ready(function()
{
    $("#uploadImagesButton").click(function() {
        $("#uploadImages").replaceWith($("#uploadImages").clone(true));
        $("#uploadImages").click();
    });

    $("#uploadImages").change(function() {
        var files = this.files;

        $('#errors').html('');
        $('#messages').addClass('hide');

        $.each(files, function(i, file) {
            var data = new FormData();
            data.append('uploadImage', file);

            $.ajax({
                url: '/uploadpictures',
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(data){
                    if(data.status == 'ok') {
                        var container = $('<div>');
                        container.attr('class', 'col-lg-3 col-sm-4 col-xs-12');
                        container.hide();

                        var well = $('<div>');
                        well.attr('class', 'well');

                        var href = $('<a>');
                        href.attr('href', '#');

                        var img = $('<img>');
                        img.attr('src', data.url);
                        img.attr('class', 'img-responsive');

                        href.append(img);
                        well.append(href);
                        container.append(well);

                        $('#newPictures').prepend(container);

                        container.fadeIn();
                    }
                    else {
                        var errors = data.errors;

                        var errorsList = $('<ul>');
                        errorsList.hide();

                        $.each(errors, function(i, error){
                            var errorItem = $('<li>');
                            errorItem.html(error);
                            errorsList.append(errorItem);
                        });


                        $('#messages').removeClass('hide');

                        var tempItem = $('<li>');
                        tempItem.html(file.name);
                        tempItem.append(errorsList);
                        $('#errors').append(tempItem);

                        errorsList.fadeIn();
                    }
                }
            });
        });
    });

});
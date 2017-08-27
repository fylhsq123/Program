function sendRequest(url, config, callback) {
    $.ajax(url, config).done(function (res) {
        callback(null, res);
    }).fail(function (err) {
        callback(err)
    })
}

function isValidNumber(number) {
    return number.length != 0 ? !/\D/.test(number) : false;
}

function validateNumbers(e) {
    var _this = $(this);
    if (isValidNumber(_this.val())) {
        _this.parent().removeClass('has-error')
    } else {
        _this.parent().addClass('has-error')
    }
}

function setValidators() {
    $('#numWords_left').keyup(validateNumbers)
    $('#numWords_right').keyup(validateNumbers)
}

function setEventListeners() {
    $('#manage_zoonyms').click(function (e) {
        alert('clicked');
    })
    $('#find').click(function (e) {
        if (isValidNumber($('#numWords_left').val() && $('#numWords_right').val())) {
            sendRequest('/findSimile/' + $('#connectingWord').val(), {
                method: 'GET',
                data: {
                    num_left: $('#numWords_left').val(),
                    num_right: $('#numWords_right').val(),
                    zoonym: $('#zoonym').val()
                }
            }, function (err, res) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(res);
                }
            })
        }
    })
}

function init() {
    setValidators();
    setEventListeners();
}

$(function () {
    init();
});
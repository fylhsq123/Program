let Routes = function (app) {
    app.route('/findSimile/:connectingWord')
        .get(function (req, res) {
            var num_left = parseInt(req.query.num_left) || 5,
                num_right = parseInt(req.query.num_right) || 5,
                zoonym = req.query.zoonym || '';
            console.log(typeof num_left, num_right)
            res.status(200).send({reseived: {connectingWord: req.params.connectingWord, num_left, num_right, zoonym}});
        })
}
module.exports = Routes;
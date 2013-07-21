console.log("begining");
var express = require("express"),
	crypto = require('crypto');


var svg = require('svg2png');

var app = express();
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.static('public'));
var fs = require('fs');
var path = require('path');

function hash(content) {
	var shasum = crypto.createHash('sha1');
	shasum.update(content, 'utf-8');
	return shasum.digest("hex");
}


app.post('/image', function(req, res) {

	console.log(req);
	var hashed = hash(req.body.svg);

	collection.findOne({
		_id: hashed
	}, function(err, doc) {
		if (doc) {
			return res.send(doc);
		};

		collection.insert({
			_id: hashed,
			svg: req.body.svg,
			date: +new Date()
		}, function(err, docs) {
			if (err || !docs || docs.length != 1) {
				return res.send(500, "oups something went wrong, please try again");
			}
			return res.send(docs[0]);
		})
	})
})

app.get('/image/latests', function(req, res) {
	var cursor = collection.find().sort({
		date: -1
	}).limit(3);

	cursor.toArray(function(err, docs) {
		res.json(docs);
	})
})

app.get('/image/:id', function(req, res) {

	var _id = req.params.id;

	var pngFileName = _id + ".png";
	var svgFileName = _id + '.svg';

	var svgPathName = path.join('/', 'tmp', svgFileName);
	var pngPathName = path.join('/', 'tmp', pngFileName);

	fs.exists(pngPathName, function(exists) {
		if (exists) {
			return res.sendfile(pngPathName);
		} else {
			collection.findOne({
				_id: _id
			}, function(err, doc) {
				if (err) {
					return res.send(err);
				}
				if (!doc || !doc.svg) {
					return res.send(404, {
						error: "document not found"
					});
				}

				fs.writeFile(svgPathName, doc.svg, function(err) {
					if (err) {
						return res.send(err)
					};
					svg(svgPathName, pngPathName, function(err) {
						if (err) {
							return res.send(err)
						};
						res.sendfile(pngPathName);
					});
				})
			})
		}
	});
});

console.log("will connect to mongo")
var MongoClient = require('mongodb').MongoClient;
var mongoURL = process.env.MONGOHQ_URL || "mongodb://127.0.0.1:27017/tcl";
console.log("will connect to mongo" + mongoURL)
var collection;
MongoClient.connect(mongoURL, function(err, db) {
	console.log("connected to mongo")
	if (err) throw err;
	collection = db.collection('images');

	var port = process.env.PORT || 5000;
	app.listen(port, function() {
		console.log("Listening on " + port);
	})
})
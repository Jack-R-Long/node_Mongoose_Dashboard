// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
//mongoose 
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose');
// create the express app
var app = express();
var bodyParser = require('body-parser');
// use it!
app.use(bodyParser.urlencoded({ extended: true }));
// MiddleWare: Session and Flash 
var session = require('express-session');
app.use(session({
	secret: 'cam_god',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}))
const flash = require('express-flash');
app.use(flash());
// static content
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// // Get sockets
// const server = app.listen(8000);
// const io = require('socket.io')(server);
// var counter = 0;

// io.on('connection', function (socket) { //2
// 	  //Insert SOCKETS 
// });

// Mongoose Schema users 
// var UserSchema = new mongoose.Schema({
// 	name: {type: String, required: true, minlength: 2},
// 	age: {type:Number, required: true, min: 1, max: 150}
// }, {timestamps: true})
// mongoose.model('User', UserSchema); // We are setting this Schema in our Models as 'User'
// var User = mongoose.model('User') // We are retrieving this Schema from our Models, named 'User'

var WolfSchema = new mongoose.Schema({
	name: {type: String, required: true, minlength: 2},
	age: {type:Number, required: true, min: 1, max: 500},
	weight: {type:Number, required: true, min: 1, max: 50}
}, {timestamps :true})
mongoose.model('Wolf', WolfSchema);
var Wolf = mongoose.model('Wolf')
// // ...delete all records of the User Model
// User.deleteMany({}, function(err){
// 	// This code will run when the DB has attempted to remove all matching records to {}
//    })

// root route to render the index.ejs view
app.get('/', function(req, res) {
	Wolf.find({}, function(err, wolf_array) {
		if (err) {
			console.log("Error finding all wolves")
			res.render("index")
		} else {
			// console.log(wolf_array)
			res.render("index", {wolves: wolf_array})
		}
	}) 
})
app.get('/wolves/new', function(req, res) {
	res.render("wolf_add")
})
app.get('/wolves/:wolfId', function(req, res) {
	Wolf.findById(req.params.wolfId, (err, wolf_select)=>{
		if (err) {
			console.log("Error finding selected wolf")
			res.render("index")
		} else {
			console.log(wolf_select)
			res.render("wolf_details", {wolves: wolf_select})
		}
	})
})
app.get('/wolves/edit/:wolfId', function(req, res) {
	Wolf.findById(req.params.wolfId, (err, wolf_select)=>{
		if (err) {
			console.log("Error finding selected wolf")
			res.render("index")
		} else {
			console.log(wolf_select)
			res.render("wolf_edit", {wolves: wolf_select})
		}
	})
})
app.get('/wolves/destroy/:wolfId', function(req, res) {
	Wolf.remove({_id: req.params.wolfId}, (err)=>{
		if (err) {
			console.log("Error destroying selected wolf")
			res.redirect("/")
		} else {
			res.redirect("/")
		}
	})
})

// POST ROUTES 
app.post('/wolves', function(req, res) {
	console.log("POST DATA", req.body);
	var new_wolf = new Wolf({name: req.body.name, age: req.body.age, weight: req.body.weight})
	new_wolf.save(function(err) {
		if (err) {
			console.log("Error adding wolf")
			for (var key in err.errors) {
				req.flash('new', err.errors[key].message);
			}
			res.redirect('/wolves/new')
		} else {
			console.log("Successfully added Wolf")
			res.redirect("/")
		}
	})
})
app.post('/wolves/:wolfId', function(req, res) {
	var id = req.params.wolfId;
	var updateObj = {name: req.body.name, age: req.body.age, weight: req.body.weight, updatedDate: Date.now()};
	Wolf.findByIdAndUpdate(id, updateObj, {new: true}, (err, wolf)=> {
		if (err) {
			console.log("Error editing wolf")
			for (var key in err.errors) {
				req.flash('new', err.errors[key].message);
			}
			res.redirect('/wolves/edit/'+id)
		}else {
			console.log("Successfully edited Wolf")
			res.redirect("/")
		}
	})
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(request, response){
	response.send("404")
});

// tell the express app to listen on port 8000
app.listen(8000, function() {
 console.log("listening on port 8000");
});
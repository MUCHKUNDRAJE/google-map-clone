// package requiements
const express = require ("express");
const app =  express();


const http = require("http");
const { connect } = require("http2");
const path = require("path");

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")))

//-------------------------------------socket--------------------------------------------



io.on("connection", function(socket) {
    socket.on("send-location", function(data) {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    console.log("A user connected");

    socket.on("disconnect", function() {
        console.log("User disconnected");
    });

    socket.emit('routeData', {
        waypoints: [
            { lat: 21.137029, lng: 79.128739 },
            { lat: 21.147029, lng: 79.138739 }
        ],
        routeInfo: {
            distance: 2.5, // in km
            time: 10 // in minutes
        }
    });
});


//-------------------routes handling---------------------------------------------------------------
app.get("/",function(req,res,next){

res.render("index");

});

server.listen(3000)
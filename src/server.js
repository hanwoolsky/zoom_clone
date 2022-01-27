import http from "http";
//import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app); // http server
const io = SocketIO(server);

function publicRooms(){
    const {
        sockets: {
            adapter: {sids, rooms}
        }
    } = io;
    const publicRooms = []
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

io.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done(); // front-end에서 실행시킴
        socket.to(roomName).emit("welcome", socket.nickname);
        io.sockets.emit("room_change", publicRooms());
    });
    socket.on("nickname", nickname => (socket["nickname"] = nickname));
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));
    });
    socket.on("disconnect", () => {
        io.sockets.emit("room_change", publicRooms());
    });
}); // receive connection

server.listen(3000, handleListen);

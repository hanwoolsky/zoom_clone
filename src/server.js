import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app); // http server
const wss = new WebSocket.Server({ server }); // webSocket server

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket); // 연결된 브라우저의 소켓을 저장
    socket["nickname"] = "anonymouse";
    console.log("Connected to Browser✅");
    socket.on("close", () => console.log("Disconnected from server❗"));
    socket.on("message", msg => {
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach((aSocket) =>
                    aSocket.send(`${socket.nickname}: ${message.payload.toString()}`)
                );
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }
    });
});


server.listen(3000, handleListen);
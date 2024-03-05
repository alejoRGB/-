const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const osc = require('node-osc');
const io = require('socket.io')(8081);

const server = http.createServer((req, res) => {
    let filePath = '';

    

    if (req.url === '/index.html' || req.url === '/') {
        filePath = path.join(__dirname, 'index.html');
    } else if (req.url === '/style.css' || req.url === '/detection.js' || req.url === '/sketch.js' || req.url === '/socket.io.js' || req.url === '/Inconsolata_Regular.ttf') {
        filePath = path.join(__dirname, req.url);
    } else {
        // Por defecto, responder con un código de estado 404 para otras rutas
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
        return;
    }

    // Leer el contenido del archivo
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Si ocurre un error al leer el archivo
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Error interno del servidor');
            return;
        }

        // Determinar el tipo de contenido basado en la extensión del archivo
        let contentType = 'text/html';
        if (filePath.endsWith('.css')) {
            contentType = 'text/css';
        } else if (filePath.endsWith('.js')) {
            contentType = 'text/javascript';
        }

        // Si el archivo se lee correctamente, enviar su contenido como respuesta
        res.writeHead(200, {'Content-Type': contentType});
        res.end(data);
    });
});

const puerto = 5501;
const host = 'localhost';

server.listen(puerto, host, () => {
    console.log(`Servidor corriendo en http://${host}:${puerto}`);

    // Comando para abrir una pestaña de chrome en localhost:5501
    const command = 'start chrome http://localhost:5501';

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al abrir Chrome: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Chrome abierto correctamente.`);
    });
});

const socketServer = io.listen(server);

let oscServer, oscClient;
let isConnected = false;

socketServer.on('connection', function (socket) {
    console.log('connectionsssss');
    socket.on("config", function (obj) {
        console.log("conected");
        oscServer = new osc.Server(obj.server.port, obj.server.host);
        oscClient = new osc.Client(obj.client.host, obj.client.port);
        oscClient.send('/status', socket.sessionId + ' connected');
        oscServer.on('message', function(msg, rinfo) {
            socket.emit("message", msg);
        });
        socket.emit("connected", 1);
    });
    socket.on("message", function (obj) {
        oscClient.send.apply(oscClient, obj);
    });
    socket.on('disconnect', function(){
        if (isConnected) {
            oscServer.kill();
            oscClient.kill();
        }
    });
});

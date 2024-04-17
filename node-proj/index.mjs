import express from 'express';
import { Server } from 'http'; // Import http module
import { Server as SocketServer } from 'socket.io'; // Import socket.io
import { exec } from 'child_process';
import dotenv from 'dotenv';
import exphbs from 'express-handlebars';
import { ensureDirectoryExists } from "./fsUtils.mjs";
import { getFinalDestination } from "./urlUtils.mjs";
import { refreshPlex } from "./plexUtils.mjs";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { __dirname as dirname} from './location.js';

console.log(path.join(dirname, "views"));

dotenv.config();

const app = express();
const httpServer = new Server(app); // Create http server
const io = new SocketServer(httpServer); // Create socket.io server

const { AUTH_TOKEN, MUSIC_DIR } = process.env;
const PORT = process.env.PORT ?? 2095;

const processes = {};

// Set up Handlebars as the view engine
app.set("views", path.join(dirname, "views"));
app.engine("hbs", exphbs.engine({
    defaultLayout: "layout",
    extname: ".hbs",
    partialsDir: "views/partials/",
    layoutsDir: "views/layouts/"
}));
app.set("view engine", "hbs");

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/log/:processId', (req, res) => {
    const { processId } = req.params;
    res.render('log', {processId, process : processes[processId]});
});

app.get('/', async (req, res) => {
    const { token } = req.headers;
    const { url, artist } = req.query;

    if (token !== AUTH_TOKEN) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    ensureDirectoryExists(`${MUSIC_DIR}/${artist}`);
    
    const spotUrl = await getFinalDestination(url);
    
    const processId = uuidv4();
    processes[processId] = {
        startTime: new Date(),
        logs: []
    }
    pushLog(`Downloading to ${MUSIC_DIR}/${artist}`, 'stdout', processId);
    const childProcess = exec(`spotdl download ${spotUrl}`, {cwd : `${MUSIC_DIR}/${artist}`});
    
    childProcess.stdout.on('data', (message) => {
        pushLog(message, "stdout", processId);
    });

    childProcess.stderr.on('data', (message) => {
        pushLog(message, "stderr", processId);
    });
    
    childProcess.on('close', (code) => {
        processes[processId].endTime = new Date();
        if (code === 0) {
            const message = 'Script execution completed successfully. Refreshing Plex';
            pushLog(message, "stdout", processId);
            refreshPlex();
        } else {
            const message = `Script execution failed with code ${code}`;
            pushLog(message, "stderr", processId);
        }
    });

    childProcess.on('error', (error) => {
        const message = `Error executing script: ${error}`;
        pushLog(message, "stderr", processId);
    });

    const currentTime = new Date();
    for (let key of Object.keys(processes)){
        let {endTime} = processes[key];
        const diffInMilliseconds = currentTime - endTime;
        const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;
        if (diffInMilliseconds > twentyFourHoursInMilliseconds){
            delete processes[key];
        }
    }

    return res.status(200).json({ message: 'OK', processId });
});

function pushLog(fullMessage, level, processId){
    const message = fullMessage.trim();
    const { logs } = processes[processId];
    logs.push({level,message});
    io.emit('log', { processId, level, message });
    const consoleMethod = (level === 'stdout' ? 'log' : 'error');
    console[consoleMethod](message);
}

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

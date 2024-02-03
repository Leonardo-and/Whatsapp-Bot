"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { OPENAI_TOKEN } = process.env;
class WhatsappAudioToText {
    constructor() {
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth(),
        });
        this.init();
    }
    createQRCode() {
        this.client.on("qr", (qr) => {
            try {
                qrcode_terminal_1.default.generate(qr, { small: true });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    speechToText(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (message.hasMedia && message.type === "ptt") {
                    const audio = yield message.downloadMedia();
                    const audioBuffer = Buffer.from(audio.data, "base64");
                    const audioPath = `temp/audio_${Date.now()}`;
                    fs_1.default.writeFileSync(audioPath + ".ogg", audioBuffer);
                    yield this.convertToMp3(audioPath);
                    const speech = yield this.transcribeAudio(audioPath);
                    yield message.reply(speech.text);
                    this.deleteTempFiles();
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    transcribeAudio(audioPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const openaiCLI = new openai_1.default({
                    apiKey: OPENAI_TOKEN,
                });
                return openaiCLI.audio.transcriptions.create({
                    file: fs_1.default.createReadStream(audioPath + ".mp3"),
                    model: "whisper-1",
                });
            }
            catch (error) {
                console.log(error);
                throw new Error(error);
            }
        });
    }
    deleteTempFiles() {
        try {
            const files = fs_1.default.readdirSync("temp");
            if (files.length > 0) {
                files.forEach((file) => {
                    fs_1.default.unlinkSync(`temp/${file}`);
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    init() {
        this.createQRCode();
        this.client.on("ready", () => {
            console.log("Client is ready!");
        });
        this.client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            yield this.speechToText(message);
        }));
        this.client.initialize();
    }
    convertToMp3(audioPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    fluent_ffmpeg_1.default.setFfmpegPath("C:\\ProgramData\\chocolatey\\lib\\ffmpeg-full\\tools\\ffmpeg\\bin\\ffmpeg.exe");
                    (0, fluent_ffmpeg_1.default)()
                        .input(fs_1.default.createReadStream(audioPath + ".ogg"))
                        .audioCodec("libmp3lame")
                        .on("end", () => {
                        resolve();
                    })
                        .save(audioPath + ".mp3");
                });
            }
            catch (error) {
                console.log(error);
                throw new Error(error);
            }
        });
    }
}
new WhatsappAudioToText();

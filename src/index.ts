import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";
import fs from "fs";
import Ffmpeg from "fluent-ffmpeg";
import { Message } from "../node_modules/whatsapp-web.js/index";
import dotenv from "dotenv";
dotenv.config();
const { OPENAI_TOKEN } = process.env;

class WhatsappAudioToText {
  client: Client;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
    });

    this.init();
  }

  createQRCode() {
    this.client.on("qr", (qr: string) => {
      try {
        qrcode.generate(qr, { small: true });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async speechToText(message: Message) {
    try {
      if (message.hasMedia && message.type === "ptt") {
        const audio = await message.downloadMedia();
        const audioBuffer = Buffer.from(audio.data, "base64");
        const audioPath = `temp/audio_${Date.now()}`;
        fs.writeFileSync(audioPath + ".ogg", audioBuffer);
        await this.convertToMp3(audioPath);
        const speech = await this.transcribeAudio(audioPath);
        await message.reply(speech.text);
        this.deleteTempFiles();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async transcribeAudio(audioPath: string): Promise<any> {
    try {
      const openaiCLI = new OpenAI({
        apiKey: OPENAI_TOKEN,
      });

      return openaiCLI.audio.transcriptions.create({
        file: fs.createReadStream(audioPath + ".mp3"),
        model: "whisper-1",
      });
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  }

  deleteTempFiles() {
    try {
      const files = fs.readdirSync("temp");
      if (files.length > 0) {
        files.forEach((file) => {
          fs.unlinkSync(`temp/${file}`);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  init() {
    this.createQRCode();
    this.client.on("ready", () => {
      console.log("Client is ready!");
    });
    this.client.on("message", async (message: Message) => {
      await this.speechToText(message);
    });
    this.client.initialize();
  }

  async convertToMp3(audioPath: string): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        Ffmpeg.setFfmpegPath(
          "C:\\ProgramData\\chocolatey\\lib\\ffmpeg-full\\tools\\ffmpeg\\bin\\ffmpeg.exe"
        );
        Ffmpeg()
          .input(fs.createReadStream(audioPath + ".ogg"))
          .audioCodec("libmp3lame")
          .on("end", () => {
            resolve();
          })
          .save(audioPath + ".mp3");
      });
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  }
}

new WhatsappAudioToText();

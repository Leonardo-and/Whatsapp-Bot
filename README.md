# WhatsApp Audio-to-Text Bot with OpenAI API (Whisper-1)

## Description

This repository contains the source code for a WhatsApp bot that converts audio messages to text using the OpenAI API with the Whisper-1 language model. The bot receives audio messages sent by users, processes these audios using the OpenAI API, and returns the corresponding text to the sender.

## Prerequisites

Make sure you have the following dependencies installed before running the bot:

- NodeJS
- Required node modules

To install the requires modules: `npm i`

- OpenAI account and API key (acquire at [https://platform.openai.com](https://platform.openai.com/))

## Configuration

Before running the bot, you need to set up some environment variables. Create a `.env` file in the project's root directory and add the following information:

`OPENAI_TOKEN  = "your-token"`

Make sure to replace the values with your own information.

Don't forget that you need to have `ffmpeg` installed on your machine through Chocolatey (Windows) or Linux. If necessary, you can change the path to the ffmpeg executable in `index.ts`

## Running the Bot

After configuration, you can start the bot by running the following command:

`npm run start`

The bot will generate a qr code in the terminal and after starting will be waiting for audio messages on the WhatsApp number associated with the qrcode provided in the terminal.

## Operation

- When a user sends an audio message to the WhatsApp number associated with the bot, the bot downloads the audio and uses the OpenAI API to convert the audio to text using the Whisper-1 model.
- The resulting text is then sent back to the user who sent the audio.

## Notes

Be sure to review the OpenAI terms of service when using the API. This bot is provided for educational purposes only and should not be used improperly or to violate the terms of service of OpenAI or any other platform used.

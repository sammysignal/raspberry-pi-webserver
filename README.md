# Raspberry Pi Webserver

This is a pretty simple express.js webserver that records voice messages and saves them locally. It was originally built for my Raspberry Pi.

## Features

- Ability to leave a voice message that is saved on the server.
- Integration with OpenAI so that the voice message can be responded to in real-time.
- Mailgun integration so I get personally notified when someone has left a message.

## Installation
```sh
yarn install
```

## Run
```sh
node server.js
```
or
```sh
node server.js --unhandled-rejections=strict
```

Note to self: make sure to update nginx max size:

client_max_body_size 25M; #25mb

as described here: https://reactgo.com/request-entity-too-large-node/

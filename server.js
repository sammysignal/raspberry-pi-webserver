const {readFileSync, writeFileSync} = require('fs');
const express = require('express');
const config = require('./config');

const app = express();

app.listen(config.port, () => {
	console.log(`http://localhost:${config.port}`);
	console.log(config.port)
});


app.get('/', (req, res) => {
	const count = readFileSync('./count.txt', 'utf-8');
	console.log('count', count);
	const newCount = parseInt(count) + 1;
	writeFileSync('./count.txt', newCount.toString());

	const browser = req.headers["user-agent"];

	res.send(`
	  <!DOCTYPE html>
	  <html lang="en">
	    <head>
	      <meta charset="utf-8" />
          <meta name-"viewport" content="width=device-width, initial-scale=1" />
          <title>Sammy's R-Pi</title>
	    </head>
	    <body>
	      <h1>Welcome to Sammy's Website!</h1>
		  <h2>This page is being served by my Raspberry Pi in nyc.</h2>
		  <p>This page has been viewed <b>${newCount}</b> times!</p>
		  <p>Your browser info: ${browser}</p>

		  <!-- Sammy Signal Spotify Embed-->
		  <iframe style="border-radius:12px" src="https://open.spotify.com/embed/artist/2HsyknHuxhT8RoZfn5rqMS?utm_source=generator&theme=0" width="100%" height="500" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
	    </body>
	  </html>`);
})

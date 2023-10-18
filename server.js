const {readFileSync, writeFileSync} = require('fs');
const express = require('express');

const app = express();

app.listen(5000, () => console.log('http://localhost:5000'));

app.get('/', (req, res) => {
	const count = readFileSync('./count.txt', 'utf-8');
	console.log('count', count);
	const newCount = parseInt(count) + 1;
	writeFileSync('./count.txt', newCount);
	
	res.send(`
	  <! DOCTYPE hitml>
	  <html lang="en">
	    <head>
	      <meta charset="utf-8" />
          <meta name-"viewport" content="width=device-width, initial-scale=1" />
          <title>RPi Hosted Website</title>
	    </head>
	    <body>
	      <h1>Welcome to my Website!</h1>
		  <p>This page has been viewed ${newCount} times!</p>
	    </body>
	  </html>`);
})

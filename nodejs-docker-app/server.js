const express = require('express');

const PORT = 8080;

//APP
const app = express();

app.get('/', (req,res) => {
	res.send("바이바이")
});

app.listen(PORT);
console.log("server is running");

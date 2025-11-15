let http = require('http'),
    express = require('express'),
    path = require('path'),
    app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/a', (req, res)=>{
    res.render('abobrinha');
});

http.createServer(app).listen(3000);
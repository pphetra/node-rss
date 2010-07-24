require.paths.unshift(__dirname);
var sys   = require('sys');
var http = require('http');
require('./lib/xmlbuilder');
var rss = require('../node-rss');

var fetchRss = function(elmId, url, resp) {
    resp.fetchCnt++;
    console.log("fetchRss " + resp.fetchCnt);
    rss.parseURL(url, function(articles){
        var body = new XmlBuilder({binding: this})
        with(body) {
            h2(url)
            ul(function() {
                for(i=0; i<articles.length; i++) {
                    li(articles[i].title)
                }                
            });
        }
        resp.write("<script>");
        resp.write("document.getElementById('" +
            elmId + '\').innerHTML=\'' + body.toString().replace(/\'/g, "\\'") + '\''
        );
        resp.write("</script>");
        
        resp.fetchCnt--;
        if (resp.fetchCnt <= 0) {
            resp.end()
        }
    });
};

http.createServer(function(req, resp) {
    resp.writeHead(200, {'Content-Type': 'text/html'});
    var b = new XmlBuilder({binding: this})
    with(b) {
        html(function() {
            head(function() {
                title("My Personal Web Page")
                style("#twitter { width: 200; height: 500; position: absolute; display: block; top: 100; left: 0; background-color: red;}")
                style("#news { width: 400; height: 500; position: absolute; display: block; top: 100; left: 300; background-color: blue;}")
            })
            body(function() {
                h1("Hey You! Welcome to my web page!!!")
                div({}, function() {
                    div({id: "twitter", 'class': "top-left"})
                    div({id: "news", 'class': "center"}, "hiiii")                    
                })
            })
        })
    }
    
    resp.fetchCnt = 0;
    fetchRss('twitter', "http://www.m3p.co.uk/feed/", resp);
    fetchRss('news', "http://feeds.feedburner.com/fastcompany/headlines", resp);
    
    resp.write(b.toString());
    
}).listen(8080, "127.0.0.1");

// exit if any js file or template file is changed.
// it is ok because this script encapsualated in a batch while(true);
// so it runs again after it exits.
var autoexit_watch=require('autoexit').watch;
//
var on_autoexit=function () { } 
autoexit_watch(__dirname,".js", on_autoexit);
//autoexit_watch(__dirname+"/templates",".html", on_autoexit);
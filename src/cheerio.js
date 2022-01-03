let AutomatonEngine = require('@open-automaton/automaton-engine/src/automaton-engine.js');
const Emitter = require('extended-emitter');

const cheerio = require("cheerio");
const request = require("postman-request");
const DOM = require("@open-automaton/automaton-engine/src/dom-tool.js").DOM;

let Automaton = {};

let CheerioBrowser = function(){
    this.page = null;
    this.dom = null;
}

CheerioBrowser.prototype.xpath = function(selector, cb){
    return DOM.xpathText(selector, this.page);
};

CheerioBrowser.prototype.select = function(selector, cb){
    return this.dom(selector);
};

CheerioBrowser.prototype.navigateTo = function(opts, cb){
    let callback = cb;
    let options = opts;
    if( (!cb) && typeof opts == 'function'){
        callback = opts;
        options = {};
    }
    if(typeof options === 'string') options = {url:options};
    if(options.data){
        let requestOptions = {
            uri : options.url,
            method : options.method || 'GET'
        };
        if(
            options.type.toUpperCase() === 'JSON' ||
            options.type.toUpperCase() === 'APPLICATION/JSON'
        ){
            requestOptions.json = options.data;
        }else{
            requestOptions.form = options.data;
        }
        request(requestOptions, (err, res, data)=>{
            if(err) return cb(err);
            this.page = data.toString();
            this.dom = cheerio.load(this.page);
            callback(null, this.page, this);
        });
    }else{
        request({
            uri : options.url
        }, (err, res, data)=>{
            if(err) return cb(err);
            this.page = data.toString();
            this.dom = cheerio.load(this.page);
            callback(null, this.page, this);
        });
    }
}

Automaton.CheerioEngine = AutomatonEngine.extend({
    fetch : function(opts, cb){
        this.browser.navigateTo(opts, (err, result, page)=>{
            cb(result);
        });
    }
}, function(opts){
    this.browser = new CheerioBrowser();
    this.options = opts || {};
    this.children = [];
    (new Emitter).onto(this);
});

module.exports = Automaton.CheerioEngine;

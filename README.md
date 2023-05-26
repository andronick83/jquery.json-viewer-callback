# jquery.json-viewer-callback

![github](https://img.shields.io/github/license/andronick83/jquery.json-viewer-callback)

jQuery JSON Viewer With Callback Support (**JVC**)

![Screenshot](screenshot.png?)

<hr>

## Demo page:
- [demo.html](https://andronick83.github.io/jquery.json-viewer-callback/demo.html)

<hr>

## Examples:
- Add to \<head\>:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
<link rel=stylesheet href="/jvc.css"/>
<script src="/jvc.js"></script>
```

- Add to \<body\>:
```html
<div id="jvc-viever"></div>
```

- Simple Object:
```JavaScript
var json = {
	"null": null,
	"true": true,
	"false": false,
	"undefined": undefined,
	"text": "\"text&nbsp;'text'\t`text`<br>\ntext\"",
	"url": "http://example.com/",
	"array": [0, 0.1, 2, [], {}],
	"callback": {
		"jvc-cb": "https://cdn.jsdelivr.net/gh/herrstrietzel/fonthelpers@main/json/gfontsAPI.json"
	}
}
```

- JVC Configuration: (key,invertColors,withLinks,bigNumbers,withQuotes,withFunctions,collapsed,showConf,showJSON,debug,error)
```JavaScript
var conf = {collapsed: false};
```

- JVC Print Viever:
```JavaScript
var jvc = $('#jvc-viever').JVC(json, conf);
```

- JVC Calback Events:
```JavaScript
jvc.on('JVC:change', function(element){
	var json = JVC.getJSON(element);
	console.log("JVC:change", json, JSON.parse(json));
});

jvc.on('JVC:callback', function(event, element, data, callback){
	$.ajax({url:data, dataType:"json"})
	.done(callback)
	.fail(function(xhr, status, err){
		callback({"jvc-fail": status+' ('+(err? err :xhr.status)+')'})
	})
});
```

<hr>

## More examples:
- [demo.html](https://github.com/andronick83/jquery.json-viewer-callback/blob/main/demo.html)

<hr>

## About
- Author: [andronick83.mail@gmail.com](mailto:andronick.mail@gmail.com) :shipit:
- License: [MIT License](http://opensource.org/licenses/MIT) :+1:

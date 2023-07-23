# jquery.json-viewer-callback v2

![github](https://img.shields.io/github/license/andronick83/jquery.json-viewer-callback)

jQuery JSON Viewer With Callback Support (**JVC**)

![Screenshot](demo-screenshot.png?)

<hr>

## Demo page:
- [demo.html](https://andronick83.github.io/jquery.json-viewer-callback/demo.html)

<hr>

## Examples:
- Add to \<head\>:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
<link rel=stylesheet href="jvc.css"/>
<script src="jvc.min.js"></script>
```

- Add to \<body\>:
```html
<div id=jvc></div>
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
		"§Callback": "https://cdn.jsdelivr.net/gh/herrstrietzel/fonthelpers@main/json/gfontsAPI.json"
	}
}
```

- JVC Calback Event:
```JavaScript
let jvcCb = function(ev){
	// Get JVC and Data:
	let jvc = ev.JVC, data = ev.data;
	// Ajax request:
	$.ajax({url:data, dataType:"json"})
	.done(v=>jvc(v))
	.fail((xhr, status, err)=>{
		jvc(Error("jvc-"+status+' '+(err? err :xhr.status)));
	});
};
```

- JVC Configuration: (expand, showMenu, showQuotes, showCommas, showJSON, showConsole, logger, change, callback, keyPrefix, keyLoop, keyCallback, keysArrGroup, keysNonEnum, keysSymbols, keysProto)
```JavaScript
var conf = {showJSON: true, showConsole: true, callback: jvcCb};
```

- JVC Print Viever:
```JavaScript
$('#jvc').JVC(json, conf);
```

<hr>

## More examples:
- [demo.html](https://github.com/andronick83/jquery.json-viewer-callback/blob/main/demo.html)

<hr>

## About
- Author: [andronick83.mail@gmail.com](mailto:andronick.mail@gmail.com) :shipit:
- License: [MIT License](http://opensource.org/licenses/MIT) :+1:

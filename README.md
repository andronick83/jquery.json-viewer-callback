# jquery.json-viewer-callback

![npm](https://img.shields.io/npm/l/jquery.json-viewer.svg)

jQuery JSON-Viewer with callbacks

[Demo page](https://andronick83.github.io/jquery.json-viewer-callback/demo.html)

![Screenshot](jvc-screenshot.png)

Example:
```html
<!-- JSON.stringify
<script src="https://cdnjs.cloudflare.com/ajax/libs/json2/20160511/json2.min.js"></script> -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
<link rel=stylesheet href="jvc.css"/>
<script src="jvc.js"></script>

<script>
$(function($){
	
	// JVC Style override: (https://cdnjs.com/libraries/highlight.js)
	//JVC.setStyle('night-owl');
	
	// JVC Object:
	json = {
		"testObject": {
			"null": null,
			"true": true,
			"false": false,
			"undefined": undefined,
			"text": "\"text&nbsp;'text'\t`text`<br>\ntext\"",
			"url": "http://example.com/",
			"array": [0, 0.1, 2, [], {}],
			"function": function(a,b){return a+b},
			"arrowFunction": (a,b)=>{return a-b}
		},
		"ajaxCallback": {"jvc-cb": "/file.json"},
		"slowCallback": {"jvc-cb": "/slow"},
		"failCallback": {"jvc-cb": "/fail"}
	};
	
	// JVC Callback:
	var jsonAjax=function(data,cb){
		if(data=='/slow')return setTimeout(cb, 10*1000, ['json-slow']);
		$.ajax(data)
		.done(cb)
		.fail(function(xhr, status, err){
			cb({"jvc-fail": status+' ('+(err? err :xhr.status)+')'}) }
	)};
	
	// JVC Conf (key,invertColors,withLinks,bigNumbers,withQuotes,commentSelect,tab,collapsed,showConf,showJSON,debug,error,callback,onChange)
	conf = {collapsed: 2, callback: jsonAjax};
	
	// JVC Object print
	$('#jvc1').JVC(json, conf);
	
	
	// JVC NoObject print
	conf.key = 'string';
	$('#jvc2').JVC("Hello\n\tworld!<br>\n", conf);
	
	// JVC Logs, Triggers
	conf = Object.assign(conf,{key: "object", showConf: true, showJSON: true, withQuotes: true, commentSelect: true, collapsed: true})
	conf.onChange = function(element,json){
		console.log('jvc-change', element);
		console.log(json);
	}
	json = [1, {"a": 3, "<br>\n": "<br>\n"}];
	$('#jvc3').JVC(json, conf);
});
</script>

<div class=page>
	<div id=jvc1></div>
	<div id=jvc2></div>
	<div id=jvc3></div>
</div>
```

## About

- Author: [andronick83](andronick.mail@gmail.com)
- License: [MIT License](http://opensource.org/licenses/MIT)

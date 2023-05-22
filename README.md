# jquery.json-viewer-callback

![github](https://img.shields.io/github/license/andronick83/jquery.json-viewer-callback)

jQuery JSON Viewer With Callback Support (**JVC**)

![Screenshot](screenshot.png?)

[Demo page](https://andronick83.github.io/jquery.json-viewer-callback/demo.html)

Example:
```html
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>

<link rel=stylesheet href="/jvc.css"/>
<script src="/jvc.js"></script>

<script>
$(function($){

	if(0){	// JVC Setters: 
		JVC.setTabSize(2);		// Tab-Size (spaces)
		JVC.setFontSize('12px');	// Font-Size
		JVC.setFontFamily('monospace'); // Font-Family
		JVC.setStyle('night-owl');	// no-style, jvc-default, night-owl, etc. https://cdnjs.com/libraries/highlight.js
		
		// JVC Getters:
		var text=JVC.getJSON($('#JVC1').get(0));
		
		// JVC Triggers:
		$('#JVC1').on('JVC:callback',function(element,jvc_data,callback){callback([1,2,3])});
		$('#JVC1').on('JVC:change',function(doc){console.log(JVC.getJSON(doc))})	}
	
	// JVC JSON-Object:
	json1 = {
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
		"ajaxCallback": {"jvc-cb": "/ajax"},
		"slowCallback": {"jvc-cb": "/slow"},
		"failCallback": {"jvc-cb": "/fail"},
		"longCallback": {"jvc-cb": "https://cdn.jsdelivr.net/gh/herrstrietzel/fonthelpers@main/json/gfontsAPI.json"}
	};
	
	// JVC Callback:
	var jsonAjax=function(event, element, data, cb){
		if(data=='/slow')return setTimeout(cb, 10*1000, ['json-slow']);
		//
		var ajax=data;
		if(typeof data==='string')var ajax={url:data,dataType:"json"};
		//
		$.ajax(ajax).done(cb)
		.fail(function(xhr, status, err){
			cb({"jvc-fail": status+' ('+(err? err :xhr.status)+')'})
		})
	};
	
	// JVC Conf (key,invertColors,withLinks,bigNumbers,withQuotes,withFunctions,collapsed,showConf,showJSON,debug,error)
	var conf = {collapsed: 2, withFunctions: true};
	
	// JVC Print Object:
	$('#JVC1').JVC(json1, conf).on('JVC:callback', jsonAjax);
	
	// JVC Print String:
	$('#JVC2').JVC("Hello\n\tworld!<br>\n", {key: "str"});
	
	// JVC Print Array:
	var conf3 = {key: "obj", withQuotes: true, collapsed: true, showJSON: true};
	var json3 = [1, {"a": 3, "<br>\n": "<br>\n"}];
	$('#JVC3').JVC(json3, conf3).on('JVC:change', function(){
		var json=JVC.getJSON(this);
		console.debug("JVC:change", JSON.parse(json));
	});
	
	/*DEV*/
	$('#JVC1').on('JVC:change', function(){
		var json=JVC.getJSON(this);
		console.debug("JVC-Check", 'OK', JSON.parse(json));
	});
	$('.jvc-tab-observer').css({'z-index':100,'position':'absolute','top':'20px','background-color':'#ff000080'});
	var doc=$('#JVC1').get(0);
	var logs=JVC.nLogs.cloneNode();logs.classList.add('jvc-json');doc.append(logs);
	JVC.__nodeData(doc,'conf').showJSON=true;
	var log=doc.querySelector('.jvc-logs.jvc-json');log.innerHTML='';
	log.append("// JSON:\n"+JVC.getJSON(doc));
	/*DEV*/
});
</script>

</head>
<body translate="no">

<div class="page">
	<span>JVC Object (with "JVC:callback" trigger and ajax loader):</span>
	<div id=JVC1>JVC1</div>
	
	<span>JVC String:</span>
	<div id=JVC2>JVC2</div>
	
	<span>JVC Array (with Quotes, Comments, Logs and "JVC:change" trigger):</span>
	<div id=JVC3>JVC3</div>
</div>

</body>
</html>
```

## About

- Author: [andronick83.mail@gmail.com](mailto:andronick.mail@gmail.com) :shipit:
- License: [MIT License](http://opensource.org/licenses/MIT) :+1:

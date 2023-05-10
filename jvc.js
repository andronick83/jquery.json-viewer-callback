/**
 * jQuery json-viewer-callback (JVC.js)
 * @author: andronick83 <andronick.mail@gmail.com>
 * @link: https://github.com/andronick83/jquery.json-viewer-callback
 */

JVC={};
JVC.isUrl=(s)=>{try{let url=new URL(s);return url.protocol==="http:"||url.protocol==="https:"}catch(_){return false}};
JVC.objDiff=(d,o)=>{var r={};for(const[k,v]of Object.entries(d))if((k in o)&&v!==o[k])r[k]=o[k];return r};
JVC.tabWidth=(o)=>{var e=$('<span style=overflow:visible>').append(o.tab.repeat(100)).appendTo('.jvc'),w=e.width()/100;e.remove();return w};
JVC.htmlEscape=(s)=>{return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&apos;').replace(/"/g,'&quot;')};
JVC.setStyle=(s)=>{$('.jvc-style').remove();
	if(!JVC.isUrl(s))s='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/'+s+'.min.css';
	$('<link rel=stylesheet class=jvc-style>').attr('href',s).appendTo('head')};
JVC.defs={key:undefined,invertColors:false,withLinks:true,bigNumbers:false,withQuotes:false,commentSelect:false,tab:"\t",
	collapsed:false,showConf:false,showJSON:false,debug:console.debug,error:console.error,callback:null,onChange:null};

(function($){
	//
	function domFixNL(dom,options,cb=null){dom.$list.hide();setTimeout(()=>{dom.$list.show();if(cb)cb(dom,options)},0);return false}// chrome display:inline nl bug
	function domPunctuation(){return $('<span class=hljs-punctuation>')}
	function domSpace(s=''){return $('<span class=jvc-space>').append(s)}
	function domComment(){return $('<span class=hljs-comment>')}
	function domQuote(){return $('<span class=jvc-quote>"</span>')}
	function domList(){return $('<span class=jvc-list>')}
	function domBR(){return domSpace("\n").addClass('jvc-br')}
	function domNew(key,level,options){
		var dom={};
		dom.$root=		$('<span class=jvc-item>').addClass('jvc-level-'+level).data('dom',dom).data('level',level);
		dom.$property=		$('<span class=hljs-attr>');		// property name
		var $colon=		'';					// colon: ": "
		dom.$value=		$('<span class=jvc-value>');		// value: string, numeric, bool, null, callback, etc.
		dom.$braceStart=	domPunctuation()			// start brace: "[", "{"
		dom.$placeholder=	domComment();				// comment: "/* .. */"
		dom.$list=		domList();				// elements of: array, dict, etc.
		dom.$braceEnd=		dom.$braceStart.clone();		// end brace: "]", "}"
		//
		var $br=domBR();
		var $tabs=domSpace().addClass('jvc-tabs');
		if(options.tab&&level)$tabs.append(options.tab.repeat(level));
		var $comma=domPunctuation().addClass('jvc-comma').append(',');
		//
		if(typeof key!=='undefined'){
			dom.$property.append(JVC.htmlEscape(JSON.stringify(key).slice(1,-1)));
			$colon=domPunctuation();
			if(level){dom.$property.prepend(domQuote).append(domQuote);$colon.append(':',domSpace())}
			else $colon.append(domSpace(' '),'=',domSpace(' '));
			if(key==='jvc-fail')dom.$value.addClass('jvc-fail')}
		//
		dom.$root.append(
			$tabs,dom.$property,$colon,dom.$value,dom.$braceStart,$comma,dom.$placeholder,$br,dom.$list,
			$('<span class=jvc-suffix>').append($tabs.clone(),dom.$braceEnd,$comma.clone(),$br.clone()));
		return dom}
	//
	function domReplace(d,r,k){k='$'+k;d[k].replaceWith(r[k]);d[k]=r[k];return d}
	function domSetValue(dom,val,type){dom.$value.addClass('hljs-'+type).append(val);return dom}
	function domSetBraces(dom,start,end=false){dom.$braceStart.append(start);if(end!==false)dom.$braceEnd.append(end);return dom}
	function domSetPlaceholder(dom,val,options){
		if(options.commentSelect)val='/* '+val+' */';
		dom.$placeholder.append(' '+val+' ');return dom}
	function domSetArr(dom,val,level,options){
		var count=val.length;
		if(!count){domSetBraces(dom,'[]');return dom}
		dom.$root.addClass('jvc-toggle');
		if(options.collapsed&&(typeof options.collapsed!=='number'||options.collapsed<=level))dom.$root.addClass('jvc-collapsed');
		domSetBraces(dom,'[',']');
		domSetPlaceholder(dom,count+(count>1?' items':' item'),options);
		for(var i=0;i<count;++i){
			var item=obj2dom(undefined,val[i],level+1,options);
			dom.$list.append(item.$root)}
		return dom}
	function domSetObj(dom,val,level,options){
		var count=Object.keys(val).length;
		if(!count){domSetBraces(dom,'{}');return dom}
		dom.$root.addClass('jvc-toggle');
		if(options.collapsed&&(typeof options.collapsed!=='number'||options.collapsed<=level))dom.$root.addClass('jvc-collapsed');
		domSetBraces(dom,'{','}');
		domSetPlaceholder(dom,count+(count>1?' items':' item'),options);
		for(var key in val){
			if(Object.prototype.hasOwnProperty.call(val,key)){
				var item=obj2dom(key,val[key],level+1,options)}
			else{	if(options.error)options.error('domSetObj','JSON-VAL-FAIL-KEY',val+"",key+"");
				var item=domNew(key.toString(),level+1,options);
				domSetValue(item,'JSON-VAL-FAIL-KEY: '+(typeof val)+' "'+key.toString()+'"','string').addClass('jvc-fail')}
			dom.$list.append(item.$root)}
		return dom}
	//
	function domSetFunc(dom,val,level,options){ /* DEV */
		dom.$root.addClass('jvc-toggle jvc-collapsed jvc-function');
		var _val=(val+"").match(/^\s*([^{]+){(.*)}$/);
		domSetValue(dom,_val[1].replaceAll(/(^\s+|\s+$)/g,''),'title')
		domSetBraces(dom,'{','}')
		domSetPlaceholder(dom,'hidden',options);
		var item=obj2dom("content",_val[2],level+1,options);
		if(options.debug)options.debug('domSetFunc',val,item);
		dom.$list.append(item);
		return dom}
	//
	function domSetCb(dom,val,level,options){
		dom.$root.addClass('jvc-toggle jvc-collapsed jvc-callback jvc-no-obj').data('jvc-cb',val['jvc-cb']);
		domSetValue(dom,null+'','keyword');
		domSetPlaceholder(dom,'jvc-cb: '+JSON.stringify(val['jvc-cb']),options);
		return dom}
	function domSet(dom,val,level,options){
		if(typeof val==='string'){
			var _val=JVC.htmlEscape(JSON.stringify(val).slice(1,-1));
			if(options.withLinks&&JVC.isUrl(val))
				_val=$('<a target=_blank>').attr('href',val).append(_val).prop('outerHTML');
			return domSetValue(dom,'"'+_val+'"','string')}
		if(val===null||typeof val==='boolean')
			return domSetValue(dom,JSON.stringify(val),'keyword');
		if(typeof val==='undefined')
			return domSetValue(dom,'undefined','keyword');
		if(typeof val==='number'||typeof val==='bigint')
			return domSetValue(dom,val,'number');
		//
		if(val instanceof Array)
			return domSetArr(dom,val,level,options);
		if(typeof val==='object'&&options.bigNumbers&&(typeof val.toExponential==='function'||val.isLosslessNumber))
			return domSetValue(dom,val.toString(),'number')
		if(typeof val==='object'&&'jvc-cb'in val)
			return domSetCb(dom,val,level,options);
		if(typeof val==='object')
			return domSetObj(dom,val,level,options);
		if(typeof val==='function')
			return domSetFunc(dom,val,level,options);
		//
		if(options.error)options.error('domSet','JSON-VAL-FAIL-TYPE:',typeof val,val);
		return domSetValue(dom,'JSON-VAL-FAIL-TYPE: '+(typeof val)+' "'+val.toString()+'"','string').addClass('jvc-fail')
	}
	//
	function obj2dom(key,val,level,options){
		var dom=domNew(key,level,options);
		return domSet(dom,val,level,options)}
	//
	function objCb(dom,val,level,options){
		var _dom=obj2dom(undefined,val,level,options);
		if(options.debug)options.debug('objCb',val,level,_dom,options);
		if(!_dom.$root.hasClass('jvc-toggle'))dom.$root.addClass('jvc-collapsed');
		else dom.$root.removeClass('jvc-collapsed');
		domReplace(dom,_dom,'value');
		domReplace(dom,_dom,'braceStart');
		domReplace(dom,_dom,'braceEnd');
		if(dom.$braceEnd.is(':empty'))dom.$root.addClass('jvc-no-obj');
		else dom.$root.removeClass('jvc-no-obj');
		domReplace(dom,_dom,'list');
		dom.$root.removeClass('jvc-loading');
		return domFixNL(dom,options,docChange)}
	//
	function docChange(dom,options){
		if(!options.onChange&&!options.showJSON)return false;
		setTimeout(function(){
			/*DEV*/
			var $doc=dom.$root.closest('.jvc');
			var $dom=dom.$root.closest('.jvc-root-list').clone().addClass('jvc-tabs').appendTo($doc);
			$dom.find(':hidden,.hljs-comment').remove();
			json=$dom.text();$dom.remove();
			/*DEV*/
			if(options.showJSON)$doc.find('.jvc-log.jvc-json').empty()
				.append("// Logs:\n")
				.append(JVC.htmlEscape(json));
			if(typeof options.onChange==='function')options.onChange(dom.$root[0],json);
			$doc.trigger('change',[dom.$root[0],json]);
		},0);return false}
	//
	$.fn.JVC=function(obj,conf){
		var options=Object.assign({},JVC.defs,conf);
		if(options.debug)options.debug('JVC',{'obj':obj,'options':options});
		if(!$('.jvc-style').length)$('<style class=jvc-style>').append('.hljs{background-color:#293134;color:#e0e2e4}.hljs-keyword{color:#93c763;font-style:normal}.hljs-number{color:#ffcd22}.hljs-string{color:#ec7600}.hljs-title{color:#dcdcaa;font-style:normal}.hljs-comment{color:#343f43;font-style:italic}.hljs-comment:hover{color:#818e96}.hljs-attr{color:#678cb1}').appendTo('head');
		return this.each(function(){
			var $doc=$('<div class="jvc hljs">').appendTo($(this).empty()).data('options',options);
			if(!options.withQuotes)$doc.addClass('jvc-no-quotes');
			if(options.invertColors)$doc.addClass('jvc-invert');
			if(!options.commentSelect)$doc.addClass('jvc-comment-no-select');
			if(options.showConf)
				$doc.prepend($('<span class=jvc-log jvc-conf>')
				.append('// Conf: '+JSON.stringify(JVC.objDiff(JVC.defs,conf))))
			var dom=obj2dom(options.key,obj,0,options);
			$doc.append(domList().addClass('jvc-root-list').append(dom.$root));
			docChange(dom,options);
			if(options.showJSON)$doc.append($('<span class="jvc-log jvc-json">'));
			//
			$doc.off('click').on('click','.jvc-toggle>:not(.jvc-list)',function(){
				var dom=$(this).closest('.jvc-toggle').data('dom');
				var data=dom.$root.data('jvc-cb');
				if(typeof data==='undefined'||data===false){
					dom.$root.toggleClass('jvc-collapsed');
					return domFixNL(dom,options,docChange)}
				//
				if(!dom.$root.hasClass('jvc-collapsed')){
					dom.$root.addClass('jvc-collapsed');
					if(dom.$braceEnd.is(':empty'))dom.$root.addClass('jvc-no-obj');
					else dom.$root.removeClass('jvc-no-obj');
					return domFixNL(dom,options,docChange)}
				//
				var level=dom.$root.data('level');
				if(!options.callback){
					if(options.error)options.error('JVC','OPTIONS-CALLBACK-EMPTY:',options.callback);
					dom.$list.append(obj2dom("JVC-fail","Not set options.callback",level,options).$root);
					return docChange(dom,options)}
				//
				dom.$root.addClass('jvc-loading');
				options.callback(data,function(val){objCb(dom,val,level,options)});
				return docChange(dom,options)
			})
		})
	}
//
})(jQuery);

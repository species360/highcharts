/*
 Highmaps JS v6.1.4-modified (2018-10-01)
 Highmaps as a plugin for Highcharts or Highstock.

 (c) 2011-2017 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(w){"object"===typeof module&&module.exports?module.exports=w:"function"===typeof define&&define.amd?define(function(){return w}):w(Highcharts)})(function(w){(function(a){var k=a.addEvent,f=a.Axis,g=a.each,d=a.pick;k(f,"getSeriesExtremes",function(){var a=[];this.isXAxis&&(g(this.series,function(q,d){q.useMapGeometry&&(a[d]=q.xData,q.xData=[])}),this.seriesXData=a)});k(f,"afterGetSeriesExtremes",function(){var a=this.seriesXData,p,f,r;this.isXAxis&&(p=d(this.dataMin,Number.MAX_VALUE),f=d(this.dataMax,
-Number.MAX_VALUE),g(this.series,function(l,b){l.useMapGeometry&&(p=Math.min(p,d(l.minX,p)),f=Math.max(f,d(l.maxX,f)),l.xData=a[b],r=!0)}),r&&(this.dataMin=p,this.dataMax=f),delete this.seriesXData)});k(f,"afterSetAxisTranslation",function(){var a=this.chart,d;d=a.plotWidth/a.plotHeight;var a=a.xAxis[0],f;"yAxis"===this.coll&&void 0!==a.transA&&g(this.series,function(a){a.preserveAspectRatio&&(f=!0)});if(f&&(this.transA=a.transA=Math.min(this.transA,a.transA),d/=(a.max-a.min)/(this.max-this.min),
d=1>d?this:a,a=(d.max-d.min)*d.transA,d.pixelPadding=d.len-a,d.minPixelPadding=d.pixelPadding/2,a=d.fixTo)){a=a[1]-d.toValue(a[0],!0);a*=d.transA;if(Math.abs(a)>d.minPixelPadding||d.min===d.dataMin&&d.max===d.dataMax)a=0;d.minPixelPadding-=a}});k(f,"render",function(){this.fixTo=null})})(w);(function(a){var k=a.addEvent,f=a.Axis,g=a.Chart,d=a.color,q,p=a.each,u=a.extend,r=a.isNumber,l=a.Legend,b=a.LegendSymbolMixin,e=a.noop,m=a.merge,n=a.pick;a.ColorAxis||(q=a.ColorAxis=function(){this.init.apply(this,
arguments)},u(q.prototype,f.prototype),u(q.prototype,{defaultColorAxisOptions:{lineWidth:0,minPadding:0,maxPadding:0,gridLineWidth:1,tickPixelInterval:72,startOnTick:!0,endOnTick:!0,offset:0,marker:{animation:{duration:50},width:.01},labels:{overflow:"justify",rotation:0},minColor:"#e6ebf5",maxColor:"#003399",tickLength:5,showInLegend:!0},keepProps:["legendGroup","legendItemHeight","legendItemWidth","legendItem","legendSymbol"].concat(f.prototype.keepProps),init:function(a,c){var h="vertical"!==a.options.legend.layout,
b;this.coll="colorAxis";b=m(this.defaultColorAxisOptions,{side:h?2:1,reversed:!h},c,{opposite:!h,showEmpty:!1,title:null,visible:a.options.legend.enabled});f.prototype.init.call(this,a,b);c.dataClasses&&this.initDataClasses(c);this.initStops();this.horiz=h;this.zoomEnabled=!1;this.defaultLegendLength=200},initDataClasses:function(a){var c,h=0,b=this.chart.options.chart.colorCount,t=this.options,e=a.dataClasses.length;this.dataClasses=c=[];this.legendItems=[];p(a.dataClasses,function(a,x){a=m(a);c.push(a);
"category"===t.dataClassColor?(a.colorIndex=h,h++,h===b&&(h=0)):a.color=d(t.minColor).tweenTo(d(t.maxColor),2>e?.5:x/(e-1))})},setTickPositions:function(){if(!this.dataClasses)return f.prototype.setTickPositions.call(this)},initStops:function(){this.stops=this.options.stops||[[0,this.options.minColor],[1,this.options.maxColor]];p(this.stops,function(a){a.color=d(a[1])})},setOptions:function(a){f.prototype.setOptions.call(this,a);this.options.crosshair=this.options.marker},setAxisSize:function(){var a=
this.legendSymbol,c=this.chart,h=c.options.legend||{},b,e;a?(this.left=h=a.attr("x"),this.top=b=a.attr("y"),this.width=e=a.attr("width"),this.height=a=a.attr("height"),this.right=c.chartWidth-h-e,this.bottom=c.chartHeight-b-a,this.len=this.horiz?e:a,this.pos=this.horiz?h:b):this.len=(this.horiz?h.symbolWidth:h.symbolHeight)||this.defaultLegendLength},normalizedValue:function(a){this.isLog&&(a=this.val2lin(a));return 1-(this.max-a)/(this.max-this.min||1)},toColor:function(a,c){var h=this.stops,b,t,
e=this.dataClasses,m,d;if(e)for(d=e.length;d--;){if(m=e[d],b=m.from,h=m.to,(void 0===b||a>=b)&&(void 0===h||a<=h)){c&&(c.dataClass=d,c.colorIndex=m.colorIndex);break}}else{a=this.normalizedValue(a);for(d=h.length;d--&&!(a>h[d][0]););b=h[d]||h[d+1];h=h[d+1]||b;a=1-(h[0]-a)/(h[0]-b[0]||1);t=b.color.tweenTo(h.color,a)}return t},getOffset:function(){var a=this.legendGroup,c=this.chart.axisOffset[this.side];a&&(this.axisParent=a,f.prototype.getOffset.call(this),this.added||(this.added=!0,this.labelLeft=
0,this.labelRight=this.width),this.chart.axisOffset[this.side]=c)},setLegendColor:function(){var a,c=this.reversed;a=c?1:0;c=c?0:1;a=this.horiz?[a,0,c,0]:[0,c,0,a];this.legendColor={linearGradient:{x1:a[0],y1:a[1],x2:a[2],y2:a[3]},stops:this.stops}},drawLegendSymbol:function(a,c){var h=a.padding,b=a.options,e=this.horiz,m=n(b.symbolWidth,e?this.defaultLegendLength:12),t=n(b.symbolHeight,e?12:this.defaultLegendLength),d=n(b.labelPadding,e?16:30),b=n(b.itemDistance,10);this.setLegendColor();c.legendSymbol=
this.chart.renderer.rect(0,a.baseline-11,m,t).attr({zIndex:1}).add(c.legendGroup);this.legendItemWidth=m+h+(e?b:d);this.legendItemHeight=t+h+(e?d:0)},setState:function(a){p(this.series,function(c){c.setState(a)})},visible:!0,setVisible:e,getSeriesExtremes:function(){var a=this.series,c=a.length;this.dataMin=Infinity;for(this.dataMax=-Infinity;c--;)a[c].getExtremes(),void 0!==a[c].valueMin&&(this.dataMin=Math.min(this.dataMin,a[c].valueMin),this.dataMax=Math.max(this.dataMax,a[c].valueMax))},drawCrosshair:function(a,
c){var h=c&&c.plotX,b=c&&c.plotY,e,m=this.pos,d=this.len;c&&(e=this.toPixels(c[c.series.colorKey]),e<m?e=m-2:e>m+d&&(e=m+d+2),c.plotX=e,c.plotY=this.len-e,f.prototype.drawCrosshair.call(this,a,c),c.plotX=h,c.plotY=b,this.cross&&!this.cross.addedToColorAxis&&this.legendGroup&&(this.cross.addClass("highcharts-coloraxis-marker").add(this.legendGroup),this.cross.addedToColorAxis=!0))},getPlotLinePath:function(a,c,h,b,e){return r(e)?this.horiz?["M",e-4,this.top-6,"L",e+4,this.top-6,e,this.top,"Z"]:["M",
this.left,e,"L",this.left-6,e+6,this.left-6,e-6,"Z"]:f.prototype.getPlotLinePath.call(this,a,c,h,b)},update:function(a,c){var h=this.chart,b=h.legend;p(this.series,function(a){a.isDirtyData=!0});a.dataClasses&&b.allItems&&(p(b.allItems,function(a){a.isDataClass&&a.legendGroup&&a.legendGroup.destroy()}),h.isDirtyLegend=!0);h.options[this.coll]=m(this.userOptions,a);f.prototype.update.call(this,a,c);this.legendItem&&(this.setLegendColor(),b.colorizeItem(this,!0))},remove:function(){this.legendItem&&
this.chart.legend.destroyItem(this);f.prototype.remove.call(this)},getDataClassLegendSymbols:function(){var m=this,c=this.chart,h=this.legendItems,d=c.options.legend,l=d.valueDecimals,n=d.valueSuffix||"",q;h.length||p(this.dataClasses,function(d,t){var x=!0,v=d.from,f=d.to;q="";void 0===v?q="\x3c ":void 0===f&&(q="\x3e ");void 0!==v&&(q+=a.numberFormat(v,l)+n);void 0!==v&&void 0!==f&&(q+=" - ");void 0!==f&&(q+=a.numberFormat(f,l)+n);h.push(u({chart:c,name:q,options:{},drawLegendSymbol:b.drawRectangle,
visible:!0,setState:e,isDataClass:!0,setVisible:function(){x=this.visible=!x;p(m.series,function(a){p(a.points,function(a){a.dataClass===t&&a.setVisible(x)})});c.legend.colorizeItem(this,x)}},d))});return h},name:""}),p(["fill","stroke"],function(b){a.Fx.prototype[b+"Setter"]=function(){this.elem.attr(b,d(this.start).tweenTo(d(this.end),this.pos),null,!0)}}),k(g,"afterGetAxes",function(){var a=this.options.colorAxis;this.colorAxis=[];a&&new q(this,a)}),k(l,"afterGetAllItems",function(b){var c=[],
h=this.chart.colorAxis[0];h&&h.options&&h.options.showInLegend&&(h.options.dataClasses?c=h.getDataClassLegendSymbols():c.push(h),p(h.series,function(c){a.erase(b.allItems,c)}));for(h=c.length;h--;)b.allItems.unshift(c[h])}),k(l,"afterColorizeItem",function(a){a.visible&&a.item.legendColor&&a.item.legendSymbol.attr({fill:a.item.legendColor})}),k(l,"afterUpdate",function(a,c,b){this.chart.colorAxis[0]&&this.chart.colorAxis[0].update({},b)}))})(w);(function(a){var k=a.defined,f=a.each,g=a.noop;a.colorPointMixin=
{isValid:function(){return null!==this.value&&Infinity!==this.value&&-Infinity!==this.value},setVisible:function(a){var d=this,p=a?"show":"hide";d.visible=!!a;f(["graphic","dataLabel"],function(a){if(d[a])d[a][p]()})},setState:function(d){a.Point.prototype.setState.call(this,d);this.graphic&&this.graphic.attr({zIndex:"hover"===d?1:0})}};a.colorSeriesMixin={pointArrayMap:["value"],axisTypes:["xAxis","yAxis","colorAxis"],optionalAxis:"colorAxis",trackerGroups:["group","markerGroup","dataLabelsGroup"],
getSymbol:g,parallelArrays:["x","y","value"],colorKey:"value",translateColors:function(){var a=this,q=this.options.nullColor,p=this.colorAxis,g=this.colorKey;f(this.data,function(d){var l=d[g];if(l=d.options.color||(d.isNull?q:p&&void 0!==l?p.toColor(l,d):d.color||a.color))d.color=l})},colorAttribs:function(a){var d={};k(a.color)&&(d[this.colorProp||"fill"]=a.color);return d}}})(w);(function(a){function k(a){a&&(a.preventDefault&&a.preventDefault(),a.stopPropagation&&a.stopPropagation(),a.cancelBubble=
!0)}function f(a){this.init(a)}var g=a.addEvent,d=a.Chart,q=a.doc,p=a.each,u=a.extend,r=a.merge,l=a.pick;f.prototype.init=function(a){this.chart=a;a.mapNavButtons=[]};f.prototype.update=function(b){var e=this.chart,d=e.options.mapNavigation,n,t=function(a){this.handler.call(e,a);k(a)},c=e.mapNavButtons;b&&(d=e.options.mapNavigation=r(e.options.mapNavigation,b));for(;c.length;)c.pop().destroy();l(d.enableButtons,d.enabled)&&!e.renderer.forExport&&a.objectEach(d.buttons,function(a,b){n=r(d.buttonOptions,
a);a=e.renderer.button(n.text,0,0,t,void 0,void 0,void 0,0,"zoomIn"===b?"topbutton":"bottombutton").addClass("highcharts-map-navigation").attr({width:n.width,height:n.height,title:e.options.lang[b],padding:n.padding,zIndex:5}).add();a.handler=n.onclick;a.align(u(n,{width:a.width,height:2*a.height}),null,n.alignTo);g(a.element,"dblclick",k);c.push(a)});this.updateEvents(d)};f.prototype.updateEvents=function(a){var b=this.chart;l(a.enableDoubleClickZoom,a.enabled)||a.enableDoubleClickZoomTo?this.unbindDblClick=
this.unbindDblClick||g(b.container,"dblclick",function(a){b.pointer.onContainerDblClick(a)}):this.unbindDblClick&&(this.unbindDblClick=this.unbindDblClick());l(a.enableMouseWheelZoom,a.enabled)?this.unbindMouseWheel=this.unbindMouseWheel||g(b.container,void 0===q.onmousewheel?"DOMMouseScroll":"mousewheel",function(a){b.pointer.onContainerMouseWheel(a);k(a);return!1}):this.unbindMouseWheel&&(this.unbindMouseWheel=this.unbindMouseWheel())};u(d.prototype,{fitToBox:function(a,e){p([["x","width"],["y",
"height"]],function(b){var d=b[0];b=b[1];a[d]+a[b]>e[d]+e[b]&&(a[b]>e[b]?(a[b]=e[b],a[d]=e[d]):a[d]=e[d]+e[b]-a[b]);a[b]>e[b]&&(a[b]=e[b]);a[d]<e[d]&&(a[d]=e[d])});return a},mapZoom:function(a,d,m,n,t){var c=this.xAxis[0],b=c.max-c.min,e=l(d,c.min+b/2),v=b*a,b=this.yAxis[0],f=b.max-b.min,q=l(m,b.min+f/2),f=f*a,e=this.fitToBox({x:e-v*(n?(n-c.pos)/c.len:.5),y:q-f*(t?(t-b.pos)/b.len:.5),width:v,height:f},{x:c.dataMin,y:b.dataMin,width:c.dataMax-c.dataMin,height:b.dataMax-b.dataMin}),v=e.x<=c.dataMin&&
e.width>=c.dataMax-c.dataMin&&e.y<=b.dataMin&&e.height>=b.dataMax-b.dataMin;n&&(c.fixTo=[n-c.pos,d]);t&&(b.fixTo=[t-b.pos,m]);void 0===a||v?(c.setExtremes(void 0,void 0,!1),b.setExtremes(void 0,void 0,!1)):(c.setExtremes(e.x,e.x+e.width,!1),b.setExtremes(e.y,e.y+e.height,!1));this.redraw()}});g(d,"beforeRender",function(){this.mapNavigation=new f(this);this.mapNavigation.update()})})(w);(function(a){var k=a.extend,f=a.pick,g=a.Pointer;a=a.wrap;k(g.prototype,{onContainerDblClick:function(a){var d=
this.chart;a=this.normalize(a);d.options.mapNavigation.enableDoubleClickZoomTo?d.pointer.inClass(a.target,"highcharts-tracker")&&d.hoverPoint&&d.hoverPoint.zoomTo():d.isInsidePlot(a.chartX-d.plotLeft,a.chartY-d.plotTop)&&d.mapZoom(.5,d.xAxis[0].toValue(a.chartX),d.yAxis[0].toValue(a.chartY),a.chartX,a.chartY)},onContainerMouseWheel:function(a){var d=this.chart,f;a=this.normalize(a);f=a.detail||-(a.wheelDelta/120);d.isInsidePlot(a.chartX-d.plotLeft,a.chartY-d.plotTop)&&d.mapZoom(Math.pow(d.options.mapNavigation.mouseWheelSensitivity,
f),d.xAxis[0].toValue(a.chartX),d.yAxis[0].toValue(a.chartY),a.chartX,a.chartY)}});a(g.prototype,"zoomOption",function(a){var d=this.chart.options.mapNavigation;f(d.enableTouchZoom,d.enabled)&&(this.chart.options.chart.pinchType="xy");a.apply(this,[].slice.call(arguments,1))});a(g.prototype,"pinchTranslate",function(a,f,g,k,r,l,b){a.call(this,f,g,k,r,l,b);"map"===this.chart.options.chart.type&&this.hasZoom&&(a=k.scaleX>k.scaleY,this.pinchTranslateDirection(!a,f,g,k,r,l,b,a?k.scaleX:k.scaleY))})})(w);
(function(a){var k=a.colorPointMixin,f=a.each,g=a.extend,d=a.isNumber,q=a.map,p=a.merge,u=a.noop,r=a.pick,l=a.isArray,b=a.Point,e=a.Series,m=a.seriesType,n=a.seriesTypes,t=a.splat;m("map","scatter",{allAreas:!0,animation:!1,marker:null,stickyTracking:!1,joinBy:"hc-key",dataLabels:{formatter:function(){return this.point.value},inside:!0,verticalAlign:"middle",crop:!1,overflow:!1,padding:0},turboThreshold:0,tooltip:{followPointer:!0,pointFormat:"{point.name}: {point.value}\x3cbr/\x3e"},states:{normal:{animation:!0},
hover:{halo:null,brightness:.2}}},p(a.colorSeriesMixin,{type:"map",getExtremesFromAll:!0,useMapGeometry:!0,forceDL:!0,searchPoint:u,directTouch:!0,preserveAspectRatio:!0,pointArrayMap:["value"],getBox:function(c){var b=Number.MAX_VALUE,e=-b,l=b,m=-b,t=b,n=b,g=this.xAxis,y=this.yAxis,q;f(c||[],function(c){if(c.path){"string"===typeof c.path&&(c.path=a.splitPath(c.path));var h=c.path||[],f=h.length,x=!1,v=-b,g=b,y=-b,k=b,p=c.properties;if(!c._foundBox){for(;f--;)d(h[f])&&(x?(v=Math.max(v,h[f]),g=Math.min(g,
h[f])):(y=Math.max(y,h[f]),k=Math.min(k,h[f])),x=!x);c._midX=g+(v-g)*r(c.middleX,p&&p["hc-middle-x"],.5);c._midY=k+(y-k)*r(c.middleY,p&&p["hc-middle-y"],.5);c._maxX=v;c._minX=g;c._maxY=y;c._minY=k;c.labelrank=r(c.labelrank,(v-g)*(y-k));c._foundBox=!0}e=Math.max(e,c._maxX);l=Math.min(l,c._minX);m=Math.max(m,c._maxY);t=Math.min(t,c._minY);n=Math.min(c._maxX-c._minX,c._maxY-c._minY,n);q=!0}});q&&(this.minY=Math.min(t,r(this.minY,b)),this.maxY=Math.max(m,r(this.maxY,-b)),this.minX=Math.min(l,r(this.minX,
b)),this.maxX=Math.max(e,r(this.maxX,-b)),g&&void 0===g.options.minRange&&(g.minRange=Math.min(5*n,(this.maxX-this.minX)/5,g.minRange||b)),y&&void 0===y.options.minRange&&(y.minRange=Math.min(5*n,(this.maxY-this.minY)/5,y.minRange||b)))},getExtremes:function(){e.prototype.getExtremes.call(this,this.valueData);this.chart.hasRendered&&this.isDirtyData&&this.getBox(this.options.data);this.valueMin=this.dataMin;this.valueMax=this.dataMax;this.dataMin=this.minY;this.dataMax=this.maxY},translatePath:function(a){var c=
!1,b=this.xAxis,e=this.yAxis,l=b.min,m=b.transA,b=b.minPixelPadding,t=e.min,f=e.transA,e=e.minPixelPadding,n,g=[];if(a)for(n=a.length;n--;)d(a[n])?(g[n]=c?(a[n]-l)*m+b:(a[n]-t)*f+e,c=!c):g[n]=a[n];return g},setData:function(c,b,m,n){var h=this.options,v=this.chart.options.chart,x=v&&v.map,g=h.mapData,k=h.joinBy,r=null===k,u=h.keys||this.pointArrayMap,z=[],A={},B=this.chart.mapTransforms;!g&&x&&(g="string"===typeof x?a.maps[x]:x);r&&(k="_i");k=this.joinBy=t(k);k[1]||(k[1]=k[0]);c&&f(c,function(b,e){var m=
0;if(d(b))c[e]={value:b};else if(l(b)){c[e]={};!h.keys&&b.length>u.length&&"string"===typeof b[0]&&(c[e]["hc-key"]=b[0],++m);for(var n=0;n<u.length;++n,++m)u[n]&&void 0!==b[m]&&(0<u[n].indexOf(".")?a.Point.prototype.setNestedProperty(c[e],b[m],u[n]):c[e][u[n]]=b[m])}r&&(c[e]._i=e)});this.getBox(c);(this.chart.mapTransforms=B=v&&v.mapTransforms||g&&g["hc-transform"]||B)&&a.objectEach(B,function(a){a.rotation&&(a.cosAngle=Math.cos(a.rotation),a.sinAngle=Math.sin(a.rotation))});if(g){"FeatureCollection"===
g.type&&(this.mapTitle=g.title,g=a.geojson(g,this.type,this));this.mapData=g;this.mapMap={};for(B=0;B<g.length;B++)v=g[B],x=v.properties,v._i=B,k[0]&&x&&x[k[0]]&&(v[k[0]]=x[k[0]]),A[v[k[0]]]=v;this.mapMap=A;c&&k[1]&&f(c,function(a){A[a[k[1]]]&&z.push(A[a[k[1]]])});h.allAreas?(this.getBox(g),c=c||[],k[1]&&f(c,function(a){z.push(a[k[1]])}),z="|"+q(z,function(a){return a&&a[k[0]]}).join("|")+"|",f(g,function(a){k[0]&&-1!==z.indexOf("|"+a[k[0]]+"|")||(c.push(p(a,{value:null})),n=!1)})):this.getBox(z)}e.prototype.setData.call(this,
c,b,m,n)},drawGraph:u,drawDataLabels:u,doFullTranslate:function(){return this.isDirtyData||this.chart.isResizing||this.chart.renderer.isVML||!this.baseTrans},translate:function(){var a=this,b=a.xAxis,e=a.yAxis,d=a.doFullTranslate();a.generatePoints();f(a.data,function(c){c.plotX=b.toPixels(c._midX,!0);c.plotY=e.toPixels(c._midY,!0);d&&(c.shapeType="path",c.shapeArgs={d:a.translatePath(c.path)})});a.translateColors()},pointAttribs:function(a,b){b=this.colorAttribs(a);b["stroke-width"]=r(a.options[this.pointAttrToOptions&&
this.pointAttrToOptions["stroke-width"]||"borderWidth"],"inherit");return b},drawPoints:function(){var a=this,b=a.xAxis,e=a.yAxis,d=a.group,m=a.chart,l=m.renderer,t,g,k,q,p=this.baseTrans,r,A,u,w,G;a.transformGroup||(a.transformGroup=l.g().attr({scaleX:1,scaleY:1}).add(d),a.transformGroup.survive=!0);a.doFullTranslate()?(a.group=a.transformGroup,n.column.prototype.drawPoints.apply(a),a.group=d,f(a.points,function(b){b.graphic&&(b.name&&b.graphic.addClass("highcharts-name-"+b.name.replace(/ /g,"-").toLowerCase()),
b.properties&&b.properties["hc-key"]&&b.graphic.addClass("highcharts-key-"+b.properties["hc-key"].toLowerCase()),b.graphic.css(a.pointAttribs(b,b.selected&&"select")))}),this.baseTrans={originX:b.min-b.minPixelPadding/b.transA,originY:e.min-e.minPixelPadding/e.transA+(e.reversed?0:e.len/e.transA),transAX:b.transA,transAY:e.transA},this.transformGroup.animate({translateX:0,translateY:0,scaleX:1,scaleY:1})):(t=b.transA/p.transAX,g=e.transA/p.transAY,k=b.toPixels(p.originX,!0),q=e.toPixels(p.originY,
!0),.99<t&&1.01>t&&.99<g&&1.01>g&&(g=t=1,k=Math.round(k),q=Math.round(q)),r=this.transformGroup,m.renderer.globalAnimation?(A=r.attr("translateX"),u=r.attr("translateY"),w=r.attr("scaleX"),G=r.attr("scaleY"),r.attr({animator:0}).animate({animator:1},{step:function(a,b){r.attr({translateX:A+(k-A)*b.pos,translateY:u+(q-u)*b.pos,scaleX:w+(t-w)*b.pos,scaleY:G+(g-G)*b.pos})}})):r.attr({translateX:k,translateY:q,scaleX:t,scaleY:g}));d.element.setAttribute("stroke-width",(a.options[a.pointAttrToOptions&&
a.pointAttrToOptions["stroke-width"]||"borderWidth"]||1)/(t||1));this.drawMapDataLabels()},drawMapDataLabels:function(){e.prototype.drawDataLabels.call(this);this.dataLabelsGroup&&this.dataLabelsGroup.clip(this.chart.clipRect)},render:function(){var a=this,b=e.prototype.render;a.chart.renderer.isVML&&3E3<a.data.length?setTimeout(function(){b.call(a)}):b.call(a)},animate:function(a){var b=this.options.animation,c=this.group,e=this.xAxis,d=this.yAxis,m=e.pos,l=d.pos;this.chart.renderer.isSVG&&(!0===
b&&(b={duration:1E3}),a?c.attr({translateX:m+e.len/2,translateY:l+d.len/2,scaleX:.001,scaleY:.001}):(c.animate({translateX:m,translateY:l,scaleX:1,scaleY:1},b),this.animate=null))},animateDrilldown:function(a){var b=this.chart.plotBox,c=this.chart.drilldownLevels[this.chart.drilldownLevels.length-1],e=c.bBox,d=this.chart.options.drilldown.animation;a||(a=Math.min(e.width/b.width,e.height/b.height),c.shapeArgs={scaleX:a,scaleY:a,translateX:e.x,translateY:e.y},f(this.points,function(a){a.graphic&&a.graphic.attr(c.shapeArgs).animate({scaleX:1,
scaleY:1,translateX:0,translateY:0},d)}),this.animate=null)},drawLegendSymbol:a.LegendSymbolMixin.drawRectangle,animateDrillupFrom:function(a){n.column.prototype.animateDrillupFrom.call(this,a)},animateDrillupTo:function(a){n.column.prototype.animateDrillupTo.call(this,a)}}),g({applyOptions:function(a,e){a=b.prototype.applyOptions.call(this,a,e);e=this.series;var c=e.joinBy;e.mapData&&((c=void 0!==a[c[1]]&&e.mapMap[a[c[1]]])?(e.xyFromShape&&(a.x=c._midX,a.y=c._midY),g(a,c)):a.value=a.value||null);
return a},onMouseOver:function(c){a.clearTimeout(this.colorInterval);if(null!==this.value||this.series.options.nullInteraction)b.prototype.onMouseOver.call(this,c);else this.series.onMouseOut(c)},zoomTo:function(){var a=this.series;a.xAxis.setExtremes(this._minX,this._maxX,!1);a.yAxis.setExtremes(this._minY,this._maxY,!1);a.chart.redraw()}},k))})(w);(function(a){var k=a.seriesType;k("mapline","map",{},{type:"mapline",colorProp:"stroke",drawLegendSymbol:a.seriesTypes.line.prototype.drawLegendSymbol})})(w);
(function(a){var k=a.merge,f=a.Point;a=a.seriesType;a("mappoint","scatter",{dataLabels:{enabled:!0,formatter:function(){return this.point.name},crop:!1,defer:!1,overflow:!1,style:{color:"#000000"}}},{type:"mappoint",forceDL:!0},{applyOptions:function(a,d){a=void 0!==a.lat&&void 0!==a.lon?k(a,this.series.chart.fromLatLonToPoint(a)):a;return f.prototype.applyOptions.call(this,a,d)}})})(w);(function(a){var k=a.arrayMax,f=a.arrayMin,g=a.Axis,d=a.each,q=a.isNumber,p=a.noop,u=a.pick,r=a.pInt,l=a.Point,
b=a.seriesType,e=a.seriesTypes;b("bubble","scatter",{dataLabels:{formatter:function(){return this.point.z},inside:!0,verticalAlign:"middle"},animationLimit:250,marker:{radius:null,states:{hover:{radiusPlus:0}},symbol:"circle"},minSize:8,maxSize:"20%",softThreshold:!1,states:{hover:{halo:{size:5}}},tooltip:{pointFormat:"({point.x}, {point.y}), Size: {point.z}"},turboThreshold:0,zThreshold:0,zoneAxis:"z"},{pointArrayMap:["y","z"],parallelArrays:["x","y","z"],trackerGroups:["group","dataLabelsGroup"],
specialGroup:"group",bubblePadding:!0,zoneAxis:"z",directTouch:!0,getRadii:function(a,b,e,c){var d,l,m,n=this.zData,t=[],f=this.options,g="width"!==f.sizeBy,k=f.zThreshold,p=b-a;l=0;for(d=n.length;l<d;l++)m=n[l],f.sizeByAbsoluteValue&&null!==m&&(m=Math.abs(m-k),b=p=Math.max(b-k,Math.abs(a-k)),a=0),q(m)?m<a?m=e/2-1:(m=0<p?(m-a)/p:.5,g&&0<=m&&(m=Math.sqrt(m)),m=Math.ceil(e+m*(c-e))/2):m=null,t.push(m);this.radii=t},animate:function(a){!a&&this.points.length<this.options.animationLimit&&(d(this.points,
function(a){var b=a.graphic,c;b&&b.width&&(c={x:b.x,y:b.y,width:b.width,height:b.height},b.attr({x:a.plotX,y:a.plotY,width:1,height:1}),b.animate(c,this.options.animation))},this),this.animate=null)},translate:function(){var b,d=this.data,l,c,h=this.radii;e.scatter.prototype.translate.call(this);for(b=d.length;b--;)l=d[b],c=h?h[b]:0,q(c)&&c>=this.minPxSize/2?(l.marker=a.extend(l.marker,{radius:c,width:2*c,height:2*c}),l.dlBox={x:l.plotX-c,y:l.plotY-c,width:2*c,height:2*c}):l.shapeArgs=l.plotY=l.dlBox=
void 0},alignDataLabel:e.column.prototype.alignDataLabel,buildKDTree:p,applyZones:p},{haloPath:function(a){return l.prototype.haloPath.call(this,0===a?0:(this.marker?this.marker.radius||0:0)+a)},ttBelow:!1});g.prototype.beforePadding=function(){var b=this,e=this.len,l=this.chart,c=0,h=e,g=this.isXAxis,p=g?"xData":"yData",w=this.min,C={},H=Math.min(l.plotWidth,l.plotHeight),E=Number.MAX_VALUE,y=-Number.MAX_VALUE,F=this.max-w,D=e/F,z=[];d(this.series,function(c){var e=c.options;!c.bubblePadding||!c.visible&&
l.options.chart.ignoreHiddenSeries||(b.allowZoomOutside=!0,z.push(c),g&&(d(["minSize","maxSize"],function(a){var b=e[a],c=/%$/.test(b),b=r(b);C[a]=c?H*b/100:b}),c.minPxSize=C.minSize,c.maxPxSize=Math.max(C.maxSize,C.minSize),c=a.grep(c.zData,a.isNumber),c.length&&(E=u(e.zMin,Math.min(E,Math.max(f(c),!1===e.displayNegative?e.zThreshold:-Number.MAX_VALUE))),y=u(e.zMax,Math.max(y,k(c))))))});d(z,function(a){var e=a[p],d=e.length,l;g&&a.getRadii(E,y,a.minPxSize,a.maxPxSize);if(0<F)for(;d--;)q(e[d])&&
b.dataMin<=e[d]&&e[d]<=b.dataMax&&(l=a.radii[d],c=Math.min((e[d]-w)*D-l,c),h=Math.max((e[d]-w)*D+l,h))});z.length&&0<F&&!this.isLog&&(h-=e,D*=(e+Math.max(0,c)-Math.min(h,e))/e,d([["min","userMin",c],["max","userMax",h]],function(a){void 0===u(b.options[a[0]],b[a[1]])&&(b[a[0]]+=a[2]/D)}))}})(w);(function(a){var k=a.merge,f=a.Point,g=a.seriesType,d=a.seriesTypes;d.bubble&&g("mapbubble","bubble",{animationLimit:500,tooltip:{pointFormat:"{point.name}: {point.z}"}},{xyFromShape:!0,type:"mapbubble",pointArrayMap:["z"],
getMapData:d.map.prototype.getMapData,getBox:d.map.prototype.getBox,setData:d.map.prototype.setData},{applyOptions:function(a,g){return a&&void 0!==a.lat&&void 0!==a.lon?f.prototype.applyOptions.call(this,k(a,this.series.chart.fromLatLonToPoint(a)),g):d.map.prototype.pointClass.prototype.applyOptions.call(this,a,g)},isValid:function(){return"number"===typeof this.z},ttBelow:!1})})(w);(function(a){var k=a.colorPointMixin,f=a.each,g=a.merge,d=a.noop,q=a.pick,p=a.Series,u=a.seriesType,r=a.seriesTypes;
u("heatmap","scatter",{animation:!1,borderWidth:0,dataLabels:{formatter:function(){return this.point.value},inside:!0,verticalAlign:"middle",crop:!1,overflow:!1,padding:0},marker:null,pointRange:null,tooltip:{pointFormat:"{point.x}, {point.y}: {point.value}\x3cbr/\x3e"},states:{hover:{halo:!1,brightness:.2}}},g(a.colorSeriesMixin,{pointArrayMap:["y","value"],hasPointSpecificOptions:!0,getExtremesFromAll:!0,directTouch:!0,init:function(){var a;r.scatter.prototype.init.apply(this,arguments);a=this.options;
a.pointRange=q(a.pointRange,a.colsize||1);this.yAxis.axisPointRange=a.rowsize||1},translate:function(){var a=this.options,b=this.xAxis,e=this.yAxis,d=a.pointPadding||0,g=function(a,b,e){return Math.min(Math.max(b,a),e)};this.generatePoints();f(this.points,function(l){var c=(a.colsize||1)/2,h=(a.rowsize||1)/2,m=g(Math.round(b.len-b.translate(l.x-c,0,1,0,1)),-b.len,2*b.len),c=g(Math.round(b.len-b.translate(l.x+c,0,1,0,1)),-b.len,2*b.len),f=g(Math.round(e.translate(l.y-h,0,1,0,1)),-e.len,2*e.len),h=
g(Math.round(e.translate(l.y+h,0,1,0,1)),-e.len,2*e.len),n=q(l.pointPadding,d);l.plotX=l.clientX=(m+c)/2;l.plotY=(f+h)/2;l.shapeType="rect";l.shapeArgs={x:Math.min(m,c)+n,y:Math.min(f,h)+n,width:Math.abs(c-m)-2*n,height:Math.abs(h-f)-2*n}});this.translateColors()},drawPoints:function(){r.column.prototype.drawPoints.call(this);f(this.points,function(a){a.graphic.css(this.colorAttribs(a))},this)},animate:d,getBox:d,drawLegendSymbol:a.LegendSymbolMixin.drawRectangle,alignDataLabel:r.column.prototype.alignDataLabel,
getExtremes:function(){p.prototype.getExtremes.call(this,this.valueData);this.valueMin=this.dataMin;this.valueMax=this.dataMax;p.prototype.getExtremes.call(this)}}),a.extend({haloPath:function(a){if(!a)return[];var b=this.shapeArgs;return["M",b.x-a,b.y-a,"L",b.x-a,b.y+b.height+a,b.x+b.width+a,b.y+b.height+a,b.x+b.width+a,b.y-a,"Z"]}},k))})(w);(function(a){function k(a,b){var e,d,l,f=!1,c=a.x,h=a.y;a=0;for(e=b.length-1;a<b.length;e=a++)d=b[a][1]>h,l=b[e][1]>h,d!==l&&c<(b[e][0]-b[a][0])*(h-b[a][1])/
(b[e][1]-b[a][1])+b[a][0]&&(f=!f);return f}var f=a.Chart,g=a.each,d=a.extend,q=a.format,p=a.merge,u=a.win,r=a.wrap;f.prototype.transformFromLatLon=function(d,b){if(void 0===u.proj4)return a.error(21),{x:0,y:null};d=u.proj4(b.crs,[d.lon,d.lat]);var e=b.cosAngle||b.rotation&&Math.cos(b.rotation),m=b.sinAngle||b.rotation&&Math.sin(b.rotation);d=b.rotation?[d[0]*e+d[1]*m,-d[0]*m+d[1]*e]:d;return{x:((d[0]-(b.xoffset||0))*(b.scale||1)+(b.xpan||0))*(b.jsonres||1)+(b.jsonmarginX||0),y:(((b.yoffset||0)-d[1])*
(b.scale||1)+(b.ypan||0))*(b.jsonres||1)-(b.jsonmarginY||0)}};f.prototype.transformToLatLon=function(d,b){if(void 0===u.proj4)a.error(21);else{d={x:((d.x-(b.jsonmarginX||0))/(b.jsonres||1)-(b.xpan||0))/(b.scale||1)+(b.xoffset||0),y:((-d.y-(b.jsonmarginY||0))/(b.jsonres||1)+(b.ypan||0))/(b.scale||1)+(b.yoffset||0)};var e=b.cosAngle||b.rotation&&Math.cos(b.rotation),m=b.sinAngle||b.rotation&&Math.sin(b.rotation);b=u.proj4(b.crs,"WGS84",b.rotation?{x:d.x*e+d.y*-m,y:d.x*m+d.y*e}:d);return{lat:b.y,lon:b.x}}};
f.prototype.fromPointToLatLon=function(d){var b=this.mapTransforms,e;if(b){for(e in b)if(b.hasOwnProperty(e)&&b[e].hitZone&&k({x:d.x,y:-d.y},b[e].hitZone.coordinates[0]))return this.transformToLatLon(d,b[e]);return this.transformToLatLon(d,b["default"])}a.error(22)};f.prototype.fromLatLonToPoint=function(d){var b=this.mapTransforms,e,m;if(!b)return a.error(22),{x:0,y:null};for(e in b)if(b.hasOwnProperty(e)&&b[e].hitZone&&(m=this.transformFromLatLon(d,b[e]),k({x:m.x,y:-m.y},b[e].hitZone.coordinates[0])))return m;
return this.transformFromLatLon(d,b["default"])};a.geojson=function(a,b,e){var m=[],f=[],l=function(a){var b,c=a.length;f.push("M");for(b=0;b<c;b++)1===b&&f.push("L"),f.push(a[b][0],-a[b][1])};b=b||"map";g(a.features,function(a){var e=a.geometry,c=e.type,e=e.coordinates;a=a.properties;var k;f=[];"map"===b||"mapbubble"===b?("Polygon"===c?(g(e,l),f.push("Z")):"MultiPolygon"===c&&(g(e,function(a){g(a,l)}),f.push("Z")),f.length&&(k={path:f})):"mapline"===b?("LineString"===c?l(e):"MultiLineString"===c&&
g(e,l),f.length&&(k={path:f})):"mappoint"===b&&"Point"===c&&(k={x:e[0],y:-e[1]});k&&m.push(d(k,{name:a.name||a.NAME,properties:a}))});e&&a.copyrightShort&&(e.chart.mapCredits=q(e.chart.options.credits.mapText,{geojson:a}),e.chart.mapCreditsFull=q(e.chart.options.credits.mapTextFull,{geojson:a}));return m};r(f.prototype,"addCredits",function(a,b){b=p(!0,this.options.credits,b);this.mapCredits&&(b.href=null);a.call(this,b);this.credits&&this.mapCreditsFull&&this.credits.attr({title:this.mapCreditsFull})})})(w);
(function(a){function k(a,b,d,f,c,h,g,k){return["M",a+c,b,"L",a+d-h,b,"C",a+d-h/2,b,a+d,b+h/2,a+d,b+h,"L",a+d,b+f-g,"C",a+d,b+f-g/2,a+d-g/2,b+f,a+d-g,b+f,"L",a+k,b+f,"C",a+k/2,b+f,a,b+f-k/2,a,b+f-k,"L",a,b+c,"C",a,b+c/2,a+c/2,b,a+c,b,"Z"]}var f=a.Chart,g=a.defaultOptions,d=a.each,q=a.extend,p=a.merge,u=a.pick,r=a.Renderer,l=a.SVGRenderer,b=a.VMLRenderer;q(g.lang,{zoomIn:"Zoom in",zoomOut:"Zoom out"});g.mapNavigation={buttonOptions:{alignTo:"plotBox",align:"left",verticalAlign:"top",x:0,width:18,height:18,
padding:5},buttons:{zoomIn:{onclick:function(){this.mapZoom(.5)},text:"+",y:0},zoomOut:{onclick:function(){this.mapZoom(2)},text:"-",y:28}},mouseWheelSensitivity:1.1};a.splitPath=function(a){var b;a=a.replace(/([A-Za-z])/g," $1 ");a=a.replace(/^\s*/,"").replace(/\s*$/,"");a=a.split(/[ ,]+/);for(b=0;b<a.length;b++)/[a-zA-Z]/.test(a[b])||(a[b]=parseFloat(a[b]));return a};a.maps={};l.prototype.symbols.topbutton=function(a,b,d,f,c){return k(a-1,b-1,d,f,c.r,c.r,0,0)};l.prototype.symbols.bottombutton=function(a,
b,d,f,c){return k(a-1,b-1,d,f,0,0,c.r,c.r)};r===b&&d(["topbutton","bottombutton"],function(a){b.prototype.symbols[a]=l.prototype.symbols[a]});a.Map=a.mapChart=function(b,d,g){var e="string"===typeof b||b.nodeName,c=arguments[e?1:0],h={endOnTick:!1,visible:!1,minPadding:0,maxPadding:0,startOnTick:!1},k,l=a.getOptions().credits;k=c.series;c.series=null;c=p({chart:{panning:"xy",type:"map"},credits:{mapText:u(l.mapText,' \u00a9 \x3ca href\x3d"{geojson.copyrightUrl}"\x3e{geojson.copyrightShort}\x3c/a\x3e'),
mapTextFull:u(l.mapTextFull,"{geojson.copyright}")},tooltip:{followTouchMove:!1},xAxis:h,yAxis:p(h,{reversed:!0})},c,{chart:{inverted:!1,alignTicks:!1}});c.series=k;return e?new f(b,c,g):new f(c,d)}})(w)});
//# sourceMappingURL=map.js.map

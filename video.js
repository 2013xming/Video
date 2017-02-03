$(document).ready(function(){
	//INITIALIZE
	var video = $('#myVideo');
	//	var isIE = /msie/.test(navigator.userAgent.toLowerCase());  //判断不出IE11
	var isIE = /trident/.test(navigator.userAgent.toLowerCase());  //兼容IE11
	var isEdge = /edge/.test(navigator.userAgent.toLowerCase());
	if(isIE || isEdge){
		$(".btnx3").hide();
	}
	//"mozilla/5.0 (compatible; msie 10.0; windows nt 10.0; wow64; trident/7.0; .net4.0c; .net4.0e; .net clr 2.0.50727; .net clr 3.0.30729; .net clr 3.5.30729; infopath.3; lcjb)"
	//"mozilla/5.0 (windows nt 10.0; wow64; trident/7.0; .net4.0c; .net4.0e; .net clr 2.0.50727; .net clr 3.0.30729; .net clr 3.5.30729; infopath.3; lcjb; rv:11.0) like gecko"
	//"mozilla/5.0 (windows nt 10.0; wow64) applewebkit/537.36 (khtml, like gecko) chrome/47.0.2526.106 safari/537.36"
	//"mozilla/5.0 (windows nt 6.3; rv:36.0) gecko/20100101 firefox/36.04"
	//"mozilla/5.0 (windows nt 10.0; wow64) applewebkit/537.36 (khtml, like gecko) chrome/45.0.2454.101 safari/537.36"
	//remove default control when JS loaded
	video[0].removeAttribute("controls");
	$('.control').show().css({'bottom':-45});
	$('.loading').fadeIn(500);
	$('.caption').fadeIn(500);
 
	//before everything get started
	video.on('loadedmetadata', function() {
		$('.caption').animate({'top':-45},300);
			
		//set video properties
		$('.current').text(timeFormat(0));
		$('.duration').text(timeFormat(video[0].duration));
		updateVolume(0, 0.7);
			
		//start to get video buffering data 
		setTimeout(startBuffer, 150);
			
		//bind video events
		$('.videoContainer')
		.append('<div id="init"></div>')
		.hover(function() {
			$('.control').stop().animate({'bottom':0}, 500);
			$('.caption').stop().animate({'top':0}, 500);
		}, function() {
			if(!volumeDrag && !timeDrag){
				$('.control').stop().animate({'bottom':-45}, 500);
				$('.caption').stop().animate({'top':-45}, 500);
			}
		})
		.on('click', function() {
			$('#init').remove();
			$('.btnPlay').addClass('paused');
			$(this).unbind('click');
			video[0].play();
		});
		$('#init').fadeIn(200);
	});
	
	//display video buffering bar
	var startBuffer = function() {
		var currentBuffer = video[0].buffered.end(0);
		var maxduration = video[0].duration;
		var perc = 100 * currentBuffer / maxduration;
		$('.bufferBar').css('width',perc+'%');

		console.log(currentBuffer);
		if(currentBuffer < maxduration) {
			setTimeout(startBuffer, 500);
		}
	};	
/*	video.on("progress",function(){
		console.log(video[0].played);
	})*/
	//display current video play time
	video.on('timeupdate', function() {
		var currentPos = video[0].currentTime;
		var maxduration = video[0].duration;
		var perc = 100 * currentPos / maxduration;
		$('.timeBar').css('width',perc+'%');	
		$('.current').text(timeFormat(currentPos));	
	});
	
	//CONTROLS EVENTS
	//video screen and play button clicked
	video.on('click', function() { playpause(); } );
	$('.btnPlay').on('click', function() { playpause(); } );
	var playpause = function() {
		if(video[0].paused || video[0].ended) {
			$('.btnPlay').addClass('paused');
			video[0].play();
		}
		else {
			$('.btnPlay').removeClass('paused');
			video[0].pause();
		}
	};
	
	//speed text clicked
	$('.btnx1').on('click', function() { fastfowrd(this, 1); });
	$('.btnx3').on('click', function() { fastfowrd(this, 3); });
	var fastfowrd = function(obj, spd) {
		$('.text').removeClass('selected');
		$(obj).addClass('selected');
		video[0].playbackRate = spd;
		video[0].play();
	};
	
	//stop button clicked
	$('.btnStop').on('click', function() {
		$('.btnPlay').removeClass('paused');
		updatebar($('.progress').offset().left);
		video[0].pause();
	});
	
	//fullscreen button clicked
/*	$('.btnFS').on('click', function() {
		if($.isFunction(video[0].webkitEnterFullscreen)) {
			video[0].webkitEnterFullscreen();
		}	
		else if ($.isFunction(video[0].mozRequestFullScreen)) {
			video[0].mozRequestFullScreen();
		}
		else {
			alert('Your browsers doesn\'t support fullscreen');
		}
	});*/
	
	//fullscreen button clicked
	$('.btnFS').on('click', function() {
		if($("div.videoContainer").attr("data-fullScreen") == "true"){
			$("div.videoContainer").removeClass("fullScreen");
			$("div.videoContainer").attr("data-fullScreen",false);
		}else{
			$("div.videoContainer").addClass("fullScreen");
			$("div.videoContainer").attr("data-fullScreen",true);
		}
	});
	
	//listen keyUp event
	$(document).keyup(function(event){
		switch (event.keyCode){
			case 27:
				if($("div.videoContainer").attr("data-fullScreen") == "true"){
					$("div.videoContainer").removeClass("fullScreen");
					$("div.videoContainer").attr("data-fullScreen",false);
				}
				break;
			case 37:
				// left,goback 10 second;
				video[0].currentTime -=10;
				break;
			case 38:
				//up,volume up
				if($("div.videoContainer").attr("data-fullScreen") == "true"){
					updateVolume(0, video[0].volume+0.05);
				}
				break;
			case 39:
				//right,forword 10 second;
				video[0].currentTime +=10;
				break;
			case 40:
				//down,volume down
				if($("div.videoContainer").attr("data-fullScreen") == "true"){
					updateVolume(0, video[0].volume-0.05);
				}
				break;
			default:
		}

		
	});
	//light bulb button clicked
	$('.btnLight').click(function() {
		$(this).toggleClass('lighton');
		
		//if lightoff, create an overlay
		if(!$(this).hasClass('lighton')) {
			$('body').append('<div class="overlay"></div>');
			$('.overlay').css({
				'position':'absolute',
				'width':100+'%',
				'height':$(document).height(),
				'background':'#000',
				'opacity':0.9,
				'top':0,
				'left':0,
				'z-index':999
			});
			$('.videoContainer').css({
				'z-index':1000
			});
		}
		//if lighton, remove overlay
		else {
			$('.overlay').remove();
		}
	});
	
	//sound button clicked
	$('.sound').click(function() {
		video[0].muted = !video[0].muted;
		$(this).toggleClass('muted');
		if(video[0].muted) {
			$('.volumeBar').css('width',0);
		}
		else{
			$('.volumeBar').css('width', video[0].volume*100+'%');
		}
	});
	
	//VIDEO EVENTS
	//video canplay event
	//IE 下拖动不再触发，只初始触发一次
	video.on('canplay', function() {
		$('.loading').fadeOut(100);
	});
	
	//video canplaythrough event
	//solve Chrome cache issue
	//IE 下拖动不再触发，只初始触发一次
	var completeloaded = false;
	video.on('canplaythrough', function() {
		completeloaded = true;
	});
	
	//video ended event
	video.on('ended', function() {
		$('.btnPlay').removeClass('paused');
		video[0].pause();
	});

	//video seeking event
	video.on('seeking', function() {
		//if video fully loaded, ignore loading screen
		if(!completeloaded) { 
			$('.loading').fadeIn(200);
		}	
	});
	
	//video seeked event
	video.on('seeked', function() {
		if(isIE || isEdge){
			$('.loading').fadeOut(100);
			completeloaded = true;
		}
	});
	
	//video waiting for more data event
	video.on('waiting', function() {
		$('.loading').fadeIn(200);
	});
	
	//VIDEO PROGRESS BAR
	//when video timebar clicked
	var timeDrag = false;	/* check for drag event */
	$('.progress').on('mousedown', function(e) {
		timeDrag = true;
		updatebar(e.pageX);
	});
	$(document).on('mouseup', function(e) {
		if(timeDrag) {
			timeDrag = false;
			updatebar(e.pageX);
		}
	});
	$(document).on('mousemove', function(e) {
		if(timeDrag) {
			updatebar(e.pageX);
		}
	});
	var updatebar = function(x) {
		var progress = $('.progress');
		
		//calculate drag position
		//and update video currenttime
		//as well as progress bar
		var maxduration = video[0].duration;
		var position = x - progress.offset().left;
		var percentage = 100 * position / progress.width();
		if(percentage > 100) {
			percentage = 100;
		}
		if(percentage < 0) {
			percentage = 0;
		}
		$('.timeBar').css('width',percentage+'%');	
		video[0].currentTime = maxduration * percentage / 100;
	};

	//VOLUME BAR
	//volume bar event
	var volumeDrag = false;
	$('.volume').on('mousedown', function(e) {
		volumeDrag = true;
		video[0].muted = false;
		$('.sound').removeClass('muted');
		updateVolume(e.pageX);
	});
	$(document).on('mouseup', function(e) {
		if(volumeDrag) {
			volumeDrag = false;
			updateVolume(e.pageX);
		}
	});
	$(document).on('mousemove', function(e) {
		if(volumeDrag) {
			updateVolume(e.pageX);
		}
	});
	var updateVolume = function(x, vol) {
		var volume = $('.volume');
		var percentage;
		//if only volume have specificed
		//then direct update volume
		if(vol) {
			percentage = vol * 100;
		}
		else {
			var position = x - volume.offset().left;
			percentage = 100 * position / volume.width();
		}
		
		if(percentage > 100) {
			percentage = 100;
		}
		if(percentage < 0 || percentage-0 < 0.01) {
			percentage = 0;
		}
		
		//update volume bar and video volume
		$('.volumeBar').css('width',percentage+'%');	
		video[0].volume = percentage / 100;
		
		//change sound icon based on volume
		if(video[0].volume == 0){
			$('.sound').removeClass('sound2').addClass('muted');
		}
		else if(video[0].volume > 0.5){
			$('.sound').removeClass('muted').addClass('sound2');
		}
		else{
			$('.sound').removeClass('muted').removeClass('sound2');
		}
		
	};

	//Time format converter - 00:00
	var timeFormat = function(seconds){
		var m = Math.floor(seconds/60)<10 ? "0"+Math.floor(seconds/60) : Math.floor(seconds/60);
		var s = Math.floor(seconds-(m*60))<10 ? "0"+Math.floor(seconds-(m*60)) : Math.floor(seconds-(m*60));
		return m+":"+s;
	};
});
this.player = function(){

	var _player = new Object();
	
	_player.change = function(id){
		
		var player_wrapper = $(".player_wrapper"),
			url = "http://www.youtube.com/v/" + id + "?version=3&amp;hl=da_DK&amp;rel=0&amp;controls=0&amp;autoplay=1&amp;iv_load_policy=3&amp;modestbranding=1";
		
		player_wrapper.empty();
					
		player_wrapper.html('<object width="100%" height="100%">' +
                '<param name="movie" value="' + url + '"></param>' +
                '<param name="allowFullScreen" value="true"></param>' +
                '<param name="allowscriptaccess" value="always"></param>' +
                '<param name="wmode" value="transparent"></param>' +
                '<embed src="' + url + '" type="application/x-shockwave-flash" wmode="transparent" width="100%" height="100%" allowscriptaccess="always" allowfullscreen="true"></embed>' +
            '</object>')

	}
	
	return _player;

}();
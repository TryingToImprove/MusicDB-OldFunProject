// JavaScript Document

this.sidebar_api = function () {

    var _sidebar_api = new Object(),
		_sidebar = document.getElementById('sidebar');

    function _generateItem(num, item) {

        if (item.id === undefined) { alert("Id is not provided"); return; }
        if (item.title === undefined) { alert("Title is not provided"); return; }

        var returnItem = $(document.createElement("span"))
		.addClass("item")
		.attr("videoId", item.id)
		.text((num + 1) + ". " + item.title)
		.bind("click", function (evt) {
		    player.change($(this).attr("videoId"));
            sidebar_api.saveToMyPlaylist($(this).attr("videoId"), ($(this).text().substring($(this).text().indexOf(".")+1)))
		})
		.bind("mouseover", function (evt) { $(this).addClass("item_hover"); })
		.bind("mouseout", function (evt) { $(this).removeClass("item_hover") })

        return returnItem;
    }

    _sidebar_api.show = function () {
        _sidebar.style.display = "block";
    }

    _sidebar_api.hide = function () {

        if ($("input[type='text']:focus").length < 1) {

            _sidebar.style.display = "none";

        } else {
            return false;
        }

    }

    _sidebar_api.searchYT = function (query) {

        var ajax_call, return_data = null;

        ajax_call = jQuery.ajax({
            url: 'http://gdata.youtube.com/feeds/api/videos',
            data: { "q": query, "format": 5, "max-results": 25, "v": 2, "alt": "jsonc" },
            dataType: "json",
            success: function (obj) {
                return_data = obj.data.items;
            },
            complete: function () {
                if (return_data != null) {
                    sidebar_api.dataset = return_data;
                    sidebar_api.databind();
                }
            }
        });

    }

    _sidebar_api.dataset = null;

    _sidebar_api.databind = function () {
        var results = $('#results');

        //truncate the results the for previous results
        results.empty();

        for (var i = 0; i < sidebar_api.dataset.length; i++) {

            var item = sidebar_api.dataset[i];

            results.append(
				_generateItem(i, item)
			);

        }

    }

    _sidebar_api.myPlaylist = function () {
        var ajax_call, return_data = null;

        ajax_call = jQuery.ajax({
            url: 'Ajax/Default.aspx',
            dataType: "json",
            success: function (songs) {
                return_data = songs;
            },
            complete: function () {
                if (return_data != null) {
                    sidebar_api.dataset = return_data;
                    sidebar_api.databind();
                }
            }
        });
    }

    _sidebar_api.saveToMyPlaylist = function(__id, __title) {
        var ajax_call, return_data = null;

        ajax_call = jQuery.ajax({
            url: 'Ajax/Default.aspx',
            data: { "id" : __id, "title":  __title.trim() },
            dataType: "json",
            success: function (data) {
                return_data = data;
            },
            complete: function () {
                if (return_data.message === "Completed") {
                    alert("GEMT");
                }
            }
        });
    }

    return _sidebar_api;

} ();

$("#sidebar_form").bind("submit", function(evt){ 

	sidebar_api.searchYT($("input[type='text']", this).val());
	
	return false;
});
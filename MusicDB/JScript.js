
function loadPlaylistcontainer() {
    var playlist_container = $("#playlist_container"),
        all_playlists = Playlist.getAll(),
        playlist_container_item,
        item;

    //Tøm container for gammel indhold.
    playlist_container.empty();

    if (all_playlists.length > 0) {
        for (var i = 0; i < all_playlists.length; i++) { //loop igennem

            item = all_playlists[i];

            playlist_container_item = $(document.createElement("div"))
            .click(function () {
                var debug_message = "";

                var playlist_id = $(this).attr("playlist_id"),
                    playlist = undefined;

                if (!IsNullOrUndefined(playlist_id)) {
                    playlist = Playlist.getPlaylist(playlist_id);

                    if ((!IsNullOrUndefined(playlist.songs.all)) && (playlist.songs.all.length > 0)) {
                        for (var i = 0; i < playlist.songs.all.length; i++) {

                            var song_id = playlist.songs.all[i].id,
                                song = undefined;

                            if (!IsNullOrUndefined(song_id)) {
                                song = Song.getSong(song_id);
                                debug_message += "Id : " + song.id + "\n";
                                debug_message += "Title : " + song.title + "\n";
                            }

                            debug_message += "\n";
                        }
                    }
                }

                alert(debug_message);
            })
            .attr("playlist_id", item.id)
            .html(item.title);


            //Append to playl.ist container
            playlist_container.append(playlist_container_item);
        }
    }
}


var Class = function (parent) {

    var klass = function () {
        this.init.apply(this, arguments);
    };
    klass.prototype.init = function () { };
    klass.fn = klass.prototype;

    klass.fn.parent = klass;

    //PROXY
    klass.proxy = function (func) {
        var self = this;
        return (function () {
            return func.apply(self, arguments);
        });
    };
    klass.fn.proxy = klass.proxy;

    //INCLUDE/EXTEND
    klass.extend = function (obj) {
        var extended = obj.extended;
        for (var i in obj) {
            klass[i] = obj[i];
        }
        if (extended) extended(this);
    };

    klass.include = function (obj) {
        var included = obj.included;
        for (var i in obj) {
            klass.fn[i] = obj[i];
        }
        if (included) included(obj);
    }

    return klass;
}

var Song = new Class();
Song.extend({
    getSong: function (songId) {
        var returnObject,
            _song = new Song(),
            ajaxRequest = jQuery.ajax({
                dataType: "JSON",
                async: false,
                url: "Ajax/getSong.aspx",
                data: { "id": songId },
                success: function (data) {
                    returnObject = data;
                }
            });

        if (returnObject != undefined) {
            _song.id = returnObject.id
            _song.title = returnObject.title;
        }

        return _song;
    }
});

Song.include({
    init: function (_id, _title) {
        this.id = _id;
        this.title = _title;
    },
    equal: function (_anotherSong) {
        if ((this.id === _anotherSong.id) && (this.title === _anotherSong.title))
            return true;
        else
            return false;
    }
});

var ModalPopup = new Class();
ModalPopup.extend({
    isOpen: false,
    display: function (element) {

        if (this.isOpen) {
            this.close();
        }

        var body = $("body"),
            shadow = $(document.createElement("div")).addClass("modal_shadow"),
            container = $(document.createElement("div")).addClass("modal_container"),
            closeingDiv = $(document.createElement("a")).text("Luk vindue").click(function () { ModalPopup.close(); });

        body.append(
            shadow
        )
        .append(
            container.append(
                closeingDiv
            )
            .append(
                element
            )
        );

        //Center modal
        $(container).css("margin-left", "-" + parseInt(element.width() / 2) + "px");
        $(container).css("margin-top", "-" + parseInt(element.height() / 2) + "px");

        this.isOpen = true;
    },
    close: function () {
        $(".modal_shadow").remove();
        $(".modal_container").remove();

        this.isOpen = false;
    }
});


var Songlist = new Class();
Songlist.include({
    init: function () {
        this.all = [];
    },
    "add": function (_song) {
        if (!(_song instanceof Song)) { throw new Error("NotCorrectClass") }

        if (!this.exists(_song)) {
            this.all.push(_song);
        }
    },
    "remove": function (_song) {
        //Validate
        if (!(_song instanceof Song)) { throw new Error("NotCorrectClass") }

        if (this.all == undefined) {
            throw new Error("SongList is null");
        }

        //Run code
        if (this.all.length > 0) {
            for (var i = 0; i < this.all.length; i++) {
                var item = this.all[i];

                if (_song.equal(item)) {
                    this.all.splice(i, 1);
                }
            }
        }
    },
    "exists": function (_song) {

        //Validate
        if (!(_song instanceof Song)) { throw new Error("NotCorrectClass") }

        if (this.all == undefined) {
            throw new Error("SongList is null");
        }

        //Properties
        var _exists = false, i = 0;

        //Run code
        if (this.all.length > 0) {
            for (var i = 0; i < this.all.length; i++) {
                var item = this.all[i];

                if (_song.equal(item))
                    _exists = true;
            }
        }

        return _exists;
    } /*,
    "length": function () {
        if (this.all != undefined) {
            return this.all.length;
        } else {
            return -1;
        }
    } ()*/
});


var Playlist = new Class();
Playlist.extend({
    displayForm: function () {

        var currentPlaylist = null;

        ModalPopup.display(
            $(document.createElement("form"))
            .bind("submit", function (e) {
                if (!e) var e = window.event;


                var title = $("#txtPlayListName").val();
                currentPlaylist = new Playlist(title)
                currentPlaylist.save();


                loadPlaylistcontainer();

                ModalPopup.close();

                e.cancelBubble = true;
                e.returnValue = false;

                //e.stopPropagation works only in Firefox.
                if (e.stopPropagation) {
                    e.stopPropagation();
                    e.preventDefault();
                }

                return false;
            })
            .append(
                $(document.createElement("input"))
                .attr("id", "txtPlayListName")
            )
            .append(
                $(document.createElement("button"))
                .attr("type", "submit")
                .text("Save playlist")
                .bind("click", function () { $(this).parent().trigger("submit"); return false; })
            )
        );

    },
    getPlaylist: function (id) {
        var returnObject,
            _playlist = new Playlist(),
            returnList = new Songlist(),
            ajaxRequest = jQuery.ajax({
                dataType: "JSON",
                async: false,
                url: "Ajax/getPlaylist.aspx",
                data: { "id": id },
                success: function (data) {
                    returnObject = data;
                }
            });

        if (returnObject != undefined) {
            _playlist.id = returnObject.id
            _playlist.title = returnObject.title;

            for (var i = 0; i < returnObject.songs.length; i++) {
                // Gør sådan at den kun gemme id og navn, for den henter ikke mere fra xml'en;
                var song = new Song(returnObject.songs[i].id, returnObject.songs[i].title);
                returnList.add(song);
            }
            _playlist.songs = returnList;
        }

        return _playlist;
    },
    getAll: function () {
        var _playlist = new Playlist(),
            returnObject = null,
            ajaxRequest = jQuery.ajax({
                dataType: "JSON",
                async: false,
                url: "Ajax/Playlist.aspx?Mode=GetAll",
                success: function (data) {
                    returnObject = data;
                }
            });

        if ((returnObject != null) && (returnObject.length > 0)) {
            return returnObject;
        } else {
            return [];
        }
    }
});

Playlist.include({
    init: function (_title) {
        this.id = undefined;
        this.title = _title;
    },
    save: function () {
        var id = this.id,
            title = this.title,
            songs = this.songs.all,

            songParam = "";


        if (songs != undefined) {
            for (var i = 0; i < songs.length; i++) {
                var item = songs[i];

                songParam += item.id;

                if (i < songs.length - 1)
                    songParam += ",";
            }
        }

        var ajaxRequest = jQuery.ajax({
            url: "Ajax/Playlist.aspx",
            async: false,
            data: { "id": this.id, "title": this.title, "items": songParam },
            success: function (data) {
            }
        });
    },
    songs: function () {
        return new Songlist();
    } (Songlist)
});

var Sidebar = new Class();
Sidebar.include({
    views: new Array(),
    init: function (element) {
        this.element = element;
    },
    generateItem: function (num, item) {
        if (item.id === undefined) { alert("Id is not provided"); return; }
        if (item.title === undefined) { alert("Title is not provided"); return; }

        var returnItem = $(document.createElement("span"))
		.addClass("item")
		.attr("videoId", item.id)
		.text((num + 1) + ". " + item.title)
		.bind("click", function (evt) {
		    //player.change($(this).attr("videoId"));
		    //sidebar_api.saveToMyPlaylist($(this).attr("videoId"), ($(this).text().substring($(this).text().indexOf(".") + 1)))
		})
		.bind("mouseover", function (evt) { $(this).addClass("item_hover"); })
		.bind("mouseout", function (evt) { $(this).removeClass("item_hover") })

        return returnItem;
    },
    hasView: function (ViewApi, ViewName) {

        var _hasView = false;

        for (var i = 0; i < this.views.length; i++) {
            var item = this.views[i];

            if ((item.name == ViewName) && (item.api == ViewApi)) {
                _hasView = true;
            }
        }

        return _hasView;

    },
    getView: function (ViewApi, ViewName) {

        var _getView = null;

        for (var i = 0; i < this.views.length; i++) {
            var item = this.views[i];

            if ((item.name == ViewName) && (item.api == ViewApi)) {
                _getView = item;
            }
        }

        return _getView.view;

    },
    change: function (ViewApi, ViewName, View) {

        $(this.element).empty();

        if (!this.hasView(ViewApi, ViewName)) {
            this.views.push({
                "api": ViewApi,
                "name": ViewName,
                "view": View
            });
        } else {
            if (View == null) {
                View = this.getView(ViewApi, ViewName);
            }
        }

        $(this.element).append(View);
        this.DebugViews();
    },
    Playlist: function (id) {

        if (id == "my") // Min afspilings liste har id +
            id = 0;

        var playlist = Playlist.getPlaylist(id),
            obj = $(document.createElement("div"));

        if ((playlist != undefined) && (playlist != null)) {
            for (var i = 0; i < playlist.songs.all.length; i++) {
                var item = playlist.songs.all[i];
                obj.append(
                $(this.generateItem(i, item))
            );
            }
        }

        this.change("Playlist", id, obj);
    },
    Search: function (query) {

        var obj = $(document.createElement("div")), sidebar = this;

        obj //Lav en form til søgning
        .append(
            $(document.createElement("form"))
            .bind("submit", function () {
                sidebar.Search($("#txtQuery").val());
                return false;
            })
            .append(
                $(document.createElement("input"))
                .attr("id", "txtQuery")
            )
            .append(
                $(document.createElement("button"))
                .text("Søg")
            )
        );

        //Udskriver og henter resultater
        if (query != undefined) {

            if (sidebar.hasView("Search", $("#txtQuery").val())) {
                obj = sidebar.getView("Search", $("#txtQuery").val());
            } else {
                var ajax_call, return_data = null;

                ajax_call = jQuery.ajax({
                    url: 'http://gdata.youtube.com/feeds/api/videos',
                    data: { "q": query, "format": 5, "max-results": 25, "v": 2, "alt": "jsonc" },
                    dataType: "json",
                    success: function (_obj) {
                        return_data = _obj.data.items;
                    },
                    complete: function () {
                        if (return_data != null) {
                            for (var i = 0; i < return_data.length; i++) {
                                var item = return_data[i];
                                obj.append(sidebar.generateItem(i, item));
                            }
                        }
                    }
                });
            }
        } else {
            query = "";
        }

        this.change("Search", query, obj);
    },
    "DebugViews": function () {

        var DebugObj = $("#debug_views"), self = this;
        DebugObj.empty();

        for (var i = 0; i < this.views.length; i++) {
            var item = this.views[i], api, name;
            if (item.name != undefined) name = item.name;
            if (item.api != undefined) api = item.api;


            DebugObj.append(
                $(document.createElement("div"))
                .attr("api", api)
                .attr("name", name)
                .html("<b>" + item.api + "</b> -> " + item.name)
                .bind("click", function () {
                    self.change($(this).attr("api"), $(this).attr("name"), undefined);
                })
            );
        }

    }
});

function IsNullOrUndefined(obj) {
    if ((obj == null) || (obj == undefined)) {
        return true;
    }
    return false;
}


$(document).ready(function () {
    _Sidebar = new Sidebar($("#sidebar"));

    //Test kode for at få alle playlisterne vidst
    ////////////////////////////////////////////////////

    loadPlaylistcontainer();
    ////////////////////////////////////////////////////
});

let comoketab = (function () {
  return {
    // use this to import your json bookmark list
    importBackUpBookmarks: function() {
        let bookMarkJson = [{"favIconUrl":"","url":""}, {"favIconUrl":"","url":""}];

        $.ajax({
            type: "POST",
            url: 'http://127.0.0.1:5000/save_bookmarks',
            data: JSON.stringify(bookMarkJson),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });

    },
    loadReadingList: function() {
      $.get("http://127.0.0.1:5000/get_reading_list", function(allItems) {
          if(allItems !== null && allItems.length !== 0) {
              //Uncomment this to backup your readinglist
              //console.log(JSON.stringify(allItems));
              //console.log("Count of objects in reading list: " + allItems.length);

              $.each(allItems, function (index, item) {
                  let html = $.parseHTML('' +
                      '<div class="reading_item">' +
                      '<div class="reading_item_column reading_item_icon">' +
                      '<img src="' + item.favIconUrl + '" />' +
                      '</div>' +
                      '<div class="reading_item_column reading_item_title">' +
                      '<a class="reading_item_link" target="_blank" href="' + item.url + '">' +
                      item.title +
                      '</a>' +
                      '</div>' +
                      '<div class="reading_item_column reading_item_check">' +
                      '<span class="fa fa-lg fa-times-circle fa-fw mr"></span>' +
                      '</div>' +
                      '</div>');

                  $('#readinglist').append(html);
              });

              $('.reading_item_check').click(function () {
                  let item_title = jQuery(this).prev('div').find('.reading_item_link').text();
                  comoketab.removeFromReadingList(jQuery(this).parent(), item_title);
              });
          }
      });
    },
    removeFromReadingList: function (node, item_title) {
        $.get("http://127.0.0.1:5000/get_reading_list", function(allItems) {
            let arrWithItemRemoved = [];

            if(allItems !== null && allItems.length !== 0) {
                $.each(allItems, (index, item) => {
                    if (item.title !== item_title) {
                        arrWithItemRemoved.push(item);
                    }
                });

                console.log('saving new reading list');
                console.log(arrWithItemRemoved);

                $.ajax({
                    type: "POST",
                    url: 'http://127.0.0.1:5000/save_reading_list',
                    data: JSON.stringify(arrWithItemRemoved),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
            }
        });

        $(node).fadeOut( "slow", function() {
            $('.reading_item').remove();
            comoketab.loadReadingList();
        });
    },
    loadBookmarks: function() {
        $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {
            if(allItems !== null && allItems.length !== 0) {
              // Uncomment to backup bookmarks
              console.log(JSON.stringify(allItems));

              $.each(allItems, function (index, item) {
                  let html = $.parseHTML('<a class="bookmark_item" href="' + item.url + '"><img src="' + item.favIconUrl + '" /></a>');
                  $('#bookmarks').append(html);
              });
          }
      });
    },

    saveSortSettings: function() {
        let ftbm = [];

        $( ".sort_item:visible" ).each(function( index, obj ) {
            let item = {
                url: $(this)[0].children[0].value,
                favIconUrl: comoketab.getCorrectFaviconUrl($(this)[0].children[1].value)
            };

            //console.log(JSON.stringify(ftbm).length + ' + ' + JSON.stringify(item).length  + ' ... 1: ' + item.url);
            ftbm.push(item);
        });

        function sortComplete() {
            $(".sort_item").remove();
            $("#overlay_sort").hide();
            $('.bookmark_item').remove();
            comoketab.loadBookmarks();
        }

        $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {

            console.log('Original length: ' + allItems.length);
            console.log('Sorted length: ' + ftbm.length);

            if(allItems.length === ftbm.length) {
                $.ajax({
                    type: "POST",
                    url: 'http://127.0.0.1:5000/save_bookmarks',
                    data: JSON.stringify(ftbm),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: sortComplete()
                });
            } else {
                console.log('There was an error. The sorted items length did not match the original length. Not updating in case of data corruption.');
            }
        });
    },
    addSortItem: function(item, index) {
      let html = $.parseHTML('' +
          '<div class="sort_item">' +
          '<input class="url" type="hidden" value="'+item.url+'" />' +
          '<input class="fav" type="hidden" value="'+item.favIconUrl+'" />' +
          '<img class="set_fav" src="' + item.favIconUrl + '" />' +
          '</div>');

      $('#sort_items').append(html);
    },
    loadSortSettings: function () {
        $("#overlay_sort").toggle();

        $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {
            if(allItems !== null && allItems.length !== 0) {

                $.each(allItems, function (index, item) {
                    comoketab.addSortItem(item, index);
                });

                $( ".sortable" ).sortable({
                    revert: true
                }).disableSelection();

                $('.sort_item').draggable({
                    containment: "parent",
                    cursor: "crosshair",
                    connectToSortable: ".sortable",
                    revert: "invalid"
                }); //draggable

                $('#save_sort').click(function() {
                    $("#choices_overlay").hide();
                    comoketab.saveSortSettings();
                });

                $('#close_sort').click(function() {
                    $(".sort_item").remove();
                    $("#overlay_sort").hide();
                    $("#choices_overlay").hide();
                });
            }
        });
    },
    saveEditSettings: function() {
        let ftbm = [];

        $( ".settings_item:visible" ).each(function( index, obj ) {
          let item = {
              url: $(this)[0].children[0].value,
              favIconUrl: comoketab.getCorrectFaviconUrl($(this)[0].children[1].value)
          };

          ftbm.push(item);
        });

        function editComplete() {
            $(".settings_item").remove();
            $(".overlay_edit").hide();
            $('.bookmark_item').remove();
            comoketab.loadBookmarks();
        }

        $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {

            console.log('Original length: ' + allItems.length);
            console.log('Edited length: ' + ftbm.length);

            if(allItems.length === ftbm.length) {
                $.ajax({
                    type: "POST",
                    url: 'http://127.0.0.1:5000/save_bookmarks',
                    data: JSON.stringify(ftbm),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: editComplete()
                });
            } else {
                console.log('There was an error. The sorted items length did not match the original length. Not updating in case of data corruption.');
           }
        });
    },
    addEditSettingsItem: function(item, index) {
      let html = $.parseHTML('' +
          '<div class="settings_item">' +
          '<input class="url" type="text" value="'+item.url+'" />' +
          '<input class="fav" type="text" value="'+item.favIconUrl+'" />' +
          '<img class="set_fav" src="' + item.favIconUrl + '" />' +
          '</div>');

      $('#settings_items').append(html);
    },
    loadEditSettings: function () {
        $(".overlay_edit").toggle();

        $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {
            if(allItems !== null && allItems.length !== 0) {

                $.each(allItems, function (index, item) {
                    comoketab.addEditSettingsItem(item, index);
                }); //each

                $("input[type='text']").click(function () {
                    $(this).select();
                });

                $('#save_settings').click(function() {
                    $("#choices_overlay").hide();
                    comoketab.saveEditSettings();
                });

                $('#close_overlay').click(function() {
                    $(".overlay_edit").hide();
                    $("#choices_overlay").hide();
                });
            }
        });
    },
    addDeleteItem: function(item, index) {
      let html = $.parseHTML('' +
          '<div class="delete_item">' +
          '<span class="set_delete delete_bookmark delete_bookmark_' +index+ ' red fa fa-ls fa-minus-circle fa-fw"></span>' +
          '<input class="url" type="hidden" value="'+item.url+'" />' +
          '<input class="fav" type="hidden" value="'+item.favIconUrl+'" />' +
          '<img class="set_fav" src="' + item.favIconUrl + '" />' +
          '</div>');

      $('#delete_items').append(html);
    },
    deleteBookmark: function(url, node) {
        $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {
            if(allItems !== null && allItems.length !== 0) {
                let arrWithItemRemoved = [];

                $.each(allItems, (index, item) => {
                    if (item.url !== url) {
                        arrWithItemRemoved.push(item);
                    }
                });

                $.ajax({
                    type: "POST",
                    url: 'http://127.0.0.1:5000/save_bookmarks',
                    data: JSON.stringify(arrWithItemRemoved),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                });
            }
        });

      $(node).fadeOut("slow", function() {});
    },
    loadDeleteSettings: function () {
      $("#overlay_delete").show();

        $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {
            if(allItems !== null && allItems.length !== 0) {

                $.each(allItems, function (index, item) {
                    comoketab.addDeleteItem(item, index);
                    $('.delete_bookmark_' + index).click(function() {
                        comoketab.deleteBookmark(item.url, $(this).parent());
                    });
                });
            }
        });

        $("#delete_overlay_close").click(function() {
            $(".delete_item").remove();
            $("#overlay_delete").hide();
            $("#choices_overlay").hide();
            $('.bookmark_item').remove();

            comoketab.loadBookmarks();
        });
    },
    getCorrectFaviconUrl: function(favIconUrl) {
      if(!favIconUrl || favIconUrl.length < 1) {
          favIconUrl = 'img/grid.png';
      } else {
          favIconUrl = favIconUrl.replace(/"/g,"");
      }
      return favIconUrl;
    }
  }
})(jQuery); //main function

$(document).ready(function () {

  //comoke.importBackUpBookmarks();

  $('.reading_item').remove();
  $('.bookmark_item').remove();
  $('.settings_item').remove();

  comoketab.loadReadingList();
  comoketab.loadBookmarks();

  /* show settings choices */
  $('#settings_button').click(function() {
      $("#choices_overlay").toggle();
  });

  /* close choices when click overlay */
  $("#choices_overlay").click(function() {
      $("#choices_overlay").hide();
  });

  /* select edit bookmark */
  $('#choice_edit').click(function() {
      $("#choices_overlay").hide();
      comoketab.loadEditSettings();
  });

  /* select delete bookmark */
  $('#choice_delete').click(function() {
      $("#choices_overlay").hide();
      comoketab.loadDeleteSettings();
  });

  /* select delete bookmark */
  $('#choice_sort').click(function() {
      $("#choices_overlay").hide();
      comoketab.loadSortSettings();
  });
});

let comoketabPopup = (function () {
  return {
    saveToReadingList: function() {
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
          let url = tabs[0].url.replace(/"/g,"");
          let title = tabs[0].title.replace(/"/g,"");
          let favIconUrl = comoketabPopup.getCorrectFaviconUrl(tabs[0].favIconUrl);

          let newItem = {
              'url':url,
              'title':title,
              'favIconUrl':favIconUrl
          };

          $.get("http://127.0.0.1:5000/get_reading_list", function(allItems) {
              if(allItems !== null && allItems.length !== 0) {
                  allItems.unshift(newItem);

                  $.ajax({
                      type: "POST",
                      url: 'http://127.0.0.1:5000/save_reading_list',
                      data: JSON.stringify(allItems),
                      contentType: "application/json; charset=utf-8",
                      dataType: "json"
                  });

                  $('#content').append($.parseHTML(
                      '<div class="tlight">Saved to Reading List</div><br>' +
                      '<span class="fa fa-2x fa-check fa-fw green"></span>'
                  ));
              }
          });
      });
    },
    saveToBookmarks: function() {
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
          let url = tabs[0].url.replace(/"/g,"");
          let favIconUrl = comoketabPopup.getCorrectFaviconUrl(tabs[0].favIconUrl);

          let newItem = {
              'url':url,
              'favIconUrl':favIconUrl
          };

          $.get("http://127.0.0.1:5000/get_bookmarks", function(allItems) {
              if(allItems !== null && allItems.length !== 0) {
                  allItems.push(newItem);

                  $.ajax({
                      type: "POST",
                      url: 'http://127.0.0.1:5000/save_bookmarks',
                      data: JSON.stringify(allItems),
                      contentType: "application/json; charset=utf-8",
                      dataType: "json"
                  });

                  $('#content').append($.parseHTML(
                      '<div class="tlight">Saved to Bookmarks</div><br>' +
                      '<span class="fa fa-2x fa-check fa-fw green"></span>'
                  ));
              }
          });
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
})(jQuery);

$(document).ready(function () {
  $('#saver').click(function() {
      $('#buts').fadeOut( "slow", function() {
          comoketabPopup.saveToReadingList();
      });

  });

  $('#saveb').click(function() {
      $('#buts').fadeOut( "slow", function() {
          comoketabPopup.saveToBookmarks();
      });
  });
});

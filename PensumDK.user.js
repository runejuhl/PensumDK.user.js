// ==UserScript==
// @name        PensumDK
// @namespace   pensumdk.petardo.dk
// @include     http://www.pensum.dk/kobsalg.php
// @version     1
// @grant       none
// ==/UserScript==

(function() {
  var isbn = document.getElementsByName('isbn')[0].value;

  if (!isbn)
    return;

  var fTitle = document.getElementsByName('title')[0];
  var fAuthor = document.getElementsByName('author')[0];
  var fEdition = document.getElementsByName('edition')[0];
  var fYear = document.getElementsByName('year')[0];
  var fPages = document.getElementsByName('pages')[0];
  var fPublisherName = document.getElementsByName('publisherName')[0];
  var fPrice = document.getElementsByName('price')[0];
  var currentAvgPrice = document.getElementById('sidebar').innerHTML.match(/øjeblikket ([0-9]+)/);
  if (currentAvgPrice !== null)
    currentAvgPrice = currentAvgPrice[1];
  var alltimeAvgPrice = document.getElementById('sidebar').innerHTML.match(/Gennemsnitlig pris ([0-9]+)/)[1];

  console.log(currentAvgPrice || alltimeAvgPrice);

  console.log(fTitle);

  var book;
  // var isbn = "9780470723371";
  var req = new XMLHttpRequest();

  var checkbook = function() {
    if (req.status == 200) {
      if (!req.responseText)
        return;

      console.log(req.responseText);
      var obj = JSON.parse(req.responseText);

      if (obj.totalItems == 0) {
        console.log("No results returned");
        return;
      }

      if (obj.totalItems == 1) {
        book = obj.items;
      } else {
        book = obj.items
          .filter(
            function(x) {
              var identifiers = x.volumeInfo.industryIdentifiers;
              var book = identifiers
                .reduce(
                  function(id)
                  { return id.type == "ISBN_13" && id.identifier == "9780470723371";
                  }
                );
              return book;
            }
          );
      }

      if (book.length == 0) {
        console.log("No matching ISBN13 found.");
        return;
      }

      console.log(book);
      var info = book[0].volumeInfo;

      console.log(info);

      fTitle.value = info.title;
      fAuthor.value = info.authors
        .reduce(function(acc, x) {
          return acc + ', ' + x;
        });
      fYear.value = info.publishedDate.match(/[0-9]{4}/)[0];
      fPages.value = info.pageCount;
      fPublisherName.value = info.publisher;
      fPrice.value = currentAvgPrice || alltimeAvgPrice;
    }
  };

  req.open('GET', "https://www.googleapis.com/books/v1/volumes?q=" + isbn);
  req.onreadystatechange = checkbook;

  req.send();

})();

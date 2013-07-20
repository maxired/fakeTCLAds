var render, data, svg;



var liveupdate = function() {
  var form = document.getElementsByClassName('myform')[0];
  data.image = form.getElementsByClassName("url")[0].value || data.image;

  data.backgroundColor = form.getElementsByClassName("color")[0].value || data.backgroundColor;
  data.linesUp = [].concat(form.getElementsByClassName("content")[0].value.toUpperCase().split('\n')) || data.linesUp;

  render();
}



Array.prototype.slice.call(document.getElementsByTagName("form")[0].elements).forEach(function(el) {
  el.onchange = liveupdate;
  el.onkeyup = liveupdate;
})


document.getElementsByClassName("saveButton")[0].onclick = function() {

  var req = new XMLHttpRequest();
  req.open('POST', '/image', true);
  req.onreadystatechange = function(aEvt) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        var content = JSON.parse(req.responseText)
        var address = "http://" + window.location.host + "/image/" + content._id;


        var resultlink = document.getElementsByClassName('resultLink')[0]
        resultlink.style.visibility = "visible";

        resultlink.getElementsByClassName("beforeLink")[0].innerHTML = "Votre image est désormais disponible";
        resultlink.getElementsByClassName("link")[0].innerHTML = "ici";
        resultlink.getElementsByClassName("link")[0].href = address;
        resultlink.getElementsByClassName("afterLink")[0].innerHTML = ".";

        resultlink.getElementsByClassName("twitterLink")[0].innerHTML = twitterTmpl(address, 'Regarder ma nouvellle création.');
        twitterFunction(document, 'script', 'twitter-wjs');
        facebookFunction(document, 'script', 'facebook-jssdk')

      } else
        alert("Erreur pendant le chargement de la page.\n");
    }
  };

  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify({
    svg: document.getElementsByClassName('main')[0].innerHTML
  }));

};

var twitterTmpl;

require(['text'], function(txt) {
  require(['lodash', 'text!tmpl.svg', 'text!twitter.tmpl'], function(_, tmpl, twitter) {

    data = {
      image: "http://farm3.static.flickr.com/2760/4131129668_12df0df3d3.jpg",
      textColor: "white",
      // backgroundColor : "#f373ac",
      backgroundColor: "black",

      downTextColor: '#e3001b',
      // linesUp : ["À 3 ARRÊTS", "DE MON","PLAN CUL."],
      // linesUp : ["À 5 MIN. DE", "C'EST QUAND","QU'ON ARRIVE."],
      linesUp: ["À 2", "MINUTES", "DE LA FIN."],

      linesDown: ["PARTOUT", "POUR", "TOUS", "IL Y A", "TCL", " "],
      height: 480,
      width: 327,

      leftMarginUp: 42,

      lineHeight: 27,
      bottomMargin: 10,
      leftMargin: 10,
      lineSpace: 5,
      fontSize: 35
    };


    render = function() {
      svg = _.template(tmpl, data);
      document.getElementsByClassName('main')[0].innerHTML = svg;
    };
    render();

    twitterTmpl = function(url, text) {
      return _.template(twitter)({
        url: url,
        text: text
      });
    }


    require(['json'], function(json) {
      require(['json!image/latests', 'text!latests.tmpl'], function(images, tmpl) {

        document.getElementsByClassName('latests')[0].innerHTML = _.template(tmpl, {
          images: images
        })


      })

    })
  });
});
(function() {

  var app = {
    init: function() {
      document.querySelector("#popup footer p:first-of-type").addEventListener("click", function(){
        document.getElementById("popup").classList.add("hide")
        terug.popupHandlePos(terug.alt, terug.el)
      })
      document.querySelector("#popup footer p:last-of-type").addEventListener("click", function(){
        document.getElementById("popup").classList.add("hide")
        terug.popupHandleNeg()
      })
      document.querySelector("form").addEventListener("submit", function(e) {
        //preventDefault zodat de pagina niet refreshed
        e.preventDefault()
        var zoekOpdracht = document.querySelector("input").value;
        document.getElementById("path").innerHTML = `
        <div id="verloopCheck">
          <p> ${zoekOpdracht} </p>
          <p>Bekijk verloop</p>
          <p>Maak moodboard</p>
          <div>`
        loader.show()
        search.query(zoekOpdracht)
        app.detail()
        document.querySelector("form").classList.add("none")
      })
      document.getElementById("images").addEventListener("click", search.main())
    },
    detail: function() {
      document.querySelector("#verloopCheck p:last-of-type").addEventListener("click", function(){
        document.querySelector("#verloopCheck p:nth-of-type(3)").classList.toggle("stayHovered")
        document.querySelector("#canvas").classList.toggle("hide")
      })
      document.querySelector("#verloopCheck p:nth-of-type(2)").addEventListener("click", function(){
        document.getElementById("path").classList.toggle("maxHeight")
        document.querySelector("#verloopCheck p:nth-of-type(2)").classList.toggle("stayHovered")
      })
    }
  }

  var loader = {
    show: function() {
      document.getElementById("loader").classList.remove("none")
    },
    hide: function() {
      document.getElementById("loader").classList.add("none")
    }
  }

  var search = {
    index: 0,
    main: function() {
      console.log("index" + this.index);
      var that = this
      document.getElementById("images").addEventListener("click", function() {
        var zoekOpdracht = event.target.title
        var archief = event.target
        console.log(archief);
        var nieuw = zoekOpdracht.split(" ")
        var nieuwer = nieuw[that.index]
        console.log(nieuwer);
        if (nieuwer) {
          that.wordchecker(nieuwer, nieuw)
        }
        else {
          console.log("kippetjes");
        }
    })},
    wordchecker: function(nieuwer, nieuw){
      console.log(nieuw);
      // this.index = 0
      nieuwer = nieuwer.toLowerCase()
      nieuwer = nieuwer.replace(",", " ")
      nieuwer = nieuwer.replace("'", "")
      nieuwer = nieuwer.replace("'", "")
      nieuwer = nieuwer.replace(";", "")
      nieuwer = nieuwer.replace(".", "")
      nieuwer = nieuwer.replace(":", "")
      nieuwer = nieuwer.replace("[", "")
      nieuwer = nieuwer.replace("]", "")
      var oudeZoekOpdracht = cookie.eat()
      console.log("vorige zoekopdracht = " + oudeZoekOpdracht);
      if (nieuwer.includes("het") || nieuwer == oudeZoekOpdracht || nieuwer.includes("een") || nieuwer.includes("met") || nieuwer.includes("naast") || nieuwer.includes("door") || nieuwer.includes("van") || nieuwer.length < 3 ){
        console.log("foutief woord");
        this.index++
        console.log(this.index);
        if (nieuw[search.index]) {
          console.log(nieuw[search.index]);
          this.wordchecker(nieuw[search.index], nieuw)
        }
        else {
          error.process(3)
        }
      } else {
        new fill.association(event.target.src, nieuwer, event.target.alt)
        nieuwer = " "+nieuwer
        this.index = 0
        search.query(nieuwer)
        loader.show()
      }
    },
    query: function(zoekOpdracht) {
      error.hide()
      console.log(zoekOpdracht);
      document.getElementById("images").innerHTML = ""
      var sparqlquery = `
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?cho ?title ?description ?img WHERE {
      ?cho dc:type ?type .
      ?cho dc:title ?title .
      ?cho dc:description ?description .
      ?cho foaf:depiction ?img .
      FILTER REGEX(?title, '${zoekOpdracht}' , 'i')
    }
    LIMIT 100`
      // more fun dc:types: 'affiche', 'japonstof', 'tegel', 'herenkostuum'
      // more fun dc:subjects with Poster.: 'Privacy.', 'Pop music.', 'Music.', 'Squatters movement.'

      var encodedquery = encodeURI(sparqlquery);

      var queryurl = 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodedquery + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';
      cookie.bake(zoekOpdracht)
      fill.page(queryurl)
    }
  }

  var fill = {
    page: function(queryurl) {
      fetch(queryurl)
        .then((resp) => resp.json()) // transform the data into json
        .then(function(data) {

          rows = data.results.bindings; // get the results
          console.log(rows);
          // if (rows == 0) {
          //   console.log("geen resultaat");
          //   var zoekOpdracht = cookie.eat()
          //   console.log(zoekOpdracht);
          //   console.log(zoekOpdracht.split(" "));
          //   var andereZoekOpdracht = zoekOpdracht.split(" ")
          //   console.log(andereZoekOpdracht);
          //   console.log(zoekOpdracht[1]);
          //   search.query(zoekOpdracht[1])
          // }
          imgdiv = document.getElementById('images');
          if (rows.length == 0) {
            error.process(1)
          }
          for (i = 0; i < rows.length; ++i) {

            var img = document.createElement('img');
            img.src = rows[i]['img']['value'];
            img.title = rows[i]['title']['value'];
            img.alt = rows[i]['description']['value']
            imgdiv.appendChild(img);

          }
          loader.hide()
        })
        .catch(function(err) {
          // if there is any error you will catch them here
          console.log(err);
          error.process(2)
        });
    },
    association : function (link, zoekOpdracht, alt){
      this.zoekOpdracht = zoekOpdracht
      this.link = link
      this.alt = alt
      console.log(this);
      document.getElementById("path").innerHTML += `
      <section>
        <img src=" ${this.link} " alt="${this.zoekOpdracht}">
        <p>${this.zoekOpdracht}</p>
        <p>${this.alt}</p>
      </section>`
      document.querySelector("#canvas").innerHTML += `
      <img src=" ${this.link} ">`
      terug.init()
      app.detail()
    }
  }

  var error = {
    process : function(errorNum){
      if (errorNum == 1) {
        console.log("error 1");
        document.getElementById("errorCatch").innerHTML = "geen resultaat"
        document.querySelector("form").classList.remove("none")
      }
      if (errorNum == 2) {
        console.log("error 2");
        document.getElementById("errorCatch").innerHTML = "Fout met de API"
        document.querySelector("form").classList.remove("none")
      }
      if (errorNum == 3) {
        console.log("error 3");
        document.getElementById("errorCatch").innerHTML = "Deze afbeelding bevat helaas geen titel"
      }
      document.getElementById("errorCatch").classList.remove("none")
    },
    hide : function(){
      document.getElementById("errorCatch").innerHTML = ""
    }
  }

  var terug = {
    alt:"",
    el: null,
    klikOp: "",
    init: function(){
      for (var i = 0; i < document.querySelectorAll("#path section img").length; i++) {
        document.querySelectorAll("#path section img")[i].addEventListener("click", terug.naarAf)
      }
    },
    naarAf: function(i){
      console.log('image index', event);
      // console.log(event.target);
      // console.log(document.querySelectorAll("#path > section"));
      document.getElementById("popup").classList.remove("hide")
      terug.alt = event.target.alt
      terug.el = this
    },
    popupHandlePos: function(zoekOpdracht, el){
      search.query(" "+zoekOpdracht)
      terug.alt = ""

      var section = el.parentNode,
        allSections = Array.from( document.querySelectorAll( '#path > section' ) ),
        remove = []

      allSections.forEach( function( el, i ) {

        var index = allSections.indexOf( section )
        console.log( index )
        if ( i > index ) {
          remove.push( el )
        }

      } )

      remove.forEach( function( el ) {

        el.remove()

      } )

      // document.querySelectorAll("#path > section").forEach( (img,i) => {
      //
      //   if (i > ) {
      //
      //   }
      // })
    }
  }

  var cookie = {
    bake: function(zoekOpdracht) {
      // zet data-elementen in localStorage
      localStorage.setItem('oudeZoekopdracht', zoekOpdracht)
    },
    eat: function() {
      // als je Zoekgeschiedenis niet leeg is, ga naar de volgende functie
      if (localStorage.getItem("oudeZoekopdracht") != null) {
        var oudeZoekOpdracht = localStorage.getItem("oudeZoekopdracht");
        console.log(oudeZoekOpdracht);
        return oudeZoekOpdracht
      }
      else {
        console.log("geen bestaande cookie");
        return
      }
    }
  }


app.init()

})();

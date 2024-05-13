function afficher_nouveau_livre (titre, desc,img_src,isbn) {

    var newBook = document.createElement("div")
    newBook.style.display="flex"
    newBook.style.justifyContent="flex-start"

    var bookImg = document.createElement("div")
    var bookDesc = document.createElement("div")


    var booktitre = document.createElement("p")
    booktitre.style.margin="2px"
    booktitre.innerHTML = titre

    var isbn_livre = document.createElement("a")
    isbn_livre.style.margin="2px"
    isbn_livre.innerHTML = isbn
    let code = String(isbn_livre.innerHTML)
    let url = "/livre/" + code
    isbn_livre.href=url

    var bookDescription = document.createElement("p")
    bookDescription.style.margin="2px"
    bookDescription.innerHTML = desc

    var img = document.createElement("img")
    img.src=img_src;
    img.style.margin="10px"

    bookImg.appendChild(img)

    var titreIsbn = document.createElement("div")
    titreIsbn.style.margin="10px"
    titreIsbn.appendChild(isbn_livre)
    titreIsbn.appendChild(booktitre)

    bookDesc.appendChild(titreIsbn)
    bookDesc.appendChild(bookDescription)


    newBook.appendChild(bookImg)
    newBook.appendChild(bookDesc)


    var container = document.getElementById("Affichage")
    container.appendChild(newBook)
}
function recup_livre_avec_query(query_titre, query_theme, query_edition,
                                query_annee, query_mots_cles, query_auteur) {
    let getUrl = "books?";
    let hasParams = false;

    if (query_titre) {
        getUrl += "titre=" + encodeURIComponent(query_titre);
        hasParams = true;
    }
    if (query_theme) {
        if (hasParams) getUrl += "&";
        getUrl += "theme=" + encodeURIComponent(query_theme);
        hasParams = true;
    }
    if (query_edition) {
        if (hasParams) getUrl += "&";
        getUrl += "edition=" + encodeURIComponent(query_edition);
    }
    if (query_annee) {
        if (hasParams) getUrl += "&";
        getUrl += "annee=" + encodeURIComponent(query_annee);
    }
    if ( query_mots_cles) {
        if (hasParams) getUrl += "&";
        getUrl += "mots_cles=" + encodeURIComponent( query_mots_cles);
    }

    if ( query_auteur) {
        if (hasParams) getUrl += "&";
        getUrl += "auteur=" + encodeURIComponent(query_auteur);
    }



    fetch(getUrl).then(function(response) {
        return response.json()
    }).then(function (data) {
        let books = data.books

        for (let book of books) {
            let titre = book[0]
            let  description = book[1]
            let  img_src = book[2]
            let isbn = book[3]
            afficher_nouveau_livre(titre, description,img_src,isbn)

        }
    })
}

function clique_recherche() {

   var input_titre = document.getElementById('titre')
   var input_theme = document.getElementById('theme')
   var input_edition = document.getElementById('edition')
   var input_annee = document.getElementById('annee')
    var input_mots_cles = document.getElementById('mots-cles')
    var input_auteur = document.getElementById('auteur')
    var search_container = document.getElementById("Affichage")
    search_container.innerHTML =""

    recup_livre_avec_query(input_titre.value, input_theme.value,
        input_edition.value, input_annee.value, input_mots_cles.value, input_auteur.value)

    input_titre.value =""
    input_theme.value =""
    input_edition.value =""
    input_annee.value = ""
    input_mots_cles.value = ""
    input_auteur.value = ""
}

function afficher_catalogue(){
    let getUrl = "catalogue";

     fetch(getUrl).then(function(response) {
        return response.json()
    }).then(function (data) {
        let books = data.books

        for (let book of books) {
            let titre = book[0]
            let  description = book[1]
            let  img_src = book[2]
            let isbn = book[3]
            afficher_nouveau_livre(titre, description,img_src,isbn)

        }


    })
}


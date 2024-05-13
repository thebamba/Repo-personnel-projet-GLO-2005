
function afficher_nouveau_event( nom, description, date_evenement, lieu, n_participants_max ) {
    var new_evenement = document.createElement("div")
    new_evenement.style.display = "inline-block";
    new_evenement.style.margin = "10px";
    new_evenement.style.border = "1px solid #ccc";
    new_evenement.style.padding = "10px";

    var nom_evenement = document.createElement("h3")
    nom_evenement.innerHTML = nom

    var description_evenement = document.createElement("h4")
    description_evenement.innerHTML = description

    var date_event= document.createElement("p")
    date_event.innerHTML= 'Date : ' +date_evenement

    var lieu_evenement = document.createElement("p")
    lieu_evenement.innerHTML= 'Lieu : ' + lieu

    var max_participants= document.createElement("p")
   max_participants.innerHTML = 'Nombre maximum de participants : ' + n_participants_max;

    new_evenement.appendChild(nom_evenement);
    new_evenement.appendChild(description_evenement);
    new_evenement.appendChild(date_event);
    new_evenement.appendChild(lieu_evenement);
    new_evenement.appendChild(max_participants);

     var container = document.getElementById("search-container")
    container.appendChild(new_evenement)
}
function recup_event_avec_query(nom, description_event, date_event) {
    let getUrl =  "get_evenement?"
    let hasParams = false;


    if (nom) {
        getUrl += "nom=" + encodeURIComponent(nom);
        hasParams = true;
    }
    if (description_event) {
        if (hasParams) getUrl += "&";
        getUrl += "description_event=" + encodeURIComponent(description_event);
        hasParams = true;
    }
      if (date_event) {
        if (hasParams) getUrl += "&";
        getUrl += "date_event=" + encodeURIComponent(date_event);
        hasParams = true;
    }


    fetch(getUrl).then(function(response) {
        return response.json()
    }).then(function (data) {
        let evenements = data.evenement;

        for (let evenement of evenements) {
            let nom = evenement [0]
            let description = evenement [1]
            let date_evenement = evenement [2]
            let lieu = evenement [3]
            let participants = evenement [4]

            afficher_nouveau_event(nom,description, date_evenement,
                lieu, participants);
        }

    })
}

function clique_recherche() {
    var input_nom = document.getElementById("nom");

    var input_mots_cles = document.getElementById('description-evenement')

    var input_date = document.getElementById('date-evenement')

    var searchContainer = document.getElementById("search-container")
    searchContainer.innerHTML =""

    recup_event_avec_query(input_nom.value, input_mots_cles.value, input_date.value)

    input_nom.value =""
    input_mots_cles.value=""
    input_date.value=""

}
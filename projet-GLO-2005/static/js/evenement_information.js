offset = 0;
let utilisateur_id = Math.floor(Math.random() * 12) + 1;
let prenom_utilisateur = "";
let nom_utilisateur = "";






function participer_evenement(evenement_id, utilisateur_id){
    postUrl = `${evenement_id}/participer`;
    fetch(postUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            evenement_id: evenement_id
        })
    })
}
function initialisation_evenement(evenement_id, _utilisateur_id) {
    obtenir_information_evenement(evenement_id)
}
function obtenir_information_evenement(evenement_id){
    getUrl = `${evenement_id}/details`;
    fetch(getUrl).then(function (response) {
        return response.json()
    }).then(function (data) {
        if (data.status == 200) {
            afficher_evenement(data);
            console.log(data);
            obtenir_commentaire(evenement_id);
        }
    })
}
function afficher_evenement(informations) {
    let titre_page = document.getElementById("titre_page")
    let evenement_nom = document.getElementById("evenement_nom")
    let evenement_organisateur = document.getElementById("evenement_organisateur")
    let evenement_lieu = document.getElementById("evenement_lieu")
    let evenement_description = document.getElementById("evenement_description")
    let date_evenement = document.getElementById("date_evenement")
    let n_participant = document.getElementById("n_participant")
    let evenement_image = document.getElementById("evenement_image")

    document.getElementById("titre_page").innerText = informations["evenement_id"]
    document.getElementById("evenement_nom").innerText = informations["nom"]
    document.getElementById("evenement_organisateur").innerText = informations["organisateur"]
    document.getElementById("evenement_lieu").innerText = informations["lieu"]
    document.getElementById("evenement_description").innerText = informations["description"]
    document.getElementById("date_evenement").innerText = informations["date_evenement"]
    document.getElementById("n_participant").innerText = `${informations["n_participant"]} / ${informations["n_participants_max"]}`;
    document.getElementById("evenement_image").innerText = informations["lien_image"]

}
async function obtenir_commentaire(isbn, quantite = 5) {
    getUrl = `${isbn}/commentaires?offset=` + offset.toString() + '&quantite=' + quantite.toString();
    fetch(getUrl).then(function (response) {
        return response.json()
    }).then(function (data) {
        if (data.status == 200) {
            afficher_commentaires(data.commentaires);
        }
    })
    return 1;
}
function afficher_commentaires(commentaires) {
    var section_commentaire = document.getElementById("conteneur_commentaire");
    for (let commentaire of commentaires) {
        section_commentaire.appendChild(creer_commentaire(commentaire));
        offset++;
    }
}

/**Crée un commentaire et le retourne*/
function creer_commentaire(p_commentaire) {
    var commentaire = document.createElement("div");
    commentaire.className = "commentaire";
    var nom_complet_commentaire = document.createElement("p");
    nom_complet_commentaire.className = "nom_complet_commentaire";
    nom_complet_commentaire.innerText = `${p_commentaire.prenom} ${p_commentaire.nom}`;

    var contenu_commentaire = document.createElement("p");
    contenu_commentaire.className = "contenu_commentaire";
    contenu_commentaire.innerText = `${p_commentaire.contenu}`;

    commentaire.appendChild(nom_complet_commentaire);
    commentaire.appendChild(contenu_commentaire);

    return commentaire;
}

/** INSERT le commentaire dans la BD */
function envoyer_commentaire(evenement_id) {
    postUrl = `${evenement_id}/commentaires`;
    fetch(postUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            contenu: document.getElementById('ajouter_commentaire').value
        })
    })
    afficher_nouveau_commentaire({
        'prenom': prenom_utilisateur,
        'nom': nom_utilisateur,
        'contenu': document.getElementById('ajouter_commentaire').value
    });

}

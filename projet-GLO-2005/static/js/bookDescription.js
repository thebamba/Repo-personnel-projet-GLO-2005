offset = 0;
let prenom_utilisateur = "";
let nom_utilisateur = "";

function initialisation_livre(isbn, _utilisateur_id) {
    utilisateur_id = _utilisateur_id;
    obtenir_nom_utilisateur(utilisateur_id, isbn)
    //obtenir_livre(isbn)
    //obtenir_commentaire(1)
    //obtenir_commentaire(1);
    /*afficher_livre(isbn);
    afficherCommentaire(isbn);*/

    //initialiser_date(isbn);
}

/**L'utilisateur ne peut pas entrer une date avant celle d'aujourd'hui*/
function initialiser_date(isbn) {
    var aujourdhui_ = new Date()
    var demain_ = new Date(+aujourdhui_ + 86400000);
    var ajourdhui = aujourdhui_.toISOString().split('T')[0];
    var demain = demain_.toISOString().split('T')[0];
    document.getElementsByName("date_debut")[0].setAttribute('min', ajourdhui);
    document.getElementsByName("date_fin")[0].setAttribute('min', demain);
    document.getElementsByName("date_debut")[0].value = ajourdhui;
    document.getElementsByName("date_fin")[0].value = demain;
    obtenir_reservation(isbn)
}

/**GET le nom de l'utilisateur puis l'affiche*/
function obtenir_nom_utilisateur(utilisateur_id, isbn) {
    let url = `/utilisateur/${utilisateur_id}`;
    fetch(url).then(function (response) {
        return response.json()
    }).then(function (data) {
        if (data.status === 200) {
            prenom_utilisateur = data.prenom;
            nom_utilisateur = data.nom;
            document.getElementById("prenom_nom_commentaire").innerText = prenom_utilisateur + ' ' + nom_utilisateur;
            obtenir_livre(isbn);
        }
    })
}

/**Ajouter un thème aimer*/
function ajouter_theme_aimer(theme_id) {
    var theme = document.getElementById(theme_id);
    theme.style.background = "#e3d984";
    theme.onclick = function () {
        retirer_theme_aimer(theme_id)
    };
    t = theme_id.slice(6,theme_id.length)
    postUrl = `/utilisateur/${utilisateur_id}/ajouter_theme_aimer`;
    fetch(postUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            theme_id: t
        })
    });
}

/**Retirer un thème que l'utilisateur n'aime plus*/
function retirer_theme_aimer(theme_id) {
    var theme = document.getElementById(theme_id);
    theme.style.background = "#FFFFFF";
    theme.onclick = function () {
        ajouter_theme_aimer(theme_id)
    };
    t = theme_id.slice(6,theme_id.length)
    postUrl = `/utilisateur/${utilisateur_id}/suprimer_theme_aimer`;
    fetch(postUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            theme_id: t
        })
    });
}


/**Ajouter un thème aimer*/
function ajouter_livre_aimer(isbn) {
    var boutton_aimer_livre = document.getElementById("boutton_aimer_livre");
    boutton_aimer_livre.style.background = "#e3d984";
    boutton_aimer_livre.onclick = function () {
        retirer_livre_aimer(isbn)
    };
    t = isbn
    postUrl = `/utilisateur/${utilisateur_id}/ajouter_livre_aimer`;
    fetch(postUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            isbn: t
        })
    });
}

/**Retirer un thème que l'utilisateur n'aime plus*/
function retirer_livre_aimer(isbn) {
    var boutton_aimer_livre = document.getElementById("boutton_aimer_livre");
    boutton_aimer_livre.style.background = "#FFFFFF";
    boutton_aimer_livre.onclick = function () {
        ajouter_livre_aimer(isbn)
    };
    t = isbn
    postUrl = `/utilisateur/${utilisateur_id}/suprimer_livre_aimer`;
    fetch(postUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            isbn: t
        })
    });
}

/**Affiche les informations à propos du livre*/
function afficher_livre(infos_livre) {
    var titre_page = document.getElementById("titre_page");
    var titre = document.getElementById("titre");
    var auteur = document.getElementById("auteur");
    var edition_annee = document.getElementById("edition_annee");
    var description = document.getElementById("contenu_description");
    var image = document.getElementById("image");
    var themes = document.getElementById("theme");
    var n_exemplaire_disponible = document.getElementById("n_exemplaire_disponible");
    var boutton_aimer_livre = document.getElementById("boutton_aimer_livre");
    let auteurs = infos_livre["auteur"][0]
    if (infos_livre["auteur"].length > 1) {
        for (let i = 1; i < infos_livre["auteur"].length - 1; i++) {
            auteurs = auteurs.concat(", ", infos_livre["auteur"][i]);
        }
        auteurs = auteurs.concat(" et ", infos_livre["auteur"][infos_livre["auteur"].length - 1]);
    }
    for (let i = 0; i < infos_livre["theme"].length; i++) {
        var theme = document.createElement("button");
        theme.className = "themeBoutton";
        theme.innerText = infos_livre["theme"][i]["nom"];
        theme.id = `theme ${infos_livre["theme"][i]["theme_id"]}`;
        theme.onclick = function () {
            ajouter_theme_aimer(`theme ${infos_livre["theme"][i]["theme_id"]}`)
        };
        themes.appendChild(theme);
    }

    boutton_aimer_livre.style.background = "#FFFFFF";
    boutton_aimer_livre.onclick = function () {
        ajouter_livre_aimer(infos_livre['isbn'])
    };

    titre_page.innerText = infos_livre['titre'];
    titre.innerText = infos_livre['titre'];
    auteur.innerText = `Écrit par: ${auteurs}`;
    edition_annee.innerText = `Publié en ${infos_livre["annee_de_parution"]} par ${infos_livre["edition"]}`;
    description.innerText = infos_livre["description"];
    image.src = infos_livre["image"];
    n_exemplaire_disponible.innerText = `${infos_livre["nbExemplaire"]} disponible(s) à la bibliothèque`;
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

/**Affiche un nouveau commentaire en haut des autres commentaire*/
function afficher_nouveau_commentaire(commentaire) {
    var section_commentaire = document.getElementById("conteneur_commentaire");
    section_commentaire.insertBefore(creer_commentaire(commentaire), section_commentaire.firstChild);
    document.getElementById('ajouter_commentaire').value = "";
}

/**Affiche les commentaires reçus en paramètre*/
function afficher_commentaires(commentaires) {
    var section_commentaire = document.getElementById("conteneur_commentaire");
    for (let commentaire of commentaires) {
        section_commentaire.appendChild(creer_commentaire(commentaire));
        offset++;
    }
}

/**GET les informations à propos du livre*/
function obtenir_livre(isbn) {
    getUrl = `${isbn}/details`;
    fetch(getUrl).then(function (response) {
        return response.json()
    }).then(function (data) {
        if (data.status == 200) {
            afficher_livre(data)
            obtenir_commentaire(isbn)
        }
    })
}

/**S'assure de l'intégrité des dates (date fin > date début)*/
function verifier_date(isbn) {
    let date_debut = new Date(document.getElementById("date_debut").value);
    let date_fin = new Date(document.getElementById("date_fin").value);
    if (date_debut > date_fin) {
        alert("La date de fin ne peut pas être avant la date de début!");
        document.getElementById("date_fin").valueAsDate = new Date(+document.getElementById("date_debut").valueAsDate + 86400000)
        obtenir_reservation(isbn)
        return false;
    }
    return true;
}

/**INSERT une réservation après avoir assuré la validité des dates*/
function reserver_livre(isbn,num_livre){
    if (!verifier_date(isbn))
        return;
    let date_debut = document.getElementById("date_debut").value;
    let date_fin = document.getElementById("date_fin").value;
    postUrl = `${isbn}/reserver_exemplaire`;
    fetch(postUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            utilisateur_id: utilisateur_id,
            num_livre: num_livre,
            date_debut : date_debut,
            date_fin : date_fin,
            type_reservation : "reserver"
        })
    });
}

/**Affiche les différents exemplaires du livre qui peuvent être réserver*/
async function obtenir_reservation(isbn) {
    if (!verifier_date(isbn))
        return;
    let date_debut = document.getElementById("date_debut").value;
    let date_fin = document.getElementById("date_fin").value;

    getUrl = `${isbn}/exemplaire_disponible?date_debut=${date_debut}&date_fin=${date_fin}`;
    fetch(getUrl).then(function (response) {
        return response.json()
    }).then(function (data) {
        if (data.status === 200) {
            afficher_exemplaire_disponible(isbn, data.exemplaires);
        }
    })

}

/**Affiche les exemplaires disponibles et supprime les anciens*/
function afficher_exemplaire_disponible(isbn, exemplaires) {
    let conteneur_livre_disponible = document.getElementById("conteneur_livre_disponible")
    while (conteneur_livre_disponible.lastElementChild){
        conteneur_livre_disponible.lastElementChild.remove()
    }
    for (let exemplaire of exemplaires) {
        conteneur_livre_disponible.appendChild(creer_exemplaire(isbn, exemplaire));
    }
    if(exemplaires.length === 0){
        let p =document.createElement("p");
        p.innerText = "Aucun livre disponible"
        conteneur_livre_disponible.appendChild(p)
    }

}

/**Crée un élément exemplaire et le retourne*/
function creer_exemplaire(isbn, exemplaires) {
    var exemplaire = document.createElement("div");
    exemplaire.className = "exemplaire";
    var num_livre = document.createElement("p");
    num_livre.className = "num_livre";
    num_livre.innerText = `Exemplaire ${exemplaires}`;

    var reserver = document.createElement("button");
    reserver.className = "reserver";
    reserver.innerText = `Reserver`;
    reserver.onclick = function(){reserver_livre(isbn, exemplaires)};
    reserver.className = "boutton_bleu";

    exemplaire.appendChild(num_livre);
    exemplaire.appendChild(reserver);

    return exemplaire;

}

/**GET une quantité de commentaire à afficher*/
async function obtenir_commentaire(isbn, quantite = 5) {
    getUrl = `${isbn}/commentaires?offset=` + offset.toString() + '&quantite=' + quantite.toString();
    fetch(getUrl).then(function (response) {
        return response.json()
    }).then(function (data) {
        if (data.status == 200) {
            afficher_commentaires(data.commentaires);
            initialiser_date(isbn);
        }
    })
    return 1;
}

/**INSERT un nouveau commentaire dans la BD*/
function envoyer_commentaire(isbn) {
    postUrl = `${isbn}/commentaires`;
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

// ################
// #    LIVRES    #
// ################

/**
 * Fonction qui envoie les paramètres d'un livre au back
 * @param {Contenue d'une table livre} data 
 */
function maj_table_livre(data) {
    // DEBUG console.log("data", data)
    fetch('/ajouter-livre', {
        method: 'POST',
        body: JSON.stringify({
            isbn: data["isbn"],
            titre: data["titre"],
            description_livre: data["description_livre"],
            annee_de_parution: data["annee_de_parution"],
            edition: data["edition"],
            image_livre: data["image_livre"]
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                console.log('Livre ajouté / modifié !')
                window.location.reload()
            } else {
                console.log('Livre non ajouté / modifié !')
            }
        })
        .catch(error => {
            console.log('error:', error)
        })
}

/**
 * Fonction pour ajouter un livre dans la bdd
 */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('ajouter-livre-form').addEventListener('submit', function (event) {
        event.preventDefault()
        maj_table_livre(
            {
                "isbn": document.getElementById('isbn').value,
                "titre": document.getElementById('titre').value,
                "description_livre": document.getElementById('description_livre').value,
                "annee_de_parution": document.getElementById('annee_de_parution').value,
                "edition": document.getElementById('edition').value,
                "image_livre": document.getElementById('image_livre').value
            }
        )
    })
})

/**
 * Fonction pour modifier un livre dans la bdd
 */
function modifier_livre() {
    var isbn_input = document.getElementById("isbn_input")
    var titre_input = document.getElementById("titre_input")
    var description_input = document.getElementById("description_input")
    var annee_de_parution_input = document.getElementById("annee_de_parution_input")
    var edition_input = document.getElementById("edition_input")
    var image_input = document.getElementById("image_input")

    maj_table_livre(
        {
            "isbn": isbn_input.value,
            "titre": titre_input.value,
            "description_livre": description_input.value,
            "annee_de_parution": annee_de_parution_input.value,
            "edition": edition_input.value,
            "image_livre": image_input.value
        }
    )
}

/**
 * Fonction pour supprimer un livre de la bdd
 */
function supprimer_livre() {
    // recuperer l'ID du livre sélectionné
    var select = document.getElementById("livre-select")
    var titre_isbn = select.options[select.selectedIndex].value
    var parts = titre_isbn.split("-");
    var livre_isbn = parseInt(parts[1].trim())
    // DEBUG console.log('livre_isbn', livre_isbn)

    fetch("/supprimer-livre", {
        method: "DELETE",
        body: JSON.stringify({
            livre_isbn
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.ok) {
            console.error("Livre supprimé !")
            window.location.reload()
        } else {
            console.error("Livre non supprimé !")
        }
    }).catch(error => {
        console.error("erreur:", error)
    });
}

/**
 * Fonction pour mettre à jour si l'utilisateur le modifie
 */
function maj_form_livre() {
    var select = document.getElementById("livre-select")

    // recuperer les infos du livre sélectionné
    var selectedOption = select.options[select.selectedIndex]

    console.log('selectedOption.dataset', selectedOption.dataset)

    // maj le formulaire
    var isbn_input = document.getElementById("isbn_input")
    isbn_input.value = selectedOption.dataset.isbn

    var titre_input = document.getElementById("titre_input")
    titre_input.value = selectedOption.dataset.titre

    var description_input = document.getElementById("description_input")
    description_input.value = selectedOption.dataset.description

    var annee_de_parution_input = document.getElementById("annee_de_parution_input")
    annee_de_parution_input.value = selectedOption.dataset.annee_de_parution

    var edition_input = document.getElementById("edition_input")
    edition_input.value = selectedOption.dataset.edition

    var image_input = document.getElementById("image_input")
    image_input.value = selectedOption.dataset.image_id
}

// ################
// #  EVENEMENTS  #
// ################

/**
 * Fonction qui envoie les paramètres d'un evenement au back
 * @param {Contenue d'une table evenement} data
 */
function maj_table_evenement(data) {
    // DEBUG console.log("data before send", data)
    fetch("/ajouter-event", {
        method: 'POST',
        body: JSON.stringify({
            evenement_id: data["evenement_id"],
            nom: data["nom"],
            description_evenement: data["description_evenement"],
            organisateur: data["organisateur"],
            date_evenement: data["date_evenement"],
            image_evenement: data["image_evenement"],
            n_participants_max: data["n_participants_max"],
            lieu: data["lieu"]
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            console.log('Evenement ajouté / modifié !')
            window.location.reload()
        } else {
            console.log('Evenement non ajouté / modifié !')
        }
    }).catch(error => {
        console.log('error:', error)
    })
}

/**
 * Fonction pour ajouter un evenement dans la bdd
 */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('add-event-form').addEventListener('submit', function (event) {
        event.preventDefault()
        maj_table_evenement({
            "evenement_id": -1,
            "nom": document.getElementById('nom').value,
            "description_evenement": document.getElementById('description_evenement').value,
            "organisateur": document.getElementById('organisateur').value,
            "date_evenement": document.getElementById('date_evenement').value,
            "image_evenement": document.getElementById('image_evenement').value,
            "n_participants_max": document.getElementById('n_participants_max').value,
            "lieu": document.getElementById('lieu').value
        })
    })
})

/**
 * Fonction pour modifier un livre dans la bdd
 */
function modifier_evenement() {
    var evenement_id_input = document.getElementById("evenement_id_input")
    var nom_input = document.getElementById("nom_evenement_input")
    var description_evenement_input = document.getElementById("description_evenement_input")
    var organisateur_input = document.getElementById("organisateur_input")
    var date_evenement_input = document.getElementById("date_evenement_input")
    var image_evenement_input = document.getElementById("image_evenement_input")
    var n_participants_max_input = document.getElementById("n_participants_max_input")
    var lieu_input = document.getElementById("lieu_input")

    maj_table_evenement(
        {
            "evenement_id": evenement_id_input.value,
            "nom": nom_input.value,
            "description_evenement": description_evenement_input.value,
            "organisateur": organisateur_input.value,
            "date_evenement": date_evenement_input.value,
            "image_evenement": image_evenement_input.value,
            "n_participants_max": n_participants_max_input.value,
            "lieu": lieu_input.value
        }
    )
}

/**
 * Fonction pour mettre à jour si l'utilisateur le modifie
 */
function maj_form_evenement() {
    var select = document.getElementById("evenement-select")

    // recuperer les infos du livre sélectionné
    var selectedOption = select.options[select.selectedIndex]

    // maj le formulaire
    var evenement_id_input = document.getElementById("evenement_id_input")
    evenement_id_input.value = selectedOption.dataset.evenement_id

    var nom_evenement_input = document.getElementById("nom_evenement_input")
    nom_evenement_input.value = selectedOption.dataset.nom

    var description_evenement_input = document.getElementById("description_evenement_input")
    description_evenement_input.value = selectedOption.dataset.description

    var organisateur_input = document.getElementById("organisateur_input")
    organisateur_input.value = selectedOption.dataset.organisateur

    var annee_de_parution_input = document.getElementById("annee_de_parution_input")
    annee_de_parution_input.value = selectedOption.dataset.annee_de_parution_input

    var date_evenement_input = document.getElementById("date_evenement_input")
    date_evenement_input.value = selectedOption.dataset.date_evenement

    var image_evenement_input = document.getElementById("image_evenement_input")
    image_evenement_input.value = selectedOption.dataset.image_id

    var n_participants_max_input = document.getElementById("n_participants_max_input")
    n_participants_max_input.value = selectedOption.dataset.image_id

    var lieu_input = document.getElementById("lieu_input")
    lieu_input.value = selectedOption.dataset.lieu
}

/**
 * Fonction pour supprimer un livre de la bdd
 */
function supprimer_evenement() {
    // Récupérer l'ID du livre sélectionné
    var event_id = document.getElementById("evenement_id_input")

    fetch("/supprimer-event", {
        method: "DELETE",
        body: JSON.stringify({
            event_id: event_id.value
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.ok) {
            console.error("Evenement supprimé !")
            window.location.reload()
        } else {
            console.error("Evenement non supprimé !")
        }
    }).catch(error => {
        console.error("erreur:", error)
    });
}
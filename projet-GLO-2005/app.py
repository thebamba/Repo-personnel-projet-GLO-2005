from flask import Flask, render_template, request, jsonify, redirect, session, url_for
import database
import json

app = Flask(__name__, static_url_path='/static')

# app.secret_key = 'BAD_SECRET_KEY'
id_utilisateur = 2



@app.route("/livre/<isbn>/commentaires", methods=["GET", "POST"])
def commentaire_livre(isbn):
    """Gère les commentaires d'un livre"""
    if request.method == 'GET':
        offset = int(request.args.get("offset"))
        quantite = int(request.args.get("quantite"))
        commentaires = database.get_commentaires_livre(isbn, offset, quantite)
        response = {
            "status": 200,
            "commentaires": commentaires
        }
        return jsonify(response)
    else:
        data = request.json
        status = database.insert_commentaire_livre(data["utilisateur_id"], isbn, data["contenu"])
        response = {"status": status}
        return jsonify(response)


@app.route("/livre/<isbn>/details")
def details_livre(isbn):
    """Permet d'obtenir les détails d'un livre"""
    details_livre = database.get_details_livre(isbn)
    status = (200, 400)[details_livre is None]
    response = {
        "status": status
    }
    if status == 200:
        response.update(details_livre)
    return jsonify(response)


@app.route("/livre/<isbn>/exemplaire_disponible")
def exemplaire_disponible(isbn):
    """Permet d'obtenir les exmplaires disponible entre deux dates"""
    date_debut = request.args.get("date_debut")
    date_fin = request.args.get("date_fin")
    exemplaires = database.get_exemplaire_disponible(isbn, date_debut, date_fin)
    response = {
        "status": 200,
        "exemplaires": exemplaires
    }
    return jsonify(response)


@app.route("/livre/<isbn>/reserver_exemplaire", methods=["POST"])
def reserver_exemplaire(isbn):
    """Permet à un utilisateur de réserver un livre"""
    data = request.json
    if(data["date_debut"] > data["date_fin"]):
        status = 400
    else:
        status = database.insert_reservation(isbn, data["utilisateur_id"], data["num_livre"], data["date_debut"], data["date_fin"], data["type_reservation"])
    response = {
        "status": status
    }
    return jsonify(response)


@app.route("/utilisateur/<utilisateur_id>", methods=["GET"])
def infos_utilisateur(utilisateur_id):
    """Permet d'obtenir les informations d'un utilisateur"""
    infos = database.get_infos_utilisateur(utilisateur_id)
    status = (200, 400)[infos is None]
    response = {
        "status": status
    }
    if status == 200:
        response.update(infos)
    return jsonify(response)


@app.route("/utilisateur/<utilisateur_id>/ajouter_theme_aimer", methods=["POST"])
def ajouter_theme_aimer(utilisateur_id):
    """Permet à l'utilisateur d'ajouter un thème qu'il aime"""
    data = request.json
    status = database.insert_aimer_theme(utilisateur_id, data["theme_id"])
    response = {
        "status": status
    }
    return jsonify(response)


@app.route("/utilisateur/<utilisateur_id>/suprimer_theme_aimer", methods=["POST"])
def suprimer_theme_aimer(utilisateur_id):
    """Permet à l'utilisateur de retirer un thème qu'il aimait"""
    data = request.json
    status = database.delete_aimer_theme(utilisateur_id, data["theme_id"])
    response = {
        "status": status
    }
    return jsonify(response)


@app.route("/utilisateur/<utilisateur_id>/ajouter_livre_aimer", methods=["POST"])
def ajouter_livre_aimer(utilisateur_id):
    """Permet à l'utilisateur d'ajouter un livre qu'il aime"""
    data = request.json
    status = database.insert_aimer_livre(utilisateur_id, data["isbn"])
    response = {
        "status": status
    }
    return jsonify(response)


@app.route("/utilisateur/<utilisateur_id>/suprimer_livre_aimer", methods=["POST"])
def suprimer_livre_aimer(utilisateur_id):
    """Permet à l'utilisateur de retirer un livre qu'il aimait"""
    data = request.json
    status = database.delete_aimer_livre(utilisateur_id, data["isbn"])
    response = {
        "status": status
    }
    return jsonify(response)


@app.route("/livre/<isbn>")
def livre(isbn):
    print(id_utilisateur)
    return render_template("bookDescription.html", isbn=isbn, id_utilisateur=id_utilisateur)


###
### ADMIN
###

@app.route('/supprimer-livre', methods=['DELETE'])
def supprimer_livre():
    data = request.json
    r_value = database.delete_livre(data.get("livre_isbn"))
    response = {
        "message": "Livre supprimé !" if r_value == 200 else "Livre non supprimé !",
        "code": r_value
    }
    return jsonify(response)


@app.route('/supprimer-event', methods=['DELETE'])
def supprimer_event():
    data = request.json
    print('route', data.get("event_id"))
    r_value = database.delete_evenement(data.get("event_id"))
    response = {
        "message": "Evenement supprimé !" if r_value == 200 else "Evenement non supprimé !",
        "code": r_value
    }
    return jsonify(response)


@app.route('/ajouter-livre', methods=['POST'])
def add_book():
    data = request.json

    r_value = database.insert_livre({
        "isbn": data.get('isbn'),
        "titre": data.get('titre'),
        "description_livre": data.get('description_livre'),
        "annee_de_parution": data.get('annee_de_parution'),
        "edition": data.get('edition'),
        "image_livre": data.get('image_livre')
    })
    response = {
        "message": "Livre ajouté !" if r_value == 200 else "Livre non ajouté !",
        "code": r_value
    }
    return jsonify(response)


@app.route('/ajouter-event', methods=['POST'])
def add_event():
    data = request.json

    data = {
        "evenement_id": data.get('evenement_id'),
        "nom": data.get('nom'),
        "description_evenement": data.get('description_evenement'),
        "organisateur": data.get('organisateur'),
        "date_evenement": data.get('date_evenement'),
        "image_evenement": data.get('image_evenement'),
        "n_participants_max": data.get('n_participants_max'),
        "lieu": data.get('lieu')
    }
    # print('data route', data)

    r_value = database.insert_event(data)
    response = {
        "message": "Evenement ajouté !" if r_value == 200 else "Evenement non ajouté !",
        "code": r_value
    }
    return jsonify(response)


@app.route('/admin')
def admin():
    livres, r_value_livres = database.get_livre()
    evenements, r_value_evenements = database.get_evenement()
    if r_value_livres == 400:
        livres = []
    if r_value_evenements == 400:
        livres = []
    return render_template("page_admin.html", livres=livres, evenements=evenements)


###
###
###

@app.route("/")
def index():

    return redirect("/connection")
#/page_membre
#/livre/<isbn>
#admin
#/register


@app.route('/connection')
def connection():
    return render_template("connection.html")


@app.route('/register')
def register():
    return render_template("register.html")


@app.route('/books')
def recuperer_livres():
    """Route pour la recherche de livres."""
    titre = request.args.get('titre')
    theme = request.args.get('theme')
    edition = request.args.get('edition')
    annee = request.args.get('annee')
    mot_cles = request.args.get('mots_cles')
    auteur = request.args.get('auteur')

    livres = database.rechercher_livres(query_titre=titre,
                                        query_theme=theme,
                                        query_edition=edition,
                                        query_annee=annee,
                                        query_mots_cles=mot_cles,
                                        query_auteur=auteur)

    return jsonify({"status": 200, "books": livres})


@app.route('/catalogue')
def catalogue():
    livres = database.rechercher_livres()
    return jsonify({"status": 200, "books": livres})


@app.route("/connection/connecter", methods=["POST"])
def connecter():
    email = request.get_json()["email"]
    password = request.get_json()["mot_de_pase"]
    global id_utilisateur
    verification, id_utilisateur,droit_utilisateur = database.verifie_utilisateur(email, password)
    if verification and droit_utilisateur == "employe":
        print(id_utilisateur)
        response = {
            "status": 200,
            "url_connexion": url_for("admin")
        }
    elif verification and droit_utilisateur == "non-membre":
        print(id_utilisateur)
        response = {
            "status": 200,
            "url_connexion": url_for("page_membre")
        }
    elif verification and droit_utilisateur == "membre":
        print(id_utilisateur)
        response = {
            "status": 200,
            "url_connexion": url_for("page_membre")
        }

    return jsonify(response)

@app.route("/inscription", methods=["POST"])
def incription():
    nom = request.get_json()["nom"]
    prenom = request.get_json()["prenom"]
    email = request.get_json()["email"]
    password = request.get_json()["password"]

    database.inserer_utilisateur(nom, prenom, email, password)

    response = {
        "status": 200
    }
    return jsonify(response)


@app.route("/page_membre")
def page_membre():
    return render_template("rechercher-livre.html")


@app.route("/get_evenement")
def get_evenement():
    """Route pour la recherche d'événements."""
    recherche_nom = request.args.get('nom')
    recherche_description = request.args.get('description_event')
    recherche_date = request.args.get('date_event')

    evenement = database.rechercher_evenement(query_nom=recherche_nom, query_description=recherche_description,
                                              query_date_evenement=recherche_date)
    reponse = {
        "status": 200,
        "evenement": evenement
    }
    return jsonify(reponse)
@app.route('/evenement')
def home():
    return render_template('rechercher-evenement.html')




if __name__ == '__main__':
    app.debug = False
    app.run()  # go to http://localhost:5000/ to view the page.

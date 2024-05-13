import os
import pymysql
from dotenv import load_dotenv
from passlib.hash import sha256_crypt

load_dotenv()
connection = pymysql.connect(
    host=os.environ.get("Host"),
    port=int(os.environ.get("Port")),
    user=os.environ.get("User"),
    password=os.environ.get("Password"),
    db=os.environ.get("Database"),
    autocommit=True
)
cursor = connection.cursor()


def get_details_livre(isbn):
    """Obtenir les informations par rapport à un livre.Retourne None si l'isbn ne correspond a auncun livre """
    request = f"SELECT L.isbn, L.titre, L.description, L.annee_de_parution, L.edition, L.image_id FROM livre L WHERE L.isbn = %s"
    cursor.execute(request,(isbn))
    livre = cursor.fetchone()
    if livre is None:
        return None

    request = f"SELECT A.nom FROM auteur A, (SELECT E.auteur_id FROM ecrire E WHERE E.isbn = %s) AS E WHERE A.auteur_id = E.auteur_id"
    cursor.execute(request,(isbn))
    auteurs = [x[0] for x in cursor.fetchall()]

    request = f"SELECT T.nom,T.theme_id FROM theme T, (SELECT E.theme_id FROM est_de_theme E WHERE E.isbn = %s) AS E WHERE T.theme_id = E.theme_id"
    cursor.execute(request,(isbn))
    columns = [col[0] for col in cursor.description]
    themes = [{columns[i]: row[i] for i in range(len(columns))} for row in cursor.fetchall()]

    request = f"SELECT COUNT(*) FROM (SELECT * FROM exemplaire E WHERE E.isbn = %s) AS ED LEFT OUTER JOIN (SELECT * FROM reservation WHERE isbn = %s AND type_reservation = 'emprunter') AS RND ON RND.num_livre = ED.num_livre WHERE RND.reservation_id IS NULL;"
    cursor.execute(request,(isbn,isbn))
    nbExemplaireDisponible = cursor.fetchone()[0]

    if(livre[-1] != None):
        request = f"SELECT I.lien_image FROM image I where I.image_id = {livre[-1]};"
        cursor.execute(request)
        image = cursor.fetchone()[0]
    else:
        image = ""

    details_livre = {
        "isbn": livre[0],
        "titre": livre[1],
        "description": livre[2],
        "annee_de_parution": livre[3].strftime('%Y-%m-%d'),
        "edition": livre[4],
        "auteur": auteurs,
        "theme": themes,
        "image": image,
        "nbExemplaire": nbExemplaireDisponible
    }
    return details_livre

def get_commentaires_livre(isbn, offset=0, limit=5):
    """SELECT les 'limit' premier commentaire avec 'offset' comme point de départ pour le livre isbn. Retourne une liste vide si le livre n'est pas dans la BD'"""
    request = (f"SELECT U.prenom, U.nom, Co.contenu FROM utilisateur U, (SELECT C.utilisateur_id, C.contenu FROM commentaire C WHERE C.isbn = %s ORDER BY C.date_publication DESC LIMIT %s OFFSET %s) as Co WHERE U.utilisateur_id = Co.utilisateur_id;")
    cursor.execute(request,(isbn,limit,offset))
    columns = [col[0] for col in cursor.description]
    commentaires = [{columns[i]: row[i] for i in range(len(columns))} for row in cursor.fetchall()]
    return commentaires

def insert_commentaire_livre(utilisateur_id, isbn, contenu):
    """INSERT le commentaire d'un utilisateur pour un certain livre. Retourne 200 si la requete est valide, 400 sinon"""
    request = (f'''INSERT INTO commentaire (utilisateur_id, isbn, contenu) VALUE (%s,%s,%s);''')
    try:
        cursor.execute(request,(utilisateur_id, isbn, contenu))
        return 200
    except:
        return 400

def get_infos_utilisateur(utilisateur_id):
    """Retourne les informations d'un utilisateur. Retourne None si l'utilisateur n'est pas dans la BD'"""
    request = f"SELECT U.prenom, U.nom FROM utilisateur U WHERE U.utilisateur_id = %s;"
    cursor.execute(request,(utilisateur_id))
    infos = cursor.fetchone()
    if infos is None:
        return None
    request = f"SELECT A.theme_id FROM aimer_theme A WHERE A.utilisateur_id = %s;"
    cursor.execute(request, (utilisateur_id))
    theme_aime = [x[0] for x in cursor.fetchall()]

    request = f"SELECT A.isbn FROM aimer_livre A WHERE A.utilisateur_id = %s;"
    cursor.execute(request, (utilisateur_id))
    livre_aime = [x[0] for x in cursor.fetchall()]

    infos_utilisateur = {
        "prenom": infos[0],
        "nom": infos[1],
        "theme_aime": theme_aime,
        "livre_aime": livre_aime
    }
    return infos_utilisateur

def rechercher_livres(query_titre=None, query_theme=None, query_edition=None, query_annee=None, query_mots_cles=None, query_auteur=None):
    """Construit une requete dynamique pour rechercher des livres dans la base de données."""
    # Début de la requête SQL de base avec une jointure pour inclure l'image du livre.
    requete = "SELECT livre.titre, livre.description, image.lien_image,livre.isbn FROM livre LEFT JOIN image ON livre.image_id = image.image_id WHERE 1=1"

    # Ajout de filtres conditionnels à la requête
    if query_titre:
        requete += f" AND titre LIKE '%{query_titre}%'"
    if query_theme:
        requete += f" AND EXISTS (SELECT 1 FROM est_de_theme WHERE est_de_theme.isbn = livre.isbn AND est_de_theme.theme_id IN (SELECT theme_id FROM theme  WHERE nom LIKE '%{query_theme}%'))"
    if query_auteur:
        requete += f" AND EXISTS (SELECT 1 FROM ecrire JOIN auteur ON ecrire.auteur_id = auteur.auteur_id WHERE ecrire.isbn = livre.isbn AND auteur.nom LIKE '%{query_auteur}%')"
    if query_edition:
        requete += f" AND edition LIKE '%{query_edition}%'"
    if query_annee:
        requete += f" AND annee_de_parution LIKE '%{query_annee}%'"
    if query_mots_cles:
        requete += f" AND description LIKE '%{query_mots_cles}%'"

    cursor.execute(requete)
    return cursor.fetchall()

def hash_mot_de_passe(mot_de_passe):
    return sha256_crypt.hash(mot_de_passe)

def verifie_mot_de_passe(mot_de_passe, actual):
    return sha256_crypt.verify(mot_de_passe, actual)

def inserer_utilisateur(nom,prenom,email, mot_de_passe, date_naissance = "2000-01-01", droit_utilisateur = "non-membre"):
    hashed_mot_de_passe = hash_mot_de_passe(mot_de_passe)
    request = f"INSERT INTO utilisateur (prenom, nom, date_naissance, courriel, mot_de_passe, droit_utilisateur) VALUES (%s,%s,%s,%s,%s,%s)"
    cursor.execute(request,(prenom, nom, date_naissance, email, hashed_mot_de_passe, droit_utilisateur))

def verifie_utilisateur(email, password):
    request = f"""SELECT mot_de_passe,utilisateur_id,droit_utilisateur FROM utilisateur WHERE courriel = %s"""
    cursor.execute(request,(email))

    liste = cursor.fetchall()

    hashed_mot_de_passe,id,type = liste[0][0],liste[0][1],liste[0][2]

    return verifie_mot_de_passe(password,hashed_mot_de_passe),id,type

def get_exemplaire_disponible(isbn, date_debut, date_fin):
    """Retourne le numéro des livres qui sont disponible dans un certain interval de temps. Retourne une liste vide si l'isbn n'est pas dans la BD"""
    request = (f'SELECT dispo.num_livre FROM ((SELECT E.num_livre FROM exemplaire E WHERE E.isbn = %s) AS dispo '
               f'LEFT OUTER JOIN (SELECT DISTINCT R.num_livre FROM reservation R WHERE (r.isbn = %s) '
               f'AND (r.type_reservation NOT LIKE "disponible") '
               f'AND ((GREATEST(r.date_debut, %s) < LEAST(r.date_fin, %s)) OR (r.type_reservation = "emprunter"))) '
               f'AS reserver ON dispo.num_livre = reserver.num_livre) WHERE reserver.num_livre IS NULL;')
    cursor.execute(request,(isbn,isbn,date_debut,date_fin))
    num_livre = [x[0] for x in cursor.fetchall()]
    return num_livre

def insert_reservation(isbn, utilisateur_id, num_livre, date_debut, date_fin, type_reservation):
    """INSERT dans reservation. Retourne 200 si la requête est valide, 400 sinon."""
    request = (f'''INSERT INTO reservation (utilisateur_id, isbn, num_livre,date_debut,date_fin,type_reservation) 
    VALUE (%s,%s,%s,%s,%s,%s);''')
    try:
        cursor.execute(request,(utilisateur_id,isbn,num_livre,date_debut,date_fin,type_reservation))
        return 200
    except:
        return 400


def insert_aimer_theme(utilisateur_id, theme_id):
    """Ajouter un theme qu'un utilisateur aime dans aimer_theme. Retourne 200 si la requête est valide, 400 sinon."""
    request = (f'''INSERT INTO aimer_theme(theme_id, utilisateur_id) VALUE (%s, %s)''')
    try:
        cursor.execute(request,(theme_id,utilisateur_id))
        return 200
    except:
        return 400

def delete_aimer_theme(utilisateur_id, theme_id):
    """Retirer un theme qu'un utilisateur n'aime plus dans aimer_theme. Retourne 200 si la requête est valide, 400 sinon.(ne devrait jamais retourner 400 je pense)"""
    request = (f'''DELETE FROM aimer_theme WHERE utilisateur_id = %s AND theme_id = %s;''')
    try:
        cursor.execute(request,(utilisateur_id,theme_id))
        return 200
    except:
        return 400

def insert_aimer_livre(utilisateur_id, isbn):
    """Ajouter un livre qu'un utilisateur aime dans aimer_livre. Retourne 200 si la requête est valide, 400 sinon."""
    request = (f'''INSERT INTO aimer_livre VALUES (%s, %s)''')
    try:
        cursor.execute(request,(utilisateur_id,isbn))
        return 200
    except:
        return 400

def delete_aimer_livre(utilisateur_id, isbn):
    """Retirer un livre qu'un utilisateur n'aime plus dans aimer_livre. Retourne 200 si la requête est valide, 400 sinon.(ne devrait jamais retourner 400 je pense)"""
    request = (f'''DELETE FROM aimer_livre WHERE utilisateur_id = %s AND isbn = %s''')
    try:
        cursor.execute(request,(utilisateur_id,isbn))
        return 200
    except:
        return 400
        
def rechercher_evenement(query_nom=None, query_description=None,
                          query_date_evenement=None):
    """Construit une requete dynamique pour rechercher les événements dans la base de données."""
    # Construit la requête SQL de base pour récupérer les événements
    requete = ("SELECT nom, description, date_evenement, lieu, n_participants_max FROM evenement WHERE 1=1")

    # Ajoute un filtre sur le nom de l'événement si query_nom est fourni
    if query_nom:
        requete += f" AND nom LIKE '%{query_nom}%'"

    # Ajoute un filtre sur la description de l'événement si query_description est fourni
    if query_description:
        requete += f" AND description LIKE '%{query_description}%'"

    # Ajoute un filtre sur la date de l'événement si query_date_evenement est fourni
    if query_date_evenement:
        requete += f" AND date_evenement LIKE '%{query_date_evenement}%'"

    cursor.execute(requete)
    return cursor.fetchall()

##################
#   ADMIN PART   #
##################

## LIVRE ## 
def get_livre():
    try:
        with connection.cursor() as cursor:
            request = "SELECT * FROM livre"
            cursor.execute(request)
            columns = [col[0] for col in cursor.description]
            livres = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # for i in range(len(livres)):
        #     print('livres', livres[i])
        return livres, 200
    except Exception as e:
        print("Erreur get_livre:", e)
        return {}, 400

def insert_livre(data):
    #? je crois que isbn ne fonctionne pas
    try:
        with connection.cursor() as cursor:
            request = """
                INSERT INTO livre (isbn, titre, description, annee_de_parution, edition, image_id) 
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                isbn = VALUES(isbn),
                titre = VALUES(titre),
                description = VALUES(description),
                annee_de_parution = VALUES(annee_de_parution),
                edition = VALUES(edition),
                image_id = VALUES(image_id)
            """
            cursor.execute(request, (data["isbn"], data["titre"], data["description_livre"], data["annee_de_parution"], data["edition"], data["image_livre"]))
        print("Livre ajouté avec succès à la base de données")
        return 200
    except Exception as e:
        print("Erreur insert_livre:", e)
        return 400

def delete_livre(livre_isbn):
    try:
        print("-----> TRY TO DELETE:", livre_isbn)
        with connection.cursor() as cursor:
            request = "DELETE FROM livre WHERE isbn = %s;"
            cursor.execute(request, livre_isbn)
        print("Livre supprimé avec succès à la base de données")
        return 200
    except Exception as e:
        print("Erreur delete_livre:", e)
        return 400

## EVENT ## 
def insert_event(data):
    try:
        print('insert_event', data)
        with connection.cursor() as cursor:
            if data["evenement_id"] == -1:
                    request = "INSERT INTO evenement (nom, description, organisateur, date_evenement, image_id, n_participants_max, lieu) VALUES (%s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(request, (data["nom"], data["description_evenement"], data["organisateur"], data["date_evenement"], data["image_evenement"], data["n_participants_max"], data["lieu"]))
            else:
                request = """
                    UPDATE evenement
                    SET nom = %s,
                        description = %s,
                        organisateur = %s,
                        date_evenement = %s,
                        image_id = %s,
                        n_participants_max = %s,
                        lieu = %s
                    WHERE evenement_id = %s
                """
                cursor.execute(request, (data["nom"], data["description_evenement"], data["organisateur"], data["date_evenement"], data["image_evenement"], data["n_participants_max"], data["lieu"], data["evenement_id"]))
            print("Evenement modifié avec succès à la base de données")
        return 200
    except Exception as e:
        print("Erreur insert_event:", e)
        return 400

def get_evenement():
    try:
        with connection.cursor() as cursor:
            request = "SELECT * FROM evenement"
            cursor.execute(request)
            columns = [col[0] for col in cursor.description]
            evenements = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return evenements, 200
    except Exception as e:
        print("Erreur get_evenement:", e)
        return {}, 400
    
    
def delete_evenement(evenement_id):
    try:
        print("-----> TRY TO DELETE:", evenement_id)
        with connection.cursor() as cursor:
            request = "DELETE FROM evenement WHERE evenement_id = %s;"
            cursor.execute(request, evenement_id)
        print("Evenement supprimé avec succès à la base de données")
        return 200
    except Exception as e:
        print("Erreur delete_evenement:", e)
        return 400



###
###
###


if __name__ == '__main__':
    # print(get_exemplaire_disponible(1,'''"2003-01-01"''','''"2005-01-15"'''))
    #print(verifie_utilisateur("dev@gmail.com","1234"))
    # print(get_infos_utilisateur(1))
    #insert_evenement("advef","wavae","vefadvef","2023-09-09"," ","23","en enfer")
    #print("hi")
    #inserer_utilisateur("admin","biblio","admin@biblio.com","123","2000-03-03","employe")
    inserer_utilisateur("t", "biblio", "d@d.d", "123", "2000-03-03", "membre")



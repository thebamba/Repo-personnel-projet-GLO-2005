CREATE TABLE image
(
    image_id   INTEGER AUTO_INCREMENT PRIMARY KEY,
    lien_image TEXT(16383) NOT NULL,
    CONSTRAINT image_lien_non_vide CHECK ( lien_image != '' )
);

CREATE TABLE evenement
(
    evenement_id       INTEGER AUTO_INCREMENT PRIMARY KEY,
    nom                VARCHAR(255)  NOT NULL,
    description       VARCHAR(1023) NOT NULL,
    organisateur       VARCHAR(255)  NOT NULL,
    date_evenement     DATETIME          NOT NULL,
    image_id           INTEGER,
    n_participants_max INTEGER       NOT NULL,
    lieu               VARCHAR(255)  NOT NULL,
    FOREIGN KEY (image_id) REFERENCES image (image_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT evenement_nom_non_vide CHECK ( nom != '' ),
    CONSTRAINT evenement_description_non_vide CHECK ( description != '' ),
    CONSTRAINT evenement_organisateur_non_vide CHECK ( organisateur != '' ),
    CONSTRAINT evenement_lieu_non_vide CHECK ( lieu != '' ),
    CONSTRAINT evenement_n_participants_max_non_negatif CHECK ( n_participants_max > 0)
);

CREATE TABLE utilisateur
(
    utilisateur_id    INTEGER AUTO_INCREMENT PRIMARY KEY,
    prenom            VARCHAR(63)                              NOT NULL,
    nom               VARCHAR(63)                              NOT NULL,
    date_naissance    DATE                                     NOT NULL,
    courriel          VARCHAR(63)                              NOT NULL,
    mot_de_passe      VARCHAR(511)                             NOT NULL,
    droit_utilisateur ENUM ('employe', 'membre', 'non-membre') NOT NULL,
    UNIQUE (courriel),
    CONSTRAINT utilisateur_nom_non_vide CHECK ( nom != '' ),
    CONSTRAINT utilisateur_prenom_non_vide CHECK ( prenom != '' ),
    CONSTRAINT utilisateur_courriel_non_vide CHECK ( courriel != '' ),
    CONSTRAINT utilisateur_mot_de_passe_non_vide CHECK ( mot_de_passe != '' )
);

CREATE TABLE theme
(
    theme_id INTEGER AUTO_INCREMENT,
    nom      VARCHAR(63) NOT NULL,
    PRIMARY KEY (theme_id),
    CONSTRAINT theme_nom_non_vide CHECK ( nom != ''),
    UNIQUE (nom)
);

CREATE TABLE livre
(
    isbn              BIGINT PRIMARY KEY,
    titre             VARCHAR(255),
    description       VARCHAR(2047) DEFAULT "Aucune description disponible",
    annee_de_parution DATE,
    edition           VARCHAR(63),
    image_id          INTEGER,
    FOREIGN KEY (image_id) REFERENCES image (image_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT livre_isbn_valide CHECK ( 9799999999999 > isbn AND isbn > 9780000000000),
    CONSTRAINT livre_titre_non_vide CHECK (titre != '' ),
    CONSTRAINT livre_description_non_vide CHECK (description != '' )
);

CREATE TABLE transaction
(
    transaction_id   INTEGER AUTO_INCREMENT PRIMARY KEY,
    montant          DECIMAL(10, 2) NOT NULL,
    date_transaction DATE           NOT NULL,
    utilisateur_id   INTEGER        NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (utilisateur_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE auteur
(
    auteur_id INTEGER AUTO_INCREMENT,
    nom       VARCHAR(63),
    PRIMARY KEY (auteur_id),
    CONSTRAINT auteur_nom_non_vide CHECK ( nom != '' )
);

CREATE TABLE exemplaire
(
    isbn      BIGINT,
    num_livre INTEGER,
    PRIMARY KEY (isbn, num_livre),
    FOREIGN KEY (isbn) REFERENCES livre (isbn) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE participer
(
    participer_id  INTEGER AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL,
    evenement_id   INTEGER NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (utilisateur_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (evenement_id) REFERENCES evenement (evenement_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (utilisateur_id, evenement_id)
);

CREATE TABLE est_de_theme
(
    isbn     BIGINT,
    theme_id INTEGER,
    PRIMARY KEY (isbn, theme_id),
    FOREIGN KEY (theme_id) REFERENCES theme (theme_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (isbn) REFERENCES livre (isbn) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ecrire
(
    auteur_id INTEGER,
    isbn      BIGINT,
    FOREIGN KEY (auteur_id) REFERENCES auteur (auteur_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (isbn) REFERENCES livre (isbn) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (auteur_id, isbn)
);

CREATE TABLE aimer_theme
(
    theme_id       INTEGER,
    utilisateur_id INTEGER,
    PRIMARY KEY (theme_id, utilisateur_id),
    FOREIGN KEY (theme_id) REFERENCES theme (theme_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (utilisateur_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE aimer_livre
(
    utilisateur_id INTEGER,
    isbn           BIGINT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (utilisateur_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (isbn) REFERENCES livre (isbn) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (utilisateur_id, isbn)
);

CREATE TABLE reservation
(
    reservation_id   INTEGER PRIMARY KEY                          NOT NULL AUTO_INCREMENT,
    utilisateur_id   INTEGER                                      NOT NULL,
    isbn             BIGINT                                       NOT NULL,
    num_livre        INTEGER                                      NOT NULL,
    date_debut       DATE                                         NOT NULL,
    date_fin         DATE                                         NOT NULL,
    type_reservation ENUM ('reserver', 'emprunter', 'disponible') NOT NULL,
    FOREIGN KEY (isbn, num_livre) REFERENCES exemplaire (isbn, num_livre) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (utilisateur_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT reservation_date_valide CHECK ( date_debut < date_fin )
);

CREATE TABLE commentaire
(
    commentaire_id   INTEGER PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id   INTEGER       NOT NULL,
    evenement_id     INTEGER,
    isbn             BIGINT,
    contenu          VARCHAR(1023) NOT NULL,
    date_publication DATETIME DEFAULT (CURRENT_TIMESTAMP),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (utilisateur_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (evenement_id) REFERENCES evenement (evenement_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (isbn) REFERENCES livre (isbn) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT commentaire_contenu_non_vide CHECK ( contenu != '' )
);

DELIMITER //
CREATE FUNCTION exemplaire_est_disponible(isbn_ BIGINT, num_livre_ INTEGER, date_debut_ DATE,
                                          date_fin_ DATE) RETURNS INTEGER
    DETERMINISTIC
BEGIN
    IF ((SELECT COUNT(*)
        FROM reservation R
        WHERE (R.isbn = isbn_)
          AND (R.num_livre = num_livre_)
          AND (R.type_reservation NOT LIKE "disponible")
          AND ((R.date_debut BETWEEN date_debut_ AND date_fin_)
          OR (R.date_fin BETWEEN date_debut_ AND date_fin_)
          OR ( date_debut_ BETWEEN R.date_debut AND R.date_fin))) > 0)
    THEN
        RETURN 0;
    ELSE
        RETURN 1;
    END IF;
END //
DELIMITER ;
DELIMITER //
CREATE PROCEDURE alonger_reservation(IN reservation_id_ integer, IN date_fin_ date)
BEGIN
    DECLARE isbn_ BIGINT;
    DECLARE num_livre_ INTEGER;
    DECLARE date_debut_ DATE;
    IF ((SELECT COUNT(*) FROM reservation R WHERE R.reservation_id = reservation_id_) != 1)
    THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = "La réservation n'existe pas!";
    END IF;
    SELECT R.isbn, R.num_livre, R.date_fin
    INTO isbn_,num_livre_,date_debut_
    FROM reservation R
    WHERE R.reservation_id = reservation_id_;
    IF (exemplaire_est_disponible(isbn_, num_livre_, DATE_ADD(date_debut_,INTERVAL 1 DAY), date_fin_) = 0)
    THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = "Le livre n'est pas disponible.";
    END IF;
    UPDATE
        reservation R
    SET R.date_fin = date_fin_
    WHERE R.reservation_id = reservation_id_;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE charger_retard()
BEGIN
    DECLARE u_id INTEGER;
    DECLARE prix_retard INTEGER DEFAULT 5;
    DECLARE lecture_complete integer DEFAULT FALSE;
    DECLARE curseur CURSOR FOR SELECT R.utilisateur_id
                               FROM reservation R
                               WHERE R.date_fin < CURDATE()
                                 AND R.type_reservation = 'emprunter';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET lecture_complete = TRUE;
    OPEN curseur;
    lecteur:
    LOOP
        FETCH curseur INTO u_id;
        IF lecture_complete THEN
            LEAVE lecteur;
        END IF;
        INSERT INTO transaction(montant, date_transaction, utilisateur_id) VALUE (prix_retard, CURDATE(), u_id);
    END LOOP lecteur;
    CLOSE curseur;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER valider_reservation
    BEFORE INSERT
    ON reservation
    FOR EACH ROW
BEGIN
    IF (exemplaire_est_disponible(NEW.isbn, NEW.num_livre, NEW.date_debut, NEW.date_fin) = 0)
    THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = "Le livre n'est pas disponible";
    END IF;
END //
DELIMITER ;

INSERT INTO evenement (nom, description, organisateur, date_evenement, image_id, n_participants_max, lieu)
VALUES
("Conférence Tech", "Conférence sur les nouvelles technologies", "TechWorld", '2024-06-15 09:00:00', 1, 150, "Palais des Congrès"),

("Festival de Musique", "Festival annuel de musique avec divers artistes", "Musique Plus", '2024-07-12 14:00:00', 1, 3000, "Parc de la Musique"),

("Tournoi d'échecs", "Compétition régionale d'échecs", "ChessClub", '2024-08-23 11:30:00', 1, 100, "Centre Communautaire");

DELIMITER //
CREATE TRIGGER valider_participer
    BEFORE INSERT
    ON participer
    FOR EACH ROW
BEGIN
    IF (((SELECT COUNT(*) FROM participer P WHERE P.evenement_id = NEW.evenement_id) + 1) >
        (SELECT E.n_participants_max FROM evenement E WHERE E.evenement_id = NEW.evenement_id LIMIT 1))
    THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = "L'événement est complet";
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER valider_commentaire
    BEFORE INSERT
    ON commentaire
    FOR EACH ROW
BEGIN
    IF (NEW.evenement_id IS NULL AND NEW.isbn IS NULL)
    THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Le commentaire doit référencer un livre ou un événement.';
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER solde_vide_avant_supression
    BEFORE DELETE
    ON utilisateur
    FOR EACH ROW
BEGIN
    IF (SELECT SUM(T.montant) FROM transaction T WHERE T.utilisateur_id = OLD.utilisateur_id) <> 0
    THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = "Le solde de l'utilisateur doit être à 0 avant la supression de l'utilisateur";
    END IF;
END //
DELIMITER ;
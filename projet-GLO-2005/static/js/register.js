document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('inscription-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Empêcher le comportement par défaut du formulaire

        var nom = document.getElementById('nom').value;
        var prenom = document.getElementById('prenom').value;
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/inscription', true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                alert('Compte créé avec succès!');
                window.location.href = '/page_membre'; //! Rediriger vers la page d'accueil
            } else {
                alert('Erreur lors de la création du compte. Veuillez réessayer.');
            }
        };

        xhr.onerror = function() {
            alert('Erreur réseau lors de la création du compte. Veuillez réessayer.');
        };

        xhr.send(JSON.stringify({
            nom: nom,
            prenom: prenom,
            email: email,
            password: password
        }));



    });
});


function inserer_utilisateur(){
    postUrl = "connection/connecter"
    fetch(postUrl, {
        method: "POST",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify({
            email : document.getElementById('email').value,
            mot_de_pase : document.getElementById('password').value
        })
    }).then(function (reponse){
        return reponse.json();
    }).then(function (data){
        window.location.href = data.url_connexion;
    }).catch(()=>{
        alert('Mauvias mot de passe ou email');
    })

}

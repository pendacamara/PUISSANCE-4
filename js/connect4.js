// Classe représentant chaque joueur
class Joueur {
    constructor(id, couleur, nom) {
        this.id = id;
        this.couleur = couleur; 
        this.nom = nom; 
    }
}

// Classe représentant chaque cellule de la grille
class Cellule {
    constructor(x, y) {
        this.x = x; 
        this.y = y; 
        this.etat = 'VIDE';
    }
}

// Classe  représentant la grille du jeu
class Grille {
    constructor(lignes, colonnes) {
        this.lignes = lignes; // Nbr de lignes de la grille
        this.colonnes = colonnes; // Nbr de colonnes de la grille
        this.cellules = []; // Tableau de cellules
        for (let y = 0; y < lignes; y++) {
            let ligne = [];
            for (let x = 0; x < colonnes; x++) {
                ligne.push(new Cellule(x, y)); // Création des cellules
            }
            this.cellules.push(ligne);
        }
    }
}

// Classe  pour gérer les scores des joueurs
class Score {
    constructor() {
        this.scores = { 1: 0, 2: 0 }; // Initialisation des scores des joueurs
    }

    ajouterPoint(joueurId) {
        this.scores[joueurId]++;
    }

    obtenirScores() {
        return this.scores;
    }
}

// Classe représentant le jeu de Puissance 4
class Jeu {
    constructor(options) {
        this.joueurs = [
            new Joueur(1, options.couleurs[0], options.noms[0]),
            new Joueur(2, options.couleurs[1], options.noms[1])
        ];
        this.joueurCourant = this.joueurs[0]; // Joueur courant
        this.grille = new Grille(options.lignes, options.colonnes); // Grille du jeu
        this.scores = new Score(); // Scores
        this.creerGrilleHTML(); // Création de la grille HTML
    }

    creerGrilleHTML() {
        const container = document.getElementById('connect4-container');
        container.style.setProperty('--cols', this.grille.colonnes);
        container.style.setProperty('--rows', this.grille.lignes);
        container.innerHTML = ''; // Vider la grille HTML
        this.grille.cellules.forEach(ligne => {
            ligne.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                cellDiv.dataset.x = cell.x;
                cellDiv.dataset.y = cell.y;
                cellDiv.addEventListener('click', () => this.jouerPion(cell.x));
                container.appendChild(cellDiv);
            });
        });
        this.mettreAJourGrille();
        this.afficherJoueurCourant();
        this.afficherScores();
    }

    jouerPion(colonne) {
        for (let y = this.grille.lignes - 1; y >= 0; y--) {
            if (this.grille.cellules[y][colonne].etat === 'VIDE') {
                this.grille.cellules[y][colonne].etat = this.joueurCourant.id;
                this.mettreAJourGrille();
                setTimeout(() => {
                    if (this.verifierVictoire(colonne, y)) {
                        alert(this.joueurCourant.nom + ' (' + this.joueurCourant.couleur + ') gagne !');
                        this.scores.ajouterPoint(this.joueurCourant.id);
                        this.resetJeu();
                    } else if (this.grille.cellules.flat().every(cell => cell.etat !== 'VIDE')) {
                        alert('Match nul !');
                        this.resetJeu();
                    } else {
                        this.changerJoueur();
                    }
                }, 100);
                break;
            }
        }
    }

    changerJoueur() {
        this.joueurCourant = this.joueurCourant.id === 1 ? this.joueurs[1] : this.joueurs[0];
        this.afficherJoueurCourant();
    }

    verifierVictoire(x, y) {
        const directions = [
            { x: 0, y: 1 }, // Vertical
            { x: 1, y: 0 }, // Horizontal
            { x: 1, y: 1 }, // Diagonale 
            { x: 1, y: -1 } // Diagonale dans l'autre sens
        ];

        for (let { x: dx, y: dy } of directions) {
            let count = 1;
            for (let i = 1; i < 4; i++) {
                const newX = x + i * dx;
                const newY = y + i * dy;
                if (this.grille.cellules[newY]?.[newX]?.etat === this.joueurCourant.id) {
                    count++;
                } else {
                    break;
                }
            }
            for (let i = 1; i < 4; i++) {
                const newX = x - i * dx;
                const newY = y - i * dy;
                if (this.grille.cellules[newY]?.[newX]?.etat === this.joueurCourant.id) {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 4) {
                return true;
            }
        }
        return false;
    }

    resetJeu() {
        this.grille.cellules.forEach(ligne => ligne.forEach(cell => (cell.etat = 'VIDE')));
        this.mettreAJourGrille();
        this.joueurCourant = this.joueurs[0];
        this.afficherJoueurCourant();
        this.afficherScores();
    }

    mettreAJourGrille() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cellDiv => {
            const x = parseInt(cellDiv.dataset.x);
            const y = parseInt(cellDiv.dataset.y);
            cellDiv.className = 'cell';
            if (this.grille.cellules[y][x].etat !== 'VIDE') {
                const joueur = this.joueurs.find(j => j.id === this.grille.cellules[y][x].etat);
                cellDiv.classList.add(joueur.couleur);
            }
        });
    }

    afficherJoueurCourant() {
        const joueurCourantDiv = document.getElementById('joueur-courant');
        if (!joueurCourantDiv) {
            const div = document.createElement('div');
            div.id = 'joueur-courant';
            div.innerHTML = 'C\'est au tour de ' + this.joueurCourant.nom + ' (' + this.joueurCourant.couleur + ')';
            document.body.appendChild(div);
        } else {
            joueurCourantDiv.innerHTML = 'C\'est au tour de ' + this.joueurCourant.nom + ' (' + this.joueurCourant.couleur + ')';
        }
    }

    afficherScores() {
        const scoresDiv = document.getElementById('scores');
        const scores = this.scores.obtenirScores();
        if (!scoresDiv) {
            const div = document.createElement('div');
            div.id = 'scores';
            div.innerHTML = 'Scores - ' + this.joueurs[0].nom + ' (' + this.joueurs[0].couleur + ') : ' + scores[1] + ' | ' + this.joueurs[1].nom + ' (' + this.joueurs[1].couleur + ') : ' + scores[2];
            document.body.appendChild(div);
        } else {
            scoresDiv.innerHTML = 'Scores - ' + this.joueurs[0].nom + ' (' + this.joueurs[0].couleur + ') : ' + scores[1] + ' | ' + this.joueurs[1].nom + ' (' + this.joueurs[1].couleur + ') : ' + scores[2];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let jeu;

    document.getElementById('start-game').addEventListener('click', () => {
        const nbJoueurs = parseInt(document.getElementById('nb-joueurs').value); // Récupère le nombre de joueurs
        const noms = [];
        const couleurs = [];

        for (let i = 1; i <= nbJoueurs; i++) {
            const nom = document.getElementById('player' + i + '-name').value || 'Joueur ' + i;
const couleur = document.getElementById('player' + i + '-color').value;

            noms.push(nom);
            couleurs.push(couleur);
        }

        if (new Set(couleurs).size !== couleurs.length) {
            alert("Chaque joueur doit choisir une couleur différente !");
            return;
        }

        const lignes = parseInt(document.getElementById('lignes').value) || 6;
        const colonnes = parseInt(document.getElementById('colonnes').value) || 7;

        if (jeu) {
            document.getElementById('connect4-container').innerHTML = '';
            document.getElementById('joueur-courant').innerHTML = '';
            document.getElementById('scores').innerHTML = '';
        }

        jeu = new Jeu({
            lignes,
            colonnes,
            couleurs,
            noms
        });
    });
});


// Gestion du DOM et démarrage du jeu
document.addEventListener('DOMContentLoaded', () => {
    let jeu;

    document.getElementById('start-game').addEventListener('click', () => {
        const player1Name = document.getElementById('player1-name').value || 'Joueur 1';
        const player2Name = document.getElementById('player2-name').value || 'Joueur 2';
        const player1Color = document.getElementById('player1-color').value;
        const player2Color = document.getElementById('player2-color').value;

        if (player1Color === player2Color) {
            alert('Les deux joueurs ne peuvent pas avoir la même couleur !');
            return;
        }

        const lignes = parseInt(document.getElementById('lignes').value) || 6;
        const colonnes = parseInt(document.getElementById('colonnes').value) || 7;

        if (jeu) {
            document.getElementById('connect4-container').innerHTML = '';
            document.getElementById('joueur-courant').innerHTML = '';
            document.getElementById('scores').innerHTML = '';
        }

        jeu = new Jeu({
            lignes,
            colonnes,
            couleurs: [player1Color, player2Color],
            noms: [player1Name, player2Name]
        });
    });
});
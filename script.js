// Configuration
const ROBLOX_GAME_ID = '113587492149668';
const API_TIMEOUT = 5000;
const ROBLOX_GAME_URL = 'https://www.roblox.com/fr/games/113587492149668/Island-Survie';

// Variables globales
let gameConfig = null;
let evenementsEnCours = [];

// Charger la configuration du jeu
async function chargerConfiguration() {
    try {
        const response = await fetch('./game-config.json');
        if (response.ok) {
            gameConfig = await response.json();
            console.log('Configuration chargée:', gameConfig);
            return gameConfig;
        }
    } catch (error) {
        console.log('Impossible de charger la configuration:', error);
    }
    return null;
}

// Données statistiques de test (fallback)
const statsParDefaut = {
    joueursConnectes: '?',
    noteJeu: '?',
    visitesTotales: '?',
    joueursFavoris: '?'
};

// Fonction pour charger les données du jeu via l'API Roblox
async function chargerDonneesJeu() {
    try {
        console.log('🎮 Récupération des données réelles du jeu Roblox...');
        
        // Essayer d'utiliser l'API officielle Roblox v2
        const response = await fetch(
            `https://games.roblox.com/v2/universes/${ROBLOX_GAME_ID}/places?sortOrder=Asc&limit=1`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );
        
        if (response.ok) {
            const placeData = await response.json();
            console.log('Données du lieu:', placeData);
            
            // Maintenant récupérer les statistiques du game
            const gameResponse = await fetch(
                `https://games.roblox.com/v1/games?universeIds=${ROBLOX_GAME_ID}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0'
                    }
                }
            );
            
            if (gameResponse.ok) {
                const gameData = await gameResponse.json();
                console.log('✅ Données réelles du jeu reçues:', gameData);
                
                if (gameData.data && gameData.data.length > 0) {
                    mettreAJourStatistiques(gameData.data[0]);
                    chargerEvenementsDynamiques();
                    return;
                }
            }
        }
        
        throw new Error('Impossible de récupérer les données API');
        
    } catch (error) {
        console.warn('⚠️ Erreur API, essai de la méthode alternative...', error);
        
        // Méthode alternative: utiliser un service proxy public
        try {
            const proxyResponse = await fetch(
                `https://api.roblox.com/universes/get-universe-containing-place?placeId=${ROBLOX_GAME_ID}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                }
            );
            
            if (proxyResponse.ok) {
                const universeData = await proxyResponse.json();
                console.log('Données univers:', universeData);
                
                // Récupérer avec l'ID univers
                const gameResponse = await fetch(
                    `https://games.roblox.com/v1/games?universeIds=${universeData.id}`,
                    {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    }
                );
                
                if (gameResponse.ok) {
                    const gameData = await gameResponse.json();
                    if (gameData.data && gameData.data.length > 0) {
                        mettreAJourStatistiques(gameData.data[0]);
                        chargerEvenementsParDefaut();
                        return;
                    }
                }
            }
        } catch (altError) {
            console.error('Erreur méthode alternative:', altError);
        }
        
        console.log('❌ Impossible de récupérer les données réelles');
        mettreAJourStatistiques(statsParDefaut);
        chargerEvenementsParDefaut();
    }
}

// Fonction pour mettre à jour les statistiques avec les vraies données
function mettreAJourStatistiques(donnees) {
    console.log('📊 Mise à jour des statistiques avec les données réelles:', donnees);
    
    // Nombre de joueurs connectés
    const joueursElement = document.getElementById('joueurs-connectes');
    let joueursCount = donnees.playing || donnees.Playing || donnees.currentPlayers || '?';
    joueursCount = parseInt(joueursCount) || '?';
    const joueursText = joueursCount === '?' ? '? 👥' : `${joueursCount.toLocaleString('fr-FR')} 👥`;
    joueursElement.textContent = joueursText;
    console.log('Joueurs connectés:', joueursText);

    // Note du jeu
    const noteElement = document.getElementById('note-jeu');
    let note = donnees.rating || donnees.Rating || donnees.averageRating || '?';
    note = parseFloat(note) || '?';
    const noteText = note === '?' ? '? ⭐' : `${note.toFixed(1)}/5 ⭐`;
    noteElement.textContent = noteText;
    console.log('Note du jeu:', noteText);

    // Visites totales
    const visitesElement = document.getElementById('visites-total');
    let visites = donnees.visits || donnees.Visits || donnees.totalVisits || donnees.visitCount || '?';
    visites = parseInt(visites) || '?';
    const visitesText = visites === '?' ? '? 🎮' : `${visites.toLocaleString('fr-FR')} 🎮`;
    visitesElement.textContent = visitesText;
    console.log('Visites totales:', visitesText);

    // Joueurs favoris
    const favorisElement = document.getElementById('joueurs-favoris');
    let favoris = donnees.favoritedCount || donnees.FavoritedCount || donnees.favoriteCount || donnees.favorites || '?';
    favoris = parseInt(favoris) || '?';
    const favorisText = favoris === '?' ? '? ❤️' : `${favoris.toLocaleString('fr-FR')} ❤️`;
    favorisElement.textContent = favorisText;
    console.log('Favoris:', favorisText);
}

// Fonction pour charger les événements dynamiquement depuis le jeu Roblox
async function chargerEvenementsDynamiques() {
    try {
        console.log('🎉 Récupération des événements RÉELS depuis Roblox...');
        console.log('🔗 Lien du jeu:', ROBLOX_GAME_URL);
        
        // Essayer de récupérer les données du jeu Roblox pour vérifier les événements
        // Utiliser l'API Roblox pour obtenir les infos complètes
        const response = await fetch(
            `https://games.roblox.com/v1/games?universeIds=${ROBLOX_GAME_ID}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );
        
        if (response.ok) {
            const gameData = await response.json();
            console.log('✅ Données du jeu récupérées:', gameData);
            
            if (gameData.data && gameData.data.length > 0) {
                const game = gameData.data[0];
                
                // Générer les événements en fonction des données du jeu
                const evenementsReels = genererEvenementsReels(game);
                console.log(`🎯 ${evenementsReels.length} événements générés depuis les données réelles du jeu`);
                chargerEvenements(evenementsReels);
                return;
            }
        }
        
        throw new Error('Impossible de récupérer les données du jeu');
        
    } catch (error) {
        console.log('⚠️ Impossible de récupérer les événements en direct depuis Roblox:', error.message);
        console.log('📋 Utilisation des événements configurés...');
        chargerEvenementsParDefaut();
    }
}

// Fonction pour générer les événements réels basés sur les données du jeu
function genererEvenementsReels(gameData) {
    console.log('📊 Génération des événements en fonction des données du jeu...');
    
    // Créer des événements basés sur les statistiques réelles du jeu
    const evenementsReels = [
        {
            titre: `🎮 ${gameData.name || 'Island Survie'} - Actuellement en ligne`,
            description: `${gameData.playing || '?'} joueurs sont actuellement en train de jouer! Rejoignez-les maintenant pour une aventure épique!`,
            date: new Date().toLocaleDateString('fr-FR'),
            icone: "🔴",
            statut: "EN DIRECT"
        },
        {
            titre: "🏝️ Accès Illimité à l'Île",
            description: "Explorez l'île complète avec tous ses secrets. Aucune limitation, aucune restriction - la liberté totale!",
            date: "Permanent",
            icone: "🗺️",
            statut: "DISPONIBLE"
        },
        {
            titre: "⭐ Jeu Hautement Noté",
            description: `Note du jeu: ${gameData.rating ? gameData.rating.toFixed(1) : '?'}/5 ⭐ - Rejoignez les milliers de joueurs satisfaits!`,
            date: "En cours",
            icone: "⭐",
            statut: "EN DIRECT"
        },
        {
            titre: "👥 Communauté Active",
            description: `${gameData.visits ? (gameData.visits.toLocaleString('fr-FR')) : '?'} visites totales! Une communauté grandissante et passionnée!`,
            date: "Tous les jours",
            icone: "👥",
            statut: "EN COURS"
        },
        {
            titre: "❤️ Mis en Favoris par des Milliers",
            description: `${gameData.favoritedCount ? gameData.favoritedCount.toLocaleString('fr-FR') : '?'} joueurs ont ajouté ce jeu à leurs favoris. Soyez du côté gagnant!`,
            date: "Depuis le lancement",
            icone: "❤️",
            statut: "NOUVEAU"
        }
    ];
    
    // Ajouter les événements configurés si disponibles
    if (gameConfig && gameConfig.events && gameConfig.events.length > 0) {
        console.log('✅ Événements personnalisés trouvés dans la configuration');
        evenementsReels.push(...gameConfig.events);
    }
    
    return evenementsReels;
}

// Fonction pour charger les événements par défaut depuis la configuration
function chargerEvenementsParDefaut() {
    if (gameConfig && gameConfig.events && gameConfig.events.length > 0) {
        console.log('📌 Chargement des événements depuis la configuration:', gameConfig.events.length, 'événements');
        chargerEvenements(gameConfig.events);
    } else {
        console.log('⚠️ Aucune configuration d\'événements trouvée, création d\'événements par défaut...');
        const evenementsParDefaut = [
            {
                titre: "🎮 Événement Island Survie - Semaine de l'Extrême",
                description: "Rejoignez-nous pour une semaine époustouflante de survie extrême! Défiez vos amis et gagnez des récompenses exclusives.",
                date: new Date().toLocaleDateString('fr-FR'),
                icone: "⚡",
                statut: "EN DIRECT"
            },
            {
                titre: "🏆 Défi de Construction Hebdomadaire",
                description: "Construisez le plus impressionnant abri sur l'île. Les 5 meilleures créations remportent des bonus spéciaux!",
                date: "Cette semaine",
                icone: "🏗️",
                statut: "EN COURS"
            },
            {
                titre: "🗺️ Quête de l'Île Mystérieuse",
                description: "Explorez tous les coins cachés de l'île et trouvez les artefacts légendaires pour débloquer le trésor ultime.",
                date: "Permanent",
                icone: "🗝️",
                statut: "DISPONIBLE"
            },
            {
                titre: "👥 Compétition Multijoueur - Bataille Royale",
                description: "Affrontez jusqu'à 100 joueurs dans une bataille épique pour devenir le dernier survivant de l'île!",
                date: "Quotidien",
                icone: "🏆",
                statut: "EN DIRECT"
            }
        ];
        
        chargerEvenements(evenementsParDefaut);
    }
}

// Fonction pour charger et afficher les événements
function chargerEvenements(evenements) {
    const container = document.getElementById('events-container');
    container.innerHTML = '';

    if (!evenements || evenements.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">Aucun événement disponible pour le moment.</p>';
        return;
    }

    console.log(`🎉 Affichage de ${evenements.length} événements`);

    evenements.forEach((event, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        // Déterminer la couleur du badge en fonction du statut
        let badgeClass = 'event-badge';
        if (event.statut === 'EN DIRECT' || event.statut === 'NOUVEAU') {
            badgeClass += ' badge-active';
        } else if (event.statut === 'EN COURS') {
            badgeClass += ' badge-pending';
        } else {
            badgeClass += ' badge-available';
        }
        
        // Formater la date si elle existe
        let dateText = event.date || 'À venir';
        if (event.endDate) {
            const endDate = new Date(event.endDate);
            dateText += ` (Fin: ${endDate.toLocaleDateString('fr-FR')})`;
        }
        
        eventCard.innerHTML = `
            <div class="event-header">
                <div class="event-title">
                    <span class="event-icon">${event.icone}</span>
                    <h3>${event.titre}</h3>
                </div>
                <span class="${badgeClass}">${event.statut}</span>
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-footer">
                <span class="event-date">📅 ${dateText}</span>
                <a href="${ROBLOX_GAME_URL}" target="_blank" class="btn-event-play">Jouer Maintenant</a>
            </div>
        `;
        container.appendChild(eventCard);
        
        console.log(`  ✓ Événement ${index + 1}: ${event.titre}`);
    });
}

// Fonction pour charger la galerie d'images
async function chargerGalerie() {
    try {
        console.log('Chargement de la galerie du jeu...');
        
        const response = await fetch(`https://games.roblox.com/v1/games/${ROBLOX_GAME_ID}/media`);
        
        if (response.ok) {
            const mediaData = await response.json();
            console.log('Données média:', mediaData);
            
            if (mediaData.data && mediaData.data.length > 0) {
                afficherGalerie(mediaData.data);
            } else {
                afficherGalerieParDefaut();
            }
        } else {
            afficherGalerieParDefaut();
        }
    } catch (error) {
        console.log('Erreur lors du chargement de la galerie:', error);
        afficherGalerieParDefaut();
    }
}

// Fonction pour afficher la galerie avec les images
function afficherGalerie(media) {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';

    // Limiter à 6 images maximum
    const images = media.slice(0, 6);
    
    images.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${item.imageUrl}" alt="Capture d'écran Island Survie ${index + 1}" loading="lazy">
            <div class="gallery-item-overlay">
                <h4>Island Survie</h4>
                <p>Cliquez pour voir sur Roblox</p>
            </div>
        `;
        
        galleryItem.addEventListener('click', () => {
            window.open(ROBLOX_GAME_URL, '_blank');
        });
        
        container.appendChild(galleryItem);
    });
}

// Fonction pour afficher la galerie par défaut
function afficherGalerieParDefaut() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';

    let gallerieParDefaut = [
        {
            titre: 'Île Tropicale',
            description: 'Découvrez le magnifique paysage de l\'île',
            icone: '🏝️'
        },
        {
            titre: 'Construction',
            description: 'Construisez votre propre abri',
            icone: '🏗️'
        },
        {
            titre: 'Aventure',
            description: 'Explorez les mystères de l\'île',
            icone: '🗺️'
        },
        {
            titre: 'Multijoueur',
            description: 'Jouez avec vos amis',
            icone: '👥'
        },
        {
            titre: 'Récompenses',
            description: 'Gagnez des récompenses exclusives',
            icone: '🎁'
        },
        {
            titre: 'Défis',
            description: 'Relevez des défis époustouflants',
            icone: '⚡'
        }
    ];

    // Utiliser les données de configuration si disponibles
    if (gameConfig && gameConfig.gallery) {
        gallerieParDefaut = gameConfig.gallery;
    }

    gallerieParDefaut.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        // Utiliser la couleur de la configuration ou générer une couleur
        const color = item.color || `hsl(${index * 60}, 70%, 60%)`;
        galleryItem.style.background = `linear-gradient(135deg, ${color}, hsl(${index * 60 + 30}, 70%, 60%))`;
        galleryItem.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${item.icone}</div>
                <h4 style="margin: 0; font-size: 1.3rem;">${item.titre}</h4>
                <p style="margin-top: 0.5rem; opacity: 0.9; font-size: 0.9rem;">${item.description}</p>
            </div>
        `;
        
        galleryItem.addEventListener('click', () => {
            window.open(ROBLOX_GAME_URL, '_blank');
        });
        
        container.appendChild(galleryItem);
    });
}

// Fonction pour rafraîchir les données périodiquement
function configurerRafraichissement() {
    // Rafraîchir les données tous les 5 minutes
    setInterval(() => {
        console.log('Rafraîchissement des données...');
        chargerDonneesJeu();
    }, 5 * 60 * 1000);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏝️ Initialisation du site Island Survie...');
    console.log('📋 Étape 1: Chargement de la configuration...');
    
    // Charger la configuration d'abord
    gameConfig = await chargerConfiguration();
    console.log('📋 Étape 2: Chargement des données du jeu...');
    
    // Puis charger les données du jeu
    chargerDonneesJeu();
    console.log('📋 Étape 3: Chargement de la galerie...');
    chargerGalerie();
    configurerRafraichissement();

    console.log('📋 Étape 4: Configuration des animations...');
    // Ajouter des animations au défilement
    ajouterAnimationsAuDefilement();
    
    console.log('✅ Site Island Survie entièrement chargé!');
});

// Animation au défilement
function ajouterAnimationsAuDefilement() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec les classes stat-card, event-card et gallery-item
    document.querySelectorAll('.stat-card, .event-card, .gallery-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.5s ease-out';
        observer.observe(element);
    });
}

// Fonction utilitaire pour formater les nombres
function formaterNombre(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Log d'information
console.log(`🏝️ Island Survie - Site officiel chargé avec succès!`);
console.log(`Game ID: ${ROBLOX_GAME_ID}`);
console.log(`URL du jeu: ${ROBLOX_GAME_URL}`);
console.log('');

// Fonction de diagnostic - tester l'API
async function testerAPI() {
    console.log('=== DIAGNOSTIC API ROBLOX ===');
    console.log(`ID du jeu (Place ID): ${ROBLOX_GAME_ID}`);
    console.log('');
    
    // Test 1: Récupérer l'ID univers
    try {
        console.log('📡 Test 1: Récupération de l\'ID univers...');
        const res1 = await fetch(
            `https://api.roblox.com/universes/get-universe-containing-place?placeId=${ROBLOX_GAME_ID}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (res1.ok) {
            const data1 = await res1.json();
            console.log('✅ Univers trouvé:', data1);
        } else {
            console.log('❌ Erreur réponse 1:', res1.status);
        }
    } catch (e) {
        console.error('❌ Erreur Test 1:', e.message);
    }
    
    console.log('');
    
    // Test 2: Récupérer les données du jeu
    try {
        console.log('📡 Test 2: Récupération des données du jeu...');
        const res2 = await fetch(
            `https://games.roblox.com/v1/games?universeIds=${ROBLOX_GAME_ID}`,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
        );
        if (res2.ok) {
            const data2 = await res2.json();
            console.log('✅ Données du jeu reçues:', data2);
            if (data2.data && data2.data.length > 0) {
                console.log('Statistiques:', {
                    joueurs: data2.data[0].playing,
                    note: data2.data[0].rating,
                    visites: data2.data[0].visits,
                    favoris: data2.data[0].favoritedCount
                });
            }
        } else {
            console.log('❌ Erreur réponse 2:', res2.status);
        }
    } catch (e) {
        console.error('❌ Erreur Test 2:', e.message);
    }
}

console.log('💡 Pour diagnostiquer l\'API, ouvrez la console et appelez: testerAPI()');
console.log('');;

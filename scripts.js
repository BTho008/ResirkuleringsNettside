class ThemeManager {
    constructor() {
        this.html = document.documentElement;
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle?.querySelector('i');
        this.init();
    }

    init() {
        if (this.themeToggle) {
            this.loadSavedTheme();
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.html.classList.remove('light-mode');
            this.html.classList.add('dark-mode');
            this.updateIcon(true);
        }
    }

    toggleTheme() {
        this.html.classList.toggle('light-mode');
        this.html.classList.toggle('dark-mode');
        const isDark = this.html.classList.contains('dark-mode');
        this.updateIcon(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    updateIcon(isDark) {
        if (this.themeIcon) {
            this.themeIcon.classList.toggle('fa-moon', !isDark);
            this.themeIcon.classList.toggle('fa-sun', isDark);
        }
    }
}

class StatisticsAnimator {
    constructor() {
        this.statsData = this.getStatsData();
        this.observer = this.createObserver();
        this.observeStatistics();
        this.initializeStatCards();
    }

    getStatsData() {
        return {
            'Avfall per Person': {
                icon: 'fa-trash',
                title: 'Avfall per Person',
                description: 'Årlig avfallsmengde per innbygger i Norge er nå på 42,6 kg, hvilket er over EU-gjennomsnittet. Dette representerer en økning på 2,3% fra forrige år.',
                trends: 'Norge har sett en jevn økning i avfall per person de siste 10 årene. Fra 2015 til 2025 har mengden økt med cirka 15%.',
                comparison: 'Norge ligger 18% over EU-gjennomsnittet på 36,1 kg per person. EU har som mål å redusere avfall per person med 20% innen 2030.',
                actions: [
                    'Kjøp produkter med mindre emballasje',
                    'Velg varer med lengre holdbarhet',
                    'Reparer fremfor å kaste',
                    'Delta i byttemarkeder',
                    'Kompostér organisk avfall'
                ]
            },
            // Other statistics omitted for brevity
        };
    }

    createObserver() {
        return new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateStatistics(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
    }

    observeStatistics() {
        const statsSection = document.querySelector('.statistics');
        if (statsSection) {
            this.observer.observe(statsSection);
        }
    }

    animateStatistics(target) {
        this.animateMeters(target);
        this.animateNumbers();
    }

    animateMeters(target) {
        const meters = target.querySelectorAll('.meter');
        meters.forEach((meter) => {
            const indicator = meter.querySelector('.meter-indicator');
            const number = meter.querySelector('.stat-number');
            if (!indicator || !number) return;

            const targetValue = parseInt(number.dataset.target) || 0;
            const rotationTarget = Math.min(targetValue, 100) / 100 * 360;

            indicator.style.setProperty('--rotation-target', `${rotationTarget}deg`);
            indicator.style.animation = 'rotateIndicator 2s ease-out forwards';

            this.animateCounter(number, targetValue);
        });
    }

    animateNumbers() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach((stat) => {
            const targetValue = parseInt(stat.dataset.target) || 0;
            this.animateCounter(stat, targetValue);
        });
    }

    animateCounter(element, target, duration = 2000) {
        let current = 0;
        const steps = 60;
        const increment = target / steps;
        const stepDuration = duration / steps;

        const updateCounter = () => {
            current = Math.min(current + increment, target);
            element.textContent = Math.floor(current).toLocaleString();

            if (current < target) {
                setTimeout(updateCounter, stepDuration);
            }
        };

        updateCounter();
    }

    initializeStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        const modal = document.getElementById('statsModal');
        const closeButton = document.getElementById('statsCloseButton');

        if (closeButton) {
            closeButton.onclick = () => {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            };
        }

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        };

        statCards.forEach((card) => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent;
                this.showStatInfo(title);
            });
        });
    }

    showStatInfo(title) {
        const info = this.statsData[title];
        if (!info) return;

        const modal = document.getElementById('statsModal');
        const modalIcon = document.getElementById('statsModalIcon');

        modalIcon.className = `fas ${info.icon}`;
        document.getElementById('statsModalTitle').textContent = info.title;
        document.getElementById('statsModalDescription').textContent = info.description;

        const actionsList = document.getElementById('statsModalActions');
        actionsList.innerHTML = info.actions.map((action) => `<li>${action}</li>`).join('');

        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
}

// Instantiate classes
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new StatisticsAnimator();
});


class RecyclingSearch {
    constructor(items) {
        this.items = items;
        this.searchInput = document.getElementById('recycle-input');
        this.instructionsElement = document.getElementById('recycling-instructions');
        this.imageElement = document.getElementById('recycling-image');
        this.suggestionsList = this.createSuggestionsList();
        this.init();
    }

    createSuggestionsList() {
        const suggestions = document.createElement('ul');
        suggestions.className = 'suggestions-list';
        suggestions.style.display = 'none';
        this.searchInput.parentNode.appendChild(suggestions);
        return suggestions;
    }

    init() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.handleInput());
            this.searchInput.addEventListener('focusout', () => {
                setTimeout(() => this.suggestionsList.style.display = 'none', 200);
            });
        }
    }

    handleInput() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        if (!searchTerm) {
            this.resetDisplay();
            this.suggestionsList.style.display = 'none';
            return;
        }

        const suggestions = this.items
            .filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            )
            .slice(0, 5);

        this.showSuggestions(suggestions);
    }

    showSuggestions(suggestions) {
        this.suggestionsList.innerHTML = '';
        if (suggestions.length === 0) {
            this.suggestionsList.style.display = 'none';
            return;
        }

        suggestions.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} (${item.category})`;
            li.addEventListener('click', () => {
                this.searchInput.value = item.name;
                this.updateDisplay(item);
                this.suggestionsList.style.display = 'none';
            });
            this.suggestionsList.appendChild(li);
        });

        this.suggestionsList.style.display = 'block';
    }

    findItem(searchTerm) {
        return this.items.find(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        );
    }

    updateDisplay(item) {
        if (!this.instructionsElement || !this.imageElement) return;

        if (item) {
            this.instructionsElement.textContent = item.description;
            this.imageElement.src = 'images/Restavfall.png';
            this.imageElement.style.display = 'block';
        } else {
            this.instructionsElement.textContent = 'Beklager, vi fant ikke dette objektet. Prøv et annet søkeord.';
            this.imageElement.style.display = 'none';
        }
    }

    resetDisplay() {
        if (this.instructionsElement) {
            this.instructionsElement.textContent = 'Skriv inn et objekt for å få sorteringsinstruksjoner';
        }
        if (this.imageElement) {
            this.imageElement.style.display = 'none';
        }
    }
}

class SmoothScroll {
    constructor() {
        this.initSmoothScrolling();
    }

    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
        });
    }

    handleClick(e, anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

const resirkuleringsobjekter = [
    // Plast
    {
        name: "Plastemballasje",
        category: "Plast",
        description: "Skylles, tørkes og brettes sammen",
        binImage: "images/Restavfall.png"
    },
    {
        name: "Sjampoflasker",
        category: "Plast",
        description: "Må være helt tom og ren",
        binImage: "images/Restavfall.png"
    },
    {
        name: "Yoghurtbeger",
        category: "Plast",
        description: "Skylles rent og sorteres som plast",
        binImage: "images/Restavfall.png"
    },
    {
        name: "Plastposer",
        category: "Plast",
        description: "Samle flere poser sammen",
        binImage: "images/Restavfall.png"
    },

    // Glass og Metall
    {
        name: "Syltetøyglass",
        category: "Glass/Metall",
        description: "Fjern lokk, skyll og rengjør",
        binImage: "images/glassavfallsdunk.png"
    },
    {
        name: "Vinflasker",
        category: "Glass/Metall",
        description: "Fjern kork og folie",
        binImage: "images/glassavfallsdunk.png"
    },
    {
        name: "Hermetikkbokser",
        category: "Glass/Metall",
        description: "Skylles rent, lokk kan sitte på",
        binImage: "images/glassavfallsdunk.png"
    },
    {
        name: "Aluminiumsfolie",
        category: "Glass/Metall",
        description: "Kun ren folie, krølles sammen",
        binImage: "images/glassavfallsdunk.png"
    },

    // Papp og Papir
    {
        name: "Pizzaesker",
        category: "Papp",
        description: "Må være uten matrester",
        binImage: "images/papiravfallsdunk.png"
    },
    {
        name: "Melkekartonger",
        category: "Papp",
        description: "Skylles, brettes og stables",
        binImage: "images/papiravfallsdunk.png"
    },
    {
        name: "Aviser",
        category: "Papir",
        description: "Buntes sammen",
        binImage: "images/papiravfallsdunk.png"
    },
    {
        name: "Reklame",
        category: "Papir",
        description: "Fjern eventuell plastinnpakning",
        binImage: "images/papiravfallsdunk.png"
    },
    {
        name: "Papir",
        category: "Papir",
        description: "Kastes i papiravfall",
        binImage: "images/papiravfallsdunk.png"
    },

    // Matavfall
    {
        name: "Matavfall",
        category: "Matavfall",
        description: "Bruk grønne poser",
        binImage: "images/matavfallsdunk.png"
    },
    {
        name: "Mat",
        category: "Matavfall",
        description: "Bruk grønne poser",
        binImage: "images/matavfallsdunk.png"
    },
    {
        name: "Kaffegrut",
        category: "Matavfall",
        description: "Inkludert filter",
        binImage: "images/matavfallsdunk.png"
    },
    {
        name: "Teposer",
        category: "Matavfall",
        description: "Fjern metallstiften",
        binImage: "images/matavfallsdunk.png"
    },
    {
        name: "Eggeskall",
        category: "Matavfall",
        description: "Kan kastes i grønn pose",
        binImage: "images/matavfallsdunk.png"
    },

    // Restavfall
    {
        name: "Bleier",
        category: "Restavfall",
        description: "Kastes i vanlig søppelpose",
        binImage: "images/Restavfall.png"
    },
    {
        name: "Støvsugerposer",
        category: "Restavfall",
        description: "Kastes i vanlig søppelpose",
        binImage: "images/Restavfall.png"
    },
    {
        name: "Røyk",
        category: "Restavfall",
        description: "Må være helt slukket",
        binImage: "images/Restavfall.png"
    },

    // Spesialavfall
    {
        name: "Batterier",
        category: "Spesialavfall",
        description: "Leveres til gjenvinningsstasjon eller butikk",
        binImage: "images/Gjenvining.png"
    },
    {
        name: "Batteri",
        category: "Spesialavfall",
        description: "Leveres til gjenvinningsstasjon eller butikk",
        binImage: "images/Gjenvining.png"
    },
    {
        name: "Elektronikk",
        category: "Spesialavfall",
        description: "Leveres til elektrobutikk eller gjenvinningsstasjon",
        binImage: "images/Gjenvining.png"
    },
    {
        name: "Lyspærer",
        category: "Spesialavfall",
        description: "Leveres til gjenvinningsstasjon",
        binImage: "images/Gjenvining.png"
    },
    {
        name: "Maling",
        category: "Spesialavfall",
        description: "Leveres til gjenvinningsstasjon",
        binImage: "images/Gjenvining.png"
    }];

    function checkRecycling() {
        const searchInput = document.getElementById('recycle-input').value.toLowerCase();
        const instructionsElement = document.getElementById('recycling-instructions');
        const imageElement = document.getElementById('recycling-image');
    
    const foundItem = resirkuleringsobjekter.find(item => 
        item.name.toLowerCase() === searchInput
    );
    
    if (foundItem) {
        instructionsElement.textContent = foundItem.description;
        imageElement.src = foundItem.binImage;
        imageElement.style.display = 'block';
    } else {
        instructionsElement.textContent = 'Beklager, vi fant ikke dette objektet. Prøv et annet søkeord.';
        imageElement.style.display = 'none';
    }
}

class CategoryModal {
    constructor() {
        this.modal = document.getElementById('categoryModal');
        this.closeButton = document.querySelector('.close-button');
        this.categoryCards = document.querySelectorAll('.category-card');
        this.init();
    }

    init() {
        this.closeButton.onclick = () => this.closeModal();
        window.onclick = (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        };

        this.categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                this.showCategoryInfo(category);
            });
        });
    }

    closeModal() {
        this.modal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    showCategoryInfo(category) {
        const categoryInfo = {
            'Plast': {
                icon: 'fa-bottle-water',
                title: 'Plastemballasje',
                description: 'Alt av ren plastemballasje kan gjenvinnes. Plast som ikke er emballasje skal ikke i plastinnsamlingen.',
                examples: [
                    'Plastflasker og -kanner',
                    'Plastposer og -folie',
                    'Plastbegre og -bokser',
                    'Shampo- og såpeflasker',
                    'Plastbakker fra mat'
                ],
                instructions: 'Skyll emballasjen i kaldt vann. Fjern matrester. Brett og stable plasten for å spare plass.'
            },
            'Glass/Metall': {
                icon: 'fa-wine-bottle',
                title: 'Glass og Metallemballasje',
                description: 'Glass og metall kan gjenvinnes uendelig mange ganger uten at kvaliteten forringes.',
                examples: [
                    'Glassflasker og glasskrukker',
                    'Hermetikkbokser',
                    'Metallokk og -korker',
                    'Aluminiumsfolie og -former',
                    'Metalltuber'
                ],
                instructions: 'Skyll emballasjen. Etiketter kan sitte på. Korker og lokk kan følge med.'
            },
            'Papir': {
                icon: 'fa-newspaper',
                title: 'Papir og Papp',
                description: 'Papir kan gjenvinnes 5-7 ganger før fibrene blir for korte. Resirkulering sparer både trær og energi.',
                examples: [
                    'Aviser og magasiner',
                    'Pappesker og kartonger',
                    'Konvolutter og reklame',
                    'Melk- og juicekartonger',
                    'Emballasjekartong'
                ],
                instructions: 'Brett kartonger og esker. Stifter og binders kan sitte i. Tape bør fjernes.'
            },
            'Matavfall': {
                icon: 'fa-apple-whole',
                title: 'Matavfall',
                description: 'Matavfall blir til kompost og biogass. Det er viktig å sortere ut matavfall for å utnytte ressursene.',
                examples: [
                    'Matrester og skrell',
                    'Kaffegrut og teposer',
                    'Eggeskall',
                    'Brød og bakevarer',
                    'Frukt og grønnsaker'
                ],
                instructions: 'Bruk grønne poser til matavfall. Knyt posen godt igjen. Unngå å kaste flytende mat.'
            }
        };

        const info = categoryInfo[category];
        if (!info) return;

        document.getElementById('modalIcon').className = `fas ${info.icon}`;
        document.getElementById('modalTitle').textContent = info.title;
        document.getElementById('modalDescription').textContent = info.description;
        
        const examplesList = document.getElementById('modalExamples');
        examplesList.innerHTML = info.examples
            .map(example => `<li>${example}</li>`)
            .join('');
        
        document.getElementById('modalInstructions').textContent = info.instructions;
        
        this.modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
}

// Initialize all classes
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new StatisticsAnimator();
    new RecyclingSearch(resirkuleringsobjekter);
    new CategoryModal();
});

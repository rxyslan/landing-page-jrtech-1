// Função genérica para inicializar carrosséis
function initializeCarousel(containerClass, slideClass, dotClass, intervalTime = 3000) {
    const carouselContainer = document.querySelector(`.${containerClass}`);
    if (!carouselContainer) return; // Sai se o container não existe

    const carouselSlide = carouselContainer.querySelector(`.${slideClass}`);
    const carouselImages = carouselContainer.querySelectorAll(`.${slideClass} img`);
    const carouselDots = carouselContainer.querySelectorAll(`.${dotClass}`);

    if (carouselImages.length === 0) return; // Não faz nada se não tiver imagens

    let counter = 0;
    
    // Define a posição inicial e atualiza os pontos
    function setupInitialState() {
        const size = getSize();
        if (size > 0) {
            carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
            updateDots();
        }
    }

    function getSize() {
        if (carouselImages.length > 0) {
            return carouselImages[0].clientWidth;
        }
        return 0;
    }

    function updateDots() {
        carouselDots.forEach(dot => dot.classList.remove('active'));
        if (carouselDots[counter]) {
            carouselDots[counter].classList.add('active');
        }
    }

    function nextSlide() {
        const size = getSize();
        if (size === 0) return;

        if (counter >= carouselImages.length - 1) {
            counter = 0;
        } else {
            counter++;
        }
        
        carouselSlide.style.transition = "transform 0.5s ease-in-out";
        carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
        updateDots();
    }

    // Auto-slide
    let slideInterval = setInterval(nextSlide, intervalTime);

    // Pausar/Retomar ao passar o mouse
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, intervalTime);
    });

    // Navegação pelos pontos
    carouselDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const size = getSize();
            if (size === 0) return;

            counter = index;
            carouselSlide.style.transition = "transform 0.5s ease-in-out";
            carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
            updateDots();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, intervalTime);
        });
    });

    // Recalcular o tamanho em redimensionamento
    window.addEventListener('resize', () => {
        const size = getSize();
        if (size === 0) return;
        
        carouselSlide.style.transition = "none";
        carouselSlide.style.transform = 'translateX(' + (-size * counter) + 'px)';
    });

    // Inicializa o carrossel após as imagens carregarem
    window.addEventListener('load', setupInitialState);
    if (document.readyState === 'complete') { // Se a página já carregou (para defer)
        setupInitialState();
    }
}

// --- CHAMADAS PARA INICIALIZAR CADA CARROSSEL ---

// Inicializa o carrossel da seção Produtos
initializeCarousel('carousel-container', 'carousel-slide', 'dot');

// Inicializa o carrossel da seção Métodos (Reconhecimento Facial)
initializeCarousel('carousel-container-methods', 'carousel-slide-methods', 'dot-methods');
/* =================================================================== */
/* 7. COMPONENTE - ROLAGEM SUAVE "DE VAGARINHO"
/* =================================================================== */

function customSmoothScroll(targetSelector, duration) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        
        // Fórmula de "Easing" (ease-in-out) para uma animação suave
        const t = timeElapsed / duration;
        const easedTime = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const run = startPosition + distance * easedTime;
        
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
}

// Pega TODOS os links que começam com '#'
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Impede o pulo brusco
        const href = this.getAttribute('href');
        
        if (href && href !== '#') {
            // A MÁGICA ESTÁ AQUI: 2000ms = 2 segundos.
            // Aumente se quiser AINDA mais devagar.
            customSmoothScroll(href, 1000); 
        }
    });
});
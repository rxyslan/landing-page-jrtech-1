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

// Inicializa o carrossel da seção Produtos (se houver, senão, não dá erro)
initializeCarousel('carousel-container', 'carousel-slide', 'dot');

// Inicializa o carrossel da seção Métodos (se houver, senão, não dá erro)
initializeCarousel('carousel-container-methods', 'carousel-slide-methods', 'dot-methods');


/* =================================================================== */
/* 7. COMPONENTE - ROLAGEM SUAVE "DE VAGARINHO"
/* =================================================================== */

function customSmoothScroll(targetSelector, duration) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    // Calcula a posição do topo da barra fixa
    const topBar = document.querySelector('.top-bar-fixed');
    const topBarHeight = topBar ? topBar.offsetHeight : 0;

    // Ajusta a posição final para descontar a altura da barra fixa
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - topBarHeight;
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
            // A MÁGICA ESTÁ AQUI: 1000ms = 1 segundo.
            customSmoothScroll(href, 1000); 
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Lógica do Modal (Janela Flutuante)
    // ----------------------------------------------------
    const modal = document.getElementById('simulation-modal');
    const openBtn = document.getElementById('open-simulation-modal');
    const closeBtn = document.getElementById('close-simulation-modal');

    if (openBtn && modal) {
        // Abre o modal
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Impede a rolagem do fundo
        });

        // Fecha o modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('open');
            document.body.style.overflow = ''; // Restaura a rolagem do fundo
        });

        // Fechar ao clicar fora do modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ----------------------------------------------------
    // 2. Lógica da Animação dos Gráficos Circulares
    // ----------------------------------------------------
    const statCircles = document.querySelectorAll('.stat-circle');
    const simulationSection = document.getElementById('simulacao-custos');
    
    // Configurações da animação
    const ANIMATION_DURATION = 1500; // 1.5 segundos
    
    let animationStarted = false; // Flag para garantir que a animação rode apenas uma vez

    function animateCircle(element, percentage) {
        const chart = element.querySelector('.circle-chart');
        const percentageText = element.querySelector('.percentage');
        
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const timeRatio = Math.min(1, progress / ANIMATION_DURATION);
            
            // Calcula o valor atual
            const currentFill = Math.round(percentage * timeRatio);

            // 1. Atualizar o preenchimento do gráfico (CSS Conic Gradient)
            chart.style.background = `conic-gradient(
                var(--green-primary) 0%, 
                var(--green-primary) ${currentFill}%, 
                var(--gray-medium) ${currentFill}%, 
                var(--gray-medium) 100%
            )`;

            // 2. Atualizar o texto da porcentagem (Contagem)
            percentageText.textContent = `${Math.round(percentage * timeRatio)}%`;

            if (timeRatio < 1) {
                requestAnimationFrame(step);
            } else {
                // Adiciona a classe para mudar a cor do texto no final
                chart.classList.add('animated'); 
            }
        }

        requestAnimationFrame(step);
    }

    // Função para iniciar a animação quando a seção entrar na tela (Intersection Observer)
    function startAnimations(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationStarted) {
                statCircles.forEach(circle => {
                    const percent = parseInt(circle.dataset.percent);
                    // Garante que o CSS var(--green-primary) seja usado (necessário para a função animateCircle)
                    if(percent >= 0) {
                        animateCircle(circle, percent);
                    }
                });
                animationStarted = true;
                observer.unobserve(simulationSection); // Para que a animação não se repita
            }
        });
    }

    // Configuração do Intersection Observer (Para detectar a visibilidade)
    if (simulationSection && 'IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // viewport
            threshold: 0.1 // Começa a animar quando 10% da seção está visível
        };
        const observer = new IntersectionObserver(startAnimations, observerOptions);
        observer.observe(simulationSection);
    } else if (simulationSection) {
        // Fallback para navegadores antigos (executa a animação imediatamente)
        statCircles.forEach(circle => {
            const percent = parseInt(circle.dataset.percent);
            animateCircle(circle, percent);
        });
    }

});

/**
 * Nexus Tech E-Commerce - Script Principal (ES6+)
 * Funcionalidades:
 * 1. Navegação SPA (Single Page Application) para menus e rodapé + indicador animado
 * 2. Carrossel principal animado com autoplay, pausa no hover, setas e indicadores
 * 3. Animação de entrada dos cards via IntersectionObserver e filtros por subcategoria
 * 4. Carrinho de compras lateral (Drawer) usando as imagens declaradas no HTML
 * 5. Validação do formulário de contato e acordeão interativo de FAQ
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigationSPA();
  initHeroCarousel();
  initCardAnimationsAndFilters();
  initShoppingCart();
  initContactForm();
  initFaqAccordion();
});

/* ==========================================================================
   1. NAVEGAÇÃO SPA E MENU ANIMADO
   ========================================================================== */
function initNavigationSPA() {
  const pageViews = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('.nav-link');
  const pageTriggers = document.querySelectorAll('[data-page]');
  const navIndicator = document.getElementById('nav-indicator');
  const mainNav = document.getElementById('main-nav');
  const mobileToggle = document.getElementById('mobile-menu-toggle');

  // Atualiza a posição e largura da barra brilhante sob o item do menu desktop
  function moveNavIndicator(targetLink) {
    if (!navIndicator || !targetLink || window.innerWidth <= 820) {
      if (navIndicator) navIndicator.style.opacity = '0';
      return;
    }
    navIndicator.style.opacity = '1';
    navIndicator.style.width = `${targetLink.offsetWidth}px`;
    navIndicator.style.transform = `translateX(${targetLink.offsetLeft}px)`;
  }

  // Abre a página correspondente e atualiza estados ativos
  function navigateTo(pageId) {
    const targetSection = document.getElementById(`page-${pageId}`);
    if (!targetSection) return;

    // Alterna visibilidade das seções
    pageViews.forEach((section) => {
      section.classList.remove('active');
    });
    targetSection.classList.add('active');

    // Atualiza destaque ativo nos links do menu superior
    let activeHeaderLink = null;
    navLinks.forEach((link) => {
      const isMatch = link.dataset.page === pageId;
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
        activeHeaderLink = link;
      } else {
        link.removeAttribute('aria-current');
      }
    });

    moveNavIndicator(activeHeaderLink);

    // Fecha o menu mobile se estiver aberto
    if (mainNav.classList.contains('mobile-open')) {
      mainNav.classList.remove('mobile-open');
      mobileToggle.classList.remove('is-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }

    // Rola suavemente para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reativa observação de animação dos cards na nova página aberta
    observeVisibleCards();
  }

  // Escuta cliques em qualquer link com atributo data-page (Menu, Carrossel, Botões "Ver todos" e Rodapé)
  pageTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const targetPage = trigger.dataset.page;
      navigateTo(targetPage);
    });
  });

  // Efeito hover magnético na linha indicadora do menu
  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => moveNavIndicator(link));
  });

  if (mainNav) {
    mainNav.addEventListener('mouseleave', () => {
      const currentActive = document.querySelector('.nav-link.active');
      moveNavIndicator(currentActive);
    });
  }

  // Menu Hambúrguer Mobile
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('mobile-open');
      mobileToggle.classList.toggle('is-open', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Posiciona inicialmente o indicador e recalcula ao redimensionar a tela
  const initialActive = document.querySelector('.nav-link.active');
  moveNavIndicator(initialActive);
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.nav-link.active');
    moveNavIndicator(currentActive);
  });
}

/* ==========================================================================
   2. CARROSSEL PRINCIPAL ANIMADO
   ========================================================================== */
function initHeroCarousel() {
  const carousel = document.getElementById('hero-carousel');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!carousel || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const intervalTime = 5500;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
      const isActive = idx === currentIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, intervalTime);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  prevBtn?.addEventListener('click', () => {
    prevSlide();
    startAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const slideIndex = Number(dot.dataset.slide);
      showSlide(slideIndex);
      startAutoplay();
    });
  });

  // Pausa reprodução automática ao passar o mouse
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

/* ==========================================================================
   3. ANIMAÇÃO DE CARDS (INTERSECTION OBSERVER) E FILTROS DE CATEGORIA
   ========================================================================== */
let cardObserver = null;

function observeVisibleCards() {
  const cards = document.querySelectorAll('.page-view.active .reveal-card');

  if (!('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  if (cardObserver) {
    cardObserver.disconnect();
  }

  cardObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach((card) => {
    card.classList.remove('is-visible');
    cardObserver.observe(card);
  });
}

function initCardAnimationsAndFilters() {
  observeVisibleCards();

  // Filtros rápidos dentro das páginas de departamento
  const filterBars = document.querySelectorAll('.filter-bar');
  filterBars.forEach((bar) => {
    const chips = bar.querySelectorAll('.filter-chip');
    const section = bar.closest('.catalog-section');
    const cards = section ? section.querySelectorAll('.product-card') : [];

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        const selectedFilter = chip.dataset.filter;
        cards.forEach((card) => {
          const matches = selectedFilter === 'all' || card.dataset.subcat === selectedFilter;
          card.classList.toggle('is-hidden-by-filter', !matches);
          if (matches) {
            card.classList.add('is-visible');
          }
        });
      });
    });
  });
}

/* ==========================================================================
   4. CARRINHO DE COMPRAS LATERAL (DRAWER) SEM BANCO DE DADOS
   ========================================================================== */
function initShoppingCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartToggleBtn = document.getElementById('cart-toggle');
  const cartCloseBtn = document.getElementById('cart-close');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCountBadge = document.getElementById('cart-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const shippingBarEl = document.getElementById('cart-shipping-bar');
  const checkoutBtn = document.getElementById('checkout-btn');
  const clearCartBtn = document.getElementById('clear-cart-btn');
  const addButtons = document.querySelectorAll('.btn-add-cart');

  // Estado em memória do carrinho
  const cart = new Map();

  function formatBRL(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartToggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function renderCart() {
    let totalItems = 0;
    let subtotal = 0;

    cart.forEach((item) => {
      totalItems += item.qty;
      subtotal += item.price * item.qty;
    });

    // Atualiza contador e aplica animação bump
    cartCountBadge.textContent = String(totalItems);
    cartCountBadge.classList.remove('bump');
    void cartCountBadge.offsetWidth; // força reflow para reiniciar animação
    cartCountBadge.classList.add('bump');

    cartSubtotalEl.textContent = formatBRL(subtotal);

    // Barra de Frete Grátis acima de R$ 499,00
    const freeShippingGoal = 499;
    if (subtotal >= freeShippingGoal) {
      shippingBarEl.classList.add('free-unlocked');
      shippingBarEl.innerHTML = '&#127881; Parabéns! Você desbloqueou <strong>Frete Grátis</strong>!';
    } else {
      shippingBarEl.classList.remove('free-unlocked');
      const remaining = formatBRL(freeShippingGoal - subtotal);
      shippingBarEl.innerHTML = `Faltam <strong>${remaining}</strong> para ganhar <strong>Frete Grátis</strong>!`;
    }

    // Renderiza lista de itens
    cartItemsContainer.innerHTML = '';

    if (cart.size === 0) {
      cartItemsContainer.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.<br>Explore nossas ofertas de hardware e periféricos!</p>';
      return;
    }

    cart.forEach((item, id) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';

      // Clona o elemento <img> original declarado no HTML do card para manter conformidade
      const thumbImg = item.imgElement.cloneNode(true);
      thumbImg.className = 'cart-item-thumb';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'cart-item-info';
      infoDiv.innerHTML = `
        <div class="cart-item-title" title="${item.name}">${item.name}</div>
        <div class="cart-item-price">${formatBRL(item.price)}</div>
        <div class="cart-qty-controls">
          <button type="button" class="qty-btn" data-action="dec" data-id="${id}" aria-label="Diminuir quantidade">-</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" data-action="inc" data-id="${id}" aria-label="Aumentar quantidade">+</button>
          <button type="button" class="remove-item-btn" data-action="remove" data-id="${id}">Remover</button>
        </div>
      `;

      itemEl.appendChild(thumbImg);
      itemEl.appendChild(infoDiv);
      cartItemsContainer.appendChild(itemEl);
    });
  }

  // Adiciona produto ao clicar no botão do card
  addButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;

      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const imgElement = card.querySelector('.product-img');

      if (cart.has(id)) {
        cart.get(id).qty += 1;
      } else {
        cart.set(id, { name, price, qty: 1, imgElement });
      }

      renderCart();
      showToast(`"${name}" adicionado ao carrinho!`);
    });
  });

  // Controles de quantidade e remoção dentro do carrinho
  cartItemsContainer.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const { action, id } = target.dataset;
    const item = cart.get(id);
    if (!item) return;

    if (action === 'inc') {
      item.qty += 1;
    } else if (action === 'dec') {
      item.qty -= 1;
      if (item.qty <= 0) cart.delete(id);
    } else if (action === 'remove') {
      cart.delete(id);
    }

    renderCart();
  });

  cartToggleBtn?.addEventListener('click', openCart);
  cartCloseBtn?.addEventListener('click', closeCart);
  cartBackdrop?.addEventListener('click', closeCart);

  clearCartBtn?.addEventListener('click', () => {
    cart.clear();
    renderCart();
  });

  checkoutBtn?.addEventListener('click', () => {
    if (cart.size === 0) {
      showToast('Adicione pelo menos um produto antes de finalizar.');
      return;
    }
    showToast('Pedido simulado com sucesso! Obrigado por comprar na Nexus Tech.');
    cart.clear();
    renderCart();
    closeCart();
  });

  // Inicializa renderização vazia
  renderCart();
}

/* ==========================================================================
   5. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const feedbackBox = document.getElementById('contact-feedback');

  function setError(fieldId, message) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (errorEl) errorEl.textContent = message;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;

    // Limpa erros anteriores
    ['name', 'email', 'subject', 'message'].forEach((id) => setError(id, ''));
    feedbackBox.className = 'form-feedback';
    feedbackBox.textContent = '';

    if (nameInput.value.trim().length < 3) {
      setError('name', 'Por favor, informe seu nome completo (mínimo 3 caracteres).');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      setError('email', 'Informe um endereço de e-mail válido.');
      isValid = false;
    }

    if (!subjectInput.value) {
      setError('subject', 'Selecione o assunto do seu atendimento.');
      isValid = false;
    }

    if (messageInput.value.trim().length < 10) {
      setError('message', 'Escreva uma mensagem com pelo menos 10 caracteres.');
      isValid = false;
    }

    if (!isValid) return;

    feedbackBox.classList.add('success');
    feedbackBox.textContent = `Mensagem enviada com sucesso, ${nameInput.value.trim()}! Nossa equipe técnica responderá em breve no e-mail informado.`;
    form.reset();
  });
}

/* ==========================================================================
   6. ACORDEÃO INTERATIVO DE PERGUNTAS FREQUENTES (FAQ)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      questionBtn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}
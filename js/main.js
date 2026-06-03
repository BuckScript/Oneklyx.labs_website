/* ============================================
   OneKlyx Main JavaScript
   Navigation, Scroll Spy, Animations, FAQ,
   Testimonials, Portfolio Filter, Counters
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. NAVBAR — Sticky, Glassmorphism on Scroll
  // ============================================
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  });

  // Mobile menu toggle
  if (navToggle && mobileOverlay) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileOverlay.classList.toggle('show');
      document.body.style.overflow = mobileOverlay.classList.contains('show') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileOverlay.classList.remove('show');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // 2. SCROLL SPY — Active section highlighting
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  // ============================================
  // 3. SMOOTH SCROLL — For all anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      
      if (targetEl) {
        const offsetTop = targetEl.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // 4. REVEAL ON SCROLL — Intersection Observer
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // 5. COUNTER ANIMATION — Animated stats
  // ============================================
  const counters = document.querySelectorAll('[data-count]');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) counterObserver.observe(statsSection);

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        
        counter.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + suffix;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // ============================================
  // 6. SERVICES FILTER — Tab filtering
  // ============================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const serviceCards = document.querySelectorAll('.service-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      serviceCards.forEach(card => {
        if (filter === 'all' || card.dataset.category.includes(filter)) {
          card.style.display = '';
          card.style.animation = 'fadeSlideIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Service card "Learn More" toggle
  document.querySelectorAll('.service-card .learn-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const details = btn.closest('.service-card').querySelector('.card-details');
      if (details) {
        details.classList.toggle('open');
        btn.textContent = details.classList.contains('open') ? 'Show Less ↑' : 'Learn More →';
      }
    });
  });

  // ============================================
  // 7. PORTFOLIO FILTER
  // ============================================
  const portfolioTabs = document.querySelectorAll('.portfolio-filter .filter-tab');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  portfolioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      portfolioTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      portfolioCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeSlideIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ============================================
  // 8. PORTFOLIO MODAL
  // ============================================
  const modal = document.querySelector('#portfolioModal');
  const modalClose = document.querySelector('.modal-close');

  document.querySelectorAll('.portfolio-card .view-btn, .portfolio-card').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = trigger.closest('.portfolio-card') || trigger;
      const title = card.querySelector('h3')?.textContent || '';
      const category = card.querySelector('.portfolio-badge')?.textContent || '';
      const tags = card.querySelector('.tech-tags')?.innerHTML || '';
      const desc = card.dataset.description || '';

      if (modal) {
        modal.querySelector('.modal-project-title').textContent = title;
        modal.querySelector('.modal-project-category').textContent = category;
        modal.querySelector('.modal-project-tags').innerHTML = tags;
        modal.querySelector('.modal-project-desc').textContent = desc;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // Close modal on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // ============================================
  // 9. FAQ ACCORDION
  // ============================================
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      const answer = faqItem.querySelector('.faq-answer');
      const isOpen = faqItem.classList.contains('open');

      // Close all other FAQs
      document.querySelectorAll('.faq-item.open').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('open');
          item.querySelector('.faq-answer').style.maxHeight = '0';
        }
      });

      // Toggle current
      if (isOpen) {
        faqItem.classList.remove('open');
        answer.style.maxHeight = '0';
      } else {
        faqItem.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ============================================
  // 10. TESTIMONIAL INFINITE SCROLL
  // ============================================
  const testimonialSlider = document.querySelector('.testimonial-slider');
  if (testimonialSlider) {
    // Clone testimonial cards for infinite scroll
    const cards = testimonialSlider.innerHTML;
    testimonialSlider.innerHTML = cards + cards;
  }

  // ============================================
  // 11. "START A PROJECT" — Smooth Scroll to Order
  // ============================================
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(btn.dataset.scrollTo);
      if (target) {
        const offsetTop = target.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // 12. PRELOADER — Simple fade out on load
  // ============================================
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.pointerEvents = 'none';
        setTimeout(() => preloader.remove(), 500);
      }, 500);
    });
  }

  // ============================================
  // 13. TYPING EFFECT for hero eyebrow (optional)
  // ============================================
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  if (heroEyebrow) {
    const words = heroEyebrow.dataset.words?.split(',') || [];
    if (words.length > 0) {
      let wordIndex = 0;
      const dynamicWord = heroEyebrow.querySelector('.dynamic-word');
      
      if (dynamicWord) {
        setInterval(() => {
          wordIndex = (wordIndex + 1) % words.length;
          dynamicWord.style.opacity = '0';
          dynamicWord.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            dynamicWord.textContent = words[wordIndex];
            dynamicWord.style.opacity = '1';
            dynamicWord.style.transform = 'translateY(0)';
          }, 300);
        }, 2500);
      }
    }
  }

});

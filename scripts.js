/**
 * CATALYST - ENTERPRISE INTELLIGENCE SOLUTIONS
 * Enhanced JavaScript with Advanced Animations & Interactions
 * 
 * Features:
 * - Particle System Animation
 * - Typing Effect
 * - Smooth Scrolling Navigation
 * - Header Scroll Effects
 * - Mobile Menu Functionality
 * - Contact Form Handling
 * - Intersection Observer for Performance
 * - Interactive Animations
 * - Accessibility Support
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONSTANTS & CONFIGURATION
    // ==========================================================================

    const CONFIG = {
        breakpoints: {
            mobile: 768,
            tablet: 1024
        },
        animation: {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        scroll: {
            offset: 80,
            threshold: 100
        },
        particles: {
            count: 50,
            speed: 0.5,
            size: { min: 2, max: 6 }
        },
        typing: {
            speed: 150,
            deleteSpeed: 75,
            pauseTime: 2000
        }
    };

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    /**
     * Debounce function to limit the rate of function execution
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Throttle function to limit the rate of function execution
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Get random number between min and max
     */
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Get scroll position with cross-browser support
     */
    function getScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    // ==========================================================================
    // PARTICLE SYSTEM
    // ==========================================================================

    class ParticleSystem {
        constructor() {
            this.container = document.getElementById('particles');
            this.particles = [];
            this.mouse = { x: 0, y: 0 };
            
            if (!this.container || prefersReducedMotion()) return;
            
            this.init();
        }

        init() {
            this.createParticles();
            this.bindEvents();
            this.animate();
        }

        createParticles() {
            for (let i = 0; i < CONFIG.particles.count; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = random(CONFIG.particles.size.min, CONFIG.particles.size.max);
                const x = random(0, window.innerWidth);
                const y = random(0, window.innerHeight);
                
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    opacity: ${random(0.1, 0.5)};
                `;
                
                this.container.appendChild(particle);
                
                this.particles.push({
                    element: particle,
                    x: x,
                    y: y,
                    vx: random(-CONFIG.particles.speed, CONFIG.particles.speed),
                    vy: random(-CONFIG.particles.speed, CONFIG.particles.speed),
                    size: size,
                    opacity: parseFloat(particle.style.opacity)
                });
            }
        }

        bindEvents() {
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('resize', debounce(() => {
                this.handleResize();
            }, 250));
        }

        handleResize() {
            this.particles.forEach(particle => {
                if (particle.x > window.innerWidth) particle.x = window.innerWidth;
                if (particle.y > window.innerHeight) particle.y = window.innerHeight;
            });
        }

        animate() {
            this.particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges
                if (particle.x <= 0 || particle.x >= window.innerWidth) {
                    particle.vx *= -1;
                    particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
                }
                if (particle.y <= 0 || particle.y >= window.innerHeight) {
                    particle.vy *= -1;
                    particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
                }

                // Mouse interaction
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx -= dx * force * 0.01;
                    particle.vy -= dy * force * 0.01;
                }

                // Apply position
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
            });

            requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.container) {
                this.container.innerHTML = '';
            }
        }
    }

    // ==========================================================================
    // TYPING EFFECT
    // ==========================================================================

    class TypingEffect {
        constructor(element, texts, options = {}) {
            this.element = element;
            this.texts = texts;
            this.options = {
                speed: options.speed || CONFIG.typing.speed,
                deleteSpeed: options.deleteSpeed || CONFIG.typing.deleteSpeed,
                pauseTime: options.pauseTime || CONFIG.typing.pauseTime
            };
            
            this.textIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.isPaused = false;
            
            if (prefersReducedMotion()) {
                this.element.textContent = this.texts[0];
                return;
            }
            
            this.type();
        }

        type() {
            if (this.isPaused) return;
            
            const currentText = this.texts[this.textIndex];
            
            if (this.isDeleting) {
                this.element.textContent = currentText.substring(0, this.charIndex - 1);
                this.charIndex--;
            } else {
                this.element.textContent = currentText.substring(0, this.charIndex + 1);
                this.charIndex++;
            }

            let typeSpeed = this.isDeleting ? this.options.deleteSpeed : this.options.speed;

            if (!this.isDeleting && this.charIndex === currentText.length) {
                typeSpeed = this.options.pauseTime;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.textIndex = (this.textIndex + 1) % this.texts.length;
                typeSpeed = 500;
            }

            setTimeout(() => this.type(), typeSpeed);
        }

        pause() {
            this.isPaused = true;
        }

        resume() {
            this.isPaused = false;
            this.type();
        }
    }

    // ==========================================================================
    // MOBILE NAVIGATION
    // ==========================================================================

    class MobileNavigation {
        constructor() {
            this.toggle = document.querySelector('.nav__toggle');
            this.menu = document.querySelector('.nav__menu');
            this.links = document.querySelectorAll('.nav__link');
            this.isOpen = false;

            this.init();
        }

        init() {
            if (!this.toggle || !this.menu) return;
            this.bindEvents();
        }

        bindEvents() {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });

            this.links.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isOpen) {
                        this.closeMenu();
                    }
                });
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                    this.closeMenu();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                    this.toggle.focus();
                }
            });

            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth > CONFIG.breakpoints.mobile && this.isOpen) {
                    this.closeMenu();
                }
            }, 250));
        }

        toggleMenu() {
            if (this.isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        }

        openMenu() {
            this.isOpen = true;
            this.menu.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        closeMenu() {
            this.isOpen = false;
            this.menu.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    // ==========================================================================
    // SMOOTH SCROLLING NAVIGATION
    // ==========================================================================

    class SmoothScrolling {
        constructor() {
            this.links = document.querySelectorAll('a[href^="#"]');
            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            this.links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        this.scrollToElement(targetElement);
                        
                        if (history.pushState) {
                            history.pushState(null, null, targetId);
                        }
                    }
                });
            });
        }

        scrollToElement(element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - CONFIG.scroll.offset;

            if (prefersReducedMotion()) {
                window.scrollTo(0, offsetPosition);
                return;
            }

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // ==========================================================================
    // HEADER SCROLL EFFECTS
    // ==========================================================================

    class HeaderScrollEffects {
        constructor() {
            this.header = document.querySelector('.header');
            this.lastScrollTop = 0;
            this.isScrolled = false;

            this.init();
        }

        init() {
            if (!this.header) return;
            this.bindEvents();
        }

        bindEvents() {
            const handleScroll = throttle(() => {
                this.updateHeader();
            }, 16);

            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        updateHeader() {
            const scrollTop = getScrollTop();
            
            if (scrollTop > CONFIG.scroll.threshold && !this.isScrolled) {
                this.header.classList.add('scrolled');
                this.isScrolled = true;
            } else if (scrollTop <= CONFIG.scroll.threshold && this.isScrolled) {
                this.header.classList.remove('scrolled');
                this.isScrolled = false;
            }

            this.lastScrollTop = scrollTop;
        }
    }

    // ==========================================================================
    // SCROLL ANIMATIONS
    // ==========================================================================

    class ScrollAnimations {
        constructor() {
            this.elements = document.querySelectorAll('.fade-in');
            this.observer = null;

            this.init();
        }

        init() {
            if (prefersReducedMotion()) {
                this.elements.forEach(el => el.classList.add('visible'));
                return;
            }

            this.setupIntersectionObserver();
        }

        setupIntersectionObserver() {
            const options = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);

            this.elements.forEach(el => {
                this.observer.observe(el);
            });
        }

        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    }

    // ==========================================================================
    // TOAST NOTIFICATIONS
    // ==========================================================================

    class ToastManager {
        constructor() {
            this.toast = document.getElementById('toast');
            this.timeoutId = null;
        }

        show(message, type = 'success', duration = 4000) {
            if (!this.toast) return;

            this.toast.textContent = message;
            this.toast.className = `toast ${type}`;
            
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }

            this.toast.classList.add('show');

            this.timeoutId = setTimeout(() => {
                this.hide();
            }, duration);
        }

        hide() {
            if (!this.toast) return;
            
            this.toast.classList.remove('show');
            
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        }
    }

    // ==========================================================================
    // CONTACT FORM
    // ==========================================================================

    class ContactForm {
        constructor(toastManager) {
            this.form = document.getElementById('contact-form');
            this.toastManager = toastManager;
            
            this.init();
        }

        init() {
            if (!this.form) return;
            this.bindEvents();
        }

        bindEvents() {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        handleSubmit() {
            const formData = new FormData(this.form);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                company: formData.get('company'),
                message: formData.get('message')
            };

            // Basic validation
            if (!data.firstName || !data.lastName || !data.email || !data.message) {
                this.toastManager.show(
                    'Please fill in all required fields.',
                    'error'
                );
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.toastManager.show(
                    'Please enter a valid email address.',
                    'error'
                );
                return;
            }

            // Simulate form submission
            this.toastManager.show(
                'Thank you for your message! We will get back to you soon.',
                'success'
            );

            this.form.reset();
        }
    }

    // ==========================================================================
    // INTERACTIVE BUTTON EFFECTS
    // ==========================================================================

    class InteractiveButtons {
        constructor() {
            this.buttons = document.querySelectorAll('.cta-button');
            this.successMessage = document.getElementById('success-message');
            
            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            this.buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    this.createRippleEffect(e, button);
                    
                    if (button.id === 'cta-button') {
                        this.showSuccessMessage();
                    }
                });
            });
        }

        createRippleEffect(e, button) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.height, rect.width);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
            `;
            
            // Add ripple keyframes to document if not exists
            if (!document.getElementById('ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'ripple-styles';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            button.style.position = 'relative';
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }

        showSuccessMessage() {
            if (!this.successMessage) return;
            
            this.successMessage.classList.add('show');
            
            setTimeout(() => {
                this.successMessage.classList.remove('show');
            }, 3000);
        }
    }

    // ==========================================================================
    // APPLICATION INITIALIZATION
    // ==========================================================================

    class CatalystApp {
        constructor() {
            this.components = {};
            this.init();
        }

        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initializeComponents();
                });
            } else {
                this.initializeComponents();
            }
        }

        initializeComponents() {
            try {
                // Add loading animation
                this.initializeLoadingAnimation();

                // Initialize core components
                this.components.toastManager = new ToastManager();
                this.components.mobileNavigation = new MobileNavigation();
                this.components.smoothScrolling = new SmoothScrolling();
                this.components.headerScrollEffects = new HeaderScrollEffects();
                this.components.scrollAnimations = new ScrollAnimations();
                this.components.contactForm = new ContactForm(this.components.toastManager);
                this.components.interactiveButtons = new InteractiveButtons();

                // Initialize particle system only (mouse trail removed)
                this.components.particleSystem = new ParticleSystem();

                // Initialize typing effect with delay
                setTimeout(() => {
                    this.initializeTypingEffect();
                }, 3000);

                // Mark app as loaded
                document.body.classList.add('loaded');

                console.log('🚀 Catalyst Enterprise Intelligence - Enhanced Landing Page Loaded Successfully!');
            } catch (error) {
                console.error('Error initializing Catalyst app:', error);
            }
        }

        initializeLoadingAnimation() {
            document.body.style.opacity = '0';
            document.body.style.transform = 'translateY(30px)';
            document.body.style.transition = 'all 0.8s ease-out';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
                document.body.style.transform = 'translateY(0)';
            }, 100);
        }

        initializeTypingEffect() {
            const typingElement = document.getElementById('typing-text');
            if (!typingElement) return;

            const texts = [
                'Naturally Smart',
                'Data-Driven', 
                'Future-Ready',
                'Intelligent',
                'Innovative'
            ];
            
            this.components.typingEffect = new TypingEffect(typingElement, texts);
        }

        destroy() {
            Object.keys(this.components).forEach(key => {
                const component = this.components[key];
                if (component && typeof component.destroy === 'function') {
                    component.destroy();
                }
            });
        }
    }

    // ==========================================================================
    // ERROR HANDLING
    // ==========================================================================

    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
    });

    // ==========================================================================
    // INITIALIZE APPLICATION
    // ==========================================================================

    window.CatalystApp = new CatalystApp();

    window.addEventListener('beforeunload', () => {
        if (window.CatalystApp && typeof window.CatalystApp.destroy === 'function') {
            window.CatalystApp.destroy();
        }
    });

    // Export for potential module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { CatalystApp };
    }

})();

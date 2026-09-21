window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        document.body.classList.remove('loading');
        setTimeout(() => {
            if (preloader.parentNode) preloader.remove();
        }, 500);
    }
});

// Preloader Safety Fallback: Remove preloader after 4 seconds even if external CDN resources hang
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        document.body.classList.remove('loading');
        setTimeout(() => {
            if (preloader.parentNode) preloader.remove();
        }, 500);
    }
}, 4000);

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const header = document.getElementById('header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-links a');
    const contactForm = document.getElementById('contact-form');
    const successState = document.getElementById('form-success');
    const resetFormBtn = document.getElementById('reset-form');
    const formErrorDisplay = document.getElementById('form-error-display');

    /**
     * Mobile Menu Logic with Scroll Lock & Focus/Event Protection
     */
    const setMobileMenuState = (isOpen) => {
        if (!mobileMenuBtn || !nav) return;
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        nav.classList.toggle('active', isOpen);
        if (header) header.classList.toggle('menu-open', isOpen);
        if (navOverlay) navOverlay.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        
        // Safely update Lucide icon whether <i> or <svg> is in DOM
        const icon = mobileMenuBtn.querySelector('[data-lucide], svg, i');
        if (icon) {
            icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        }
    };

    const toggleMobileMenu = () => {
        if (!mobileMenuBtn) return;
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        setMobileMenuState(!isExpanded);
    };

    const closeMobileMenu = () => {
        if (!mobileMenuBtn) return;
        if (mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
            setMobileMenuState(false);
        }
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMobileMenu);
    }

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // Close menu on resize to desktop widths (> 992px)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            closeMobileMenu();
        }
    }, { passive: true });

    /**
     * Header Scroll Effect & Dynamic Offset Initializer
     */
    const handleScroll = () => {
        if (!header) return;
        const isScrolled = window.scrollY > 50;
        if (header.classList.contains('scrolled') !== isScrolled) {
            header.classList.toggle('scrolled', isScrolled);
        }
    };

    // Run once on load to establish initial state
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    /**
     * Smooth Scrolling with Offset Calculation & Mobile Reflow Protection
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId || !targetId.startsWith('#')) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // If mobile menu is open, close it first
                if (mobileMenuBtn && mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
                    closeMobileMenu();
                }

                const currentHeaderHeight = header ? header.offsetHeight : 80;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - (currentHeaderHeight * 0.9);

                window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: 'smooth'
                });
            }
        });
    });

    /**
     * Active Link Highlighting using IntersectionObserver
     */
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-links a');

    if (sections.length > 0) {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '-10% 0px -60% 0px'
        };

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinksList.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => navObserver.observe(section));
    }

    /**
     * Scroll Reveal Animation Optimization
     */
    const revealSections = () => {
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px -20px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elementsToReveal = document.querySelectorAll('.reveal, .category-card, .pricing-card, .testimonial-card, .gallery-item');
        elementsToReveal.forEach(el => observer.observe(el));
    };

    revealSections();

    /**
     * Initial Lucide icons initialization with maximum retry cap
     */
    let lucideRetries = 0;
    const initLucide = () => {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        } else if (lucideRetries < 20) {
            lucideRetries++;
            setTimeout(initLucide, 150);
        }
    };
    initLucide();

    /**
     * Service Worker Registration
     */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration warning:', err));
        });
    }

    /**
     * FAQ Accordion Logic with Full ARIA Accessibility
     */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            const answerId = `faq-answer-${index + 1}`;
            answer.setAttribute('id', answerId);
            question.setAttribute('aria-controls', answerId);
            question.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Collapse other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherBtn = otherItem.querySelector('.faq-question');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle target item
                item.classList.toggle('active', !isActive);
                question.setAttribute('aria-expanded', String(!isActive));
            });
        }
    });

    /**
     * Form Submission with Rapid Click Guard, Validation, Timeout & Offline Check
     */
    if (contactForm && successState) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Prevent rapid multi-submission race conditions
            if (contactForm.dataset.submitting === 'true') return;
            
            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phone');
            const serviceInput = document.getElementById('service');
            const messageInput = document.getElementById('message');
            const botcheckInput = contactForm.querySelector('input[name="botcheck"]');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            // Bot check (honeypot field)
            if (botcheckInput && botcheckInput.checked) {
                return; // Silent fail for automated bots
            }

            // Clear previous form error message
            if (formErrorDisplay) {
                formErrorDisplay.classList.add('hidden');
                formErrorDisplay.textContent = '';
            }

            // Client-side Validation
            let hasError = false;
            [nameInput, phoneInput, serviceInput].forEach(input => {
                if (!input) return;
                const parent = input.closest('.form-group');
                if (!input.value.trim()) {
                    if (parent) {
                        parent.classList.add('error');
                        parent.setAttribute('data-error', 'Required field');
                    }
                    hasError = true;
                } else if (parent) {
                    parent.classList.remove('error');
                }
            });

            // Phone specific validation (10 to 12 digits)
            if (phoneInput && phoneInput.value.trim()) {
                const cleanPhone = phoneInput.value.replace(/\D/g, '');
                if (!/^\d{10,12}$/.test(cleanPhone)) {
                    const parent = phoneInput.closest('.form-group');
                    if (parent) {
                        parent.classList.add('error');
                        parent.setAttribute('data-error', 'Enter valid 10-digit phone number');
                    }
                    hasError = true;
                }
            }

            if (hasError) return;

            // Offline check
            if (!navigator.onLine) {
                showFormError("You appear to be offline. Please check your internet connection or contact us via WhatsApp.");
                return;
            }

            contactForm.dataset.submitting = 'true';
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Request Call Back';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
            }

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // Set up 10-second timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const result = await response.json();

                if (response.status === 200 && result.success !== false) {
                    contactForm.classList.add('hidden');
                    successState.classList.remove('hidden');
                    
                    // Device Detection for WhatsApp Redirection
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
                    
                    if (isMobile) {
                        const whatsappNumber = "919136098583"; 
                        const serviceText = serviceInput && serviceInput.selectedIndex !== -1 ? serviceInput.options[serviceInput.selectedIndex].text : 'Not selected';
                        const text = `*New Request Call Back*%0a` +
                                     `*Name:* ${encodeURIComponent(nameInput ? nameInput.value.trim() : '')}%0a` +
                                     `*Phone:* ${encodeURIComponent(phoneInput ? phoneInput.value.trim() : '')}%0a` +
                                     `*Service:* ${encodeURIComponent(serviceText)}%0a` +
                                     `*Brief:* ${encodeURIComponent((messageInput && messageInput.value.trim()) || 'No message provided')}`;
                        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${text}`;
                        // Use location redirect to prevent popup blockers from blocking window.open on mobile
                        window.location.href = whatsappLink;
                    }
                } else {
                    const errorMessage = result.message || "Something went wrong! Please try again.";
                    showFormError(errorMessage);
                }
            } catch (error) {
                clearTimeout(timeoutId);
                const isTimeout = error.name === 'AbortError';
                const errorMessage = isTimeout 
                    ? "Request timed out. Please check your network connection or message us on WhatsApp." 
                    : "Network error. Please check your internet connection and try again.";
                showFormError(errorMessage);
            } finally {
                contactForm.dataset.submitting = 'false';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
                
                if (successState && !successState.classList.contains('hidden')) {
                    successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });

        const showFormError = (msg) => {
            if (formErrorDisplay) {
                formErrorDisplay.textContent = msg;
                formErrorDisplay.classList.remove('hidden');
                formErrorDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                alert(msg);
            }
        };

        // Reset Form Logic
        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                contactForm.reset();
                contactForm.dataset.submitting = 'false';
                contactForm.classList.remove('hidden');
                successState.classList.add('hidden');
                if (formErrorDisplay) {
                    formErrorDisplay.classList.add('hidden');
                    formErrorDisplay.textContent = '';
                }
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }

        // Clear inline errors on input/change events
        contactForm.querySelectorAll('input, select, textarea').forEach(input => {
            ['input', 'change'].forEach(evtType => {
                input.addEventListener(evtType, () => {
                    const group = input.closest('.form-group');
                    if (group) group.classList.remove('error');
                    if (formErrorDisplay) formErrorDisplay.classList.add('hidden');
                });
            });
        });
    }

    /**
     * Back-Forward Cache (bfcache) Restoration Cleanup
     */
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            const preloader = document.getElementById('preloader');
            if (preloader && preloader.parentNode) preloader.remove();
            document.body.classList.remove('loading');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            if (contactForm) contactForm.dataset.submitting = 'false';
            const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
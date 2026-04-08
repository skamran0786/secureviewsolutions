window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        document.body.classList.remove('loading');
        setTimeout(() => {
            preloader.remove();
        }, 500);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const header = document.getElementById('header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-links a');
    const contactForm = document.getElementById('contact-form');

    /**
     * Mobile Menu Logic with Scroll Lock
     */
    const toggleMobileMenu = () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', String(!isExpanded)); // Explicitly convert boolean to string
        nav.classList.toggle('active');
        
        if (!isExpanded) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            const scrollY = document.body.style.top;
            const scrollPos = parseInt(scrollY, 10) * -1; // Use radix for parseInt
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, isNaN(scrollPos) ? 0 : scrollPos); // Handle potential NaN from parseInt
        }
        
        const icon = mobileMenuBtn.querySelector('i');
        icon.setAttribute('data-lucide', isExpanded ? 'menu' : 'x');
        if (window.lucide) lucide.createIcons();
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) toggleMobileMenu();
        });
    });

    /**
     * Header Scroll Effect & Dynamic Offset
     */
    let headerHeight = header ? header.offsetHeight : 80;

    const handleScroll = () => {
        if (!header) return;
        const isScrolled = window.scrollY > 50;
        if (header.classList.contains('scrolled') !== isScrolled) {
            header.classList.toggle('scrolled', isScrolled);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            headerHeight = header ? header.offsetHeight : 80;
        }, 250);
    }, { passive: true });

    /**
     * Smooth Scrolling with Dynamic Offset
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Recalculate header height in case it changed
                const currentHeaderHeight = header ? (header.classList.contains('scrolled') ? 
                                          header.offsetHeight : 
                                          (header.offsetHeight * 0.8)) : 80; // Estimate scrolled height or fallback to 80

                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - currentHeaderHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /**
     * Active Link Highlighting using IntersectionObserver (Performance Optimized)
     */
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '-10% 0px -70% 0px' // Trigger when section is in the upper part of the viewport
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

    const revealSections = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px' // Adjusted for mobile
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Small delay for a more natural feel
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, 50);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Target sections and individual cards for better rhythm
        const elementsToReveal = document.querySelectorAll('.reveal, .category-card, .pricing-card, .testimonial-card, .gallery-item');
        elementsToReveal.forEach(el => observer.observe(el));
    };

    revealSections();

    // Initial Lucide icons creation with a fallback
    const initLucide = () => {
        if (window.lucide) {
            lucide.createIcons();
        } else {
            setTimeout(initLucide, 100);
        }
    };
    initLucide();

    /**
     * Service Worker Registration for Caching & Performance
     */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
        });
    }

    /**
     * FAQ Accordion Logic
     */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => otherItem.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    /**
     * WhatsApp Form Submission with Enhanced Mobile UX & Success State
     */
    const successState = document.getElementById('form-success');
    const resetFormBtn = document.getElementById('reset-form');

    const formErrorDisplay = document.getElementById('form-error-display'); // Assuming this element exists or will be added
    if (contactForm && successState) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phone');
            const serviceInput = document.getElementById('service');
            const messageInput = document.getElementById('message');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            // Clear previous general form errors
            if (formErrorDisplay) formErrorDisplay.classList.add('hidden');
            if (formErrorDisplay) formErrorDisplay.textContent = '';
            
            // Simple validation UI
            let hasError = false;
            [nameInput, phoneInput, serviceInput].forEach(input => {
                const parent = input.closest('.form-group');
                if (!input.value.trim()) {
                    parent.classList.add('error');
                    parent.setAttribute('data-error', 'Required field');
                    hasError = true;
                } else {
                    parent.classList.remove('error');
                }
            });

            // Phone specific validation
            if (phoneInput.value.trim() && !/^\d{10,12}$/.test(phoneInput.value.replace(/\D/g,''))) {
                const parent = phoneInput.closest('.form-group');
                parent.classList.add('error');
                parent.setAttribute('data-error', 'Enter valid 10-digit number');
                hasError = true;
            }

            if (hasError) return;

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    // Show Success State
                    contactForm.classList.add('hidden');
                    successState.classList.remove('hidden');
                    
                    // Device Detection for WhatsApp Redirection
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
                    
                    if (isMobile) {
                        const whatsappNumber = "919136098583"; 
                        const serviceText = serviceInput.selectedIndex !== -1 ? serviceInput.options[serviceInput.selectedIndex].text : 'Not selected';
                        const text = `*New Request Call Back*%0a` +
                                     `*Name:* ${encodeURIComponent(nameInput.value.trim())}%0a` +
                                     `*Phone:* ${encodeURIComponent(phoneInput.value.trim())}%0a` +
                                     `*Service:* ${encodeURIComponent(serviceText)}%0a` +
                                     `*Brief:* ${encodeURIComponent(messageInput.value.trim() || 'No message provided')}`;
                        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${text}`;
                        window.open(whatsappLink, '_blank', 'noopener,noreferrer');
                    }
                } else {
                    console.log(response);
                    const errorMessage = json.message || "Something went wrong! Please try again.";
                    if (formErrorDisplay) {
                        formErrorDisplay.textContent = errorMessage;
                        formErrorDisplay.classList.remove('hidden');
                        formErrorDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        alert(errorMessage); // Fallback to alert if no display element
                    }
                }
            })
            .catch(error => {
                console.log(error);
                if (formErrorDisplay) { formErrorDisplay.textContent = "Network error. Please check your internet connection."; formErrorDisplay.classList.remove('hidden'); } else { alert("Network error. Please check your internet connection."); }
            })
            .then(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                if (successState.classList.contains('hidden') === false) {
                    successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });

        // Reset Form Logic
        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                contactForm.reset();
                contactForm.classList.remove('hidden');
                successState.classList.add('hidden');
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }

        // Clear errors on input
        contactForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => {
                input.closest('.form-group').classList.remove('error');
            });
        });
    }
});
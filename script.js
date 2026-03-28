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
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('active');
        
        if (!isExpanded) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
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
                const currentHeaderHeight = header.classList.contains('scrolled') ? 
                                          header.offsetHeight : 
                                          (header.offsetHeight * 0.8); // Estimate scrolled height

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
     * Reveal on Scroll Interaction (Intersection Observer)
     */
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
     * WhatsApp Form Submission
     */
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            try {
                const name = document.getElementById('name').value.trim();
                const phone = document.getElementById('phone').value.trim();
                const service = document.getElementById('service').value;
                const message = document.getElementById('message').value.trim();
                
                if (!name || !phone) return;

                submitBtn.disabled = true;
                submitBtn.textContent = 'Processing...';

                const whatsappNumber = "919136098583"; 
                const text = `*New Enterprise Inquiry*%0a` +
                             `*Name:* ${encodeURIComponent(name)}%0a` +
                             `*Phone:* ${encodeURIComponent(phone)}%0a` +
                             `*Service:* ${encodeURIComponent(service)}%0a` +
                             `*Brief:* ${encodeURIComponent(message)}`;
                
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${text}`;
                window.open(whatsappLink, '_blank', 'noopener,noreferrer');
                
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }, 1000);

            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                alert('An error occurred. Please try again.');
            }
        });
    }
});
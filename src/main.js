import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
  autoRaf: true,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
})

// Inject Page Transition Overlay
const transitionOverlay = document.createElement('div');
transitionOverlay.classList.add('page-transition');
document.body.appendChild(transitionOverlay);

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// 2. Circular Cursor Logic
const cursor = document.querySelector('.cursor-circle')
const mouse = { x: 0, y: 0 }
const pos = { x: 0, y: 0 }
let initialized = false

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY

  if (!initialized) {
    pos.x = mouse.x
    pos.y = mouse.y
    initialized = true
    gsap.to(cursor, { autoAlpha: 1, duration: 0.3 })
  }
})

gsap.ticker.add(() => {
  pos.x += (mouse.x - pos.x) * 0.15
  pos.y += (mouse.y - pos.y) * 0.15
  gsap.set(cursor, {
    x: pos.x,
    y: pos.y,
    xPercent: -50,
    yPercent: -50
  })
})

// Cursor States Logic
const updateCursorHover = () => {
  const textElements = document.querySelectorAll('h1, h2, .about-box, .work-item, .marquee-text, a, .magnetic-btn')
  textElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover-text'))
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover-text'))
  })
}
updateCursorHover()

// 3. Loader Animation
const loader = document.querySelector('.loader')
const loaderContent = document.querySelector('.loader-content')

if (loader) {
  let loadingProgress = { val: 0 }
  gsap.to(loadingProgress, {
    val: 100,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      if (loaderContent) {
        loaderContent.innerText = `${Math.round(loadingProgress.val)}%`
        // Growing effect
        const scale = 1 + (loadingProgress.val / 100) * 2 // Grows from 1 to 3
        gsap.set(loaderContent, { scale: scale, opacity: 0.5 + (loadingProgress.val / 100) * 0.5 })
      }
    },
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 1,
        ease: "power4.inOut",
        onComplete: () => {
          initAnimations()
        }
      })
    }
  })
} else {
  initAnimations()
}

// 4. Reveal Animations Setup
const heroTitle = document.querySelector('.hero-title')
if (heroTitle) {
  const heroLines = heroTitle.innerHTML.split('<br>')
  heroTitle.innerHTML = heroLines.map(line => {
    return `<div class="line-wrapper"><div class="line-inner">${line}</div></div>`
  }).join('')
}

// 4. Hacker Effect Utility
function animateHackerText(el, delay = 0) {
  if (!el) return;
  const originalText = el.innerText;
  const letters = originalText.split("");
  const codeChars = "01$#%&@*ZX<>?/!{}[]";
  el.innerHTML = "";
  el.style.opacity = 1;
  el.style.visibility = 'visible';

  letters.forEach((letter, i) => {
    const span = document.createElement("span");
    span.innerText = letter === " " ? "\u00A0" : codeChars[Math.floor(Math.random() * codeChars.length)];
    span.style.opacity = "0";
    span.style.display = "inline-block";
    el.appendChild(span);

    gsap.to(span, {
      opacity: 1,
      duration: 0.1,
      delay: delay + (i * 0.05),
      onStart: () => {
        if (letter !== " ") {
          let count = 0;
          const interval = setInterval(() => {
            span.innerText = codeChars[Math.floor(Math.random() * codeChars.length)];
            count++;
            if (count > 4) {
              clearInterval(interval);
              span.innerText = letter;
            }
          }, 50);
        }
      }
    });
  });
}

// 5. Reveal Animations Prep
// Pre-split ALL reveal-text immediately to prevent flash
const revealTexts = document.querySelectorAll('.reveal-text')
revealTexts.forEach(revealText => {
  const text = revealText.innerText
  revealText.innerHTML = text.split(' ').map(word => `<span class="word-wrapper" style="overflow:hidden; display:inline-block; vertical-align: top;"><span class="word-inner" style="display:inline-block; transform:translateY(100%); opacity:0;">${word}&nbsp;</span></span>`).join('')
})

function initAnimations() {
  // Re-select Hacker elements to ensure they exist (fixes Blog page issue)
  const logo = document.querySelector('#logo');
  const navLinks = document.querySelectorAll('.nav-links a');

  // Hacker reveal for Logo (0.5s) and then Links (1.5s)
  if (logo) animateHackerText(logo, 0.5);
  navLinks.forEach((link, i) => {
    animateHackerText(link, 1.5 + (i * 0.1));
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target);
      }
    });
  });

  // Hero reveal
  if (heroTitle) {
    gsap.fromTo(".line-inner",
      { yPercent: 120, skewY: 10, autoAlpha: 0 },
      { yPercent: 0, skewY: 0, autoAlpha: 1, duration: 1.8, stagger: 0.1, ease: "power4.out", delay: 0.2 }
    )
  }

  const heroTag = document.querySelector('.hero-tag');
  if (heroTag) {
    // Re-split hero-tag for animation logic
    const tagText = heroTag.innerText;
    heroTag.innerHTML = tagText.split('').map(char => `<span class="char" style="opacity: 0; display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    gsap.to(".hero-tag .char", { opacity: 1, x: 0, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.8 })
  }

  const heroFooter = document.querySelector('.hero-footer')
  if (heroFooter) {
    gsap.to(heroFooter, { opacity: 0.8, y: 0, duration: 1.5, ease: "power3.out", delay: 1.2 })
  }

  // Scroll reveal for all .reveal-text
  revealTexts.forEach(revealText => {
    const wordInners = revealText.querySelectorAll('.word-inner')
    gsap.to(wordInners, {
      scrollTrigger: {
        trigger: revealText,
        start: "top 90%",
        toggleActions: "play none none reverse"
      },
      y: "0%",
      opacity: 1,
      duration: 1.5,
      stagger: 0.1,
      ease: "power3.out"
    })

    // Interactive Liquid Gradient Effect
    const handleMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX)
      const y = e.clientY || (e.touches && e.touches[0].clientY)

      wordInners.forEach(word => {
        const rect = word.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distance = Math.hypot(x - centerX, y - centerY)
        const effectRadius = 100

        if (distance < effectRadius) {
          const proximity = 1 - (distance / effectRadius)
          gsap.to(word, {
            color: 'transparent',
            backgroundImage: `linear-gradient(${135 + proximity * 360}deg, #ff3e00 0%, #ff00ea 50%, #0070ff 100%)`,
            backgroundSize: '200% auto',
            backgroundPosition: `${proximity * 100}% center`,
            duration: 0.2,
            ease: "none",
            overwrite: 'auto'
          })
        } else {
          gsap.to(word, {
            color: '#070707',
            backgroundImage: 'none',
            duration: 0.4,
            ease: "power2.out",
            overwrite: 'auto'
          })
        }
      })
    }
    revealText.addEventListener('mousemove', handleMove)
    revealText.addEventListener('touchmove', handleMove, { passive: true })
  })

  // Philosophy / Box Reveal
  const aboutBox = document.querySelector('.about-box')
  if (aboutBox) {
    const aboutTitles = aboutBox.querySelectorAll('.about-box-title')
    const aboutHeader = aboutBox.querySelector('.about-box-header')
    const aboutFooter = aboutBox.querySelector('.about-box-footer')
    const aboutIcon = aboutBox.querySelector('.about-box-icon')

    const splitToChars = (el) => {
      if (!el) return
      const children = el.children
      if (children.length > 0) {
        // If it has children (like spans for left/right), split each child's text
        Array.from(children).forEach(child => {
          const text = child.innerText
          child.innerHTML = text.split('').map(char => {
            if (char === ' ') return '<span class="char-space" style="opacity: 0; display: inline-block;">&nbsp;</span>'
            return `<span class="char" style="opacity: 0; display: inline-block;">${char}</span>`
          }).join('')
        })
      } else {
        // Otherwise split the element's own text
        const text = el.innerText
        el.innerHTML = text.split('').map(char => {
          if (char === ' ') return '<span class="char-space" style="opacity: 0; display: inline-block;">&nbsp;</span>'
          return `<span class="char" style="opacity: 0; display: inline-block;">${char}</span>`
        }).join('')
      }
    }

    aboutTitles.forEach(splitToChars)
    splitToChars(aboutHeader)
    splitToChars(aboutFooter)
    if (aboutIcon) gsap.set(aboutIcon, { scale: 0, opacity: 0 })

    ScrollTrigger.create({
      trigger: ".about-pin",
      start: "top 60%",
      onEnter: () => {
        const tl = gsap.timeline()
        if (aboutHeader) tl.to(aboutHeader.querySelectorAll('.char, .char-space'), { opacity: 1, stagger: 0.02, duration: 0.1 })
        if (aboutTitles[0]) tl.to(aboutTitles[0].querySelectorAll('.char, .char-space'), { opacity: 1, stagger: 0.04, duration: 0.1 }, "+=0.1")
        if (aboutIcon) tl.to(aboutIcon, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, "+=0.1")
        if (aboutTitles[1]) tl.to(aboutTitles[1].querySelectorAll('.char, .char-space'), { opacity: 1, stagger: 0.04, duration: 0.1 }, "+=0.1")
        if (aboutFooter) tl.to(aboutFooter.querySelectorAll('.char, .char-space'), { opacity: 1, stagger: 0.02, duration: 0.1 }, "+=0.2")
      }
    })

    gsap.to(aboutBox, {
      scrollTrigger: {
        trigger: ".about-pin",
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
        onUpdate: (self) => {
          // Fade background from black to light as we reach full scale
          const progress = self.progress
          if (progress > 0.8) {
            gsap.to(".about-pin", { backgroundColor: '#eaeaea', duration: 0.5, overwrite: 'auto' })
          } else {
            gsap.to(".about-pin", { backgroundColor: '#070707', duration: 0.5, overwrite: 'auto' })
          }
        }
      },
      scale: 1,
      borderRadius: 0,
    })
  }

  // Horizontal
  const horizontalSection = document.querySelector('.horizontal-section')
  const horizontalContent = document.querySelector('.horizontal-content')
  if (horizontalSection && horizontalContent) {
    if (window.innerWidth > 768) {
      const workImages = document.querySelectorAll('.work-item img')
      gsap.to(horizontalContent, {
        x: () => -(horizontalContent.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSection,
          start: "top top",
          end: () => `+=${horizontalContent.scrollWidth}`,
          scrub: 1,
          pin: true,
          onUpdate: () => {
            workImages.forEach(img => {
              const rect = img.getBoundingClientRect()
              const center = window.innerWidth / 2
              const imgCenter = rect.left + rect.width / 2
              if (Math.abs(imgCenter - center) < window.innerWidth * 0.15) {
                img.classList.add('active')
              } else {
                img.classList.remove('active')
              }
            })
          }
        }
      })
    }
  }

  // Stacking Cards
  const cards = document.querySelectorAll('.card')
  if (cards.length > 0) {
    cards.forEach((card, index) => {
      if (index !== cards.length - 1) {
        gsap.to(card, {
          scale: 0.9,
          opacity: 0,
          scrollTrigger: {
            trigger: card,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        })
      }
    })
  }

  // Marquees (Experience & Portfolio) - Moved to end for proper refresh
  const marquees = document.querySelectorAll('.marquee-section')
  marquees.forEach(marquee => {
    const text = marquee.querySelector('.marquee-text')
    if (text) {
      gsap.to(text, {
        scrollTrigger: {
          trigger: marquee,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true
        },
        xPercent: -100, // Maximum movement
        ease: "none"
      })
    }
  })

  // Footer Shine Delay (No entrance effect)
  const footerCta = document.querySelector('.footer-cta')
  if (footerCta) {
    ScrollTrigger.create({
      trigger: ".footer",
      start: "top 90%",
      once: true,
      onEnter: () => {
        // Start the shine animation after 1 second (faster than before)
        gsap.delayedCall(1, () => {
          footerCta.style.animationPlayState = 'running'
        })
      }
    })
  }

  // Refresh ScrollTrigger to account for pinned sections
  ScrollTrigger.refresh()

  // Blog Link Recurring Highlight
  const blogLink = document.querySelector('#blog-link');
  if (blogLink) {
    // Initial pulse soon after load
    setTimeout(() => {
      blogLink.classList.add('highlight-pulse');
      setTimeout(() => blogLink.classList.remove('highlight-pulse'), 3000);
    }, 2000);

    // Recurring pulse (faster: 5s interval)
    setInterval(() => {
      blogLink.classList.add('highlight-pulse');
      setTimeout(() => {
        blogLink.classList.remove('highlight-pulse');
      }, 3000);
    }, 5000);
  }

  // Handle Internal Page Transitions (Exit Animation)
  const allLinks = document.querySelectorAll('a');
  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Check if it's an internal link (relative or same domain) and not just an anchor
    if (href && (href.startsWith('/') || href.includes(window.location.hostname)) && !href.startsWith('#')) {
      link.addEventListener('click', (e) => {
        // If it's the current page (just hash change or same URL), let default happen or handled by Lenis
        if (href === window.location.pathname || href === window.location.href) return;

        // If it's a real navigation
        e.preventDefault();

        gsap.to(transitionOverlay, {
          yPercent: 0,
          duration: 0.8,
          ease: "power4.inOut",
          onComplete: () => {
            window.location.href = href;
          }
        });
      });
    }
  });

  // Mobile Menu Logic
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const menuOverlay = document.querySelector('.mobile-menu-overlay');
  const menuClose = document.querySelector('.mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-links a');

  if (menuToggle && menuOverlay && menuClose) {
    const tl = gsap.timeline({ paused: true });

    tl.to(menuOverlay, {
      opacity: 1,
      pointerEvents: 'all',
      duration: 0.5,
      ease: "power2.out"
    })
      .to(mobileLinks, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.3");

    menuToggle.addEventListener('click', () => {
      tl.play();
    });

    const closeMenu = () => {
      tl.reverse();
    };

    menuClose.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
        // Allow page transition logic to take over if needed
      });
    });
  }
}

// 8. Magnetic Buttons (Persistent)
const magnets = document.querySelectorAll('.magnetic-btn')
magnets.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" })
  })
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.3, ease: "power2.out" })
  })
})

import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
  autoRaf: true, // Let Lenis handle requestAnimationFrame
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
})

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
const textElements = document.querySelectorAll('h1, h2, .about-box, .work-item, .marquee-text')

textElements.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover-text'))
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover-text'))
})

// 3. Loader Animation
const loader = document.querySelector('.loader')
const loaderContent = document.querySelector('.loader-content')

let loadingProgress = { val: 0 }
gsap.to(loadingProgress, {
  val: 100,
  duration: 2,
  ease: "power2.inOut",
  onUpdate: () => {
    loaderContent.innerText = `${Math.round(loadingProgress.val)}%`
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

// 4. Reveal Animations
// Pre-split hero titles to prevent jump and animate on load
const heroTitle = document.querySelector('.hero-title')
const heroLines = heroTitle.innerHTML.split('<br>')
heroTitle.innerHTML = heroLines.map(line => {
  return `<div class="line-wrapper"><div class="line-inner">${line}</div></div>`
}).join('')

const heroTag = document.querySelector('.hero-tag')
const tagChars = heroTag.innerText.split('')
heroTag.innerHTML = tagChars.map(char => `<span class="char" style="opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`).join('')

function initAnimations() {
  // Trigger hero animations immediately after loader
  gsap.fromTo(".line-inner",
    { yPercent: 120, skewY: 10, autoAlpha: 0 },
    {
      yPercent: 0,
      skewY: 0,
      autoAlpha: 1,
      duration: 1.8,
      stagger: 0.1,
      ease: "power4.out",
      delay: 0.2
    }
  )

  gsap.to(".hero-tag .char", {
    opacity: 1,
    x: 0,
    duration: 1,
    stagger: 0.03,
    ease: "power3.out",
    delay: 0.8
  })

  gsap.to(".hero-footer", {
    opacity: 0.8,
    y: 0,
    duration: 1.5,
    ease: "power3.out",
    delay: 1.2
  })

  // Hero parallax on scroll
  gsap.to(".hero-title", {
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    },
    yPercent: 50,
    scale: 0.9,
    opacity: 0
  })

  // Scroll reveal for sections (Typewriter + Slide up) - SLOWER & SMOOTHER
  const detailText = document.querySelector('.about-details .reveal-text')
  if (detailText) {
    const detailWords = detailText.innerText.split(' ')
    detailText.innerHTML = detailWords.map(word => `<span class="word-wrapper" style="overflow:hidden; display:inline-block; vertical-align: top;"><span class="word-inner" style="display:inline-block; transform:translateY(100%); opacity:0;">${word}&nbsp;</span></span>`).join('')

    const wordInners = detailText.querySelectorAll('.word-inner')

    gsap.to(wordInners, {
      scrollTrigger: {
        trigger: detailText,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: "0%",
      opacity: 1,
      duration: 2, // Slower/Smoother as requested
      stagger: 0.15,
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

        // Liquid color change - faster and responsive
        const effectRadius = 100

        if (distance < effectRadius) {
          const proximity = 1 - (distance / effectRadius)
          gsap.to(word, {
            color: 'transparent',
            backgroundImage: `linear-gradient(${135 + proximity * 360}deg, #ff3e00 0%, #ff00ea 50%, #0070ff 100%)`,
            backgroundSize: '200% auto',
            backgroundPosition: `${proximity * 100}% center`,
            duration: 0.2, // Faster entry
            ease: "none",
            overwrite: 'auto'
          })
        } else {
          gsap.to(word, {
            color: '#070707',
            backgroundImage: 'none',
            duration: 0.4, // Faster but fluid return
            ease: "power2.out",
            overwrite: 'auto'
          })
        }
      })
    }

    detailText.addEventListener('mousemove', handleMove)
    detailText.addEventListener('touchmove', handleMove, { passive: true })
  }

  // Box Expansion Animation + Sequence Reveal
  const aboutBox = document.querySelector('.about-box')
  const aboutTitles = aboutBox.querySelectorAll('.about-box-title')
  const aboutHeader = aboutBox.querySelector('.about-box-header')
  const aboutFooter = aboutBox.querySelector('.about-box-footer')
  const aboutIcon = aboutBox.querySelector('.about-box-icon')

  // Helper to split text into chars
  const splitToChars = (el) => {
    const spans = el.querySelectorAll('span')
    if (spans.length > 0) {
      spans.forEach(span => {
        const text = span.innerText
        span.innerHTML = text.split('').map(char => `<span class="char" style="opacity: 0; display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`).join('')
      })
    } else {
      const text = el.innerText
      el.innerHTML = text.split('').map(char => `<span class="char" style="opacity: 0; display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`).join('')
    }
  }

  // Split everything
  aboutTitles.forEach(splitToChars)
  splitToChars(aboutHeader)
  splitToChars(aboutFooter)
  if (aboutIcon) gsap.set(aboutIcon, { scale: 0, opacity: 0 })

  // Sequential Reveal - Triggered earlier
  ScrollTrigger.create({
    trigger: ".about-pin",
    start: "top 60%",
    onEnter: () => {
      const tl = gsap.timeline()

      // 1. Header
      tl.to(aboutHeader.querySelectorAll('.char'), {
        opacity: 1,
        stagger: 0.02,
        duration: 0.1,
        ease: "none"
      })
        // 2. First Title
        .to(aboutTitles[0].querySelectorAll('.char'), {
          opacity: 1,
          stagger: 0.04,
          duration: 0.1,
          ease: "none"
        }, "+=0.1")
        // 3. Icon
        .to(aboutIcon, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(2)"
        }, "+=0.1")
        // 4. Second Title
        .to(aboutTitles[1].querySelectorAll('.char'), {
          opacity: 1,
          stagger: 0.04,
          duration: 0.1,
          ease: "none"
        }, "+=0.1")
        // 5. Footer
        .to(aboutFooter.querySelectorAll('.char'), {
          opacity: 1,
          stagger: 0.02,
          duration: 0.1,
          ease: "none"
        }, "+=0.2")
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
        if (self.progress > 0.8) {
          gsap.to(".about-pin", { backgroundColor: "#eaeaea", duration: 0.5, overwrite: "auto" })
        } else {
          gsap.to(".about-pin", { backgroundColor: "#070707", duration: 0.5, overwrite: "auto" })
        }
      }
    },
    scale: 1,
    borderRadius: 0,
    ease: "none"
  })

  // Magnetic/Parallax Interaction for Philosophy Content
  const aboutPin = document.querySelector('.about-pin')
  const boxCursor = document.querySelector('.box-cursor-data')

  aboutPin.addEventListener('mousemove', (e) => {
    const rect = aboutPin.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update local cursor data
    boxCursor.innerHTML = `X: ${Math.round(x)}<br>Y: ${Math.round(y)}`

    // Parallax movement for titles - subtler
    gsap.to(aboutTitles, {
      x: (x - rect.width / 2) * 0.03,
      y: (y - rect.height / 2) * 0.03,
      duration: 0.8,
      ease: "power2.out"
    })

    // Coordinate data follows mouse more closely
    gsap.to(boxCursor, {
      x: x - (rect.width * 0.1), // Adjusted to be near cursor
      y: y - (rect.height * 0.1),
      duration: 0.4,
      ease: "power2.out"
    })
  })

  // Marquee scroll animation (Slower)
  gsap.to(".marquee-text", {
    scrollTrigger: {
      trigger: ".marquee-section",
      start: "top bottom",
      end: "bottom top",
      scrub: 2
    },
    xPercent: -20,
    ease: "none"
  })


  // 5. Horizontal Scroll (Only on non-touch devices or wide screens)
  const horizontalSection = document.querySelector('.horizontal-section')
  const horizontalContent = document.querySelector('.horizontal-content')

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
        invalidateOnRefresh: true,
        onUpdate: () => {
          workImages.forEach(img => {
            const rect = img.getBoundingClientRect()
            const center = window.innerWidth / 2
            const imgCenter = rect.left + rect.width / 2

            // If the image center is close to the screen center (within 30% of width)
            if (Math.abs(imgCenter - center) < window.innerWidth * 0.15) {
              img.classList.add('active')
            } else {
              img.classList.remove('active')
            }
          })
        }
      }
    })
  } else {
    // Mobile center detection
    const workImages = document.querySelectorAll('.work-item img')
    ScrollTrigger.create({
      trigger: ".horizontal-section",
      start: "top bottom",
      end: "bottom top",
      onUpdate: () => {
        workImages.forEach(img => {
          const rect = img.getBoundingClientRect()
          const center = window.innerHeight / 2
          const imgCenter = rect.top + rect.height / 2
          if (Math.abs(imgCenter - center) < window.innerHeight * 0.2) {
            img.classList.add('active')
          } else {
            img.classList.remove('active')
          }
        })
      }
    })
  }

  // 6. Stacking Cards Animation
  const cards = document.querySelectorAll('.card')
  cards.forEach((card, index) => {
    if (index !== cards.length - 1) { // Don't animate the last card
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

  // 7. Background Color Change
  ScrollTrigger.create({
    trigger: ".stacking-section",
    start: "top center",
    end: "bottom center",
    onEnter: () => gsap.to("body", { backgroundColor: "#070707", color: "#eaeaea", duration: 0.8 }),
    onLeaveBack: () => gsap.to("body", { backgroundColor: "#eaeaea", color: "#070707", duration: 0.8 })
  })
}

// 8. Magnetic Buttons
const magnets = document.querySelectorAll('.magnetic-btn')
magnets.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out"
    })
  })

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    })
  })
})

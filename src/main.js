import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// 2. Custom Cursor Logic
const cursor = document.querySelector('.cursor-pointer')
const cursorData = document.querySelector('.cursor-data')
const posX = { val: 0 }
const posY = { val: 0 }
const mouseX = { val: 0 }
const mouseY = { val: 0 }

window.addEventListener('mousemove', (e) => {
  mouseX.val = e.clientX
  mouseY.val = e.clientY
})

// Lerp loop for cursor
gsap.ticker.add(() => {
  posX.val += (mouseX.val - posX.val) * 0.15
  posY.val += (mouseY.val - posY.val) * 0.15

  gsap.set(cursor, { x: posX.val, y: posY.val })
  gsap.set(cursorData, { x: posX.val, y: posY.val })

  cursorData.querySelector('.x').innerText = `X: ${Math.round(posX.val)}`
  cursorData.querySelector('.y').innerText = `Y: ${Math.round(posY.val)}`
})

// Cursor interactions
const interactiveElements = document.querySelectorAll('a, .work-item')
interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursor, { width: 40, height: 40, duration: 0.3 })
  })
  el.addEventListener('mouseleave', () => {
    gsap.to(cursor, { width: 12, height: 12, duration: 0.3 })
  })
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
function initAnimations() {
  // Split hero title into letters for a premium effect
  const heroTitle = document.querySelector('.hero-title')
  const lines = heroTitle.innerHTML.split('<br>')
  heroTitle.innerHTML = lines.map(line => {
    return `<div class="line-wrapper"><div class="line-inner">${line}</div></div>`
  }).join('')

  // Hero reveal animation
  gsap.from(".line-inner", {
    yPercent: 120,
    skewY: 10,
    duration: 2,
    stagger: 0.2,
    ease: "power4.out",
    delay: 0.2
  })

  const heroTag = document.querySelector('.hero-tag')
  const tagChars = heroTag.innerText.split('')
  heroTag.innerHTML = tagChars.map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join('')

  gsap.from(".hero-tag .char", {
    opacity: 0,
    x: 10,
    duration: 1,
    stagger: 0.05,
    ease: "power3.out",
    delay: 1
  })

  gsap.from(".hero-footer", {
    opacity: 0,
    y: 20,
    duration: 1.5,
    ease: "power3.out",
    delay: 1.5
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

  // Scroll reveal for sections
  const revealTexts = document.querySelectorAll('.about-details .reveal-text')
  revealTexts.forEach(text => {
    const split = text.innerText.split(' ')
    text.innerHTML = split.map(word => `<span>${word} </span>`).join('')

    gsap.from(text.querySelectorAll('span'), {
      scrollTrigger: {
        trigger: text,
        start: "top 85%",
      },
      yPercent: 100,
      skewY: 5,
      opacity: 0,
      duration: 1,
      stagger: 0.02,
      ease: "power3.out"
    })
  })

  // Box Expansion Animation
  gsap.to(".about-box", {
    scrollTrigger: {
      trigger: ".about-pin",
      start: "top top",
      end: "bottom top",
      scrub: true,
      pin: true
    },
    scale: 1,
    borderRadius: 0,
    ease: "none"
  })

  // Marquee scroll animation
  gsap.to(".marquee-text", {
    scrollTrigger: {
      trigger: ".marquee-section",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
    },
    xPercent: -50,
    ease: "none"
  })

  // Floating images parallax
  const floatingImages = document.querySelectorAll('.floating-img')
  floatingImages.forEach(img => {
    const speed = img.dataset.speed
    gsap.to(img, {
      y: -200 * speed,
      scrollTrigger: {
        trigger: ".about-details",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    })
  })

  // 5. Horizontal Scroll
  const horizontalSection = document.querySelector('.horizontal-section')
  const horizontalContent = document.querySelector('.horizontal-content')

  gsap.to(horizontalContent, {
    x: () => -(horizontalContent.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: horizontalSection,
      start: "top top",
      end: () => `+=${horizontalContent.scrollWidth}`,
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true
    }
  })

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

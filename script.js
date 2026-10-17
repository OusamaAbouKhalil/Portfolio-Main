(() => {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Typing effect ---------- */
  const roles = [
    "Mobile & Web Developer",
    "Flutter Engineer",
    "Firebase Specialist",
    "Cross-Platform App Builder",
    "React Developer",
  ];
  const typedEl = document.getElementById("typed");

  if (typedEl) {
    if (prefersReducedMotion) {
      typedEl.textContent = roles[0];
    } else {
      let roleIdx = 0;
      let charIdx = 0;
      let deleting = false;

      const tick = () => {
        const word = roles[roleIdx];
        charIdx += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, charIdx);

        let delay = deleting ? 38 : 72;
        if (!deleting && charIdx === word.length) {
          delay = 1800;
          deleting = true;
        } else if (deleting && charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          delay = 350;
        }
        setTimeout(tick, delay);
      };
      tick();
    }
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".stat-num");
  const formatNum = (n) => n.toLocaleString("en-US");

  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
      el.textContent = formatNum(target) + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------- Nav: scrolled state + scrollspy ---------- */
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);

    let currentId = null;
    const probe = window.scrollY + window.innerHeight * 0.35;
    sections.forEach((section) => {
      if (section.offsetTop <= probe) currentId = section.id;
    });
    navLinks.forEach((link) =>
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${currentId}`
      )
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinksWrap = document.getElementById("navLinks");

  navToggle.addEventListener("click", () => {
    const open = navLinksWrap.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach((link) =>
    link.addEventListener("click", () => {
      navLinksWrap.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Project filters ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      projectCards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Subtle tilt on featured cards (pointer only) ---------- */
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let rafId = null;
      card.addEventListener("mousemove", (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(1100px) rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 2.5).toFixed(2)}deg)`;
          rafId = null;
        });
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Certificate lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  let lastFocused = null;

  const openLightbox = (src, alt) => {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Certificate full view";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll(".cert-card").forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img");
      openLightbox(card.dataset.img, img ? img.alt : "");
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();

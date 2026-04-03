const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const yearTarget = document.querySelector("#year");
const themeToggle = document.querySelector(".theme-toggle");
const backToTopButton = document.querySelector(".back-to-top");
const rootBody = document.body;
const mobileAutoSliders = document.querySelectorAll(".mobile-auto-slider");
const heroSlider = document.querySelector("[data-hero-slider]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const storedTheme = localStorage.getItem("gmc-theme");
const preferredTheme =
  storedTheme ||
  (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

const applyTheme = (theme) => {
  rootBody.dataset.theme = theme;

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
};

applyTheme(preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = rootBody.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("gmc-theme", nextTheme);
  });
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    rootBody.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      rootBody.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealSections = document.querySelectorAll(".reveal-section");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealSections.forEach((section) => revealObserver.observe(section));
} else {
  revealSections.forEach((section) => section.classList.add("is-visible"));
}

const updateBackToTopVisibility = () => {
  if (!backToTopButton) {
    return;
  }

  backToTopButton.classList.toggle("is-visible", window.scrollY > 500);
};

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateBackToTopVisibility();
  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
}

const mobileMediaQuery = window.matchMedia("(max-width: 760px)");
const sliderTimers = new Map();

const stopAutoSlider = (slider) => {
  const timer = sliderTimers.get(slider);
  if (timer) {
    window.clearInterval(timer);
    sliderTimers.delete(slider);
  }
};

const startAutoSlider = (slider) => {
  stopAutoSlider(slider);

  if (!mobileMediaQuery.matches) {
    slider.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }

  const step = () => {
    const card = slider.querySelector(":scope > *");
    if (!card) {
      return;
    }

    const gap = 14;
    const cardWidth = card.getBoundingClientRect().width + gap;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const nextLeft = slider.scrollLeft + cardWidth;

    slider.scrollTo({
      left: nextLeft >= maxScroll - 4 ? 0 : nextLeft,
      behavior: "smooth",
    });
  };

  const timer = window.setInterval(step, 3200);
  sliderTimers.set(slider, timer);
};

mobileAutoSliders.forEach((slider) => {
  startAutoSlider(slider);

  slider.addEventListener("pointerenter", () => stopAutoSlider(slider));
  slider.addEventListener("pointerleave", () => startAutoSlider(slider));
  slider.addEventListener("touchstart", () => stopAutoSlider(slider), { passive: true });
  slider.addEventListener("touchend", () => startAutoSlider(slider), { passive: true });
});

const syncMobileSliders = () => {
  mobileAutoSliders.forEach((slider) => startAutoSlider(slider));
};

if (typeof mobileMediaQuery.addEventListener === "function") {
  mobileMediaQuery.addEventListener("change", syncMobileSliders);
} else if (typeof mobileMediaQuery.addListener === "function") {
  mobileMediaQuery.addListener(syncMobileSliders);
}

if (heroSlider) {
  const heroSlides = Array.from(heroSlider.querySelectorAll(".hero-slide"));
  const heroDots = Array.from(heroSlider.querySelectorAll(".hero-slider-dot"));
  let activeHeroIndex = heroSlides.findIndex((slide) => slide.classList.contains("is-active"));
  let heroTimer = null;

  if (activeHeroIndex < 0) {
    activeHeroIndex = 0;
  }

  const renderHeroSlide = (index) => {
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-pressed", String(dotIndex === index));
    });

    activeHeroIndex = index;
  };

  const stopHeroSlider = () => {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
  };

  const startHeroSlider = () => {
    stopHeroSlider();

    if (heroSlides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(() => {
      const nextIndex = (activeHeroIndex + 1) % heroSlides.length;
      renderHeroSlide(nextIndex);
    }, 3600);
  };

  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      renderHeroSlide(index);
      startHeroSlider();
    });
  });

  heroSlider.addEventListener("pointerenter", stopHeroSlider);
  heroSlider.addEventListener("pointerleave", startHeroSlider);
  heroSlider.addEventListener("touchstart", stopHeroSlider, { passive: true });
  heroSlider.addEventListener("touchend", startHeroSlider, { passive: true });

  renderHeroSlide(activeHeroIndex);
  startHeroSlider();
}

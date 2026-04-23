const nav = document.getElementById("nav");
const navLinks = document.getElementById("navLinks");
const hamburger = document.getElementById("hamburger");
const gameWrapper = document.getElementById("gameWrapper");
const gameExpand = document.getElementById("gameExpand");

const syncNavShadow = () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
};

const closeMenu = () => {
  navLinks.classList.remove("is-open");
  hamburger.classList.remove("is-open");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

syncNavShadow();
window.addEventListener("scroll", syncNavShadow, { passive: true });

hamburger.addEventListener("click", () => {
  const nextOpen = !navLinks.classList.contains("is-open");
  navLinks.classList.toggle("is-open", nextOpen);
  hamburger.classList.toggle("is-open", nextOpen);
  hamburger.setAttribute("aria-expanded", String(nextOpen));
  document.body.classList.toggle("menu-open", nextOpen);
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (!nav.contains(event.target)) {
    closeMenu();
  }
});

gameExpand.addEventListener("click", () => {
  const expanded = !gameWrapper.classList.contains("is-expanded");
  gameWrapper.classList.toggle("is-expanded", expanded);
  document.body.classList.toggle("preview-open", expanded);
  gameExpand.setAttribute("aria-label", expanded ? "Collapse preview" : "Expand preview");
  gameExpand.textContent = expanded ? "×" : "⛶";
});

document.querySelectorAll(".faq-item").forEach((item) => {
  const button = item.querySelector(".faq-q");
  button.setAttribute("aria-expanded", "false");

  button.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    document.querySelectorAll(".faq-item").forEach((entry) => {
      entry.classList.remove("is-open");
      entry.querySelector(".faq-q").setAttribute("aria-expanded", "false");
    });

    item.classList.toggle("is-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && gameWrapper.classList.contains("is-expanded")) {
    gameWrapper.classList.remove("is-expanded");
    document.body.classList.remove("preview-open");
    gameExpand.setAttribute("aria-label", "Expand preview");
    gameExpand.textContent = "⛶";
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.15
  }
);

document.querySelectorAll(".fade-in").forEach((element) => {
  observer.observe(element);
});

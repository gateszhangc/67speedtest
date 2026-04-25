const nav = document.getElementById("nav");
const buttonRedirectUrl = "https://mirofish.my/";

const syncNavShadow = () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
};

const redirectButtonClick = (event) => {
  event.preventDefault();
  window.location.assign(buttonRedirectUrl);
};

const redirectTargetSelector = ["button", "a.cta-btn", "a.nav-cta"].join(", ");

syncNavShadow();
window.addEventListener("scroll", syncNavShadow, { passive: true });

document.querySelectorAll(redirectTargetSelector).forEach((target) => {
  target.addEventListener("click", redirectButtonClick);
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

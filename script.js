document.addEventListener("DOMContentLoaded", function () {

  // MOBILE NAVIGATION
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".nav-links");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      navigation.classList.toggle("open");

      const isOpen = navigation.classList.contains("open");
      menuButton.setAttribute("aria-expanded", isOpen);
      menuButton.textContent = isOpen ? "×" : "☰";
    });

    navigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.textContent = "☰";
      });
    });
  }

  // AUTOMATIC COPYRIGHT YEAR
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(
        link.getAttribute("href")
      );

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // IMAGE LOADING
  document.querySelectorAll("img").forEach(function (image) {
    image.loading = "lazy";
  });

});

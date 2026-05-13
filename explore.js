const buttons = document.querySelectorAll(".cat");
const cards = document.querySelectorAll(".case-card");
const search = document.getElementById("searchInput");
lucide.createIcons();

let currentCategory = "all";

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    filterCases();
  });
});

search.addEventListener("input", filterCases);

function filterCases() {
  const text = search.value.toLowerCase();

  cards.forEach(card => {
    const content = card.innerText.toLowerCase();
    const category = card.dataset.cat;

    const show =
      (currentCategory === "all" || category === currentCategory) &&
      content.includes(text);

    card.style.display = show ? "block" : "none";
  });
}

const caseGrid = document.querySelector('.cases');
let scrollbarTimer;
const HIDE_DELAY = 500;

function showScrollbar() {
  caseGrid.classList.add('scrolling');
  clearTimeout(scrollbarTimer);
  scrollbarTimer = setTimeout(hideScrollbar, HIDE_DELAY);
}

function hideScrollbar() {
  caseGrid.classList.remove('scrolling');
}

caseGrid.addEventListener('scroll', showScrollbar, { passive: true });
caseGrid.addEventListener('wheel', showScrollbar, { passive: true });
caseGrid.addEventListener('mouseenter', showScrollbar, { passive: true });
caseGrid.addEventListener('mouseleave', () => {
  clearTimeout(scrollbarTimer);
  scrollbarTimer = setTimeout(hideScrollbar, HIDE_DELAY);
});

resetScrollbarTimer();
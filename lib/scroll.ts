export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

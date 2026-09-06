document.addEventListener("DOMContentLoaded", () => {
  const tickerTrack = document.querySelector(".ticker-track");
  if (tickerTrack) {
    const clone = tickerTrack.cloneNode(true);
    tickerTrack.parentElement.appendChild(clone);
  }

  document.querySelectorAll("[data-copy-loader]").forEach((button) => {
    button.addEventListener("click", async () => {
      const loader = button.dataset.copyLoader;
      if (!loader) return;

      await navigator.clipboard.writeText(loader);
      const originalLabel = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 1500);
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const tickerTrack = document.querySelector(".ticker-track");
  if (tickerTrack) {
    const clone = tickerTrack.cloneNode(true);
    tickerTrack.parentElement.appendChild(clone);
  }
});
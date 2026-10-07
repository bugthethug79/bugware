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

  const reviewList = document.querySelector("[data-review-list]");
  if (reviewList) {
    const reviewStatus = document.querySelector("[data-review-status]");

    fetch("reviews.xml")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load reviews.");
        return response.text();
      })
      .then((source) => {
        const documentXml = new DOMParser().parseFromString(source, "application/xml");
        if (documentXml.querySelector("parsererror")) {
          throw new Error("The reviews file could not be read.");
        }

        const reviews = [...documentXml.querySelectorAll("review")]
          .map((review) => ({
            username: review.querySelector("username")?.textContent.trim() || "Anonymous",
            text: review.querySelector("text")?.textContent.trim() || "",
            rating: Number(review.querySelector("rating")?.textContent),
          }))
          .filter((review) => review.text && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5);

        if (!reviews.length) throw new Error("No reviews are available yet.");

        const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
        document.querySelector("[data-review-average]").textContent = average.toFixed(1);
        document.querySelector("[data-review-count]").textContent = reviews.length;
        const roundedAverage = Math.round(average);
        document.querySelector("[data-review-stars]").textContent = `${"★".repeat(roundedAverage)}${"☆".repeat(5 - roundedAverage)}`;

        reviews.forEach((review) => {
          const card = document.createElement("article");
          card.className = "review-card";

          const header = document.createElement("div");
          header.className = "review-card-header";

          const username = document.createElement("h2");
          username.className = "review-username";
          username.textContent = review.username;

          const rating = document.createElement("span");
          rating.className = "review-rating";
          rating.setAttribute("aria-label", `${review.rating} out of 5 stars`);
          rating.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;

          const text = document.createElement("p");
          text.className = "review-text";
          text.textContent = review.text;

          header.append(username, rating);
          card.append(header, text);
          reviewList.append(card);
        });

        if (reviewStatus) reviewStatus.textContent = "";
      })
      .catch(() => {
        if (reviewStatus) reviewStatus.textContent = "Reviews could not be loaded right now.";
      });
  }
});
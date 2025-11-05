// Attach behavior after DOM is ready
// Term 2 data: one entry per course with a resources array.
// kind: "quiz" | "assignment" | "midterm" | "final" | "project" | "lab" | etc.
// title: user-facing text
// url: absolute or relative link to the resource
const term2CourseData = [
  {
    courseTitle: "Comp 2522",
    resources: [
      { kind: "quiz",     title: "Quiz 1 — OOP Basics",     url: "/2522/quizzes/q1" },
      { kind: "assignment", title: "A1 — Inheritance",       url: "/2522/asn/a1" },
      { kind: "midterm",  title: "Midterm Study Notes",     url: "/2522/exams/midterm-notes" },
      { kind: "project",  title: "Project — Zoo Simulator", url: "/2522/projects/zoo" }
    ]
  },
  {
    courseTitle: "Comp 2714",
    resources: [
      { kind: "quiz",     title: "Quiz 1 — SQL Basics",     url: "/2714/quizzes/q1" },
      { kind: "assignment", title: "A1 — Normalization",     url: "/2714/asn/a1" }
    ]
  },
  {
    courseTitle: "Comp 2721",
    resources: [
      { kind: "lab",      title: "Lab 2 — Networking Intro", url: "/2721/labs/l2" },
      { kind: "final",    title: "Final Exam Practice",      url: "/2721/exams/final-practice" }
    ]
  },
  {
    courseTitle: "Comp 2510",
    resources: [] // empty is allowed — UI will say "No resources yet"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  // Create Term 2 content
 createContent(term2CourseData, 2);
  // Find all accordion groups (each term is isolated)
  const accordionGroupElements = document.querySelectorAll(".accordion-group");

  // For every group, wire clicks with event delegation (prevents double listeners per item)
  accordionGroupElements.forEach((singleAccordionGroupElement) => {
    singleAccordionGroupElement.addEventListener("click", (clickEvent) => {
      // Go to the closest button if a child inside it was clicked
      const clickedHeaderButton = clickEvent.target.closest(".accordion-header-button");
      if (!clickedHeaderButton || !singleAccordionGroupElement.contains(clickedHeaderButton)) return;

      // Identify panel and state
      const contentPanelId = clickedHeaderButton.getAttribute("aria-controls");
      const accordionContentPanel = document.getElementById(contentPanelId);

      // Prevent re-entrancy while animating
      if (accordionContentPanel.dataset.animating === "true") return;

      const isCurrentlyExpanded = clickedHeaderButton.getAttribute("aria-expanded") === "true";

      if (isCurrentlyExpanded) {
        closeAccordionItem(clickedHeaderButton, accordionContentPanel);
      } else {
        openAccordionItem(clickedHeaderButton, accordionContentPanel);
      }
    }, { passive: true });
  });
});

/**
 * Open a single accordion item with smooth height animation and proper ARIA.
 */
function openAccordionItem(accordionHeaderButton, accordionContentPanel) {
  accordionContentPanel.dataset.animating = "true";

  // Make the panel measurable
  accordionContentPanel.hidden = false;
  accordionHeaderButton.setAttribute("aria-expanded", "true");
  accordionContentPanel.setAttribute("aria-hidden", "false");

  // Remove 'height' so we can measure natural content size, but ensure baseline
  accordionContentPanel.classList.add("is-open");
  accordionContentPanel.style.height = "auto";
  const contentFullHeight = accordionContentPanel.scrollHeight; // go fetch the actual pixel height

  // Start from 0 → then to full height
  accordionContentPanel.style.height = "0px";

  // Ensure layout flush then start transition
  requestAnimationFrame(() => {
    // one more frame to ensure styles are committed (avoids glitch on some browsers)
    requestAnimationFrame(() => {
      accordionContentPanel.style.height = contentFullHeight + "px";
    });
  });

  // When transition ends, set height to auto so content can grow later
  accordionContentPanel.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "height") return;
    accordionContentPanel.style.height = "auto";
    accordionContentPanel.dataset.animating = "false";
  }, { once: true });
}

/**
 * Close a single accordion item with animation and proper ARIA.
 */
function closeAccordionItem(accordionHeaderButton, accordionContentPanel) {
  accordionContentPanel.dataset.animating = "true";

  accordionHeaderButton.setAttribute("aria-expanded", "false");
  accordionContentPanel.setAttribute("aria-hidden", "true");

  // Set from current computed height → 0
  const currentHeight = accordionContentPanel.scrollHeight;
  accordionContentPanel.style.height = currentHeight + "px";

  // Force reflow so the browser acknowledges the current height before collapsing
  // (This guarantees the transition runs.)
  // eslint-disable-next-line no-unused-expressions
  accordionContentPanel.offsetHeight;

  // Collapse to 0
  accordionContentPanel.style.height = "0px";

  // Remove open padding during collapse for a crisper motion
  accordionContentPanel.classList.remove("is-open");

  accordionContentPanel.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "height") return;
    accordionContentPanel.hidden = true;               // semantic + tabbing
    accordionContentPanel.dataset.animating = "false";
  }, { once: true });
}

/**
 * createContent:
 * - termCourseData: array of { courseTitle: string, resources: Resource[] }
 * - termNumber: number used to target the right accordion group
 */
function createContent(termCourseData, termNumber) {
  const accordionGroupForTerm = document.querySelector(`[data-accordion-group="term-${termNumber}"]`);

  termCourseData.forEach((singleCourseData, courseIndex) => {
    const { courseTitle, resources } = singleCourseData;

    const accordionItemContainer = document.createElement("div");
    accordionItemContainer.classList.add("accordion-item");

    const contentPanelId = `term${termNumber}-content-${courseIndex}`;
    const headerButtonId = `term${termNumber}-button-${courseIndex}`;

    // Header button (click target)
    const headerHTML = `
      <h3 class="accordion-title">
        <button
          class="accordion-header-button"
          aria-expanded="false"
          aria-controls="${contentPanelId}"
          id="${headerButtonId}"
        >
          ${courseTitle}
        </button>
      </h3>
    `;

    // Build the inner content markup from resources
    const resourceSectionHTML = buildResourceSectionsHTML(resources);

    // Collapsible content region (ARIA region, initially hidden)
    const contentHTML = `
      <div
        id="${contentPanelId}"
        class="accordion-content-panel"
        role="region"
        aria-labelledby="${headerButtonId}"
        aria-hidden="true"
        hidden
      >
        ${resourceSectionHTML}
      </div>
    `;

    accordionItemContainer.innerHTML = headerHTML + contentHTML;
    accordionGroupForTerm.appendChild(accordionItemContainer);
  });
}

/**
 * buildResourceSectionsHTML:
 * - Group resources by "kind" to produce labeled sections.
 * - If the list is empty, show a friendly message.
 */
function buildResourceSectionsHTML(resourceArray) {
  if (!resourceArray || resourceArray.length === 0) {
    return `
      <div class="resource-empty">
        <em>No resources yet. Check back soon.</em>
      </div>
    `;
  }

  // Map "kind" -> user label. Add any new kinds here once and reuse everywhere.
  const kindToLabel = {
    quiz: "Quizzes",
    assignment: "Assignments",
    midterm: "Midterm",
    final: "Final",
    project: "Projects",
    lab: "Labs",
  };

  // 1) Group by kind
  const groupedByKind = resourceArray.reduce((accumulator, singleResource) => {
    const normalizedKind = String(singleResource.kind || "").toLowerCase();
    const bucket = accumulator.get(normalizedKind) || [];
    bucket.push(singleResource);
    accumulator.set(normalizedKind, bucket);
    return accumulator;
  }, new Map());

  // 2) Create sections in a stable order (by label)
  const sections = [];
  [...groupedByKind.entries()]
    .sort((a, b) => {
      const labelA = kindToLabel[a[0]] || a[0];
      const labelB = kindToLabel[b[0]] || b[0];
      return labelA.localeCompare(labelB);
    })
    .forEach(([kindKey, resourcesForKind]) => {
      const sectionLabel = kindToLabel[kindKey] || capitalize(kindKey);

      const listItemsHTML = resourcesForKind
        .map((singleResource) => {
          const safeTitle = escapeHTML(singleResource.title);
          const safeUrl = escapeAttribute(singleResource.url);
          return `
            <li class="resource-item">
              <a class="resource-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">
                ${safeTitle}
              </a>
            </li>
          `;
        })
        .join("");

      sections.push(`
        <div class="resource-section">
          <div class="resource-section-title"><strong>${sectionLabel}:</strong></div>
          <ul class="resource-list">
            ${listItemsHTML}
          </ul>
        </div>
      `);
    });

  return sections.join("");
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/* Basic HTML escaping for innerText contexts */
function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* Escape for attribute contexts like href= */
function escapeAttribute(text) {
  return String(text)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


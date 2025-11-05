// Attach behavior after DOM is ready
// Term 2 data: one entry per course with a resources array.
// kind: "quiz" | "assignment" | "midterm" | "final" | "project" | "lab" | etc.
// title: user-facing text
// url: absolute or relative link to the resource
const term2CourseData = [
  {
    courseTitle: "Comp 2522",
    resources: [
      {kind: "quiz", title: "Comp 2121 Quizzes", url: "https://drive.google.com/drive/folders/1SHEpax_vOviIJuxFeNtC18GTphxrUUHG?dmr=1&ec=wgc-drive-globalnav-goto"}
    ]
  },
  {
    courseTitle: "Comp 2714",
    resources: [
      {kind: "quiz", title: "Comp 2714 Quizzes", url: "https://drive.google.com/drive/folders/1HaAwBR5AdXOeowPiUIXDNcRcTb7rzRTq?dmr=1&ec=wgc-drive-globalnav-goto"}
    ]
  },
  {
    courseTitle: "Comp 2721",
    resources: [
      {kind: "final", title: "Comp 2721 Final", url: "https://drive.google.com/drive/folders/1AAvMcHgfMyi9nBQtXKDWyJkAxEjSQ7m0?dmr=1&ec=wgc-drive-globalnav-goto"},
      {kind: "midterm", title: "Comp 2721 Midterm", url: "https://drive.google.com/drive/folders/1XFqM930vOMglP2b3s2JGe8esYlFhaxB3?dmr=1&ec=wgc-drive-globalnav-goto"},
      {kind: "quiz", title: "Comp 2721 Quizzes", url: "https://drive.google.com/drive/folders/1FXoQX_DGbyHAiuniDYI9uFxCdu7H5mbP?dmr=1&ec=wgc-drive-globalnav-goto"}
    ]
  },
  {
    courseTitle: "Comp 2121",
    resources:[
      {kind: "assignment", title: "Comp 2121 Assignments", url: "https://drive.google.com/drive/folders/12XhXYCM09G7XYiOOwOgvwXMp6TWwTq70?dmr=1&ec=wgc-drive-globalnav-goto"},
      {kind: "final", title: "Comp 2121 Final", url: "https://drive.google.com/drive/folders/1Da8KFXvnn5_E63KDQeo8GONI7_EB_ibX?dmr=1&ec=wgc-drive-globalnav-goto"},
      {kind: "midterm", title: "Comp 2121 Midterm", url: "https://drive.google.com/drive/folders/1bLYuLHOTucvnJOJqgV4TQ7W86iOW5jwL?dmr=1&ec=wgc-drive-globalnav-goto"},
      {kind: "quiz", title: "Comp 2121 Quizzes", url: "https://drive.google.com/drive/folders/1ybULkD-hPhoVRuqS9VvgXgdbAtz7PqPm?dmr=1&ec=wgc-drive-globalnav-goto"}
    ]
  },
  {
    courseTitle: "Comp 2510",
    resources:[
      {kind: "final", title: "Comp 2510 Final", url: "https://drive.google.com/drive/folders/1Tjrqk_hs5_hMleOyShiAgWng26-E_18Z?dmr=1&ec=wgc-drive-globalnav-goto"},
      {kind: "midterm", title: "Comp 2510 Midterm", url: "https://drive.google.com/drive/folders/1E4AEToUETj23xMlT5giiKbIPXcLiwfyx?dmr=1&ec=wgc-drive-globalnav-goto"},
      {kind: "quiz", title: "Comp 2510 Quizzes", url: "https://drive.google.com/drive/folders/1dRPpcvttWZlcjshmR-aKxAl3TzaFI33x?dmr=1&ec=wgc-drive-globalnav-goto"}
    ]
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


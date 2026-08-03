"use strict";

const intro = document.getElementById("intro-screen");
const form = document.getElementById("review-form");
const results = document.getElementById("results-screen");
const sections = [...document.querySelectorAll(".question-section")];

const patientLabel = document.getElementById("patient-label");
const privacyCheck = document.getElementById("privacy-confirmation");
const beginButton = document.getElementById("begin-button");
const backButton = document.getElementById("back-button");
const nextButton = document.getElementById("next-button");
const calculateButton = document.getElementById("calculate-button");
const validationMessage = document.getElementById("validation-message");

const progressLabel = document.getElementById("progress-label");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");
const progressTrack = document.querySelector(".progress-track");

const resultCard = document.getElementById("result-status-card");
const resultCategory = document.getElementById("result-category");
const resultSummary = document.getElementById("result-summary");
const resultScore = document.getElementById("result-score");
const strengthsList = document.getElementById("strengths-list");
const concernsList = document.getElementById("concerns-list");
const followUpList = document.getElementById("follow-up-list");

const editButton = document.getElementById("edit-review-button");
const resetButton = document.getElementById("start-over-button");

let currentSection = 0;

function showScreen(target) {
  [intro, form, results].forEach((screen) => {
    screen.classList.toggle("active", screen === target);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function radio(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value ?? null;
}

function checked(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)]
    .map((input) => input.value);
}

function uniquePush(list, value) {
  if (!list.includes(value)) list.push(value);
}

function updateBegin() {
  beginButton.disabled =
    !privacyCheck.checked || patientLabel.value.trim().length === 0;
}

function updateSection() {
  sections.forEach((section, index) => {
    section.classList.toggle("active", index === currentSection);
  });

  const percent = Math.round(
    ((currentSection + 1) / sections.length) * 100
  );

  progressLabel.textContent =
    `Section ${currentSection + 1} of ${sections.length}`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  progressTrack.setAttribute("aria-valuenow", String(percent));

  backButton.disabled = currentSection === 0;

  const last = currentSection === sections.length - 1;
  nextButton.classList.toggle("hidden", last);
  calculateButton.classList.toggle("hidden", !last);
  validationMessage.textContent = "";
}

function validateSection() {
  const section = sections[currentSection];
  const requiredNames = [
    ...new Set(
      [...section.querySelectorAll("input[required]")]
        .map((input) => input.name)
    )
  ];

  const missing = requiredNames.find((name) => {
    return !section.querySelector(`input[name="${name}"]:checked`);
  });

  if (missing) {
    validationMessage.textContent =
      "Please answer every required question before continuing.";
    return false;
  }

  validationMessage.textContent = "";
  return true;
}

function addListItems(element, items) {
  element.replaceChildren();

  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    element.appendChild(item);
  });
}

function evaluate() {
  let score = 0;
  const strengths = [];
  const concerns = [];
  const followUps = [];
  const hardStops = [];

  const stable = radio("medicallyStable");
  const procedure = radio("pendingProcedure");
  const symptoms = radio("acuteSymptomsControlled");

  if (stable === "yes") {
    score += 7;
    strengths.push("Medically stable for transfer.");
  } else if (stable === "uncertain") {
    score += 2;
    concerns.push("Medical stability needs clarification.");
    followUps.push("Confirm medical stability and readiness for transfer.");
  } else {
    hardStops.push("The patient is not medically stable for transfer.");
  }

  if (procedure === "no") {
    score += 4;
  } else if (procedure === "uncertain") {
    score += 1;
    concerns.push("A pending procedure or acute workup is unclear.");
    followUps.push("Clarify whether procedures or acute testing remain pending.");
  } else {
    hardStops.push("A major procedure or acute diagnostic workup remains pending.");
  }

  if (symptoms === "yes") {
    score += 4;
    strengths.push("Acute symptoms and support needs appear controlled.");
  } else if (symptoms === "uncertain") {
    score += 1;
    concerns.push("Control of symptoms, oxygen, pain, or vital signs is uncertain.");
  } else {
    hardStops.push("Acute symptoms or support needs are not adequately controlled.");
  }

  const prior = radio("priorFunction");
  const decline = radio("functionalDecline");
  const areas = checked("functionalAreas");

  if (prior === "independent") {
    score += 6;
    strengths.push("Previously independent or mostly independent.");
  } else if (prior === "someAssistance") {
    score += 4;
    strengths.push("Meaningful prior functional baseline.");
  } else if (prior === "dependent") {
    score += 1;
    concerns.push("Substantially dependent before the current event.");
  } else {
    concerns.push("Prior level of function is unknown.");
    followUps.push("Clarify the prior level of function.");
  }

  if (decline === "major") {
    score += 8;
    strengths.push("Major new functional decline.");
  } else if (decline === "moderate") {
    score += 6;
    strengths.push("Moderate new functional decline.");
  } else if (decline === "minor") {
    score += 2;
    concerns.push("Only minor functional decline is apparent.");
  } else {
    concerns.push("The degree of functional decline is unclear.");
  }

  if (areas.length >= 4) {
    score += 6;
    strengths.push("Multiple functional domains are affected.");
  } else if (areas.length >= 2) {
    score += 4;
    strengths.push("More than one functional domain is affected.");
  } else if (areas.length === 1) {
    score += 1;
    concerns.push("Only one functional problem area is identified.");
  } else {
    concerns.push("No specific functional problem area was selected.");
  }

  const therapies = checked("therapyDisciplines");
  const includesPtOrOt =
    therapies.includes("pt") || therapies.includes("ot");

  if (therapies.length >= 2 && includesPtOrOt) {
    score += 9;
    strengths.push("Multiple therapy disciplines are needed, including PT or OT.");
  } else if (therapies.length === 1) {
    score += 2;
    concerns.push("Only one therapy discipline is identified.");
    followUps.push("Clarify whether a second therapy discipline is necessary.");
  } else {
    concerns.push("Multiple therapy requirements are not established.");
    followUps.push("Obtain current therapy recommendations.");
  }

  const goals = radio("clearGoals");
  if (goals === "yes") {
    score += 4;
    strengths.push("Clear measurable functional goals are documented.");
  } else if (goals === "partial") {
    score += 2;
    concerns.push("Functional goals are only partially documented.");
  } else {
    concerns.push("Clear functional goals are not documented.");
    followUps.push("Obtain measurable rehabilitation goals.");
  }

  const lowerLevel = radio("lowerLevelSufficient");
  if (lowerLevel === "no") {
    score += 2;
    strengths.push("A lower-intensity setting may not meet the rehabilitation needs.");
  } else if (lowerLevel === "uncertain") {
    concerns.push("It is unclear whether a lower level of care would be sufficient.");
  } else {
    score -= 4;
    concerns.push("A lower level of care may be sufficient.");
  }

  const participation = radio("therapyParticipation");
  if (participation === "strong") {
    score += 9;
    strengths.push("Participates consistently in therapy.");
  } else if (participation === "withRest") {
    score += 7;
    strengths.push("May tolerate intensive therapy with rest or scheduling adjustments.");
  } else if (participation === "limitedImproving") {
    score += 4;
    concerns.push("Participation is limited but may improve.");
    followUps.push("Obtain updated therapy-participation documentation.");
  } else if (participation === "uncertain") {
    score += 1;
    concerns.push("Therapy tolerance is not sufficiently documented.");
    followUps.push("Clarify therapy tolerance and participation.");
  } else {
    hardStops.push("The patient is currently unable to participate meaningfully.");
  }

  const learning = radio("learningCapacity");
  if (learning === "yes") {
    score += 5;
    strengths.push("Can follow instructions, learn strategies, or be redirected.");
  } else if (learning === "partial") {
    score += 3;
    concerns.push("Requires substantial cueing or redirection.");
  } else if (learning === "uncertain") {
    score += 1;
    concerns.push("Learning capacity is uncertain.");
  } else {
    concerns.push("Limited ability to follow instructions or learn strategies.");
  }

  const improvement = radio("improvementExpected");
  if (improvement === "yes") {
    score += 7;
    strengths.push("Meaningful functional improvement is expected.");
  } else if (improvement === "possible") {
    score += 3;
    concerns.push("Rehabilitation potential is possible but incompletely supported.");
  } else {
    score -= 4;
    concerns.push("Meaningful improvement appears unlikely.");
  }

  const motivation = radio("motivation");
  if (motivation === "good") {
    score += 4;
    strengths.push("Motivation and engagement support rehabilitation.");
  } else if (motivation === "variable") {
    score += 2;
    concerns.push("Motivation is variable but redirectable.");
  } else if (motivation === "uncertain") {
    concerns.push("Motivation and engagement are unclear.");
  } else {
    score -= 3;
    concerns.push("Persistent refusal or inability to engage may limit benefit.");
  }

  const medicalNeeds = checked("medicalNeeds");
  if (medicalNeeds.length >= 4) {
    score += 9;
    strengths.push("Several active medical issues affect rehabilitation.");
  } else if (medicalNeeds.length >= 2) {
    score += 6;
    strengths.push("Multiple active medical issues affect rehabilitation.");
  } else if (medicalNeeds.length === 1) {
    score += 2;
    concerns.push("Only one active medical-management issue is identified.");
  } else {
    concerns.push("No active medical-management need was identified.");
  }

  const oversight = radio("physicianOversight");
  if (oversight === "yes") {
    score += 7;
    strengths.push("Frequent rehabilitation-related physician oversight appears necessary.");
  } else if (oversight === "uncertain") {
    score += 2;
    concerns.push("The need for frequent physician oversight is uncertain.");
    followUps.push("Clarify why frequent physician management is required.");
  } else {
    score -= 3;
    concerns.push("Frequent rehabilitation-physician oversight does not appear necessary.");
  }

  const medicalLower = radio("medicalNeedsLowerLevel");
  if (medicalLower === "no") {
    score += 4;
    strengths.push("Medical needs may not be manageable at a lower level of care.");
  } else if (medicalLower === "uncertain") {
    concerns.push("It is unclear whether medical needs could be managed at a lower level.");
  } else {
    score -= 4;
    concerns.push("Medical needs may be manageable at a lower level of care.");
  }

  const destination = radio("dischargeDestination");
  if (destination === "clear") {
    score += 3;
    strengths.push("A likely discharge destination is identified.");
  } else if (destination === "possible") {
    score += 2;
    concerns.push("The discharge destination is possible but not confirmed.");
  } else if (destination === "uncertain") {
    concerns.push("The discharge destination is uncertain.");
  } else {
    score -= 2;
    concerns.push("No feasible discharge destination is identified.");
  }

  const support = radio("supportAvailable");
  if (support === "yes") {
    score += 2;
    strengths.push("Caregiver or environmental support appears available.");
  } else if (support === "partial") {
    score += 1;
    concerns.push("Caregiver or environmental support is only partially established.");
  } else {
    concerns.push("Caregiver or environmental support is not currently available.");
  }

  const missing = checked("missingInformation")
    .filter((value) => value !== "none");

  if (missing.length >= 4) {
    score -= 8;
    concerns.push("Several important documentation elements are missing.");
  } else if (missing.length >= 2) {
    score -= 4;
    concerns.push("Multiple documentation elements are missing.");
  } else if (missing.length === 1) {
    score -= 2;
    concerns.push("One important documentation element is missing.");
  } else {
    strengths.push("No major documentation gap was identified.");
  }

  if (missing.includes("therapyNotes")) {
    followUps.push("Obtain current PT, OT, and SLP notes as applicable.");
  }
  if (missing.includes("priorFunction")) {
    followUps.push("Confirm the prior level of function.");
  }
  if (missing.includes("medicalPlan")) {
    followUps.push("Clarify the active medical-management plan.");
  }
  if (missing.includes("goals")) {
    followUps.push("Obtain measurable expected functional goals.");
  }
  if (missing.includes("tolerance")) {
    followUps.push("Obtain current therapy-tolerance documentation.");
  }
  if (missing.includes("dischargePlan")) {
    followUps.push("Clarify the discharge setting and support plan.");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let category;
  let summary;
  let style;

  if (hardStops.length) {
    category = "Hold for medical clarification";
    summary =
      "One or more findings may make transfer unsafe or premature. Resolve these concerns before considering placement.";
    style = "hold";
    hardStops.forEach((item) => uniquePush(concerns, item));
    uniquePush(
      followUps,
      "Escalate the medical-readiness findings for clinical review."
    );
  } else if (score >= 75) {
    category = "Strong candidate for clinical review";
    summary =
      "The responses show substantial rehabilitation need, participation potential, and medical complexity supporting further review.";
    style = "strong";
  } else if (score >= 55) {
    category = "Potential candidate — clarification needed";
    summary =
      "The patient may be appropriate, but missing evidence or conflicting factors should be clarified before a final decision.";
    style = "clarify";
  } else {
    category = "Lower apparent fit";
    summary =
      "The current responses provide limited support for intensive inpatient rehabilitation. Compare the needs with other levels of care.";
    style = "lower-fit";
  }

  if (!strengths.length) strengths.push("No strong supporting factor was identified.");
  if (!concerns.length) concerns.push("No major concern was identified.");
  if (!followUps.length) {
    followUps.push(
      "Proceed with standard clinical, physician, payer, and facility review."
    );
  }

  return { score, category, summary, style, strengths, concerns, followUps };
}

privacyCheck.addEventListener("change", updateBegin);
patientLabel.addEventListener("input", updateBegin);

beginButton.addEventListener("click", () => {
  showScreen(form);
  currentSection = 0;
  updateSection();
});

nextButton.addEventListener("click", () => {
  if (!validateSection()) return;
  if (currentSection < sections.length - 1) {
    currentSection += 1;
    updateSection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

backButton.addEventListener("click", () => {
  if (currentSection > 0) {
    currentSection -= 1;
    updateSection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateSection()) return;

  const outcome = evaluate();
  const label = patientLabel.value.trim() || "Patient";

  resultCategory.textContent = outcome.category;
  resultSummary.textContent = `${label}: ${outcome.summary}`;
  resultScore.textContent = String(outcome.score);
  resultCard.className = `result-status-card ${outcome.style}`;

  addListItems(strengthsList, outcome.strengths);
  addListItems(concernsList, outcome.concerns);
  addListItems(followUpList, outcome.followUps);

  showScreen(results);
});

editButton.addEventListener("click", () => {
  showScreen(form);
  currentSection = sections.length - 1;
  updateSection();
});

resetButton.addEventListener("click", () => {
  form.reset();
  patientLabel.value = "Patient 1";
  privacyCheck.checked = false;
  updateBegin();
  currentSection = 0;
  updateSection();
  showScreen(intro);
});

document
  .querySelectorAll('input[name="missingInformation"]')
  .forEach((input) => {
    input.addEventListener("change", () => {
      const none = form.querySelector(
        'input[name="missingInformation"][value="none"]'
      );

      if (input.value === "none" && input.checked) {
        form.querySelectorAll(
          'input[name="missingInformation"]:not([value="none"])'
        ).forEach((other) => {
          other.checked = false;
        });
      } else if (input.value !== "none" && input.checked) {
        none.checked = false;
      }
    });
  });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  });
}

updateBegin();
updateSection();

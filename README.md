# Rehab Candidate Review

A mobile-first educational questionnaire for organizing factors relevant to possible inpatient rehabilitation referrals.

## Current status

This is an early, unvalidated prototype.

The application can:

- Ask structured referral-review questions
- Identify supporting factors
- Highlight concerns
- Identify missing information
- Suggest follow-up questions
- Produce a preliminary support score
- Flag medical-readiness hard stops

It does not make admission, denial, coverage, or medical-necessity decisions.

## Privacy

The application has no patient names, dates of birth, medical-record numbers, chart uploads, free-text clinical notes, user accounts, backend, database, saved patient records, or analytics.

Use only generic labels such as `Patient 1`.

## Run locally

Run `python3 -m http.server 8000`, then open `http://localhost:8000`.

## Safety limitations

The scoring model has not been clinically validated. It must not replace physician review, professional judgment, facility policy, payer requirements, or legal and compliance review.

See `DISCLAIMER.md` for additional limitations.

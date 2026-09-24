# Credence Generic Railway Adaptation Cost Model

**Planning basis:** Indian Railways-style deployment for one pilot division and one operational corridor

**Prepared:** 23 September 2026

## 1. Purpose

This document estimates the cost to adapt Credence to an existing railway operating environment. It is intended for a concept note, pilot proposal, or budgetary discussion. Values are **indicative planning estimates**, not vendor quotations or a government tender estimate.

The model assumes that Credence is added as a decision-support layer around existing railway systems. It does not replace safety-certified interlocking, signalling, train-control, or dispatch systems.

## 2. Cost conventions

- Currency: Indian Rupees (INR)
- Figures exclude GST, land/building works, major signalling hardware, rolling-stock modifications, and procurement overheads.
- `Lakh` = INR 100,000; `Crore` = INR 10,000,000.
- One-time costs cover discovery, adapters, configuration, model development, testing, deployment, and training.
- Annual operating costs cover support, hosting, monitoring, security, model maintenance, and refresher training.
- Software licence fees are only one part of the budget. Railway adaptation, data integration, cybersecurity, validation, training, support, and operational change are the major cost areas.

## 3. Planning assumptions

| Assumption | Pilot value |
|---|---:|
| Deployment scope | 1 railway division, 1 corridor, 3-5 operating departments |
| Data sources | TMS, SMMS, TDMS, BDMS, COA, timetable, goods forecast |
| Users | 30-60 controllers, planners, maintenance and supervisory users |
| Data refresh | 1-5 minutes for operational feeds; daily or event-based for maintenance data |
| Availability target | 99.5% for pilot decision-support service |
| Hosting | Railway data centre or approved government cloud; hybrid deployment preferred |
| Integration mode | Read-only first, controlled write-back after acceptance testing |
| Safety posture | Advisory system with human approval; no direct safety-critical actuation |
| Pilot duration | 9-12 months including discovery and live shadow operation |

## 4. Generic railway adaptation cost model

The following categories represent the complete adaptation effort. Algorithm names are implementation examples, not separate products that must all be purchased.

### 4.1 Data integration: TMS, SMMS, TDMS, BDMS, COA, timetable and goods forecast

**Role:** Create a unified operational data layer from existing railway systems.

| Cost component | One-time estimate | Annual estimate |
|---|---:|---:|
| Interface discovery and data dictionary | INR 8-15 lakh | INR 2-4 lakh |
| Six to seven source adapters and API/message connectors | INR 35-70 lakh | INR 10-18 lakh |
| ETL, validation, reconciliation and master-data mapping | INR 20-40 lakh | INR 8-15 lakh |
| Historical data migration and cleansing | INR 10-25 lakh | INR 3-6 lakh |
| Operational data store and audit trail | INR 12-25 lakh | INR 6-12 lakh |
| **Subtotal** | **INR 85 lakh-1.75 crore** | **INR 29-55 lakh** |

**Adaptation requirement:** Existing systems may expose different identifiers, time formats, asset codes, block codes, and update frequencies. The largest cost risk is not the connector itself; it is reconciliation of conflicting master data and approval of access to legacy systems.

### 4.2 Planning, analytics and decision-support services

**Role:** Provide risk scoring, maintenance prioritisation, block planning, disruption recovery, train-impact analysis, and explainable recommendations. The implementation may use statistical models, machine learning, constraint solvers, graph methods, or search methods such as XGBoost, CP-SAT, GNN, ALNS, and Time-Dependent A*.

| Cost component | One-time estimate | Annual estimate |
|---|---:|---:|
| Requirements, rules and objective definition | INR 12-25 lakh | INR 4-8 lakh |
| Risk, planning and recovery service development | INR 30-65 lakh | INR 10-20 lakh |
| Scenario testing, explainability and controller review | INR 15-30 lakh | INR 6-12 lakh |
| Model and rules monitoring, calibration and updates | Included in pilot | INR 8-16 lakh |
| **Subtotal** | **INR 57 lakh-1.20 crore** | **INR 28-56 lakh** |

**Technology assumption:** The platform can use open-source or commercial components. The estimate covers the complete decision-support capability rather than a specific algorithm licence.

**Acceptance measures:** Precision of the high-risk queue, calibration error, reduction in overdue critical work, and controller agreement with recommended priorities.

### 4.3 Application platform and operational workflow

**Role:** Provide the controller command centre, role-based access, approvals, alerts, dashboards, audit history, reports, and controlled write-back to existing systems.

| Cost component | One-time estimate | Annual estimate |
|---|---:|---:|
| User research, workflow mapping and UX design | INR 12-25 lakh | INR 4-8 lakh |
| Web command centre and operational dashboards | INR 25-55 lakh | INR 10-20 lakh |
| Approval, notification, reporting and audit workflows | INR 18-40 lakh | INR 8-16 lakh |
| Controlled write-back and external-system integration | INR 15-35 lakh | INR 6-12 lakh |
| **Subtotal** | **INR 70 lakh-1.55 crore** | **INR 28-56 lakh** |

**Acceptance measures:** Controller task completion time, approval traceability, usability, data freshness, audit completeness, and successful write-back without disrupting existing operations.

### 4.4 Infrastructure, hosting and service continuity

**Role:** Provide compute, storage, backups, monitoring, disaster recovery, environments, and service continuity for the pilot and later rollout.

| Cost component | One-time estimate | Annual estimate |
|---|---:|---:|
| Environment design and deployment automation | INR 12-25 lakh | INR 5-10 lakh |
| Compute, storage, database and message processing | INR 20-50 lakh | INR 20-45 lakh |
| Backup, disaster recovery and continuity testing | INR 12-30 lakh | INR 8-18 lakh |
| Application and infrastructure monitoring | INR 8-18 lakh | INR 8-16 lakh |
| **Subtotal** | **INR 52 lakh-1.23 crore** | **INR 41-89 lakh** |

**Deployment assumption:** Existing railway data-centre or approved government-cloud facilities should be reused where possible. New hardware is excluded from this estimate.

### 4.5 Cybersecurity, governance and compliance

**Role:** Protect operational data and provide identity, access control, auditability, vulnerability management, privacy controls, and governance for a railway decision-support service.

| Cost component | One-time estimate | Annual estimate |
|---|---:|---:|
| Identity, role-based access and network controls | INR 12-25 lakh | INR 8-16 lakh |
| Security testing, VAPT and remediation | INR 10-25 lakh | INR 8-18 lakh |
| Audit logging, governance and incident response | INR 10-22 lakh | INR 8-18 lakh |
| Security documentation and compliance reviews | INR 8-18 lakh | INR 5-12 lakh |
| **Subtotal** | **INR 40-90 lakh** | **INR 29-64 lakh** |

**Acceptance measures:** No unauthorised access, complete audit trails, resolved critical vulnerabilities, tested recovery procedures, and approved operational security controls.

### 4.6 Testing, safety assurance and railway validation

**Role:** Demonstrate that recommendations are reliable, explainable, safe for advisory use, and compatible with railway rules and existing operating procedures.

| Cost component | One-time estimate | Annual estimate |
|---|---:|---:|
| Historical data replay and scenario library | INR 12-25 lakh | INR 5-10 lakh |
| Safety-rule, timetable and operational validation | INR 20-45 lakh | INR 8-16 lakh |
| Shadow-mode trials and controller acceptance | INR 18-40 lakh | INR 8-18 lakh |
| Independent review and release assurance | INR 12-30 lakh | INR 6-15 lakh |
| **Subtotal** | **INR 62 lakh-1.40 crore** | **INR 27-59 lakh** |

**Acceptance measures:** Zero hard safety violations in test scenarios, correct handling of frozen operations, acceptable recovery time, route and delay accuracy, and controller sign-off.

## 5. Consolidated pilot budget

The following range includes the generic adaptation workstreams above and assumes that no new signalling or field hardware is being purchased.

| Budget view | Estimate |
|---|---:|
| Software, integration and railway adaptation implementation | **INR 3.66-8.03 crore** |
| Contingency for legacy interfaces, data quality and approvals, 15% | **INR 0.55-1.20 crore** |
| **Indicative pilot implementation total** | **INR 4.21-9.23 crore** |
| Annual support, hosting, monitoring, security and training | **INR 1.82-3.79 crore/year** |

The range is wide because the cost is driven mainly by integration access, data quality, cyber controls, validation requirements, and the number of departments included in the pilot. The algorithms themselves are not the dominant cost.

## 6. Recommended phased procurement

### Phase 0: Discovery and data-readiness assessment, 6-8 weeks

**Budget:** INR 20-40 lakh

- Confirm system owners and access approvals.
- Inventory data fields, identifiers, interfaces, update frequencies, and retention rules.
- Establish baseline metrics for block-planning time, train delay, safety exceptions, and manual effort.
- Decide whether hosting will be on-premises, government cloud, or hybrid.

### Phase 1: Shadow-mode pilot, 4-6 months

**Budget:** INR 2.5-5 crore

- Integrate priority read-only feeds.
- Deploy the initial planning, analytics, disruption recovery, and train-impact services.
- Run recommendations beside the existing process without automatic write-back.
- Validate frozen-state behaviour, explainability, and controller acceptance.

### Phase 2: Controlled operational use, 3-6 months

**Budget:** INR 2-5 crore

- Add approval-based write-back for block plans and dispatch recommendations.
- Add live alerts, audit reports, model monitoring, and disaster recovery.
- Add advanced analytics or graph-based guidance only after the baseline operational workflow is stable.
- Expand from one corridor to additional sections only after acceptance gates are met.

### Phase 3: Multi-division rollout

**Budget:** Usually 0.6-1.2 times the original pilot implementation cost per additional division, depending on reuse of the common platform and the quality of local interfaces.

## 7. Cost drivers and risks

1. **Legacy integration:** Proprietary interfaces, unavailable APIs, and manual exports can increase the integration budget by 25-60%.
2. **Data quality:** Inconsistent asset IDs, block IDs, route topology, and timestamps create more work than model coding.
3. **Safety and cybersecurity approval:** A decision-support system still requires strong access control, auditability, VAPT, backup, and operational validation.
4. **Scope expansion:** Adding signalling, crew rostering, rolling-stock maintenance, or automatic dispatch changes the system category and budget.
5. **Historical data:** Risk, planning, and analytics performance depends on reliable failures, accepted plans, asset records, and train movement history.
6. **Performance scale:** A single corridor and a full-zone deployment have materially different compute, testing, and support requirements.
7. **Human workflow:** Adoption costs rise if the tool does not match controller SOPs, approval authority, escalation paths, and existing terminology.

## 8. Cost-control recommendations

- Start with read-only integration and shadow mode.
- Prioritise the operational workflow and measurable outcomes before selecting advanced algorithms.
- Treat individual algorithms as replaceable implementation components, not as separate procurement items.
- Reuse existing railway identity, logging, hosting, and monitoring services where approved.
- Maintain a versioned constraint catalogue and a replayable historical scenario test set.
- Use human approval for every schedule or dispatch recommendation until safety and operational acceptance is complete.
- Price all vendor licences separately from the open-source engineering estimate.

## 9. Value model for later business-case approval

The implementation budget should be compared against measured benefits after the baseline study. The recommended benefit model is:

`Annual benefit = avoided delay cost + recovered maintenance access value + reduced manual planning effort + avoided disruption escalation cost`

Track these pilot KPIs:

- Average time from disruption detection to controller-ready recovery plan.
- Additional train delay per disruption.
- Percentage of completed or active possessions preserved.
- Number of blocks changed per recovery event.
- Safety and hard-constraint violations.
- Planner/controller hours per weekly planning cycle.
- Percentage of recommendations accepted without manual redesign.
- Asset-risk backlog reduction and maintenance completion rate.

A procurement decision should be made from measured pilot performance, not from algorithm names alone. The strongest investment case for Credence is the reduction in cascading disruption while preserving safe work that is already underway.

## 10. Executive summary

For one corridor and one division, a realistic planning envelope is **INR 4.2-9.2 crore for pilot implementation** and **INR 1.8-3.8 crore per year for operations and support**, excluding GST and major railway hardware.

The main cost is not the algorithm licence. It comes from connecting existing railway systems, configuring local operating rules, building reliable workflows, validating safety and timetable constraints, securing the deployment, training users, and supporting the system in live operations.

The recommended approach is to prove the complete operational capability first: **integrated data, prioritised maintenance, feasible block planning, disruption recovery, train-impact visibility, explainable decisions, and human approval**. The underlying algorithms can be selected or replaced according to performance, support, licensing, and railway governance requirements.

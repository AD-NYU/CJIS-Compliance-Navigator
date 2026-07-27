"use client";

import { useMemo, useRef, useState } from "react";
import catalogJson from "./data/cjis-catalog.json";

type ChecklistItem = { id: string; text: string; details: string; source: string };
type Control = {
  id: string;
  name: string;
  description: string;
  requirement: string;
  policyCitation: string;
  needsVerification: boolean;
  guidanceNeedsVerification: boolean;
  guidanceVerificationNote: string | null;
  checklist: ChecklistItem[];
};
type Family = { abbr: string; name: string; controls: Control[] };
type Catalog = {
  policy: { title: string; version: string; displayDate: string; authority: string };
  guidance: { label: string; sourceFile: string; methodology: string; crossReference: string };
  families: Family[];
};

const catalog = catalogJson as Catalog;

function matchesSearch(control: Control, family: Family, query: string) {
  if (!query) return true;
  return [
    family.abbr,
    family.name,
    control.id,
    control.name,
    control.description,
    control.requirement,
    ...control.checklist.map((item) => `${item.text} ${item.details}`),
  ].join(" ").toLocaleLowerCase().includes(query);
}

function complianceSummary(control: Control) {
  return `Implement and document all ${control.id} requirements for ${control.name}; assign ownership, retain evidence, and remediate gaps.`;
}

export default function NavigatorApp() {
  const [query, setQuery] = useState("");
  const [selectedFamilyAbbr, setSelectedFamilyAbbr] = useState<string | null>(null);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const gridScroll = useRef(0);
  const controlListScroll = useRef(0);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const selectedFamily = catalog.families.find((family) => family.abbr === selectedFamilyAbbr) ?? null;
  const selectedControl = selectedFamily?.controls.find((control) => control.id === selectedControlId) ?? null;

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return catalog.families.flatMap((family) => family.controls
      .filter((control) => matchesSearch(control, family, normalizedQuery))
      .map((control) => ({ family, control })));
  }, [normalizedQuery]);

  const visibleFamilies = useMemo(() => catalog.families.filter((family) => {
    if (!normalizedQuery) return true;
    const familyMatch = `${family.abbr} ${family.name}`.toLocaleLowerCase().includes(normalizedQuery);
    return familyMatch || family.controls.some((control) => matchesSearch(control, family, normalizedQuery));
  }), [normalizedQuery]);

  const visibleControls = useMemo(() => {
    if (!selectedFamily) return [];
    const familyMatch = `${selectedFamily.abbr} ${selectedFamily.name}`.toLocaleLowerCase().includes(normalizedQuery);
    return selectedFamily.controls.filter((control) => familyMatch || matchesSearch(control, selectedFamily, normalizedQuery));
  }, [normalizedQuery, selectedFamily]);

  const currentVisibleIndex = selectedControl ? visibleControls.findIndex((control) => control.id === selectedControl.id) : -1;
  const restoreScroll = (position: number) => requestAnimationFrame(() => window.scrollTo({ top: position, behavior: "instant" }));

  function openFamily(family: Family) {
    gridScroll.current = window.scrollY;
    setSelectedFamilyAbbr(family.abbr);
    setSelectedControlId(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openControl(control: Control, rememberScroll = true) {
    if (rememberScroll) controlListScroll.current = window.scrollY;
    setSelectedControlId(control.id);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openSearchResult(family: Family, control: Control) {
    gridScroll.current = window.scrollY;
    controlListScroll.current = window.scrollY;
    setSelectedFamilyAbbr(family.abbr);
    setSelectedControlId(control.id);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function goBack() {
    if (selectedControl) {
      setSelectedControlId(null);
      restoreScroll(controlListScroll.current);
    } else if (selectedFamily) {
      setSelectedFamilyAbbr(null);
      restoreScroll(gridScroll.current);
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">CN</span>
          <div><p className="brand-name">CJIS Compliance Navigator</p><p className="brand-meta">Policy v{catalog.policy.version} · Effective {catalog.policy.displayDate}</p></div>
        </div>
        <span className="read-only-pill read-only-pill--dark">Public read-only view</span>
      </header>

      <main id="main-content" className="main-content">
        <section className="public-panel" aria-labelledby="public-title">
          <div><p className="eyebrow">Public policy catalog</p><h1 id="public-title">Browse CJIS controls without an account</h1><p>Explore official control families, requirements, citations, and independently authored implementation guidance. This application has no accounts, sign-in, saved progress, comments, evidence entry, or other data-entry features.</p></div>
        </section>

        <section className="search-panel" aria-label="Search controls">
          <label htmlFor="catalog-search">Search the policy catalog</label>
          <div className="search-field"><span aria-hidden="true">⌕</span><input id="catalog-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Family, control ID, control name, or keyword" />{query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search">Clear</button> : null}</div>
        </section>

        {(selectedFamily || selectedControl) && <nav className="breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => { setSelectedControlId(null); setSelectedFamilyAbbr(null); restoreScroll(gridScroll.current); }}>All Families</button>
          {selectedFamily ? <><span aria-hidden="true">→</span><button type="button" onClick={() => { setSelectedControlId(null); restoreScroll(controlListScroll.current); }}>{selectedFamily.name}</button></> : null}
          {selectedControl ? <><span aria-hidden="true">→</span><span aria-current="page">{selectedControl.id} {selectedControl.name}</span></> : null}
        </nav>}

        {!selectedFamily && normalizedQuery && <section aria-labelledby="search-results-title">
          <div className="section-heading"><div><p className="eyebrow">Family, control ID, name, and policy keyword</p><h2 id="search-results-title">Search results</h2></div><p aria-live="polite">{searchResults.length} {searchResults.length === 1 ? "control" : "controls"} found</p></div>
          {searchResults.length ? <ul className="control-list search-results-list">{searchResults.map(({ family, control }) => <li key={control.id}><button className="control-row control-row--search" type="button" onClick={() => openSearchResult(family, control)}><span className="control-id">{control.id}</span><span className="control-copy"><strong>{control.name}</strong><span>{control.description}</span></span><span className="search-result-meta"><span className="search-family-pill">{family.abbr} · {family.name}</span>{control.guidanceNeedsVerification ? <span className="verification-pill">Needs verification</span> : null}</span><span className="row-arrow" aria-hidden="true">→</span></button></li>)}</ul> : <div className="empty-state"><strong>No controls match “{query.trim()}”.</strong><span>Try a family name, control ID such as AC-2, control name, or policy keyword.</span><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
        </section>}

        {!selectedFamily && !normalizedQuery && <section aria-labelledby="families-title">
          <div className="section-heading"><div><p className="eyebrow">Control Family → Control ID → Requirement → Checklist</p><h2 id="families-title">Control families</h2></div><p>{visibleFamilies.length} of {catalog.families.length} families</p></div>
          {visibleFamilies.length ? <div className="family-grid">{visibleFamilies.map((family) => <button className="family-card" type="button" key={family.abbr} onClick={() => openFamily(family)}><span className="family-card__top"><span className="family-abbr">{family.abbr}</span><span className="read-only-pill">Read only</span></span><strong>{family.name}</strong><span className="family-count">{family.controls.length} controls</span><span className="family-progress">Official policy catalog</span><span className="family-action">View controls <span aria-hidden="true">→</span></span></button>)}</div> : <div className="empty-state"><strong>No families match your search.</strong><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
        </section>}

        {selectedFamily && !selectedControl && <section aria-labelledby="controls-title">
          <div className="section-actions"><button className="button button--quiet" type="button" onClick={goBack}>← Back</button></div>
          <div className="section-heading family-heading"><div><p className="eyebrow">{selectedFamily.abbr} control family</p><h2 id="controls-title">{selectedFamily.name}</h2><p>{selectedFamily.controls.length} official policy controls</p></div><span className="read-only-pill">Read only</span></div>
          {visibleControls.length ? <ul className="control-list">{visibleControls.map((control) => <li key={control.id}><button className="control-row control-row--public" type="button" onClick={() => openControl(control)}><span className="control-id">{control.id}</span><span className="control-copy"><strong>{control.name}</strong><span>{control.description}</span></span>{control.guidanceNeedsVerification ? <span className="verification-pill">Needs verification</span> : null}<span className="row-arrow" aria-hidden="true">→</span></button></li>)}</ul> : <div className="empty-state"><strong>No controls match your search in this family.</strong><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
        </section>}

        {selectedFamily && selectedControl && <article className="control-detail" aria-labelledby="control-title">
          <div className="section-actions section-actions--split"><button className="button button--quiet" type="button" onClick={goBack}>← Back</button><div className="pager" aria-label="Control navigation"><button className="button button--quiet" type="button" disabled={currentVisibleIndex <= 0} onClick={() => openControl(visibleControls[currentVisibleIndex - 1], false)}>← Previous Control</button><button className="button button--quiet" type="button" disabled={currentVisibleIndex < 0 || currentVisibleIndex >= visibleControls.length - 1} onClick={() => openControl(visibleControls[currentVisibleIndex + 1], false)}>Next Control →</button></div></div>
          <header className="control-hero"><div><p className="eyebrow">Official control ID</p><h2 id="control-title"><span>{selectedControl.id}</span> {selectedControl.name}</h2><div className="compliance-summary"><span>Compliance summary</span><p>{complianceSummary(selectedControl)}</p></div></div><span className="read-only-pill read-only-pill--dark">Read only</span></header>
          <section className="requirement-card" aria-labelledby="requirement-title"><div className="card-heading"><div><p className="eyebrow">Official CJIS policy</p><h3 id="requirement-title">Requirement</h3></div>{selectedControl.needsVerification ? <span className="verification-pill">Needs verification</span> : null}</div><div className="requirement-text">{selectedControl.requirement}</div><p className="citation"><span aria-hidden="true">§</span> {selectedControl.policyCitation}</p></section>
          <section className="checklist-card" aria-labelledby="checklist-title"><div className="checklist-intro"><div><p className="guidance-label">Implementation guidance—not official CJIS policy</p><h3 id="checklist-title">Implementation checklist</h3><p>An independently authored four-step workflow derived from the official CJIS requirement above. Policy-specified timing, thresholds, events, and conditions are shown; agency-selected values are identified rather than guessed.</p></div><span className="read-only-pill">Read only</span></div>{selectedControl.guidanceVerificationNote ? <div className="verification-note"><strong>Needs verification</strong><span>{selectedControl.guidanceVerificationNote}</span></div> : null}<div className="checklist-items">{selectedControl.checklist.map((item, index) => <div className="checklist-item checklist-item--public" key={item.id}><div className="checklist-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div><div className="checklist-copy"><p className="checklist-prompt">{item.text}</p>{item.details ? <details><summary>Policy-specific implementation details</summary><p>{item.details}</p><p className="guidance-source">Source: {item.source}</p></details> : null}</div></div>)}</div></section>
        </article>}

        <footer className="disclaimer"><div><strong>Public and read-only.</strong><p>This application does not provide accounts, authentication, status tracking, comments, evidence storage, or user-specific records.</p></div><div><strong>No data-entry boundary.</strong><p>Do not enter Criminal Justice Information, credentials, personal case information, or agency-sensitive material into search or other browser fields.</p></div><div><strong>Policy navigation and implementation aid only.</strong><p>This application does not prove, grant, or imply CJIS compliance or certification. Validate applicability with your CJIS Systems Agency and authorized assessors.</p></div><p className="policy-source">Official source: {catalog.policy.title}, version {catalog.policy.version}, effective {catalog.policy.displayDate}. {catalog.policy.authority}.</p><p className="creator-credit">Created by Amrit Dhillon, PMP, CISM.</p><div className="legal-note"><strong>Intellectual property notice.</strong><p>This independent educational implementation aid is not affiliated with or endorsed by the FBI, CJIS, GovRAMP, or any referenced organization. Third-party names, policies, trademarks, and materials remain the property of their respective owners. We respect intellectual property rights. A rights holder who identifies specific content that is inaccurate or improperly used may contact the site owner; substantiated concerns will be reviewed promptly and appropriate content corrected or removed.</p></div></footer>
      </main>
    </div>
  );
}

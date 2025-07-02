import React from "react";

export const CreditApplicationVinsListTab = "vinsList";
export const CreditApplicationModelMismatchesTab = "modelMismatches";

export const CreditApplicationTabs = ({ active, setActive }) => {
  return (
    <ul className="nav nav-tabs" key="tabs" role="tablist">
      <li
        className={`nav-item ${active === CreditApplicationVinsListTab ? "active" : ""}`}
        role="presentation"
      >
        <button
          onClick={() => {
            setActive(CreditApplicationVinsListTab);
          }}
        >
          All Records
        </button>
      </li>
      <li
        className={`nav-item ${active === CreditApplicationModelMismatchesTab ? "active" : ""}`}
        role="presentation"
      >
        <button
          onClick={() => {
            setActive(CreditApplicationModelMismatchesTab);
          }}
        >
          Review Model Mismatches
        </button>
      </li>
    </ul>
  );
};

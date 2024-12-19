import React from "react";
import { render, screen } from "@testing-library/react";
import SupplementaryAlert from "../SupplementaryAlert";
import "@testing-library/jest-dom/extend-expect";
import { SupplimentaryAlertsTestData } from "./test-data/testData";

// mock the alert component
jest.mock(
  "../../../app/components/Alert",
  () =>
    ({ title, icon, classname, message }) => (
      <div data-testid="alert-mock">
        <span data-testid="title">{title}</span>
        <span data-testid="icon">{icon}</span>
        <span data-testid="classname">{classname}</span>
        <span data-testid="message">{message}</span>
      </div>
    ),
);

describe("SupplementaryAlert", () => {
  const { testCases } = SupplimentaryAlertsTestData;
  const setup = (status) => {
    render(<SupplementaryAlert {...defaultProps} status={status} />);
  };

  const defaultProps = {
    date: "2024-12-10",
    user: "John Doe",
  };

  const checkStatusRender = (title, icon, classname, message) => {
    expect(screen.getByTestId("title").textContent).toBe(title);
    expect(screen.getByTestId("icon").textContent).toBe(icon);
    expect(screen.getByTestId("classname").textContent).toBe(classname);
    expect(screen.getByTestId("message").textContent).toBe(message);
  };

  testCases.forEach(({ status, expected }) => {
    it(`renders correctly for status "${status}"`, () => {
      setup(status);
      checkStatusRender(
        expected.title,
        expected.icon,
        expected.classname,
        expected.message,
      );
    });
  });
});

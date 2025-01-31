import { act, screen, fireEvent } from "@testing-library/react";


export const baseUser = {
  username: "TESTER",
  hasPermission: () => {},
}


export const testComments = [
  { id: 3, comment: "Test Comment 3" },
  { id: 4, comment: "Test Comment 4" },
  { id: 5, comment: "Test Comment 5" },
  { id: 6, comment: "Test Comment 6" },
  { id: 7, comment: "Test Comment 7" },
  { id: 8, comment: "Test Comment 8" },
  { id: 9, comment: "Test Comment 9" },
  { id: 10, comment: "Test Comment 10" },
];


export class MockedComponent {
  constructor(mockedComponentText) {
    this.props = undefined;
    this.inputParams = undefined;
    this.mockedComponentText = mockedComponentText;
  }

  async triggerInput(testId, inputParams) {
    this.inputParams = inputParams;
    await act(async () => {
      await fireEvent.click(screen.getByTestId(testId));
    });
    this.inputParams = undefined;
  }

  assertRendered() {
    const pageElements = screen.queryAllByText(this.mockedComponentText);
    expect(pageElements).toHaveLength(1);
  }

  assertProps(expectedProps) {
    const actualProps = {};
    for (const key in expectedProps) {
      actualProps[key] = this.props[key];
    }
    expect(actualProps).toEqual(expectedProps);
  }
}
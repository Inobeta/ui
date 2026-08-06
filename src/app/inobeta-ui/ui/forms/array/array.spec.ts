import { UntypedFormArray } from "@angular/forms";
import { IbFormArray } from "./array";

describe("IbFormArray", () => {
  it("applies defaults for omitted layout, fields, options, and callbacks", () => {
    const definition = new IbFormArray({ key: "items", fields: null });

    expect(definition.fields).toEqual([]);
    expect(definition.options).toEqual({ max: Infinity, addFieldLabel: "shared.ibForms.array.add" });
    expect(definition.cols).toBe(1);
    expect(definition.rows).toBe(1);
    expect(definition.width).toBe("100%");
    expect(() => definition.addRow(new UntypedFormArray([]), 1)).not.toThrow();
    expect(() => definition.removeRow(new UntypedFormArray([]), 0, 0, {})).not.toThrow();
  });

  it("preserves supplied layout, options, and row callbacks", () => {
    const addRow = jasmine.createSpy("addRow");
    const removeRow = jasmine.createSpy("removeRow");
    const definition = new IbFormArray({
      key: "items",
      fields: [],
      options: { max: 3, addFieldLabel: "add-item" },
      cols: 2,
      rows: 4,
      width: "50%",
      addRow,
      removeRow,
    });
    const control = new UntypedFormArray([]);

    definition.addRow(control, 1);
    definition.removeRow(control, 0, 0, { id: 1 });

    expect(definition.options).toEqual({ max: 3, addFieldLabel: "add-item" });
    expect(definition.cols).toBe(2);
    expect(definition.rows).toBe(4);
    expect(definition.width).toBe("50%");
    expect(addRow).toHaveBeenCalledWith(control, 1);
    expect(removeRow).toHaveBeenCalledWith(control, 0, 0, { id: 1 });
  });
});

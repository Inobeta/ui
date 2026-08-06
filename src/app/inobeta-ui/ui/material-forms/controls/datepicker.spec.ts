import { IbMatDatepickerControl } from './datepicker';

describe('IbMatDatepickerControl', () => {
  it('should preserve null for an empty value', () => {
    const control = new IbMatDatepickerControl({});

    expect(control.value).toBeNull();
  });
});

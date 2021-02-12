/*--------------------------STUB PER LA DIALOG----------------------------------------*/

// stub della dialog che chiama la ref
export const stubServiceDialog = {
  open() {
    return stubDialogRef;
  },
  close() {
    return;
  }
};

// stub della ref che chiama la afterClosed
export const stubDialogRef = {
  afterClosed() {
    return stubAfterClosedDialog;
  }
};

// stub della afterClosed
export const stubAfterClosedDialog = {
  go: true,
  subscribe(succ, err) {
    if (stubAfterClosedDialog.go) {
      succ({ response: 'Yes' });
    } else {
      err();
    }
  }
};

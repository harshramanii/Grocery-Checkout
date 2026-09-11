export const penceToDisplay = (pence: number): string =>
  `£ ${(pence / 100).toFixed(2)}`;

export const penceInline = (pence: number): string =>
  `£${(pence / 100).toFixed(2)}`;

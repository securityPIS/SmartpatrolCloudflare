# stores

Root Zustand store composition / cross-slice selectors. Feature-local stores live
next to their feature (`features/<name>/model`). This directory wires them together
as the app grows (auth + patrol + incident + ...).

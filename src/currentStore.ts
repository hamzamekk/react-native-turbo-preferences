// Module-level state backing the deprecated global-namespace API
// (setName + top-level get/set/...). New code should use createStore().

let currentName: string | null = null;

export function getCurrentName(): string | null {
  return currentName;
}

export function setCurrentName(name: string | null): void {
  currentName = name && name.length > 0 ? name : null;
}

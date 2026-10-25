export const STUDY_CHANGED = "az900-study-changed";
export const STUDY_REFRESHED = "az900-study-refreshed";
let owner: string | null = null;
export function setStudyOwner(id: string | null) { owner = id; }
export function studyStorageKey(key: string) { return owner ? `${key}:user:${owner}` : key; }
export function readStudy(key: string) { return localStorage.getItem(studyStorageKey(key)); }
export function writeStudy(key: string, value: string, notify = true) {
  localStorage.setItem(studyStorageKey(key), value);
  if (notify && typeof window !== "undefined") window.dispatchEvent(new Event(STUDY_CHANGED));
}
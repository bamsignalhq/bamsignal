/** Compute age in full years from ISO date YYYY-MM-DD. */
export function ageFromDateOfBirth(dob: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const born = new Date(year, month - 1, day);
  if (born.getFullYear() !== year || born.getMonth() !== month - 1 || born.getDate() !== day) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - year;
  const hadBirthday =
    today.getMonth() > month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}

export function isAdultDob(dob: string): boolean {
  const age = ageFromDateOfBirth(dob);
  return age != null && age >= 18;
}

export function defaultAdultDob(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  return d.toISOString().slice(0, 10);
}

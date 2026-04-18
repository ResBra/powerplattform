// STUBBED FOR ANDROID BUILD (Firebase only)
export async function getUsers() {
  return [];
}

export async function createUser(formData: FormData) {
  return { success: false, message: "Funktion im Native-Modus eingeschränkt." };
}

export async function deleteUser(id: string) {
  return { success: false, message: "Funktion deaktiviert." };
}

export async function changePassword(formData: FormData) {
  return { success: false, message: "Bitte nutzen Sie die Firebase Passwort-Funktion." };
}

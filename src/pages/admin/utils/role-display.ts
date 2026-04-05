export const getRoleShortForm = (role: string) => {
  switch (role) {
    case "Bride": return "BR"
    case "Groom": return "GR"
    case "Bridesmaid": return "BM"
    case "Coordinator": return "CO"
    default: return role.slice(0, 2);
  }
}
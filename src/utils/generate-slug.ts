export function generateSlug(text: string): string {
  return (
    text
      // Normalização de caracteres: é --> e' --> Ele separa em dois caracteres
      .normalize('NFD')
      // Ele faz a substituição de todos os caracteres que não são letras por nada (remove) e' --> e
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      // Tudo o que não for letra, espaço ou hífen, ele substitui por uma string vazia
      .replace(/[^\w\s-]/g, '')
      // Substitui todos os espaços em branco longos por hífen (-), mantendo apenas um único hífen
      .replace(/\s+/g, '-')
  )
}

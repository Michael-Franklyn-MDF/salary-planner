export interface Greeting {
  language: string
  text: string
}

export const greetings: Greeting[] = [
  { language: 'English', text: 'Hello, Michael' },
  { language: 'Spanish', text: 'Hola, Michael' },
]

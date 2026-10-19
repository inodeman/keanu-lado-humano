export type Lang = "es" | "en";

export type Chapter = {
  id: string;
  ratio: number;
  es: string;
  en: string;
  line: { es: string; en: string };
};

export const chapters: Chapter[] = [
  {
    id: "foto",
    ratio: 0,
    es: "La foto",
    en: "The photograph",
    line: {
      es: "No hablaron de una película. Preguntaron si estaba bien.",
      en: "They were not talking about a movie. They asked if he was all right.",
    },
  },
  {
    id: "nombre",
    ratio: 0.06,
    es: "El nombre",
    en: "The name",
    line: {
      es: "Keanu, en hawaiano: brisa fresca sobre las montañas.",
      en: "In Hawaiian, Keanu means cool breeze over the mountains.",
    },
  },
  {
    id: "antes",
    ratio: 0.16,
    es: "Antes del cartel",
    en: "Before the poster",
    line: {
      es: "Hablaba despacio porque pensaba.",
      en: "He spoke slowly because he was thinking.",
    },
  },
  {
    id: "peliculas",
    ratio: 0.24,
    es: "Las películas",
    en: "The films",
    line: {
      es: "No habló de taquilla. Habló de personas.",
      en: "He did not talk about the box office. He talked about people.",
    },
  },
  {
    id: "river",
    ratio: 0.46,
    es: "River",
    en: "River",
    line: {
      es: "Los amigos de verdad no se vuelven contenido.",
      en: "Real friends do not become content.",
    },
  },
  {
    id: "nochebuena",
    ratio: 0.54,
    es: "Nochebuena",
    en: "Christmas Eve",
    line: {
      es: "Nadie es invencible en una funeraria.",
      en: "Nobody is unbeatable in a funeral home.",
    },
  },
  {
    id: "nombre-propio",
    ratio: 0.68,
    es: "Sin su nombre",
    en: "Without his name",
    line: {
      es: "No me gusta ponerle mi nombre.",
      en: "I don’t like to attach my name to it.",
    },
  },
  {
    id: "banco",
    ratio: 0.78,
    es: "El banco y la fila",
    en: "The bench and the line",
    line: {
      es: "Una estrategia se cansa. Él lleva décadas.",
      en: "A strategy gets tired. He has been doing this for decades.",
    },
  },
  {
    id: "morimos",
    ratio: 0.86,
    es: "Cuando morimos",
    en: "When we die",
    line: {
      es: "Sé que quienes nos aman nos van a extrañar.",
      en: "I know that the ones who love us will miss us.",
    },
  },
  {
    id: "brisa",
    ratio: 0.93,
    es: "La brisa",
    en: "The breeze",
    line: {
      es: "La bondad cabe en una vida rota. Cabe en la tuya.",
      en: "Kindness fits inside a broken life. It fits inside yours.",
    },
  },
];

export const slides: { src: string; ratio: number }[] = [
  { src: "/media/keanu/rooftop.jpg", ratio: 0 },
  { src: "/media/keanu/gaze.jpg", ratio: 0.05 },
  { src: "/media/keanu/young.jpg", ratio: 0.09 },
  { src: "/media/keanu/hands.jpg", ratio: 0.14 },
  { src: "/media/keanu/down.jpg", ratio: 0.18 },
  { src: "/media/keanu/billted.jpg", ratio: 0.24 },
  { src: "/media/keanu/suit.jpg", ratio: 0.3 },
  { src: "/media/keanu/wick.jpg", ratio: 0.36 },
  { src: "/media/keanu/ribbon.jpg", ratio: 0.4 },
  { src: "/media/keanu/e3-crowd.jpg", ratio: 0.44 },
  { src: "/media/keanu/bass-now.jpg", ratio: 0.48 },
  { src: "/media/keanu/lying.jpg", ratio: 0.52 },
  { src: "/media/keanu/bass-90s.jpg", ratio: 0.58 },
  { src: "/media/keanu/down.jpg", ratio: 0.63 },
  { src: "/media/keanu/hands.jpg", ratio: 0.69 },
  { src: "/media/keanu/fans.jpg", ratio: 0.78 },
  { src: "/media/keanu/e3-smile.jpg", ratio: 0.84 },
  { src: "/media/keanu/gaze.jpg", ratio: 0.88 },
  { src: "/media/keanu/rooftop.jpg", ratio: 0.94 },
];

export const copy = {
  es: {
    kicker: "Documental",
    person: "Keanu Reeves",
    title: "El hombre que eligió ser bueno",
    deck: "Sus películas pasan. Lo que queda es cómo trató a la gente, y lo que la vida le quitó sin volverlo cruel.",
    ytTitle: "Keanu Reeves: el hombre que eligió ser bueno",
    hashtags:
      "#KeanuReeves #Documental #ElLadoHumano #JohnWick #Matrix #InodeAi #Cine #HistoriasReales #Bondad #Keanu",
    description: `Hay una foto de un hombre comiendo un sándwich, solo, en un banco. Internet lo llamó el Keanu triste. Este documental no repite el mito. Cuenta por qué el mundo lo quiere de verdad.

Keanu Reeves perdió a su amigo River Phoenix. Perdió a su hija Ava, que nació muerta la Nochebuena de 1999. Perdió a Jennifer Syme. Y aun así eligió seguir siendo amable, en voz baja, sin cartel.

Aquí están sus películas — Bill y Ted, Point Break, Speed, Matrix, John Wick, el E3, Dogstar — y, sobre todo, la persona. La fundación privada a la que no quiere ponerle su nombre. La frase frente a Stephen Colbert. El día en que el éxito no lo volvió cruel.

Duración: alrededor de 10 minutos. En YouTube es el largo que la gente sí termina. Pasa de los 8 minutos, así que puede monetizarse, y no se siente inflado.

Si esta historia se quedó contigo, suscríbete a InodeAi. Y deja en los comentarios el nombre de alguien a quien todavía extrañas.

Fuentes habladas con cuidado: The Late Show con Stephen Colbert (2019 y 2024), Parade (2006), Ladies’ Home Journal (2009) y el desmentido de su equipo, en 2022, del mito de que donó el 70% de Matrix. Las cifras de regalos al equipo circulan como leyenda: aquí se cuentan como lo que son, no como un número auditado.

Fotografías reales de archivo de prensa y apariciones públicas.

#KeanuReeves #Documental #ElLadoHumano #JohnWick #Matrix #InodeAi #Cine #HistoriasReales #Bondad #Keanu`,
  },
  en: {
    kicker: "Documentary",
    person: "Keanu Reeves",
    title: "The man who chose to stay kind",
    deck: "The movies pass. What remains is how he treated people, and what life took from him without making him cruel.",
    ytTitle: "Keanu Reeves: The Man Who Chose to Stay Kind",
    hashtags:
      "#KeanuReeves #Documentary #HumanStory #JohnWick #TheMatrix #InodeAi #Kindness #TrueStory #Cinema #Keanu",
    description: `There is a photograph of a man eating a sandwich, alone, on a bench. The internet called him Sad Keanu. This documentary does not repeat the myth. It tells why the world actually loves him.

Keanu Reeves lost his friend River Phoenix. He lost his daughter Ava, stillborn on Christmas Eve, 1999. He lost Jennifer Syme. And he still chose to stay kind, quietly, without a billboard.

His films are here — Bill and Ted, Point Break, Speed, The Matrix, John Wick, E3, Dogstar — and, more than those, the person. The private foundation he will not put his name on. The sentence he said to Stephen Colbert. The fact that success did not make him cruel.

Length: about 10 minutes. On YouTube, that is the length people actually finish. It clears 8 minutes, so it can be monetized, and it does not feel padded.

If this story stayed with you, subscribe to InodeAi. And leave in the comments the name of someone you still miss.

Spoken carefully from: The Late Show with Stephen Colbert (2019 and 2024), Parade (2006), Ladies’ Home Journal (2009), and his team’s 2022 denial of the myth that he donated 70% of his Matrix money. The crew-gift figures circulate as legend. They are told here as legend, not as an audited number.

Real photographs from press archives and public appearances.

#KeanuReeves #Documentary #HumanStory #JohnWick #TheMatrix #InodeAi #Kindness #TrueStory #Cinema #Keanu`,
  },
} as const;

export const credits = [
  "Retratos 2021, Esquire / archivo de prensa",
  "E3 2019, apariciones públicas de Xbox / Cyberpunk",
  "Estreno de John Wick: Chapter 4, archivo de prensa",
  "Firmas con fans, Toy Story 4, archivo de prensa",
  "Dogstar, archivo de prensa (GQ, Los Angeles Times)",
  "Bill & Ted, fotografía promocional",
];

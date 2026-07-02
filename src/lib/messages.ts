export const messages = {
  wrapped: {
    hook: {
      eyebrow: "MM-kisat 2026",
      title: "Lopullinen sijoituksesi",
      swipe: "Vieritä alas",
    },
    distribution: {
      eyebrow: "Veikkausten jakauma",
      detail: "Veikkauksesi jakaantuivat eri vaihtoehdoille näin.",
    },
    accuracy: {
      eyebrow: "Osumatarkkuus",
      detail: "Sait {correct} oikein {total} veikkauksesta.",
      betterStrategy:
        'Jos olisit veikannut kaikkiin otteluihin tulokseksi "{pick}", olisit saanut {correctCount} pistettä ja sijoittunut sijalle {potentialRank}.',
    },
    draws: {
      eyebrow: "Tasapelien tietäjä",
      detail:
        "Turnauksessa pelattiin {tournamentCount} tasapeliä — osuit niihin {pct}%:n tarkkuudella.",
      leader: "Eniten oikeita tasapelejä: {name} ({count}/{total})",
    },
    unanimous: {
      eyebrow: "Great minds think alike",
      detail: "Näin monessa ottelussa kaikki veikkasivat samaa tulosta.",
      correct:
        "{count, plural, one {Näistä meni oikein # veikkaus.} other {Näistä meni oikein # veikkausta.}}",
    },
    nobodyCorrect: {
      eyebrow: "Vaikeimmat veikattavat",
      empty:
        "Tälle porukalle mikään ottelu ei ollut liian vaikea — jokaisen ottelun veikkasi joku oikein.",
      detail:
        "{count, plural, one {# ottelu, jota kukaan ei veikannut oikein:} other {# ottelua, joita kukaan ei veikannut oikein:}}",
    },
    loneWolf: {
      eyebrow: "Parempi kuin muut",
      zero: "Et ollut kertaakaan yksin oikeassa — menit turvallisesti muiden mukana.",
      some: "Olit {count} ottelussa ainoa oikein veikannut.",
      leader: "Eniten ainoita oikeita veikkauksia: {name} ({count})",
    },
    twinNemesis: {
      eyebrow: "Yö ja päivä",
      twin: "Eniten samoja veikkauksia kanssasi:",
      nemesis: "Vähiten samoja veikkauksia kanssasi:",
      noData: "Ei dataa.",
    },
    trajectory: {
      eyebrow: "Sijoituksesi turnauksen edetessä",
      peak: "Parhaimmillaan",
      lowest: "Huonoimmillaan",
      knockoutLabel: "Pudotuspelit",
    },
    outro: {
      eyebrow: "Loppukaneetti",
      thanks: "Kiitos pelaamisesta!",
      tease: "Onneksi UEFA Euro 28 onkin jo ihan kulman takana... 👀",
    },
  },
} as const;

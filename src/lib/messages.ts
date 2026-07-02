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
    streaks: {
      eyebrow: "Pisimmät veikkausputkesi",
      correct: "oikein ",
      incorrect: "väärin",
    },
    bestGroup: {
      eyebrow: "Paras lohkosi",
      detail: "Veikkasit parhaiten {letter}-lohkon ottelut.",
    },
    draws: {
      eyebrow: "Tasapelien tietäjä",
      detail: "Tasapelit ovat usein vaikeimpia ennustaa.",
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
        "{count, plural, one {Kukaan ei veikannut tätä ottelua oikein.} other {Kukaan ei veikannut näitä otteluita oikein.}}",
    },
    loneWolf: {
      eyebrow: "Parempi kuin muut",
      zero: "Et ollut kertaakaan yksin oikeassa — menit turvallisesti muiden mukana.",
      some: "Näin monessa ottelussa olit ainoa oikein veikannut.",
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
      knockoutLabel: "Pudotuspelit",
    },
    outro: {
      eyebrow: "Loppukaneetti",
      thanks: "Kiitos pelaamisesta!",
      tease: "Onneksi UEFA Euro 28 onkin jo ihan kulman takana... 👀",
    },
  },
} as const;

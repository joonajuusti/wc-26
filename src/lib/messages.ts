export const messages = {
  wrapped: {
    footer: {
      rank: "{rank}. sija",
      brand: "WC26",
    },
    hook: {
      eyebrow: "MM-kisat 2026",
      title: "Lopullinen sijoituksesi",
      points: "{n, plural, one {# piste} other {# pistettä}}",
    },
    accuracy: {
      eyebrow: "Osumatarkkuus",
      detail: "Sait {correct} oikein {total} veikkauksesta.",
      betterStrategy:
        'Jos olisit veikannut kaikkiin otteluihin tulokseksi "{pick}", olisit saanut {correctCount} pistettä ja sijoittunut sijalle {potentialRank}.',
    },
    draws: {
      eyebrow: "Tasapelien tietäjä",
      intro: {
        bad: "Tasapelit ovat tunnetusti vaikeita — parempi onni ensi kerralla.",
        good: "Tasapelit ovat tunnetusti vaikeita — mutta ei sinulle.",
      },
      detail:
        "Turnauksessa pelattiin {tournamentCount} tasapeliä — osuit niihin {pct}%:n tarkkuudella.",
      leader: "Eniten oikeita tasapelejä: {name} ({count}/{total})",
    },
    decisive: {
      eyebrow: "Ratkaisulliset ottelut",
      intro: "Kun ottelussa oli voittaja, tiesit sen.",
      detail: "{correct}/{total} oikein.",
      leader: "Eniten: {name} ({count})",
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
      peakMatch: "Nousit kärkeen ottelun {home}–{away} jälkeen.",
      comment: {
        rollercoaster: "Aikamoista vuoristorataa 🎢",
        climber: "Nousujohteinen suoritus 📈",
        faller: "Aloitit vahvasti, mutta loppua kohden hyytyi 📉",
        steady: "Veikkasit tasaisen vahvasti läpi turnauksen 💪🏻",
      },
    },
    clutch: {
      eyebrow: "Jakauma",
      group: "Lohkovaihe",
      knockout: "Pudotuspelit",
      label: {
        neutral: "Veikkasit tasaisen vahvasti läpi turnauksen 💪🏻",
        choker:
          "Aloitit vahvasti, mutta pudotuspelit koituivat kohtaloksesi 📉",
        clutch: "Nousujohteista suorittamista 📈",
      },
    },
    poster: {
      eyebrow: "WC26 · Yhteenveto",
      rank: "sija",
      points: "pistettä",
      accuracy: "osumat",
      superlative: {
        loneWolf:
          "{n, plural, one {Yksin ainoa oikeassa # kerran.} other {Yksin ainoa oikeassa # kertaa.}}",
        nobodyCorrect:
          "{n, plural, one {# ottelu, jossa kukaan ei osunut.} other {# ottelua, joissa kukaan ei osunut.}}",
        even: "Tasainen suoritus läpi turnauksen.",
      },
    },
  },
} as const;

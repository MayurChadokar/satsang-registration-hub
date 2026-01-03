export function toDevanagariDigits(input: string) {
  return input
    .replaceAll("0", "०")
    .replaceAll("1", "१")
    .replaceAll("2", "२")
    .replaceAll("3", "३")
    .replaceAll("4", "४")
    .replaceAll("5", "५")
    .replaceAll("6", "६")
    .replaceAll("7", "७")
    .replaceAll("8", "८")
    .replaceAll("9", "९");
}

type VowelInfo = { token: string; independent: string; matra: string };

const VOWELS: VowelInfo[] = [
  { token: "aa", independent: "आ", matra: "ा" },
  { token: "ai", independent: "ऐ", matra: "ै" },
  { token: "au", independent: "औ", matra: "ौ" },
  { token: "ii", independent: "ई", matra: "ी" },
  { token: "ee", independent: "ई", matra: "ी" },
  { token: "uu", independent: "ऊ", matra: "ू" },
  { token: "oo", independent: "ऊ", matra: "ू" },
  { token: "ri", independent: "ऋ", matra: "ृ" },
  { token: "a", independent: "अ", matra: "" },
  { token: "i", independent: "इ", matra: "ि" },
  { token: "u", independent: "उ", matra: "ु" },
  { token: "e", independent: "ए", matra: "े" },
  { token: "o", independent: "ओ", matra: "ो" },
];

const CONSONANTS: Array<{ token: string; out: string }> = [
  { token: "ksh", out: "क्ष" },
  { token: "gy", out: "ज्ञ" },
  { token: "kh", out: "ख" },
  { token: "gh", out: "घ" },
  { token: "chh", out: "छ" },
  { token: "ch", out: "च" },
  { token: "jh", out: "झ" },
  { token: "th", out: "थ" },
  { token: "dh", out: "ध" },
  { token: "ph", out: "फ" },
  { token: "bh", out: "भ" },
  { token: "sh", out: "श" },
  { token: "gn", out: "ग्न" },
  { token: "tr", out: "त्र" },
  { token: "dr", out: "द्र" },
  { token: "kr", out: "क्र" },
  { token: "gr", out: "ग्र" },
  { token: "pr", out: "प्र" },
  { token: "br", out: "ब्र" },
  { token: "sr", out: "स्र" },
  { token: "k", out: "क" },
  { token: "g", out: "ग" },
  { token: "j", out: "ज" },
  { token: "t", out: "त" },
  { token: "d", out: "द" },
  { token: "n", out: "न" },
  { token: "p", out: "प" },
  { token: "b", out: "ब" },
  { token: "m", out: "म" },
  { token: "y", out: "य" },
  { token: "r", out: "र" },
  { token: "l", out: "ल" },
  { token: "v", out: "व" },
  { token: "w", out: "व" },
  { token: "s", out: "स" },
  { token: "h", out: "ह" },
  { token: "f", out: "फ" },
  { token: "q", out: "क" },
  { token: "x", out: "क्स" },
  { token: "z", out: "ज" },
];

function matchToken<T extends { token: string }>(
  input: string,
  index: number,
  tokens: T[],
) {
  for (const t of tokens) {
    if (input.startsWith(t.token, index)) return t;
  }
  return null;
}

export function romanToHindi(text: string) {
  const src = text
    .trim()
    .replaceAll(/\s+/g, " ")
    .toLowerCase();

  if (!src) return "";

  let out = "";
  let i = 0;
  let atWordStart = true;
  let prevWasConsonant = false;

  while (i < src.length) {
    const ch = src[i];

    if (ch === " ") {
      out += " ";
      i += 1;
      atWordStart = true;
      prevWasConsonant = false;
      continue;
    }

    if (/\d/.test(ch)) {
      out += ch;
      i += 1;
      atWordStart = false;
      prevWasConsonant = false;
      continue;
    }

    if (/[^a-z]/.test(ch)) {
      out += ch;
      i += 1;
      atWordStart = false;
      prevWasConsonant = false;
      continue;
    }

    const vowel = matchToken(src, i, VOWELS);
    if (vowel) {
      if (atWordStart || !prevWasConsonant) out += vowel.independent;
      else out += vowel.matra;
      i += vowel.token.length;
      atWordStart = false;
      prevWasConsonant = false;
      continue;
    }

    const consonant = matchToken(src, i, CONSONANTS);
    if (consonant) {
      out += consonant.out;
      i += consonant.token.length;
      atWordStart = false;
      prevWasConsonant = true;
      continue;
    }

    out += ch;
    i += 1;
    atWordStart = false;
    prevWasConsonant = false;
  }

  return out;
}

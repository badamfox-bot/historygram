// Shared animal identity per category, used by the alternate visual engines
// (creature-b.js / creature-c.js). Not used by the original engine
// (mascot.js) — kept separate so all three can coexist on the same page
// for side-by-side comparison without colliding.
const SPECIES = {
  "Dev & Tools":     { animal: "Owl",      ears: "tufts",   snout: "beak",    tail: "short",  legs: 2, action: "bounce", badge: "code" },
  "Entertainment":   { animal: "Raccoon",  ears: "round",   snout: "mask",    tail: "ringed", legs: 4, action: "arc",    badge: "play" },
  "Social":          { animal: "Rabbit",   ears: "long",    snout: "round",   tail: "puff",   legs: 4, action: "pulse",  badge: "heart" },
  "Shopping":        { animal: "Squirrel", ears: "round",   snout: "round",   tail: "bushy",  legs: 4, action: "sway",   badge: "dollar" },
  "News":            { animal: "Fox",      ears: "pointed", snout: "pointed", tail: "bushy",  legs: 4, action: "bounce", badge: "lines" },
  "Search":          { animal: "Meerkat",  ears: "small",   snout: "pointed", tail: "thin",   legs: 2, action: "sway",   badge: "magnifier" },
  "Email":           { animal: "Beaver",   ears: "small",   snout: "teeth",   tail: "flat",   legs: 4, action: "arc",    badge: "envelope" },
  "Finance":         { animal: "Hamster",  ears: "round",   snout: "round",   tail: "tiny",   legs: 4, action: "spin",   badge: "dollar" },
  "Productivity":    { animal: "Ant",      ears: "none",    snout: "none",    tail: "none",   legs: 6, action: "pulse",  badge: "check" },
  "Reference":       { animal: "Tortoise", ears: "none",    snout: "beak",    tail: "tiny",   legs: 4, action: "bounce", badge: "book" },
  "Maps & Travel":   { animal: "Bird",     ears: "none",    snout: "beak",    tail: "fan",    legs: 2, action: "arc",    badge: "plane" },
  "AI & Assistants": { animal: "Cat",      ears: "pointed", snout: "round",   tail: "thin",   legs: 4, action: "pulse",  badge: "sparkle" },
  "Music":           { animal: "Frog",     ears: "none",    snout: "wide",    tail: "none",   legs: 4, action: "arc",    badge: "note" },
  "Other":           { animal: "Mole",     ears: "tiny",    snout: "pointed", tail: "thin",   legs: 4, action: "spin",   badge: "question" },
};

function speciesFor(category) {
  return SPECIES[category] || SPECIES["Other"];
}

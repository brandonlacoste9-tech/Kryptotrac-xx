export const personas = {
  bb: {
    id: "bb",
    name: "Bee",
    dock_label: "Bee",
    analytics_tag: "persona_bb",
    test_log_tag: "[BB TEST]",
    description: "Expert crypto analyst with degen energy & deep knowledge",
  },
  satoshi: {
    id: "satoshi",
    name: "Satoshi",
    dock_label: "Satoshi",
    analytics_tag: "persona_satoshi",
    test_log_tag: "[SATOSHI TEST]",
    description: "Smart crypto friend with degen energy",
  },
  default: {
    id: "default",
    name: "Default",
    dock_label: "ATLAS",
    analytics_tag: "persona_default",
    test_log_tag: "[ATLAS TEST]",
    description: "Formal analytical assistant",
  },
}

export type PersonaId = keyof typeof personas

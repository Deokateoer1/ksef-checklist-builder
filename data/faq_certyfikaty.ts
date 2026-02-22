import { FAQItem } from '../data/faqDatabase';

export const FAQ_CERTYFIKATY: FAQItem[] = [
  {
    id: "FAQ_CERT_001",
    phase: 3,
    category: "Techniczne",
    question: "Jak często należy odnawiać certyfikaty i tokeny w KSeF oraz jakie są konsekwencje ich wygaśnięcia?",
    answer: "Certyfikaty kwalifikowane mają ważność zwykle 2-3 lata, tokeny API są ważne przez rok (można je odnowić w MCU). Wygasły certyfikat uniemożliwia wystawianie faktur w KSeF. Jeśli certyfikat wygaśnie, należy natychmiast złożyć wniosek o nowy w MCU. W międzyczasie można używać trybu offline24 z poprzednim certyfikatem (jeśli był ważny w momencie wystawienia faktury offline). Zaleca się ustawienie przypomnień na 30 dni przed wygaśnięciem.",
    tags: ["certyfikat", "token", "wygasanie", "odnawianie", "mcu", "ważność"],
    difficulty: "intermediate",
    audience: "IT",
    relatedTopics: ["FAQ_3_001", "FAQ_3_002", "FAQ_6_001"],
    source: "mf.gov.pl"
  }
];
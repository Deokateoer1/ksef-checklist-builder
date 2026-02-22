import { FAQItem } from '../data/faqDatabase';

export const FAQ_BEZPIECZENSTWO_RODO: FAQItem[] = [
  {
    id: "FAQ_BR_001",
    phase: 1,
    category: "Bezpieczeństwo i RODO",
    question: "Jak KSeF wpływa na ochronę danych osobowych (RODO)?",
    answer: "KSeF przetwarza dane osobowe zawarte w fakturach (nazwiska, adresy, NIP). Podatnik musi zaktualizować klauzule informacyjne dla kontrahentów. Należy unikać wpisywania danych wrażliwych w polu opisu towaru/usługi (P_7).",
    tags: ["RODO", "dane osobowe", "bezpieczeństwo", "prywatność", "P_7"],
    difficulty: "advanced",
    audience: "audytor",
    relatedTopics: [],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (podatki.gov.pl)"
  },
  {
    id: "FAQ_BR_002",
    phase: 2,
    category: "Bezpieczeństwo i RODO",
    question: "Jakie metody uwierzytelniania są dostępne w KSeF?",
    answer: "KSeF oferuje: Profil Zaufany, podpis kwalifikowany, certyfikat kwalifikowany, token API, pieczęć elektroniczną. Od 2026 wymagany jest certyfikat KSeF do trybu offline.",
    tags: ["uwierzytelnianie", "certyfikat", "token", "pieczęć", "bezpieczeństwo"],
    difficulty: "intermediate",
    audience: "IT",
    relatedTopics: ["FAQ_BR_001"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (mf.gov.pl)"
  },
  {
    id: "FAQ_BR_003",
    phase: 3,
    category: "Bezpieczeństwo i RODO",
    question: "Jak zabezpieczyć dane w integracji z KSeF?",
    answer: "Należy używać TLS 1.3, szyfrować dane w bazie, implementować kontrolę dostępu, regularnie aktualizować certyfikaty, prowadzić logi dostępu i przeprowadzać audyty bezpieczeństwa.",
    tags: ["szyfrowanie", "TLS", "bezpieczeństwo", "audyt", "kontrola dostępu"],
    difficulty: "expert",
    audience: "IT",
    relatedTopics: ["FAQ_BR_002"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (gov.pl)"
  },
  {
    id: "FAQ_BR_004",
    phase: 4,
    category: "Bezpieczeństwo i RODO",
    question: "Co zrobić w przypadku wycieku danych z KSeF?",
    answer: "Należy niezwłocznie powiadomić UODO (w ciągu 72 godzin), kontrahentów których dane wyciekły, zabezpieczyć system, zmienić hasła i certyfikaty, oraz przeprowadzić audyt bezpieczeństwa.",
    tags: ["wyciek danych", "UODO", "incydent", "bezpieczeństwo", "powiadomienie"],
    difficulty: "advanced",
    audience: "audytor",
    relatedTopics: ["FAQ_BR_001"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (podatki.gov.pl)"
  },
  {
    id: "FAQ_BR_005",
    phase: 5,
    category: "Bezpieczeństwo i RODO",
    question: "Jak długo przechowywać logi dostępu do KSeF?",
    answer: "Zaleca się przechowywanie logów przez minimum 3 lata (okres przedawnienia odpowiedzialności). Logi powinny zawierać: datę, godzinę, użytkownika, IP, operację i wynik (sukces/porażka).",
    tags: ["logi", "audyt", "przechowywanie", "3 lata", "monitoring"],
    difficulty: "intermediate",
    audience: "IT",
    relatedTopics: ["FAQ_BR_003"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (mf.gov.pl)"
  }
];
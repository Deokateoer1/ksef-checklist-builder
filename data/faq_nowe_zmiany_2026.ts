import { FAQItem } from '../data/faqDatabase';

export const FAQ_NOWE_ZMIANY_2026: FAQItem[] = [
  {
    id: "FAQ_NZ_2026_001",
    phase: 0,
    category: "Nowe obowiązki 2026",
    question: "Jakie są nowe terminy obowiązkowego KSeF od 1 lutego 2026 roku?",
    answer: "Od 1 lutego 2026 roku KSeF jest obowiązkowy dla dużych firm (przychody > 200 mln zł w 2024). Od 1 kwietnia 2026 dla pozostałych podatników VAT z limitem 10 000 zł miesięcznie. Od 1 stycznia 2027 pełny obowiązek dla wszystkich.",
    tags: ["terminy", "2026", "obowiązek", "duże firmy", "harmonogram"],
    difficulty: "beginner",
    audience: "wszyscy",
    relatedTopics: [],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (podatki.gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_002",
    phase: 1,
    category: "Nowe obowiązki 2026",
    question: "Co to jest limit 10 000 zł w okresie przejściowym 2026?",
    answer: "Od 1 kwietnia do 31 grudnia 2026 podatnicy mogą wystawiać faktury poza KSeF, jeśli miesięczna wartość sprzedaży nie przekracza 10 000 zł brutto. Przekroczenie limitu w danym miesiącu oznacza obowiązek KSeF dla wszystkich faktur w tym miesiącu.",
    tags: ["limit", "10 000 zł", "okres przejściowy", "2026", "zwolnienie"],
    difficulty: "intermediate",
    audience: "ksiegowy",
    relatedTopics: ["FAQ_NZ_2026_001"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (mf.gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_003",
    phase: 2,
    category: "Nowe obowiązki 2026",
    question: "Jakie faktury są wyłączone z obowiązku KSeF w 2026 roku?",
    answer: "Wyłączone są: faktury B2C (dla konsumentów), faktury uproszczone do 450 zł, usługi finansowe zwolnione z VAT, bilety, usługi autostradowe oraz faktury dla podmiotów zagranicznych bez polskiego NIP.",
    tags: ["wyłączenia", "B2C", "faktury uproszczone", "2026", "zwolnienia"],
    difficulty: "intermediate",
    audience: "ksiegowy",
    relatedTopics: ["FAQ_NZ_2026_002"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_004",
    phase: 3,
    category: "Techniczne zmiany 2026",
    question: "Co to jest Moduł Certyfikatów i Uprawnień (MCU) w KSeF?",
    answer: "MCU to nowy moduł KSeF uruchomiony w listopadzie 2025, który umożliwia zarządzanie uprawnieniami do wystawiania faktur. Pozwala na nadawanie uprawnień pracownikom i biurom rachunkowym bez udostępniania głównego certyfikatu.",
    tags: ["MCU", "uprawnienia", "certyfikaty", "2026", "bezpieczeństwo"],
    difficulty: "advanced",
    audience: "IT",
    relatedTopics: [],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (podatki.gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_005",
    phase: 4,
    category: "Techniczne zmiany 2026",
    question: "Jakie są nowe kody błędów w KSeF od 2026 roku?",
    answer: "Od 2026 wprowadzono nowe kody błędów: 21150 (błąd struktury XML), 21151 (błąd walidacji biznesowej), 21152 (błąd autoryzacji), 21153 (limit zapytań przekroczony). Każdy błąd ma szczegółowy opis w odpowiedzi API.",
    tags: ["błędy", "kody błędów", "2026", "API", "walidacja"],
    difficulty: "advanced",
    audience: "IT",
    relatedTopics: [],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (mf.gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_006",
    phase: 5,
    category: "Kary i sankcje 2026",
    question: "Jakie kary grożą za niewystawienie faktury w KSeF w 2026 roku?",
    answer: "W 2026 roku (okres przejściowy) nie ma kar za błędy w KSeF. Od 1 stycznia 2027 kara wynosi do 100% kwoty podatku VAT na fakturze lub do 18,7% wartości faktury bez VAT. Kary nakłada Naczelnik US.",
    tags: ["kary", "2026", "okres przejściowy", "sankcje", "2027"],
    difficulty: "intermediate",
    audience: "menedzer",
    relatedTopics: ["FAQ_NZ_2026_001"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_007",
    phase: 6,
    category: "Tryb awaryjny 2026",
    question: "Jak działa tryb offline24 w nowym KSeF?",
    answer: "Tryb offline24 pozwala wystawić fakturę bez połączenia z KSeF. Faktura musi zawierać kod QR z hashem SHA-256 i identyfikatorem certyfikatu. Należy ją przesłać do KSeF w ciągu 24 godzin od przywrócenia połączenia.",
    tags: ["offline24", "tryb awaryjny", "2026", "kod QR", "awaria"],
    difficulty: "advanced",
    audience: "IT",
    relatedTopics: [],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (podatki.gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_008",
    phase: 7,
    category: "Integracja systemów",
    question: "Jakie są wymagania techniczne dla integracji z KSeF od 2026?",
    answer: "Systemy muszą obsługiwać API KSeF w wersji 2.0, używać TLS 1.3, obsługiwać strukturę FA(3), implementować mechanizm retry przy błędach 429, oraz przechowywać numery KSeF w bazie danych (UPO write-back).",
    tags: ["integracja", "API", "wymagania techniczne", "2026", "FA(3)"],
    difficulty: "expert",
    audience: "IT",
    relatedTopics: ["FAQ_NZ_2026_005"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (mf.gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_009",
    phase: 8,
    category: "JPK_VAT i KSeF",
    question: "Jak zmienia się JPK_VAT w związku z KSeF od 2026?",
    answer: "Od 2026 w JPK_VAT obowiązkowo należy podawać numer KSeF dla każdej faktury wystawionej w systemie. Wprowadzono nowe oznaczenia: OFF (faktura offline), BFK (faktura bez KSeF), DI (dokument inny niż faktura).",
    tags: ["JPK_VAT", "numer KSeF", "2026", "ewidencja", "oznaczenia"],
    difficulty: "intermediate",
    audience: "ksiegowy",
    relatedTopics: ["FAQ_NZ_2026_001"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (gov.pl)"
  },
  {
    id: "FAQ_NZ_2026_010",
    phase: 9,
    category: "Koszty wdrożenia",
    question: "Jakie są koszty wdrożenia KSeF dla małej firmy?",
    answer: "Koszty obejmują: certyfikat kwalifikowany (300-600 zł/rok), dostosowanie systemu ERP (od 5 000 zł), szkolenia pracowników (od 2 000 zł), ewentualne usługi integratora. Samo API KSeF jest bezpłatne.",
    tags: ["koszty", "wdrożenie", "małe firmy", "2026", "budżet"],
    difficulty: "beginner",
    audience: "menedzer",
    relatedTopics: ["FAQ_NZ_2026_001"],
    source: "ŹRÓDŁO ZEWNĘTRZNE – INTERNET (podatki.gov.pl)"
  }
];
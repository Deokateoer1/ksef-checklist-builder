
export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'TERMINY' | 'KARY' | 'ECOMMERCE' | 'BIURA' | 'MEDYCYNA' | 'BUDOWLANKA' | 'GASTRONOMIA' | 'TRANSPORT' | 'TECHNICZNE' | 'DOKUMENTACJA' | 'PRAWNE' | 'ROBOT' | 'STRUKTURA_XML' | 'UPRAWNIENIA' | 'AWARIE_PROCEDURY' | 'INTEGRACJE_IT';
  keywords: string[];
}

export const FAQ_DATABASE: FAQItem[] = [
  // --- ROZBUDOWANE TERMINY ---
  { id: 101, category: 'TERMINY', question: 'Kiedy duże firmy wchodzą do KSeF?', answer: 'Dla podatników o obrotach powyżej 200 mln zł (VAT-owcy) termin to 1 lutego 2026 r.', keywords: ['termin', 'luty', '2026', 'duże'] },
  { id: 102, category: 'TERMINY', question: 'Kiedy MŚP i mikro wchodzą do KSeF?', answer: 'Dla pozostałych podatników termin to 1 kwietnia 2026 r.', keywords: ['mśp', 'mikro', 'kwiecień'] },
  { id: 103, category: 'TERMINY', question: 'Od kiedy kary za brak faktury w KSeF?', answer: 'Kary pieniężne (sankcje) zostaną aktywowane 1 stycznia 2027 r.', keywords: ['kary', '2027', 'sankcje'] },
  
  // --- ZAANSOWANY ROBOT (PORT 8443) ---
  { id: 801, category: 'ROBOT', question: 'Dlaczego Robot Zwiadowca używa portu 8443?', answer: 'Port 8443 jest standardem dla bezpiecznej komunikacji HTTPS (FastAPI). Pozwala na integrację Dashboardu z Twoją lokalną bazą PostgreSQL i Redis bez konfliktów z innymi systemami ERP na porcie 8000.', keywords: ['port', '8443', 'https', 'fastapi'] },
  { id: 802, category: 'ROBOT', question: 'Co to jest funkcja Math-Guard w Robocie?', answer: 'Math-Guard to warstwa walidacji, która przed wysyłką XML do MF sprawdza poprawność matematyczną (Netto + VAT = Brutto). MF tego nie sprawdza, więc Robot chroni przed wprowadzaniem błędnych dokumentów do obiegu.', keywords: ['matematyka', 'walidacja', 'błędy', 'math-guard'] },
  { id: 803, category: 'ROBOT', question: 'Jak Robot obsługuje błąd 429 (Rate Limit)?', answer: 'Robot implementuje kolejkę Celery/Redis z mechanizmem Exponential Backoff. Jeśli MF odrzuci połączenie, Robot odczekuje (2s, 4s, 8s...) i ponawia wysyłkę automatycznie.', keywords: ['429', 'rate limit', 'kolejkowanie', 'redis'] },
  
  // --- STRUKTURA XML (FA-3) ---
  { id: 1301, category: 'STRUKTURA_XML', question: 'Czym różni się FA-3 od FA-2?', answer: 'FA-3 wprowadza zmiany w sekcji Podmiot3 (podmioty trzecie), doprecyzowuje pola dla załączników (w formie linków) i modyfikuje pola stopek płatności. Wymaga aktualizacji parserów.', keywords: ['fa-3', 'fa-2', 'różnice', 'zmiany'] },
  { id: 1302, category: 'STRUKTURA_XML', question: 'Limit znaków w polu P_7 (Nazwa towaru)?', answer: 'Limit wynosi 256 znaków. Przekroczenie tego limitu spowoduje błąd krytyczny 21133 i odrzucenie faktury.', keywords: ['p_7', 'limit', 'opis', '21133'] },
  { id: 1303, category: 'STRUKTURA_XML', question: 'Jak oznaczyć WSTO (Wewnątrzwspólnotowa Sprzedaż Towarów na Odległość)?', answer: 'W KSeF faktury WSTO B2B muszą posiadać odpowiednie oznaczenia w polach procedur specjalnych i stawkach VAT kraju przeznaczenia.', keywords: ['wsto', 'e-commerce', 'zagranica'] },

  // --- E-COMMERCE & OSS ---
  { id: 301, category: 'ECOMMERCE', question: 'Czy faktury B2C trafiają do KSeF?', answer: 'Nie. Zgodnie z aktualnym projektem (v2.0), faktury dla osób fizycznych nieprowadzących działalności (B2C) są wyłączone z KSeF.', keywords: ['b2c', 'konsumenci', 'wyłączenie'] },
  { id: 302, category: 'ECOMMERCE', question: 'Co z procedurą OSS?', answer: 'Podatnicy rozliczający się w procedurze OSS wystawiają faktury poza KSeF (chyba że są to transakcje B2B podlegające polskim przepisom).', keywords: ['oss', 'vat', 'procedura'] },

  // --- TECHNICZNE & API ---
  { id: 701, category: 'TECHNICZNE', question: 'Błąd 21157 - jak go uniknąć?', answer: 'Błąd 21157 oznacza zbyt duży plik XML (>1MB). Rozwiązaniem jest podział faktury na mniejsze (rzadkie) lub użycie sesji wsadowej (Batch) obsługiwanej przez Robota.', keywords: ['21157', 'rozmiar', 'xml', 'batch'] },
  { id: 702, category: 'TECHNICZNE', question: 'Co to jest kod 21133?', answer: 'To błąd walidacji semantycznej pola P_7. Najczęściej wynika z użycia niedozwolonych znaków (np. emoji, specyficzne symbole spoza UTF-8).', keywords: ['21133', 'p_7', 'znaki', 'utf-8'] },
  { id: 703, category: 'TECHNICZNE', question: 'Jak wygenerować token JWT 2.0?', answer: 'Tokeny generuje się w Aplikacji Podatnika (Aplikacja KSeF). Pamiętaj: tokeny z wersji 1.0 (z 2024 roku) NIE BĘDĄ działać w wersji 2.0. Wymagana regeneracja po 10.12.2025.', keywords: ['token', 'jwt', 'autoryzacja', '2.0'] },

  // --- BRANŻOWE ---
  { id: 901, category: 'GASTRONOMIA', question: 'Paragony z NIP do 450 zł?', answer: 'Po wejściu KSeF paragon z NIP przestaje pełnić rolę faktury uproszczonej. Każda sprzedaż B2B musi zakończyć się wystawieniem pełnej faktury XML w KSeF.', keywords: ['paragon', 'nip', '450', 'uproszczona'] },
  { id: 1101, category: 'TRANSPORT', question: 'Paliwo i opłaty drogowe w KSeF?', answer: 'Faktury za paliwo (np. karty paliwowe) będą pobierane przez biura bezpośrednio z KSeF. Koniec z "zbieraniem paragonów" od kierowców.', keywords: ['paliwo', 'transport', 'koszty'] },
  { id: 1001, category: 'PRAWNE', question: 'Numer KSeF w JPK_V7M?', answer: 'Od 2026 roku JPK_V7 będzie posiadał nowe pole na 35-znakowy numer KSeF. Brak podania numeru w JPK przy fakturze KSeF może skutkować błędem 500 zł za każdy rekord.', keywords: ['jpk', 'vat', 'numer ksef', 'kara'] }
];

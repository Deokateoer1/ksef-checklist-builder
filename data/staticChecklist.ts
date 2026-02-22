import { TaskSection, TaskPriority } from '../types';

export interface StaticTask {
  id: string;
  section: TaskSection;
  title: string;
  desc: string;
  priority: TaskPriority;
}

export const MASTER_CHECKLIST: StaticTask[] = [
  {
    id: 'M001',
    section: TaskSection.PREPARATORY,
    title: 'Inwentaryzacja systemów i procesów',
    desc: 'Identyfikacja wszystkich punktów styku, w których generowane są faktury (sprzedaż, media, refaktury, samofakturowanie).',
    priority: TaskPriority.CRITICAL
  },
  {
    id: 'M002',
    section: TaskSection.PREPARATORY,
    title: 'Audyt czystości danych NIP/Kontrahent',
    desc: 'Weryfikacja bazy kontrahentów pod kątem poprawności NIP i przypisania do odpowiednich grup (B2B vs B2C).',
    priority: TaskPriority.HIGH
  },
  {
    id: 'M101',
    section: TaskSection.COMPLIANCE,
    title: 'Aneksowanie umów z biurem rachunkowym',
    desc: 'Dostosowanie odpowiedzialności za błędy w XML oraz terminowość dosyłania faktur w trybie offline.',
    priority: TaskPriority.CRITICAL
  },
  {
    id: 'M102',
    section: TaskSection.COMPLIANCE,
    title: 'Procedura retencji dokumentów (10 lat)',
    desc: 'Ustalenie sposobu archiwizacji plików XML poza systemem KSeF po upływie okresu gwarantowanego przez MF.',
    priority: TaskPriority.MEDIUM
  },
  {
    id: 'M301',
    section: TaskSection.TECHNICAL,
    title: 'Wybór modelu autoryzacji (Token vs Pieczęć)',
    desc: 'Decyzja o sposobie uwierzytelniania w API. Dla dużych wolumenów zalecana pieczęć kwalifikowana podmiotu.',
    priority: TaskPriority.HIGH
  },
  {
    id: 'M302',
    section: TaskSection.TECHNICAL,
    title: 'Integracja z bramką API 2.0 (FA-3)',
    desc: 'Dostosowanie ERP do nowej struktury logicznej FA(3) i obsługa komunikatów statusowych (UPO/Błąd).',
    priority: TaskPriority.CRITICAL
  },
  {
    id: 'M501',
    section: TaskSection.TESTS,
    title: 'Testy scenariuszy korygujących',
    desc: 'Symulacja wystawiania korekt "do zera" oraz korekt danych merytorycznych w środowisku Demo.',
    priority: TaskPriority.HIGH
  },
  {
    id: 'M601',
    section: TaskSection.EMERGENCY,
    title: 'Wdrożenie procedury Offline24',
    desc: 'Przeszkolenie personelu z zakresu generowania faktur z kodem QR podczas awarii systemów zewnętrznych.',
    priority: TaskPriority.CRITICAL
  }
];
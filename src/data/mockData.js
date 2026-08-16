export const SEED_USERS = [
  // Guru Kelas A
  { id: 1, email: 'guru.a@tk.com', password: '123', name: 'Bu Siti (TK A)', role: 'teacher', assignedClass: 'TK A' },
  // Guru Kelas B
  { id: 2, email: 'guru.b@tk.com', password: '123', name: 'Bu Rina (TK B)', role: 'teacher', assignedClass: 'TK B' },
  // Kepala Sekolah
  { id: 99, email: 'kepsek@tk.com', password: '123', name: 'Pak Budi (Kepsek)', role: 'admin', assignedClass: 'ALL' },
];

export const SEED_STUDENTS = [
  { id: 1, name: 'Adit Sopo', class: 'TK A', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adit' },
  { id: 2, name: 'Jarwo Kuat', class: 'TK A', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jarwo' },
  { id: 3, name: 'Susanti', class: 'TK B', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Susanti' },
  { id: 4, name: 'Mei Mei', class: 'TK B', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mei' },
  { id: 5, name: 'Ijat', class: 'TK A', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ijat' },
  { id: 6, name: 'Mail', class: 'TK B', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mail' },
];
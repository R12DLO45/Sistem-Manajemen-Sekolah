export const SEED_USERS = [
  // 1. Admin / Tata Usaha
  { id: 1, 
    name: 'Admin TU', 
    email: 'admin@tk.com', 
    password: 'admin123', 
    role: 'admin', 
    assignedClass: 'ALL', 
    nip: '198501012010011001',
    phone: '081234567001' 
  },
  { id: 2, 
    name: 'Bu Sari, S.Pd', 
    email: 'sari@tk.com', 
    password: 'sari123', 
    role: 'teacher', 
    assignedClass: 'Kelas A', 
    nip: '199002152015022002',
    phone: '081234567002' 
  },
  { 
    id: 3, 
    name: 'Bu Rini, S.Pd', 
    email: 'rini@tk.com', 
    password: 'rini123', 
    role: 'teacher', 
    assignedClass: 'Kelas B', 
    nip: '199208202018032003',
    phone: '081234567003'
  },
  { 
    id: 4, 
    name: 'Pak Budi, S.Pd', 
    email: 'budi@tk.com', 
    password: 'budi123', 
    role: 'teacher', 
    assignedClass: 'Kelas C', 
    nip: '198811102014041004',
    phone: '081234567004'
  },
  { 
    id: 5, 
    name: 'Hj. Siti Nurjanah, M.Pd', 
    email: 'kepsek@tk.com', 
    password: 'kepsek123', 
    role: 'kepsek', 
    assignedClass: 'ALL', 
    nip: '197503121998032001',
    phone: '081234567005'
  }
];

export const SEED_STUDENTS = [
  { id: 101, name: 'Aira Putri', class: 'Kelas A', gender: 'P', parentName: 'Hendra Pratama', phone: '081234567890', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aira' },
  { id: 102, name: 'Bima Pratama', class: 'Kelas A', gender: 'L', parentName: 'Agus Santoso', phone: '081234567891', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bima' },
  { id: 103, name: 'Cinta Meilani', class: 'Kelas A', gender: 'P', parentName: 'Rudi Hartono', phone: '081234567892', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cinta' },
  { id: 104, name: 'Daffa Alfarizi', class: 'Kelas A', gender: 'L', parentName: 'Bambang Irawan', phone: '081234567893', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daffa' },
  { id: 105, name: 'Eka Nur A.', class: 'Kelas B', gender: 'P', parentName: 'Suryanto', phone: '081234567894', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eka' },
  { id: 106, name: 'Fathan Rafi', class: 'Kelas B', gender: 'L', parentName: 'Dedi Kurniawan', phone: '081234567895', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fathan' },
  { id: 107, name: 'Ghina Azzahra', class: 'Kelas B', gender: 'P', parentName: 'Wahyu Hidayat', phone: '081234567896', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghina' },
  { id: 108, name: 'Hafidz Ramadhan', class: 'Kelas C', gender: 'L', parentName: 'M. Taufik', phone: '081234567897', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hafidz' },
  { id: 109, name: 'Intan Permata', class: 'Kelas C', gender: 'P', parentName: 'Joko Widodo', phone: '081234567898', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Intan' },
  { id: 110, name: 'Jovan Arkan', class: 'Kelas C', gender: 'L', parentName: 'Ahmad Syaifullah', phone: '081234567899', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jovan' }
];
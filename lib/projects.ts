export type Project = {
  name: string;
  type: string;
  price: string;
  size: string;
  rooms: string;
  baths: string;
  location: string;
  status: "Dalam Jualan" | "Unit Terhad" | "Siap 2026" | "Habis Dijual";
  image: string;
  href: string;
};

const uploads = "/project-images";

export const projects: Project[] = [
  { name: "Rumah Selangorku U9 Shah Alam", type: "Apartment", price: "RM288,000", size: "1,023 sqft", rooms: "4", baths: "2", location: "U9, Shah Alam", status: "Dalam Jualan", image: `${uploads}/2026/04/residensi_akasia_facade-scaled.webp`, href: "https://selangorku.org/rumah-selangorku-u9-shah-alam/" },
  { name: "Rumah Selangorku Bukit Raja", type: "Apartment", price: "RM280,000", size: "900 sqft", rooms: "3", baths: "2", location: "Bukit Raja, Klang", status: "Dalam Jualan", image: `${uploads}/2026/06/36.png`, href: "https://selangorku.org/rumah-selangorku-klang/" },
  { name: "Residensi Armani Putrajaya", type: "Servis Apartment", price: "RM230,000", size: "450–1,000 sqft", rooms: "3", baths: "2", location: "Desa Pinggiran Putra", status: "Dalam Jualan", image: `${uploads}/2026/06/38.webp`, href: "https://selangorku.org/residensi-armani-putrajaya/" },
  { name: "Ara Grove Batang Kali", type: "Teres 1 Tingkat", price: "RM297,000", size: "20’ × 65’", rooms: "3", baths: "2", location: "Batang Kali, Hulu Selangor", status: "Dalam Jualan", image: `${uploads}/2026/08/57.webp`, href: "https://selangorku.org/ara-grove-batang-kali/" },
  { name: "Gardens Idaman Rawang", type: "Apartment", price: "RM250,000", size: "1,002 sqft", rooms: "3", baths: "2", location: "Kundang, Rawang", status: "Dalam Jualan", image: `${uploads}/2026/10/rumah-selangorku-rawang.webp`, href: "https://selangorku.org/rumah-selangorku-gardens-idaman-rawang/" },
  { name: "PPAM Bandar Saujana Putra", type: "Apartment", price: "RM299,000", size: "850 sqft", rooms: "3", baths: "2", location: "Bandar Saujana Putra", status: "Habis Dijual", image: `${uploads}/2026/01/169-1280x720-19-300x169.webp`, href: "https://selangorku.org/ppam-bandar-saujana-putra/" },
  { name: "Rumah Teres Pulau Meranti", type: "Teres 2 Tingkat", price: "RM619,000", size: "20’ × 60’–95’", rooms: "4", baths: "3", location: "Pulau Meranti, Puchong", status: "Dalam Jualan", image: `${uploads}/2026/01/90.webp`, href: "https://selangorku.org/rumah-teres-pulau-meranti/" },
  { name: "Rumah Selangorku Setia Alam", type: "Apartment", price: "RM285,000", size: "1,048 sqft", rooms: "4", baths: "3", location: "Setia Alam, Shah Alam", status: "Dalam Jualan", image: `${uploads}/2025/08/selangorku-setia-alam.webp`, href: "https://selangorku.org/selangorku-setia-alam/" },
  { name: "Rumawip Residensi Melati", type: "Apartment", price: "RM300,000", size: "800 sqft", rooms: "3", baths: "2", location: "Taman Melati, Setapak", status: "Dalam Jualan", image: `${uploads}/2026/04/rumawip-residensi-melati-facade.png`, href: "https://selangorku.org/rumawip-residensi-melati/" },
  { name: "Rumah Selangorku Jenderam", type: "Townhouse", price: "RM230,000", size: "1,035 sqft", rooms: "3", baths: "2", location: "Jenderam, Dengkil", status: "Dalam Jualan", image: `${uploads}/2026/08/selangorku-jenderam-damai.webp`, href: "https://selangorku.org/rumah-selangorku-jenderam/" },
  { name: "Selangorku Lagenda Ardea", type: "Teres 1 Tingkat", price: "RM250,000", size: "20’ × 65’", rooms: "3", baths: "2", location: "Bernam Jaya, Kuala Kubu Bharu", status: "Dalam Jualan", image: `${uploads}/2025/08/9-1.webp`, href: "https://selangorku.org/selangorku-lagenda-ardea/" },
  { name: "Daffodil Alam Suria", type: "Kondominium", price: "RM286,000", size: "850 sqft", rooms: "3", baths: "2", location: "Alam Suria, Puncak Alam", status: "Dalam Jualan", image: `${uploads}/2026/02/101.webp`, href: "https://selangorku.org/daffodil-alam-suria-puncak-alam/" },
  { name: "Selangorku Puncak Alam", type: "Apartment", price: "RM250,000", size: "1,022 sqft", rooms: "3", baths: "3", location: "Puncak Alam", status: "Dalam Jualan", image: `${uploads}/2025/08/97.webp`, href: "https://selangorku.org/selangorku-puncak-alam/" },
  { name: "Rumah Selangorku Damansara", type: "Servis Apartment", price: "RM250,000", size: "553 sqft", rooms: "2", baths: "1", location: "Bandar Sri Damansara", status: "Dalam Jualan", image: `${uploads}/2026/04/rumah-selangorku-damansara.webp`, href: "https://selangorku.org/rumah-selangorku-damansara/" },
  { name: "Rumah Selangorku Bandar Sunway", type: "Apartment", price: "RM265,000", size: "550 sqft", rooms: "2", baths: "2", location: "Bandar Sunway, Subang Jaya", status: "Dalam Jualan", image: `${uploads}/2026/07/48.webp`, href: "https://selangorku.org/rumah-selangorku-bandar-sunway/" },
  { name: "Rumah Selangorku Puchong Jaya", type: "Servis Apartment", price: "Dari RM270,000", size: "550–850 sqft", rooms: "2/3", baths: "1/2", location: "Puchong Jaya", status: "Unit Terhad", image: `${uploads}/2026/04/rumah-selangorku-puchong.webp`, href: "https://selangorku.org/rumah-selangorku-puchong-jaya/" },
  { name: "Rumah Selangorku Cyberjaya", type: "Apartment", price: "RM250,000", size: "1,100 sqft", rooms: "3", baths: "2", location: "Cyberjaya", status: "Siap 2026", image: `${uploads}/2025/07/48.webp`, href: "https://selangorku.org/rumah-selangorku-cyberjaya/" },
  { name: "Kita Sejati @ Cybersouth", type: "Apartment", price: "RM320,000", size: "850 sqft", rooms: "3", baths: "2", location: "Cybersouth, Dengkil", status: "Dalam Jualan", image: `${uploads}/2025/08/99-300x169.webp`, href: "https://selangorku.org/kita-sejati-cybersouth/" },
  { name: "Kondo Vista Bayu @ Kajang", type: "Kondominium", price: "RM346,000", size: "1,387 sqft", rooms: "3", baths: "2", location: "Sungai Ramal, Kajang", status: "Dalam Jualan", image: `${uploads}/2025/08/98.webp`, href: "https://selangorku.org/kondo-vista-bayu/" },
  { name: "Rumah Selangorku Semenyih Diamond City", type: "Apartment", price: "RM262,000", size: "1,000 sqft", rooms: "3", baths: "2", location: "Diamond City, Semenyih", status: "Dalam Jualan", image: `${uploads}/2026/01/169-1280x720-22.webp`, href: "https://selangorku.org/rumah-selangorku-semenyih-diamond-city/" },
  { name: "Rumah Selangorku Bangi", type: "Apartment", price: "RM262,000", size: "1,045 sqft", rooms: "3", baths: "3", location: "Alam Sari, Bangi", status: "Dalam Jualan", image: `${uploads}/2025/09/169-1280x720-15.webp`, href: "https://selangorku.org/rumah-selangorku-bangi/" },
  { name: "Rumah Selangorku Semenyih", type: "Apartment", price: "RM262,000", size: "1,045 sqft", rooms: "3", baths: "3", location: "Eco Majestic, Semenyih", status: "Dalam Jualan", image: `${uploads}/2025/09/169-1280x720-14.webp`, href: "https://selangorku.org/rumah-selangorku-semenyih/" },
  { name: "Rumah Penjawat Awam Myra Dahlia", type: "Kondominium", price: "RM299,800", size: "900 sqft", rooms: "3", baths: "2", location: "Bandar Baru Salak Tinggi", status: "Habis Dijual", image: `${uploads}/2025/07/ppam-myra-dahlia-300x169.webp`, href: "https://selangorku.org/perumahan-penjawat-awam-myra-dahlia/" },
  { name: "Rumah Teres Intan Baiduri", type: "Teres 1 Tingkat", price: "RM389,000", size: "20’ × 75’", rooms: "4", baths: "2", location: "Bandar Baru Salak Tinggi", status: "Habis Dijual", image: `${uploads}/2025/08/47-300x169.webp`, href: "https://selangorku.org/rumah-intan-baiduri/" },
  { name: "Rumah Teres Kota Warisan", type: "Teres 1 Tingkat", price: "RM450,000", size: "22’ × 70’", rooms: "4", baths: "2", location: "Kota Warisan, Salak Tinggi", status: "Habis Dijual", image: `${uploads}/2025/08/96-300x169.webp`, href: "https://selangorku.org/rumah-kota-warisan/" },
  { name: "Rumah Teres Kg Lombong", type: "Teres 2 Tingkat", price: "RM558,000", size: "20’ × 72’", rooms: "4", baths: "4", location: "Kg Lombong, Shah Alam", status: "Habis Dijual", image: `${uploads}/2025/09/71-300x169.webp`, href: "https://selangorku.org/rumah-teres-kg-lombong/" },
  { name: "Rumah Teres Jalan Kebun", type: "Teres 2 Tingkat", price: "RM515,000", size: "20’ × 65’–67’", rooms: "4", baths: "3", location: "Jalan Kebun, Shah Alam", status: "Habis Dijual", image: `${uploads}/2025/10/80-300x169.webp`, href: "https://selangorku.org/rumah-teres-jalan-kebun/" },
  { name: "Residensi Aman Madani", type: "Apartment", price: "RM300,000", size: "900 sqft", rooms: "3", baths: "2", location: "Bandar Sri Permaisuri, Cheras", status: "Habis Dijual", image: `${uploads}/2026/04/residensi-aman-madani-300x219.webp`, href: "https://selangorku.org/residensi-aman-madani/" },
  { name: "Selangorku Dua Meranti", type: "Apartment", price: "RM249,000", size: "900 sqft", rooms: "3", baths: "2", location: "Pulau Meranti, Puchong", status: "Habis Dijual", image: `${uploads}/2025/08/selangorku-dua-meranti-1-300x169.webp`, href: "https://selangorku.org/selangorku-dua-meranti/" },
  { name: "Rumah Selangorku Cahaya Alam", type: "Apartment", price: "RM288,000", size: "1,022 sqft", rooms: "3", baths: "3", location: "U12, Shah Alam", status: "Habis Dijual", image: `${uploads}/2026/01/95-300x169.webp`, href: "https://selangorku.org/rumah-selangorku-cahaya-alam/" },
  { name: "Rumah Teres Shah Alam (S29)", type: "Teres 2 Tingkat", price: "RM650,000", size: "20’ × 80’", rooms: "4", baths: "4", location: "Seksyen 29, Shah Alam", status: "Habis Dijual", image: `${uploads}/2025/10/77-300x169.webp`, href: "https://selangorku.org/rumah-teres-shah-alam/" },
  { name: "Rumah Selangorku Puchong", type: "Townhouse", price: "RM295,000", size: "22’ × 65’", rooms: "3", baths: "2", location: "Pulau Meranti, Puchong", status: "Habis Dijual", image: `${uploads}/2025/08/51-300x169.webp`, href: "https://selangorku.org/rumah-selangorku-puchong/" },
  { name: "Rumah Selangorku Subang", type: "Apartment", price: "RM290,000", size: "1,090 sqft", rooms: "3", baths: "2", location: "USJ 2, Subang Jaya", status: "Habis Dijual", image: `${uploads}/2025/09/169-1280x720-16.webp`, href: "https://selangorku.org/rumah-selangorku-subang/" },
  { name: "Selangorku Idaman Cahaya", type: "Apartment", price: "RM250,000", size: "1,022 sqft", rooms: "3", baths: "3", location: "Shah Alam", status: "Habis Dijual", image: `${uploads}/2025/08/idaman-cahaya-300x169.webp`, href: "https://selangorku.org/selangorku-idaman-cahaya/" },
  { name: "RSKU Kuala Kubu Bharu", type: "Teres 2 Tingkat", price: "RM250,000", size: "20’ × 60’", rooms: "3", baths: "2", location: "Kuala Kubu Bharu", status: "Habis Dijual", image: `${uploads}/2025/08/selangorku-kkb-300x169.webp`, href: "https://selangorku.org/rsku-kuala-kubu-bharu/" },
  { name: "Selangorku Idaman Sari", type: "Apartment", price: "RM250,000", size: "1,022 sqft", rooms: "3", baths: "3", location: "Pulau Meranti, Puchong", status: "Habis Dijual", image: `${uploads}/2025/08/idaman-sari-300x169.webp`, href: "https://selangorku.org/selangorku-idaman-sari/" },
  { name: "Selangorku Idaman BSP", type: "Apartment", price: "RM250,000", size: "1,022 sqft", rooms: "3", baths: "3", location: "Bandar Saujana Putra", status: "Habis Dijual", image: `${uploads}/2025/08/idaman-bsp-300x169.webp`, href: "https://selangorku.org/selangorku-idaman-bsp/" },
  { name: "Selangorku Idaman Melur", type: "Apartment", price: "RM250,000", size: "1,022 sqft", rooms: "3", baths: "3", location: "Cybersouth", status: "Habis Dijual", image: `${uploads}/2025/08/idaman-melur-1-300x169.webp`, href: "https://selangorku.org/selangorku-idaman-melur/" }
];

export function projectSlug(project: Project) {
  return new URL(project.href).pathname.split("/").filter(Boolean).at(-1) || "";
}

export function projectPath(project: Project) {
  return `/projek/${projectSlug(project)}`;
}

export function findProject(slug: string) {
  return projects.find((project) => projectSlug(project) === slug);
}

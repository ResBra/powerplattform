export interface InstagramPost {
  id: string;
  id_post: string;
  imageUrl: string;
  caption: string;
  link: string;
}

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "1",
    id_post: "post1",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000",
    caption: "Moderne Architektur im Bergischen Land. #Immobilien #Wiehl",
    link: "https://www.instagram.com/p/C6_placeholder1/"
  },
  {
    id: "2",
    id_post: "post2",
    imageUrl: "https://images.unsplash.com/photo-1600607687940-4e524cb35a3a?q=80&w=1000",
    caption: "Exklusive Einblicke in unsere neuen Objekte. #BergischLand #Home",
    link: "https://www.instagram.com/p/C6_placeholder2/"
  },
  {
    id: "3",
    id_post: "post3",
    imageUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1000",
    caption: "Traumhaus gefunden? Wir begleiten Sie persönlich. #Hauskauf",
    link: "https://www.instagram.com/p/C6_placeholder3/"
  },
  {
    id: "4",
    id_post: "post4",
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1000",
    caption: "Professionelle Hausverwaltung für Ihren Seelenfrieden. #Service",
    link: "https://www.instagram.com/p/C6_placeholder4/"
  },
  {
    id: "5",
    id_post: "post5",
    imageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1000",
    caption: "Ehrlichkeit und Transparenz sind unser Fundament. #Werte",
    link: "https://www.instagram.com/p/C6_placeholder5/"
  },
  {
    id: "6",
    id_post: "post6",
    imageUrl: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=1000",
    caption: "Wir für das Bergische Land. Ihr Partner vor Ort. #Lokal",
    link: "https://www.instagram.com/p/C6_placeholder6/"
  }
];

/* Generated from the Zuzalu Dossier (research file, Sep 2026). Photos belong to the credited authors. */
export interface DossierPhoto { src: string; caption: string; credit: string | null; hero: boolean }
export interface DossierVideo { href: string; thumb: string; title: string }
export interface DossierArticle { title: string; byline: string | null; summary: string }
export interface DossierChapter { id: string; num: string; title: string; place: string; dates: string; lede: string; stats: { value: string; label: string }[]; photos: DossierPhoto[]; videos: DossierVideo[]; articles?: DossierArticle[]; source?: { label: string; href: string } }

export const DOSSIER_EMBLEM = "/zuzalu/00-d6c5c5.jpg";
export const DOSSIER_CHAPTERS: DossierChapter[] = [
 {
  "id": "montenegro",
  "num": "I",
  "title": "Zuzalu Montenegro",
  "place": "Lustica Bay, Montenegro",
  "dates": "25 Mar – 25 May 2023",
  "lede": "The prototype. Two hundred people in an off-season resort on the Adriatic, a geodesic dome for talks, a zero-knowledge passport, and no token or DAO by design.",
  "stats": [
   {
    "value": "~200",
    "label": "core residents"
   },
   {
    "value": "~800",
    "label": "people passed through"
   },
   {
    "value": "2",
    "label": "months"
   },
   {
    "value": "0",
    "label": "tokens or DAOs, by design"
   }
  ],
  "photos": [
   {
    "src": "/zuzalu/01-3278d8.jpg",
    "caption": "Lustica Bay marina at sunset: the white Dome and the lighthouse.",
    "credit": "Noah Chon Lee",
    "hero": true
   },
   {
    "src": "/zuzalu/02-9701dd.jpg",
    "caption": "Residents outside the Dome at the marina.",
    "credit": "Milica Vulic / CoinDesk",
    "hero": false
   },
   {
    "src": "/zuzalu/03-bfa368.jpg",
    "caption": "Vitalik presenting at Zuzalu.",
    "credit": "Bernardo Vicente",
    "hero": false
   },
   {
    "src": "/zuzalu/04-72b1f3.jpg",
    "caption": "Closing panel on the amphitheatre stage, 25 May 2023.",
    "credit": "Shuyao Kong / Decrypt",
    "hero": false
   },
   {
    "src": "/zuzalu/05-17af57.jpg",
    "caption": "ZK talk inside the Dome, beanbags and laptops.",
    "credit": "Decrypt",
    "hero": false
   },
   {
    "src": "/zuzalu/06-0258f6.jpg",
    "caption": "Vitalik on the AKASHA social-networks panel in the Dome.",
    "credit": "AKASHA",
    "hero": false
   },
   {
    "src": "/zuzalu/07-5196f5.jpg",
    "caption": "Evening session on the Chedi terrace.",
    "credit": "Decrypt",
    "hero": false
   },
   {
    "src": "/zuzalu/08-ea1bc6.jpg",
    "caption": "The teal-and-yellow Zuzalu flag.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/09-761b0b.jpg",
    "caption": "Acro-yoga on the Chedi pool deck.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/10-77db0f.jpg",
    "caption": "Vitalik's day trip to UDG students in Podgorica, 28 Apr 2023.",
    "credit": "EuroCC / UDG",
    "hero": false
   },
   {
    "src": "/zuzalu/11-8397e7.jpg",
    "caption": "Boat trip in the Bay of Kotor.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/12-e2ed33.jpg",
    "caption": "Perast. Hero of Vitalik's essay and the Zupass ticket background.",
    "credit": "George Kedenburg III / Palladium",
    "hero": false
   }
  ],
  "videos": [
   {
    "href": "https://www.youtube.com/watch?v=hh_EWsyJIcc",
    "thumb": "/zuzalu/13-e5df85.jpg",
    "title": "Zuzalu in Montenegro (Lustica Bay channel)"
   },
   {
    "href": "https://www.youtube.com/watch?v=BathFxHadZ8",
    "thumb": "/zuzalu/14-5f4c48.jpg",
    "title": "CoinDesk: Zuzalu to close after 2 months"
   },
   {
    "href": "https://www.youtube.com/watch?v=6tlqPCuv2-E",
    "thumb": "/zuzalu/15-8a5864.jpg",
    "title": "Panel in the Dome with Vitalik (AKASHA)"
   },
   {
    "href": "https://www.youtube.com/watch?v=BAeMr3Xyb08",
    "thumb": "/zuzalu/16-00d163.jpg",
    "title": "Bankless: Vitalik on the experiment"
   }
  ]
 },
 {
  "id": "istanbul",
  "num": "II",
  "title": "ZuConnect Istanbul",
  "place": "Minoa Pera, Beyoğlu, Istanbul",
  "dates": "29 Oct – 11 Nov 2023",
  "lede": "The sequel, compressed. Two weeks in an 1896 Beyoğlu building with a bookstore, café, co-working floors and a red-seat theatre. Zupass grew into ticketing and polls.",
  "stats": [
   {
    "value": "~300",
    "label": "full-time residents"
   },
   {
    "value": "100+",
    "label": "part-timers"
   },
   {
    "value": "2",
    "label": "weeks before Devconnect"
   },
   {
    "value": "56",
    "label": "talks archived on StreamETH"
   }
  ],
  "photos": [
   {
    "src": "/zuzalu/17-b637ec.jpg",
    "caption": "Vitalik Buterin and Juan Benet, “What can technologists do to fix a fractured web?”, 7 Nov.",
    "credit": "Matters Lab",
    "hero": true
   },
   {
    "src": "/zuzalu/18-4eb31e.jpg",
    "caption": "Minoa Pera on Meşrutiyet Caddesi, the ZuConnect hub.",
    "credit": "AiCoin",
    "hero": false
   },
   {
    "src": "/zuzalu/19-cc06b3.jpg",
    "caption": "The theatre during a session. Slide: “Value-aligned tech stack.”",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/20-ff8898.jpg",
    "caption": "Vitalik with ZuSocial hackers in a loft above the rooftops.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/21-6aec90.jpg",
    "caption": "Vitalik on Community Notes and Birdwatch.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/22-c4b4af.jpg",
    "caption": "Panel on mechanism design for digital public spaces.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/23-08edac.jpg",
    "caption": "Night out in Beyoğlu.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/24-e04ce2.jpg",
    "caption": "Residents on the Asian side, Kadıköy.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/25-78f709.jpg",
    "caption": "The Zuzalians’ co-creation canvas.",
    "credit": "AiCoin",
    "hero": false
   },
   {
    "src": "/zuzalu/26-ac76e3.jpg",
    "caption": "Decentralized Social Day after-party.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/27-4c6ca3.jpg",
    "caption": "Decentralized Social Day schedule, 7 Nov 2023.",
    "credit": "Matters Lab",
    "hero": false
   }
  ],
  "videos": [
   {
    "href": "https://www.youtube.com/watch?v=UVm15VIbtHM",
    "thumb": "/zuzalu/28-c4ac7a.jpg",
    "title": "Vitalik on the future of Zuzalu, 1 Nov 2023"
   },
   {
    "href": "https://www.youtube.com/watch?v=3d-y3boMIXw",
    "thumb": "/zuzalu/29-7be784.jpg",
    "title": "Vlog at the ZuConnect venue, 6 Nov"
   },
   {
    "href": "https://www.youtube.com/watch?v=ugXNQmWOH4Y",
    "thumb": "/zuzalu/30-7c69d4.jpg",
    "title": "Vlad Martynov on governance at ZuConnect"
   },
   {
    "href": "https://www.youtube.com/watch?v=3jCKdxQ9Pfw",
    "thumb": "/zuzalu/31-c44a67.jpg",
    "title": "ZK Day: ZK Email"
   }
  ]
 },
 {
  "id": "chiangmai",
  "num": "III",
  "title": "Chiang Mai Archipelago",
  "place": "Chiang Mai, Thailand",
  "dates": "30 Sep – 10 Nov 2024",
  "lede": "The peak. A dozen pop-up villages ran as neighbours with no central organiser, coordinated through pelago.city and timed before Devcon Bangkok. The community drew it as an island map and called it the Zuzapelago.",
  "stats": [
   {
    "value": "12+",
    "label": "villages at once"
   },
   {
    "value": "2,000+",
    "label": "people in the city"
   },
   {
    "value": "600–700",
    "label": "at Edge City Lanna"
   },
   {
    "value": "42",
    "label": "days Vitalik spent there"
   }
  ],
  "photos": [
   {
    "src": "/zuzalu/32-422eed.jpg",
    "caption": "“Zuzapelago Chiang Mai”, the showcase map.",
    "credit": "Zuzalu Town Halls",
    "hero": true
   },
   {
    "src": "/zuzalu/33-f1f073.jpg",
    "caption": "Edge City Lanna sign on the lawn at Wat Kate.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/34-0c00c2.jpg",
    "caption": "Vitalik at Cathy Tie’s plant gene-editing workshop.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/35-a04c25.jpg",
    "caption": "Invisible Garden opening, Vitalik centre.",
    "credit": "Invisible Garden",
    "hero": false
   },
   {
    "src": "/zuzalu/36-3a2bde.jpg",
    "caption": "Keynote hall at Edge City Lanna.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/37-54dd45.jpg",
    "caption": "Flood clean-up after the October 2024 floods.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/38-b072c4.jpg",
    "caption": "Sunday community dinner.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/39-81cba0.jpg",
    "caption": "The “tools for human flourishing” hackathon.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/40-29fd6c.jpg",
    "caption": "Morning yoga.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/41-3ab0f9.jpg",
    "caption": "Kids’ program: toddlers to centenarians.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/42-3ee387.jpg",
    "caption": "Idext co-working, first week.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/43-177685.jpg",
    "caption": "Invisible Garden residents in Nimman.",
    "credit": "Invisible Garden",
    "hero": false
   },
   {
    "src": "/zuzalu/44-8759f3.jpg",
    "caption": "Closing group photo.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/45-017289.jpg",
    "caption": "Edge City Lanna village map.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/46-6bbd9b.jpg",
    "caption": "ShanhaiWoo Chiang Mai opening, 5 Oct 2024.",
    "credit": "ShanhaiWoo",
    "hero": false
   }
  ],
  "videos": [
   {
    "href": "https://www.youtube.com/watch?v=0DwWqkyEda4",
    "thumb": "/zuzalu/47-d76c6d.jpg",
    "title": "Vitalik: Introduction to d/acc, Edge City Lanna"
   },
   {
    "href": "https://www.youtube.com/watch?v=8Y7xyzVBLPw",
    "thumb": "/zuzalu/48-a1ba1b.jpg",
    "title": "A day in the life at Edge City Lanna"
   },
   {
    "href": "https://www.youtube.com/watch?v=iAG5L-0RTwg",
    "thumb": "/zuzalu/49-712c73.jpg",
    "title": "Invisible Garden 2024 recap"
   },
   {
    "href": "https://www.youtube.com/watch?v=Kn_RKyPG8Ko",
    "thumb": "/zuzalu/50-6a0fb2.jpg",
    "title": "What is Edge City Lanna?"
   }
  ]
 },
 {
  "id": "february-2026",
  "num": "IV",
  "title": "February 2026",
  "place": "Zuzone newsletter",
  "dates": "Feb 2026",
  "lede": "Three years after Montenegro, the ecosystem takes stock. Pop-ups are becoming permanent bases, a new regenerative village joins the map, and the 2026 map of villages is published.",
  "stats": [],
  "photos": [
   {
    "src": "/zuzone-2026/zuzone-map-2026.jpeg",
    "caption": "Global Map of Villages, 2026 edition, from the February issue.",
    "credit": "Design: ShanHaiWoo",
    "hero": true
   },
   {
    "src": "/zuzone-2026/amagi-life.jpeg",
    "caption": "Amagi, a regenerative village in Thailand, introduced as a new village.",
    "credit": "Amagi Life",
    "hero": false
   },
   {
    "src": "/zuzone-2026/chris-mata.jpeg",
    "caption": "Chris Mata (protocolwhisper), featured in d/acc in Practice.",
    "credit": "Zuzone",
    "hero": false
   }
  ],
  "videos": [],
  "articles": [
   {
    "title": "On Potentials, Pitfalls and Priorities in Zu2026",
    "byline": "Burns",
    "summary": "Three years in, pop-ups have become a path to permanent bases. The essay argues the movement should now leave platform games and governance theatre behind and focus on scaling tools, not empires."
   },
   {
    "title": "Introducing New Villages: Amagi",
    "byline": null,
    "summary": "A regenerative village in Thailand, six months in, with residents living on site, businesses operating and a community ownership model other villages want to replicate."
   },
   {
    "title": "d/acc in Practice: EIP-8149",
    "byline": "Chris Mata",
    "summary": "A proposed Ethereum precompile that verifies many KZG openings from one data blob in a single call, making full on-chain verification cheap enough to rely on."
   }
  ],
  "source": {
   "label": "Read the February 2026 issue",
   "href": "https://www.zuzone.org/february-2026"
  }
 },
 {
  "id": "march-2026",
  "num": "V",
  "title": "March 2026",
  "place": "Zuzone newsletter",
  "dates": "Mar 2026",
  "lede": "Permanent hubs as the places where sanctuary technology becomes everyday life. ZuCity Japan launches its app, Network School offers lessons in permanence, and Zuzone co-hosts its first X Spaces on the road to Devcon.",
  "stats": [],
  "photos": [
   {
    "src": "/zuzone-2026/shashank-trivedi.jpeg",
    "caption": "Shashank Trivedi, builder of Privote, featured in d/acc in Practice.",
    "credit": "Zuzone",
    "hero": false
   }
  ],
  "videos": [],
  "articles": [
   {
    "title": "Editor's Corner: Building Sanctuary in Practice",
    "byline": "Yami",
    "summary": "Sanctuary technologies need liveable communities around them. Permanent hubs such as ZuBerlin and ZuAfrique are where those tools become daily infrastructure, and coordination is what connects separate hubs into an ecosystem."
   },
   {
    "title": "The EF Mandate and Zuzalu",
    "byline": "Burns",
    "summary": "Reads Ethereum's newly published mandate alongside Zuzalu: both aim to uncapture the individual, and shared CROPS principles give a network of independent hubs common ground without a main node."
   },
   {
    "title": "Connecting the Global Nomad to Rural Japan",
    "byline": null,
    "summary": "ZuCity Japan launches an app that gathers rooms, cars and events across rural Nagano, Hokkaido and Kyushu in one place, with an on-chain booking calendar counted in Zuzalu years."
   },
   {
    "title": "Lessons in Permanence from Network School",
    "byline": "vrn.eth",
    "summary": "Permanent coliving raises the stakes: relationships with neighbours and local government come first, and extended residencies are the best way to seed a permanent place."
   },
   {
    "title": "X Spaces: Roads to Devcon",
    "byline": null,
    "summary": "On March 25, Zuzone co-hosted a conversation with Invisible Garden, Valley of the Commons and ProtoVille about value-aligned spaces and the road to Devcon, the first of a recurring series."
   },
   {
    "title": "d/acc in Practice: Privote",
    "byline": "Shashank Trivedi",
    "summary": "Private, anti-collusion on-chain voting built on MACI. Voters can quietly change their vote, so a bribe can never be verified, and they can sign in with just an email or passkey."
   }
  ],
  "source": {
   "label": "Read the March 2026 issue",
   "href": "https://www.zuzone.org/march-2026"
  }
 }
];
export const DOSSIER_SOURCES = "Sources: Vitalik Buterin’s essays (2022, 2023, 2025), Decrypt, CoinDesk, Matters Lab, Edge City, Invisible Garden, Noah Chon Lee, Bernardo Vicente, the StreamETH archive, Luma and the Zuzone newsletter. Photos belong to the credited authors.";

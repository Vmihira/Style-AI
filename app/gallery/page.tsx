"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Filter, Check, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface FashionItem {
  id: string
  category: string
  name: string
  description: string
  color: string
  theme: string
  image: string
}

const fashionItems: FashionItem[] = [
  // Tops
  {
    id: "t1",
    category: "tops",
    name: "Silk Blouse",
    description:
      "Luxurious 100% mulberry silk blouse featuring mother-of-pearl buttons, French seams, and a relaxed fit perfect for executive boardroom presentations",
    color: "white",
    theme: "elegant",
    image: "/images/tops/silk-blouse-white.png",
  },
  {
    id: "t2",
    category: "tops",
    name: "Crop Top",
    description:
      "Edgy cropped top with asymmetrical hemline, bold geometric laser-cut patterns, and stretch cotton blend for music festival adventures",
    color: "black",
    theme: "casual",
    image: "/images/tops/crop-top-black.png",
  },
  {
    id: "t3",
    category: "tops",
    name: "Power Blazer",
    description:
      "Structured wool blazer with sharp peak lapels, padded shoulders, and double-breasted closure commanding respect in any corporate setting",
    color: "navy",
    theme: "professional",
    image: "/images/tops/blazer-navy.png",
  },
  {
    id: "t4",
    category: "tops",
    name: "Cashmere Sweater",
    description:
      "Ultra-soft Mongolian cashmere pullover with intricate cable-knit detailing, ribbed cuffs, and oversized silhouette for luxurious comfort",
    color: "beige",
    theme: "casual",
    image: "/images/tops/cashmere-sweater.png",
  },
  {
    id: "t5",
    category: "tops",
    name: "Tank Top",
    description:
      "Minimalist racerback tank crafted from organic bamboo fiber with raw-edge seams and subtle curved hem for effortless layering",
    color: "pink",
    theme: "casual",
    image: "/images/tops/tank-top-pink.png",
  },
  {
    id: "t6",
    category: "tops",
    name: "Oxford Shirt",
    description:
      "Classic button-down in premium Egyptian cotton with contrast topstitching, barrel cuffs, and timeless collegiate charm",
    color: "blue",
    theme: "professional",
    image: "/images/tops/oxford-shirt.png",
  },
  {
    id: "t7",
    category: "tops",
    name: "Oversized Hoodie",
    description:
      "Streetwear-inspired hoodie featuring dropped shoulders, kangaroo pocket, and brushed fleece interior for urban comfort and style",
    color: "gray",
    theme: "casual",
    image: "/images/tops/oversized-hoodie.png",
  },

  // Jeans
  {
    id: "j1",
    category: "jeans",
    name: "Skinny Jeans",
    description:
      "High-stretch premium denim with sculpting technology, fade-resistant indigo wash, and ankle-length cut for a sleek silhouette",
    color: "blue",
    theme: "casual",
    image: "/images/jeans/skinny-jeans-blue.png",
  },
  {
    id: "j2",
    category: "jeans",
    name: "High-Waist Jeans",
    description:
      "Vintage-inspired high-rise jeans with authentic button fly, selvedge denim construction, and flattering waist-cinching fit",
    color: "black",
    theme: "vintage",
    image: "/images/jeans/high-waist-black.png",
  },
  {
    id: "j3",
    category: "jeans",
    name: "Distressed Jeans",
    description:
      "Artfully destroyed boyfriend jeans with hand-sanded whiskers, strategic rips, and lived-in wash for authentic rebel attitude",
    color: "blue",
    theme: "edgy",
    image: "/images/jeans/distressed-ripped.png",
  },
  {
    id: "j4",
    category: "jeans",
    name: "Straight Leg Jeans",
    description:
      "Classic five-pocket styling in Japanese Kuroki Mills denim with straight-through silhouette and clean, unfaded indigo finish",
    color: "indigo",
    theme: "classic",
    image: "/images/jeans/straight-leg-indigo.png",
  },
  {
    id: "j5",
    category: "jeans",
    name: "Wide Leg Jeans",
    description:
      "Fashion-forward palazzo-style jeans with ultra-wide leg opening, high waist, and cropped length for contemporary edge",
    color: "white",
    theme: "trendy",
    image: "/images/jeans/wide-leg-white.png",
  },
  {
    id: "j6",
    category: "jeans",
    name: "Mom Jeans",
    description:
      "Retro-inspired relaxed fit with tapered legs, high waist, and authentic stone-washed finish for nostalgic 90s charm",
    color: "blue",
    theme: "retro",
    image: "/images/jeans/mom-jeans-vintage.png",
  },
  {
    id: "j7",
    category: "jeans",
    name: "Bootcut Jeans",
    description:
      "Flattering bootcut silhouette with subtle flare from knee down, mid-rise waist, and dark rinse for leg-lengthening effect",
    color: "black",
    theme: "classic",
    image: "/images/jeans/bootcut-black.png",
  },

  // Dresses
  {
    id: "d1",
    category: "dresses",
    name: "Maxi Dress",
    description:
      "Flowing floor-length dress in silk chiffon with empire waist, flutter sleeves, and hand-painted botanical print for bohemian romance",
    color: "floral",
    theme: "bohemian",
    image: "/images/dresses/maxi-floral.png",
  },
  {
    id: "d2",
    category: "dresses",
    name: "Cocktail Dress",
    description:
      "Sophisticated little black dress with French lace overlay, three-quarter sleeves, and hidden back zipper for evening elegance",
    color: "black",
    theme: "elegant",
    image: "/images/dresses/cocktail-black.png",
  },
  {
    id: "d3",
    category: "dresses",
    name: "Wrap Dress",
    description:
      "Universally flattering wrap silhouette in silk jersey with adjustable tie waist, V-neckline, and midi length for versatile styling",
    color: "navy",
    theme: "classic",
    image: "/images/dresses/wrap-navy.png",
  },
  {
    id: "d4",
    category: "dresses",
    name: "Midi Dress",
    description:
      "Contemporary midi featuring asymmetrical one-shoulder neckline, side slit detail, and body-skimming fit in luxe crepe fabric",
    color: "burgundy",
    theme: "modern",
    image: "/images/dresses/midi-burgundy.png",
  },
  {
    id: "d5",
    category: "dresses",
    name: "Bodycon Dress",
    description:
      "Figure-hugging stretch dress with seamless construction, strategic ruching at waist, and curve-enhancing silhouette",
    color: "red",
    theme: "bold",
    image: "/images/dresses/bodycon-red.png",
  },
  {
    id: "d6",
    category: "dresses",
    name: "Shift Dress",
    description:
      "Minimalist A-line shift with clean architectural lines, hidden back zip, and sleeveless design for effortless sophistication",
    color: "white",
    theme: "minimalist",
    image: "/images/dresses/shift-white.png",
  },
  {
    id: "d7",
    category: "dresses",
    name: "Evening Gown",
    description:
      "Glamorous floor-length gown with hand-beaded bodice, flowing chiffon skirt, and dramatic train for red carpet moments",
    color: "gold",
    theme: "glamorous",
    image: "/images/dresses/evening-gown-gold.png",
  },
  {
    id: "d8",
    category: "dresses",
    name: "Sundress",
    description:
      "Breezy cotton voile sundress with smocked bodice, adjustable spaghetti straps, and tiered skirt for carefree summer days",
    color: "yellow",
    theme: "casual",
    image: "/images/dresses/sundress-yellow.png",
  },

  // Skirts
  {
    id: "s1",
    category: "skirts",
    name: "Pencil Skirt",
    description:
      "High-waisted pencil skirt in stretch wool blend with back walking slit and invisible side zipper for professional polish",
    color: "black",
    theme: "professional",
    image: "/images/skirts/pencil-black.jpg",
  },
  {
    id: "s2",
    category: "skirts",
    name: "A-Line Skirt",
    description:
      "Classic A-line with inverted box pleats, midi length, and luxurious wool crepe fabric for timeless elegance",
    color: "navy",
    theme: "classic",
    image: "/images/skirts/a-line-navy.png",
  },
  {
    id: "s3",
    category: "skirts",
    name: "Pleated Skirt",
    description:
      "Accordion-pleated midi skirt with metallic finish, elastic waistband, and movement-enhancing design for party glamour",
    color: "silver",
    theme: "glamorous",
    image: "/images/skirts/pleated-silver.png",
  },
  {
    id: "s4",
    category: "skirts",
    name: "Mini Skirt",
    description:
      "Flirty denim mini with asymmetrical frayed hem, side zip closure, and vintage-inspired high waist for youthful energy",
    color: "blue",
    theme: "trendy",
    image: "/images/skirts/mini-denim.png",
  },
  {
    id: "s5",
    category: "skirts",
    name: "Maxi Skirt",
    description:
      "Flowing maxi in breathable cotton voile with elastic smocked waistband, side pockets, and bohemian-inspired silhouette",
    color: "white",
    theme: "bohemian",
    image: "/images/skirts/maxi-white.png",
  },
  {
    id: "s6",
    category: "skirts",
    name: "Denim Skirt",
    description:
      "Vintage-inspired A-line denim skirt with button-front closure, patch pockets, and perfectly frayed raw hem",
    color: "blue",
    theme: "casual",
    image: "/images/skirts/denim-blue.png",
  },
  {
    id: "s7",
    category: "skirts",
    name: "Leather Skirt",
    description:
      "Edgy leather mini with exposed silver zipper details, structured silhouette, and rock-chic attitude for bold statements",
    color: "black",
    theme: "edgy",
    image: "/images/skirts/leather-black.png",
  },

  // Bags
  {
    id: "b1",
    category: "bags",
    name: "Tote Bag",
    description:
      "Spacious Italian leather tote with multiple interior compartments, detachable shoulder strap, and gold-tone hardware for everyday luxury",
    color: "brown",
    theme: "classic",
    image: "/images/bags/tote-brown.png",
  },
  {
    id: "b2",
    category: "bags",
    name: "Crossbody Bag",
    description:
      "Compact quilted crossbody with adjustable chain strap, magnetic flap closure, and signature diamond pattern for hands-free elegance",
    color: "black",
    theme: "modern",
    image: "/images/bags/crossbody-black.png",
  },
  {
    id: "b3",
    category: "bags",
    name: "Clutch Bag",
    description:
      "Beaded evening clutch with intricate sequin embellishments, magnetic closure, and optional chain strap for formal occasions",
    color: "gold",
    theme: "glamorous",
    image: "/images/bags/clutch-gold.png",
  },
  {
    id: "b4",
    category: "bags",
    name: "Backpack",
    description:
      "Structured leather backpack with padded laptop compartment, multiple pockets, and polished gold hardware for urban sophistication",
    color: "navy",
    theme: "modern",
    image: "/images/bags/backpack-navy.png",
  },
  {
    id: "b5",
    category: "bags",
    name: "Shoulder Bag",
    description:
      "Medium shoulder bag with signature turn-lock closure, soft pebbled leather construction, and comfortable single strap",
    color: "burgundy",
    theme: "classic",
    image: "/images/bags/shoulder-burgundy.png",
  },
  {
    id: "b6",
    category: "bags",
    name: "Satchel",
    description:
      "Structured satchel in premium Italian leather with dual top handles, removable shoulder strap, and professional silhouette",
    color: "tan",
    theme: "professional",
    image: "/images/bags/satchel-tan.png",
  },
  {
    id: "b7",
    category: "bags",
    name: "Evening Bag",
    description:
      "Miniature evening bag with crystal embellishments, silk lining, and delicate chain handle for special occasions",
    color: "silver",
    theme: "glamorous",
    image: "/images/bags/evening-silver.png",
  },

  // Outerwear
  {
    id: "o1",
    category: "outerwear",
    name: "Trench Coat",
    description:
      "Classic double-breasted trench in water-resistant gabardine with storm flaps, removable belt, and timeless British heritage",
    color: "beige",
    theme: "classic",
    image: "/images/outerwear/trench-beige.png",
  },
  {
    id: "o2",
    category: "outerwear",
    name: "Leather Jacket",
    description:
      "Moto-inspired leather jacket with asymmetrical zip, quilted shoulders, and vintage brass hardware for rebel sophistication",
    color: "black",
    theme: "edgy",
    image: "/images/outerwear/leather-jacket-black.png",
  },
  {
    id: "o3",
    category: "outerwear",
    name: "Wool Coat",
    description:
      "Tailored wool coat with notched lapels, single-breasted closure, and Italian wool construction for timeless elegance",
    color: "gray",
    theme: "elegant",
    image: "/images/outerwear/wool-coat-gray.png",
  },
  {
    id: "o4",
    category: "outerwear",
    name: "Denim Jacket",
    description:
      "Vintage-wash denim jacket with contrast stitching, chest pockets, and perfectly faded finish for casual layering",
    color: "blue",
    theme: "casual",
    image: "/images/outerwear/denim-jacket-blue.png",
  },
  {
    id: "o5",
    category: "outerwear",
    name: "Cashmere Cardigan",
    description:
      "Luxurious cashmere cardigan with pearl buttons, ribbed trim, and open-front design for cozy sophistication",
    color: "cream",
    theme: "elegant",
    image: "/images/outerwear/cardigan-cream.png",
  },
  {
    id: "o6",
    category: "outerwear",
    name: "Bomber Jacket",
    description:
      "Satin bomber with embroidered floral details, ribbed cuffs, and contemporary street style for modern edge",
    color: "green",
    theme: "trendy",
    image: "/images/outerwear/bomber-green.png",
  },
  {
    id: "o7",
    category: "outerwear",
    name: "Puffer Jacket",
    description:
      "Quilted puffer with premium down filling, water-resistant shell, and sleek silhouette for winter warmth with style",
    color: "navy",
    theme: "casual",
    image: "/images/outerwear/puffer-navy.png",
  },

  // Jewelry
  {
    id: "jew1",
    category: "jewelry",
    name: "Diamond Necklace",
    description:
      "Delicate tennis necklace featuring brilliant-cut diamonds in 18k white gold setting with secure lobster clasp",
    color: "silver",
    theme: "elegant",
    image: "/images/jewelry/diamond-necklace-silver.png",
  },
  {
    id: "jew2",
    category: "jewelry",
    name: "Statement Earrings",
    description:
      "Bold chandelier earrings with geometric Art Deco design and gold-plated finish for dramatic evening flair",
    color: "gold",
    theme: "bold",
    image: "/images/jewelry/statement-earrings-gold.png",
  },
  {
    id: "jew3",
    category: "jewelry",
    name: "Pearl Bracelet",
    description:
      "Classic cultured pearl bracelet with graduated sizing, sterling silver clasp, and lustrous natural finish",
    color: "white",
    theme: "classic",
    image: "/images/jewelry/pearl-bracelet-white.png",
  },
  {
    id: "jew4",
    category: "jewelry",
    name: "Minimalist Ring",
    description: "Sleek geometric band ring in brushed sterling silver with contemporary architectural silhouette",
    color: "silver",
    theme: "minimalist",
    image: "/images/jewelry/minimalist-ring-silver.png",
  },
  {
    id: "jew5",
    category: "jewelry",
    name: "Velvet Choker",
    description:
      "Gothic-inspired velvet choker with antique brass charm and adjustable ribbon tie for mysterious allure",
    color: "black",
    theme: "edgy",
    image: "/images/jewelry/velvet-choker-black.png",
  },
  {
    id: "jew6",
    category: "jewelry",
    name: "Luxury Watch",
    description:
      "Swiss automatic movement watch with genuine leather strap, rose gold case, and sapphire crystal for timeless sophistication",
    color: "brown",
    theme: "luxury",
    image: "/images/jewelry/luxury-watch-brown.png",
  },
  {
    id: "jew7",
    category: "jewelry",
    name: "Charm Anklet",
    description: "Delicate chain anklet with dangling star charms in rose gold finish for bohemian beach vibes",
    color: "rose-gold",
    theme: "delicate",
    image: "/images/jewelry/charm-anklet-rose-gold.png",
  },

  // Footwear
  {
    id: "f1",
    category: "footwear",
    name: "Stiletto Heels",
    description:
      "Classic pointed-toe pumps with 4-inch stiletto heel in patent leather for commanding power dressing presence",
    color: "red",
    theme: "elegant",
    image: "/images/footwear/stiletto-heels-red.png",
  },
  {
    id: "f2",
    category: "footwear",
    name: "Designer Sneakers",
    description:
      "Luxury sneakers with premium leather upper, metallic accents, and cushioned sole for elevated athleisure style",
    color: "white",
    theme: "casual",
    image: "/images/footwear/designer-sneakers-white.png",
  },
  {
    id: "f3",
    category: "footwear",
    name: "Ankle Boots",
    description:
      "Chelsea-style ankle boots with elastic side goring, block heel, and supple suede construction for versatile styling",
    color: "brown",
    theme: "edgy",
    image: "/images/footwear/ankle-boots-brown.png",
  },
  {
    id: "f4",
    category: "footwear",
    name: "Ballet Flats",
    description:
      "Timeless ballet flats with grosgrain bow detail, cushioned insole, and buttery soft leather for all-day comfort",
    color: "nude",
    theme: "classic",
    image: "/images/footwear/ballet-flats-nude.png",
  },
  {
    id: "f5",
    category: "footwear",
    name: "Strappy Sandals",
    description:
      "Gladiator-inspired sandals with multiple leather straps, ankle tie closure, and flat sole for bohemian summer style",
    color: "tan",
    theme: "casual",
    image: "/images/footwear/strappy-sandals-tan.png",
  },
  {
    id: "f6",
    category: "footwear",
    name: "Penny Loafers",
    description:
      "Classic penny loafers with hand-stitched construction, leather sole, and traditional strap detail for preppy sophistication",
    color: "black",
    theme: "professional",
    image: "/images/footwear/penny-loafers-black.png",
  },
  {
    id: "f7",
    category: "footwear",
    name: "Platform Heels",
    description:
      "Retro platform sandals with chunky heel, ankle strap, and 70s-inspired silhouette for vintage glamour",
    color: "pink",
    theme: "bold",
    image: "/images/footwear/platform-heels-pink.png",
  },

  // Cosmetics
  {
    id: "c1",
    category: "cosmetics",
    name: "Matte Lipstick",
    description:
      "Long-wearing matte lipstick in classic Hollywood red with vitamin E and jojoba oil for comfortable all-day wear",
    color: "red",
    theme: "bold",
    image: "/images/cosmetics/matte-lipstick-red.png",
  },
  {
    id: "c2",
    category: "cosmetics",
    name: "Eyeshadow Palette",
    description:
      "12-shade neutral palette with buttery matte and shimmer finishes for versatile day-to-night eye looks",
    color: "brown",
    theme: "natural",
    image: "/images/cosmetics/eyeshadow-palette-brown.png",
  },
  {
    id: "c3",
    category: "cosmetics",
    name: "Liquid Foundation",
    description:
      "Full-coverage liquid foundation with SPF 30, hydrating hyaluronic acid, and 24-hour wear for flawless complexion",
    color: "beige",
    theme: "natural",
    image: "/images/cosmetics/liquid-foundation-beige.png",
  },
  {
    id: "c4",
    category: "cosmetics",
    name: "Volumizing Mascara",
    description:
      "Waterproof mascara with curved brush and fiber-infused formula for dramatic volume and length without clumping",
    color: "black",
    theme: "dramatic",
    image: "/images/cosmetics/volumizing-mascara-black.png",
  },
  {
    id: "c5",
    category: "cosmetics",
    name: "Cream Blush",
    description:
      "Buildable cream blush in peachy coral with natural finish and skin-loving ingredients for healthy glow",
    color: "peach",
    theme: "natural",
    image: "/images/cosmetics/cream-blush-peach.png",
  },
  {
    id: "c6",
    category: "cosmetics",
    name: "Gel Eyeliner",
    description:
      "Smudge-proof gel eyeliner with precision brush applicator for sharp lines and smoky effects that last",
    color: "black",
    theme: "dramatic",
    image: "/images/cosmetics/gel-eyeliner-black.png",
  },
  {
    id: "c7",
    category: "cosmetics",
    name: "Powder Highlighter",
    description:
      "Champagne highlighter with ultra-fine shimmer particles for luminous cheekbone definition and inner corner highlight",
    color: "gold",
    theme: "glam",
    image: "/images/cosmetics/powder-highlighter-gold.png",
  },

  // Accessories
  {
    id: "a1",
    category: "accessories",
    name: "Silk Scarf",
    description:
      "Hand-rolled silk scarf with paisley print, contrasting border, and versatile styling options for timeless elegance",
    color: "multicolor",
    theme: "elegant",
    image: "/images/accessories/silk-scarf-multicolor.png",
  },
  {
    id: "a2",
    category: "accessories",
    name: "Leather Belt",
    description:
      "Italian leather belt with polished gold buckle, adjustable sizing, and classic width for waist definition",
    color: "brown",
    theme: "classic",
    image: "/images/accessories/leather-belt-brown.png",
  },
  {
    id: "a3",
    category: "accessories",
    name: "Aviator Sunglasses",
    description:
      "Classic aviator sunglasses with polarized lenses, gold-tone frame, and UV protection for timeless cool",
    color: "gold",
    theme: "classic",
    image: "/images/accessories/aviator-sunglasses-gold.png",
  },
  {
    id: "a4",
    category: "accessories",
    name: "Wide-Brim Hat",
    description:
      "Wool felt hat with wide brim, leather band detail, and sophisticated silhouette for sun protection with style",
    color: "black",
    theme: "elegant",
    image: "/images/accessories/wide-brim-hat-black.png",
  },
  {
    id: "a5",
    category: "accessories",
    name: "Leather Gloves",
    description:
      "Lambskin gloves with cashmere lining, touchscreen fingertips, and elegant wrist length for winter luxury",
    color: "black",
    theme: "elegant",
    image: "/images/accessories/leather-gloves-black.png",
  },
  {
    id: "a6",
    category: "accessories",
    name: "Pearl Hair Clip",
    description:
      "Vintage-inspired hair barrette with freshwater pearls, gold-plated setting, and secure spring mechanism",
    color: "gold",
    theme: "vintage",
    image: "/images/accessories/pearl-hair-clip-gold.png",
  },
  {
    id: "a7",
    category: "accessories",
    name: "Art Deco Brooch",
    description:
      "Statement brooch with geometric Art Deco design, crystal embellishments, and vintage-inspired glamour",
    color: "silver",
    theme: "vintage",
    image: "/images/accessories/art-deco-brooch-silver.png",
  },

  // Ethnic Wear
  {
    id: "e1",
    category: "ethnic",
    name: "Silk Saree",
    description:
      "Handwoven Banarasi silk saree with intricate gold zari work, traditional paisley motifs, and ceremonial elegance",
    color: "red",
    theme: "traditional",
    image: "/images/ethnic/silk-saree-red.png",
  },
  {
    id: "e2",
    category: "ethnic",
    name: "Lehenga Choli",
    description:
      "Embroidered lehenga with mirror work, sequin details, and flowing silhouette for wedding festivities and celebrations",
    color: "pink",
    theme: "festive",
    image: "/images/ethnic/lehenga-choli-pink.png",
  },
  {
    id: "e3",
    category: "ethnic",
    name: "Cotton Kurti",
    description:
      "Block-printed cotton kurti with three-quarter sleeves, side slits, and comfortable fit for everyday ethnic wear",
    color: "blue",
    theme: "casual",
    image: "/images/ethnic/cotton-kurti-blue.png",
  },
  {
    id: "e4",
    category: "ethnic",
    name: "Palazzo Pants",
    description:
      "Flowing palazzo pants in georgette with elastic waistband, wide leg silhouette, and graceful movement",
    color: "white",
    theme: "elegant",
    image: "/images/ethnic/palazzo-pants-white.png",
  },
  {
    id: "e5",
    category: "ethnic",
    name: "Embroidered Dupatta",
    description:
      "Chiffon dupatta with gold thread embroidery, beaded tassels, and traditional finishing for ethnic ensembles",
    color: "gold",
    theme: "traditional",
    image: "/images/ethnic/embroidered-dupatta-gold.png",
  },
  {
    id: "e6",
    category: "ethnic",
    name: "Anarkali Suit",
    description:
      "Floor-length Anarkali with flared silhouette, intricate threadwork, and royal elegance for special occasions",
    color: "green",
    theme: "elegant",
    image: "/images/ethnic/anarkali-suit-green.png",
  },
  {
    id: "e7",
    category: "ethnic",
    name: "Sharara Set",
    description:
      "Contemporary sharara with short kurti, flared pants, and printed georgette fabric for modern ethnic style",
    color: "purple",
    theme: "modern",
    image: "/images/ethnic/sharara-set-purple.png",
  },

  // Activewear
  {
    id: "ac1",
    category: "activewear",
    name: "High-Waist Leggings",
    description:
      "Compression leggings with moisture-wicking fabric, side pockets, and squat-proof construction for active lifestyle",
    color: "black",
    theme: "athletic",
    image: "/images/activewear/high-waist-leggings-black.png",
  },
  {
    id: "ac2",
    category: "activewear",
    name: "Sports Bra",
    description:
      "Medium-support sports bra with removable padding, racerback design, and breathable mesh panels for workouts",
    color: "pink",
    theme: "athletic",
    image: "/images/activewear/sports-bra-pink.png",
  },
  {
    id: "ac3",
    category: "activewear",
    name: "Track Suit",
    description:
      "Matching track suit in technical fabric with zip-up jacket, tapered pants, and athletic-inspired styling",
    color: "navy",
    theme: "athletic",
    image: "/images/activewear/track-suit-navy.png",
  },
  {
    id: "ac4",
    category: "activewear",
    name: "Running Shorts",
    description:
      "Lightweight running shorts with built-in compression liner, reflective details, and moisture-wicking technology",
    color: "gray",
    theme: "athletic",
    image: "/images/activewear/running-shorts-gray.png",
  },
  {
    id: "ac5",
    category: "activewear",
    name: "Athletic Tank",
    description:
      "Breathable tank top with mesh panels, quick-dry technology, and loose fit for intense training sessions",
    color: "white",
    theme: "athletic",
    image: "/images/activewear/athletic-tank-white.png",
  },
  {
    id: "ac6",
    category: "activewear",
    name: "Yoga Leggings",
    description:
      "Buttery-soft leggings with four-way stretch, seamless waistband, and non-see-through fabric for yoga practice",
    color: "purple",
    theme: "athletic",
    image: "/images/activewear/yoga-leggings-purple.png",
  },
  {
    id: "ac7",
    category: "activewear",
    name: "Windbreaker",
    description:
      "Lightweight windbreaker with packable design, water-resistant coating, and adjustable hood for outdoor activities",
    color: "blue",
    theme: "athletic",
    image: "/images/activewear/windbreaker-blue.png",
  },
]

const categories = [
  "tops",
  "jeans",
  "dresses",
  "skirts",
  "bags",
  "outerwear",
  "jewelry",
  "footwear",
  "cosmetics",
  "accessories",
  "ethnic",
  "activewear",
]



export default function GalleryPage() {
  const [selectedItems, setSelectedItems] = useState<FashionItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FashionItem[]>(fashionItems)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let filtered = fashionItems

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }
   
    setFilteredItems(filtered)
  }, [selectedCategory])

  const handleItemSelect = (item: FashionItem) => {
    const categoryAlreadySelected = selectedItems.some((selected) => selected.category === item.category)

    if (categoryAlreadySelected) {
      setSelectedItems((prev) => prev.filter((selected) => selected.category !== item.category))
      setSelectedItems((prev) => [...prev, item])
    } else if (selectedItems.length < 5) {
      setSelectedItems((prev) => [...prev, item])
    }
  }

  const handleItemRemove = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleProceed = () => {
    if (selectedItems.length > 0) {
      localStorage.setItem("selectedItems", JSON.stringify(selectedItems))
      router.push("/result")
    }
  }

  const isItemSelected = (itemId: string) => {
    return selectedItems.some((item) => item.id === itemId)
  }

  const isCategorySelected = (category: string) => {
    return selectedItems.some((item) => item.category === category)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-6 w-6 text-rose-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                StyleAI Gallery
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-rose-200">
                {selectedItems.length}/5 Selected
              </Badge>
              <div className="text-sm text-gray-600">{filteredItems.length} items available</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200/50 shadow-lg">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-rose-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-gray-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-rose-100 to-purple-100 backdrop-blur-sm rounded-2xl p-6 border border-rose-200/50 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Selected Items ({selectedItems.length}/5)</h3>
            <div className="flex flex-wrap gap-3">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center bg-white/80 rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-sm mr-2 text-gray-700">{item.name}</span>
                  <button onClick={() => handleItemRemove(item.id)} className="text-rose-500 hover:text-rose-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {filteredItems.map((item) => {
            const selected = isItemSelected(item.id)
            const categorySelected = isCategorySelected(item.category)
            const canSelect = !categorySelected || selected

            return (
              <div
                key={item.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selected
                    ? "ring-2 ring-rose-400 scale-105"
                    : canSelect
                      ? "hover:scale-105 hover:ring-2 hover:ring-rose-300"
                      : "opacity-50 cursor-not-allowed"
                }`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => canSelect && handleItemSelect(item)}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-rose-200/50 shadow-lg">
                  <div className="relative aspect-[4/5]">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    {selected && (
                      <div className="absolute top-2 right-2 bg-rose-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {hoveredItem === item.id && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                        <p className="text-white text-sm text-center leading-relaxed">{item.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-rose-300 text-rose-600">
                        {item.category}
                      </Badge>
                      <div className="flex space-x-1">
                        <div className={`w-3 h-3 rounded-full bg-${item.color}-400`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Proceed Button */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={handleProceed}
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 rounded-full px-8 py-4 shadow-2xl"
            >
              Generate Style
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

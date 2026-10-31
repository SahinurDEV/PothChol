import { Analysis } from "./types";
export function mockAnalysis(ward = "Ward 7 (Mirpur, DNCC)"): Analysis {
  return {
    mode: "mock",
    frame: { w: 771, h: 1024 },
    hazards: [
      { id: "h1", concept: "pothole", label: "Open pothole", labelBn: "খোলা গর্ত", severity: "high", score: 0.93, polygon: [[215,470],[300,420],[440,405],[560,420],[500,500],[440,528],[300,530],[220,505]] },
      { id: "h2", concept: "construction debris", label: "Loose debris on footpath", labelBn: "ফুটপাতে নির্মাণ ময়লা", severity: "medium", score: 0.86, polygon: [[470,238],[700,238],[700,298],[470,298]] },
      { id: "h3", concept: "broken slab", label: "Broken slab / debris", labelBn: "ভাঙা স্ল্যাব / ময়লা", severity: "medium", score: 0.81, polygon: [[340,382],[760,388],[760,412],[340,400]] }
    ],
    planBn: "সতর্কতা: সামনে ফুটপাতের মাঝখানে একটি খোলা গর্ত আছে — বাম দিক ঘেঁষে হাঁটুন। সামনে ডান দিকে নির্মাণ ময়লা পড়ে আছে, আর ভাঙা কার্ব/স্ল্যাবে পা পিছলে যেতে পারে। বৃষ্টিতে গর্তে পানি জমে দেখা যায় না — শিশু ও বয়স্কদের হাত ধরে পার হোন।",
    planEn: "Caution: an open pothole sits mid-footpath ahead — keep left. Loose construction debris lies further ahead on the right, and the broken kerb/slab edge can trip you. In rain the hole fills and becomes invisible — hold children's and elders' hands.",
    wardReport: `বরাবর,\nকাউন্সিলর, ${ward}\nবিষয়: ফুটপাতে বিপজ্জনক গর্ত, নির্মাণ ময়লা ও ভাঙা কার্ব মেরামতের আবেদন\n\nশনাক্ত সমস্যা: ১) খোলা গর্ত (উচ্চ ঝুঁকি) ২) ফুটপাতে নির্মাণ ময়লা ৩) ভাঙা কার্ব/স্ল্যাব।\nঅনুরোধ: ৭ দিনের মধ্যে গর্ত ঢেকে দেওয়া, ময়লা সরানো ও কার্ব মেরামত করা।\n\n— PothChol নাগরিক রিপোর্ট`
  };
}

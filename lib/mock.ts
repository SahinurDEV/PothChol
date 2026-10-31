import { Analysis } from "./types";
export function mockAnalysis(ward = "Ward 7 (Mirpur, DNCC)"): Analysis {
  return {
    mode: "mock",
    frame: { w: 640, h: 420 },
    hazards: [
      { id: "h1", concept: "pothole", label: "Open pothole", labelBn: "খোলা গর্ত", severity: "high", score: 0.93, polygon: [[260,280],[330,268],[400,284],[392,318],[330,330],[266,316]] },
      { id: "h2", concept: "vendor stall", label: "Vendor obstruction", labelBn: "হকারের বাধা", severity: "medium", score: 0.88, polygon: [[420,180],[480,180],[480,290],[420,290]] },
      { id: "h3", concept: "broken slab", label: "Broken slab / debris", labelBn: "ভাঙা স্ল্যাব / ময়লা", severity: "medium", score: 0.81, polygon: [[200,240],[300,210],[310,230],[205,262]] }
    ],
    planBn: "সতর্কতা: সামনে ফুটপাতের মাঝখানে একটি খোলা গর্ত আছে। বাম দিক ঘেঁষে হাঁটুন, ডানে হকারের দোকান পথ আটকে রেখেছে। বৃষ্টিতে গর্তে পানি জমে দেখা যায় না — শিশু ও বয়স্কদের হাত ধরে পার হোন।",
    planEn: "Caution: an open pothole sits mid-footpath ahead. Keep left; a vendor stall blocks the right side. In rain the hole fills and becomes invisible — hold children's and elders' hands.",
    wardReport: `বরাবর,\nকাউন্সিলর, ${ward}\nবিষয়: ফুটপাতে বিপজ্জনক গর্ত ও প্রতিবন্ধকতা অপসারণের আবেদন\n\nশনাক্ত সমস্যা: ১) খোলা গর্ত (উচ্চ ঝুঁকি) ২) হকারের বাধা ৩) ভাঙা স্ল্যাব।\nঅনুরোধ: ৭ দিনের মধ্যে গর্ত ঢেকে দেওয়া ও ফুটপাত দখলমুক্ত করা।\n\n— PothChol নাগরিক রিপোর্ট`
  };
}

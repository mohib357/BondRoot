import { Person } from '../types/person';
import { KINSHIP_REGISTRY, RelationshipDescriptor } from '../data/relationshipMapping';

export function getFullName(person: Person, isEnglish = false): string {
  if (isEnglish) {
    const englishPart = person.lastName.replace(/[()]/g, '').trim();
    return englishPart || `${person.firstName} ${person.lastName}`;
  }
  return `${person.firstName} ${person.lastName}`;
}

export function toBanglaNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function calculateAge(birthDate?: string, deathDate?: string, isLiving = true, isEnglish = false): string {
  if (!birthDate) return isEnglish ? 'Unknown age' : 'বয়স অজানা';
  const birthYear = parseInt(birthDate.substring(0, 4), 10);
  if (isNaN(birthYear)) return isEnglish ? 'Unknown' : 'অজানা';

  if (!isLiving && deathDate) {
    const deathYear = parseInt(deathDate.substring(0, 4), 10);
    if (!isNaN(deathYear)) {
      const ageAtDeath = deathYear - birthYear;
      return isEnglish
        ? `${ageAtDeath} yrs (passed ${deathYear})`
        : `${toBanglaNumber(ageAtDeath)} বছর (মৃত্যু: ${toBanglaNumber(deathYear)})`;
    }
    return isEnglish ? 'Passed away' : 'প্রয়াত';
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return isEnglish ? `${age} yrs old` : `${toBanglaNumber(age)} বছর`;
}

export function findRootAncestors(people: Person[]): Person[] {
  return people.filter((p) => p.parentIds.length === 0);
}

export interface RelationshipPathStep {
  fromId: string;
  toId: string;
  relation: string;
  relationBangla: string;
}

export interface RelationshipResult {
  path: RelationshipPathStep[];
  
  // Direct Social Label (The primary highlighted title)
  directLabelBn: string;         // e.g. "চাচাতো ভাই (Second Cousin)"
  directLabelEn: string;         // e.g. "Paternal Cousin (Second Cousin)"
  
  // Full Lineage Subtitle / Details
  lineageDetailBn: string;       // e.g. "দাদার ভাইয়ের ছেলের ছেলে"
  lineageDetailEn: string;       // e.g. "Paternal Grandfather's Brother's Son's Son"
  
  // Calling term / সম্বোধন রীতি
  callingTermBn: string;         // e.g. "মুহিব কামালকে 'স্নেহের ছোট ভাই' বলে ডাকবেন বা সরাসরি নাম ধরে সম্বোধন করবেন"
  callingTermEn: string;         // e.g. "Muhib addresses Kamal affectionately as younger brother"
  reverseCallingTermBn?: string; // e.g. "কামাল মুহিবকে 'বড় ভাই / ভাইয়া' বলে শ্রদ্ধাভরে সম্বোধন করবেন"
  
  // Age comparison note
  ageComparisonBn?: string;      // e.g. "কামাল মুহিবের চেয়ে ৪ বছরের ছোট (১৯৯৮ বনাম ২০০২)"
  ageComparisonEn?: string;
  
  // Generation & Social Category badges
  generationGapTextBn: string;   // e.g. "একই প্রজন্মের আত্মীয় (Same Generation)"
  generationGapTextEn: string;
  socialCategoryBn: string;      // e.g. "সমবয়সী কাজিন (Cousin)"
  socialCategoryEn: string;
  
  // Legacy fields for backward compatibility
  summary: string;
  summaryBangla: string;
  summaryEnglish: string;
  relationId: string;
  generationLevel: number;
  gender: string;
  side: string;
  status: 'CONFIRMED' | 'NEEDS_REVIEW';
}

export function findRelationship(
  personAId: string,
  personBId: string,
  people: Person[],
  isEnglish = false
): RelationshipResult | null {
  const personMap = new Map<string, Person>();
  people.forEach((p) => personMap.set(p.id, p));

  const personA = personMap.get(personAId);
  const personB = personMap.get(personBId);
  if (!personA || !personB) return null;

  if (personAId === personBId) {
    const desc = KINSHIP_REGISTRY['SELF'];
    return {
      path: [],
      directLabelBn: 'একই ব্যক্তি (স্বয়ং)',
      directLabelEn: 'Same Person (Self)',
      lineageDetailBn: 'নিজের ব্যক্তিগত পরিচয়',
      lineageDetailEn: 'Own identity',
      callingTermBn: `${personA.firstName} স্বয়ং নিজের পরিচয়`,
      callingTermEn: `${personA.firstName} is looking up self`,
      generationGapTextBn: 'একই ব্যক্তি (Gen 0)',
      generationGapTextEn: 'Self (Gen 0)',
      socialCategoryBn: 'স্বয়ং (Self)',
      socialCategoryEn: 'Self',
      summary: isEnglish ? desc.relationNameEn : desc.relationNameBn,
      summaryBangla: desc.relationNameBn,
      summaryEnglish: desc.relationNameEn,
      relationId: desc.relationId,
      generationLevel: desc.generationLevel,
      gender: desc.gender,
      side: desc.side,
      status: desc.status,
    };
  }

  interface QueueNode {
    id: string;
    path: RelationshipPathStep[];
  }

  const queue: QueueNode[] = [{ id: personAId, path: [] }];
  const visited = new Set<string>([personAId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentPerson = personMap.get(current.id);
    if (!currentPerson) continue;

    if (current.id === personBId) {
      return resolveKinship(current.path, personA, personB, isEnglish);
    }

    // Neighbors: parents
    for (const pId of currentPerson.parentIds) {
      if (!visited.has(pId)) {
        visited.add(pId);
        const parent = personMap.get(pId);
        const rel = parent?.gender === 'female' ? 'Mother' : 'Father';
        const relBn = parent?.gender === 'female' ? 'মা' : 'বাবা';
        queue.push({
          id: pId,
          path: [...current.path, { fromId: current.id, toId: pId, relation: rel, relationBangla: relBn }],
        });
      }
    }

    // Neighbors: children
    for (const cId of currentPerson.childrenIds) {
      if (!visited.has(cId)) {
        visited.add(cId);
        const child = personMap.get(cId);
        const rel = child?.gender === 'female' ? 'Daughter' : 'Son';
        const relBn = child?.gender === 'female' ? 'মেয়ে' : 'ছেলে';
        queue.push({
          id: cId,
          path: [...current.path, { fromId: current.id, toId: cId, relation: rel, relationBangla: relBn }],
        });
      }
    }

    // Neighbors: siblings
    for (const sibId of currentPerson.siblingIds) {
      if (!visited.has(sibId)) {
        visited.add(sibId);
        const sibling = personMap.get(sibId);
        const rel = sibling?.gender === 'female' ? 'Sister' : 'Brother';
        const relBn = sibling?.gender === 'female' ? 'বোন' : 'ভাই';
        queue.push({
          id: sibId,
          path: [...current.path, { fromId: current.id, toId: sibId, relation: rel, relationBangla: relBn }],
        });
      }
    }

    // Neighbors: spouses (for in-law kinship paths)
    for (const spId of currentPerson.spouseIds) {
      if (!visited.has(spId)) {
        visited.add(spId);
        const spouse = personMap.get(spId);
        const rel = spouse?.gender === 'female' ? 'Wife' : 'Husband';
        const relBn = spouse?.gender === 'female' ? 'স্ত্রী' : 'স্বামী';
        queue.push({
          id: spId,
          path: [...current.path, { fromId: current.id, toId: spId, relation: rel, relationBangla: relBn }],
        });
      }
    }
  }

  return null;
}

function resolveKinship(
  path: RelationshipPathStep[],
  from: Person,
  to: Person,
  isEnglish: boolean
): RelationshipResult {
  const len = path.length;

  // Calculate Net Generation Level (+ for ancestor generations, - for descendant generations)
  let genLevel = 0;
  for (const st of path) {
    if (st.relation === 'Father' || st.relation === 'Mother') genLevel++;
    else if (st.relation === 'Son' || st.relation === 'Daughter') genLevel--;
  }

  // Calculate Age Difference
  let diffYears: number | null = null;
  let yearA: number | null = null;
  let yearB: number | null = null;
  if (from.birthDate && to.birthDate) {
    yearA = parseInt(from.birthDate.substring(0, 4), 10);
    yearB = parseInt(to.birthDate.substring(0, 4), 10);
    if (!isNaN(yearA) && !isNaN(yearB)) {
      diffYears = yearA - yearB; // positive: to is older than from; negative: to is younger than from
    }
  }

  // Format Age comparison note
  let ageComparisonBn = '';
  let ageComparisonEn = '';
  if (diffYears !== null && yearA !== null && yearB !== null) {
    if (diffYears < 0) {
      const absDiff = Math.abs(diffYears);
      ageComparisonBn = `${to.firstName} ${from.firstName}-এর চেয়ে ${toBanglaNumber(absDiff)} বছরের ছোট (${toBanglaNumber(yearA)} বনাম ${toBanglaNumber(yearB)})`;
      ageComparisonEn = `${to.firstName} is ${absDiff} years younger than ${from.firstName} (${yearA} vs ${yearB})`;
    } else if (diffYears > 0) {
      ageComparisonBn = `${to.firstName} ${from.firstName}-এর চেয়ে ${toBanglaNumber(diffYears)} বছরের বড় (${toBanglaNumber(yearB)} বনাম ${toBanglaNumber(yearA)})`;
      ageComparisonEn = `${to.firstName} is ${diffYears} years older than ${from.firstName} (${yearA} vs ${yearB})`;
    } else {
      ageComparisonBn = `উভয়ের জন্ম একই বছরে (${toBanglaNumber(yearA)}) - সমবয়সী`;
      ageComparisonEn = `Both born in the same year (${yearA}) - same age`;
    }
  }

  // Generation Gap Badges
  let genGapBn = 'একই প্রজন্মের আত্মীয় (Same Generation)';
  let genGapEn = 'Same Generation (Gen 0)';
  if (genLevel > 0) {
    genGapBn = `${toBanglaNumber(genLevel)} ধাপ ঊর্ধ্বতন মুরুব্বি প্রজন্ম (+${genLevel})`;
    genGapEn = `${genLevel} Generation${genLevel > 1 ? 's' : ''} Above (+${genLevel})`;
  } else if (genLevel < 0) {
    const absGen = Math.abs(genLevel);
    genGapBn = `${toBanglaNumber(absGen)} ধাপ কনিষ্ঠ অধস্তন প্রজন্ম (-${absGen})`;
    genGapEn = `${absGen} Generation${absGen > 1 ? 's' : ''} Below (-${absGen})`;
  }

  // Variables to populate
  let directLabelBn = '';
  let directLabelEn = '';
  let lineageDetailBn = '';
  let lineageDetailEn = '';
  let callingTermBn = '';
  let callingTermEn = '';
  let reverseCallingTermBn = '';
  let socialCategoryBn = 'পারিবারিক আত্মীয় (Family Kin)';
  let socialCategoryEn = 'Family Kin';
  let relationId = 'CUSTOM_KIN';

  // 1-step direct
  if (len === 1) {
    const s1 = path[0];
    if (s1.relation === 'Father') {
      directLabelBn = 'বাবা (পিতা)';
      directLabelEn = 'Father';
      lineageDetailBn = 'আপন জন্মদাতা পিতা';
      lineageDetailEn = 'Biological Father';
      callingTermBn = `${from.firstName} ${to.firstName}-কে "বাবা / আব্বা" বলে গভীর শ্রদ্ধায় সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as "Father / Abba"`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের সন্তান হিসেবে নাম ধরে বা "বাবা/মা" বলে ডাকবেন`;
      socialCategoryBn = 'পিতা-মাতার সম্পর্ক (Parent)';
      socialCategoryEn = 'Parental Bond';
      relationId = 'FATHER';
    } else if (s1.relation === 'Mother') {
      directLabelBn = 'মা (মাতা)';
      directLabelEn = 'Mother';
      lineageDetailBn = 'আপন জন্মদাত্রী মাতা';
      lineageDetailEn = 'Biological Mother';
      callingTermBn = `${from.firstName} ${to.firstName}-কে "মা / আম্মা" বলে গভীর শ্রদ্ধায় সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as "Mother / Amma"`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের সন্তান হিসেবে স্নেহভরে ডাকবেন`;
      socialCategoryBn = 'পিতা-মাতার সম্পর্ক (Parent)';
      socialCategoryEn = 'Parental Bond';
      relationId = 'MOTHER';
    } else if (s1.relation === 'Son') {
      directLabelBn = 'ছেলে (পুত্র)';
      directLabelEn = 'Son';
      lineageDetailBn = 'আপন ঔরসজাত পুত্র সন্তান';
      lineageDetailEn = 'Biological Son';
      callingTermBn = `${from.firstName} ${to.firstName}-কে স্নেহভরে নাম ধরে বা "বাবা" বলে স্নেহ করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately by name`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "বাবা / মা" বলে সম্মান প্রদর্শন করবেন`;
      socialCategoryBn = 'সন্তান (Child)';
      socialCategoryEn = 'Offspring';
      relationId = 'SON';
    } else if (s1.relation === 'Daughter') {
      directLabelBn = 'মেয়ে (কন্যা)';
      directLabelEn = 'Daughter';
      lineageDetailBn = 'আপন ঔরসজাত কন্যা সন্তান';
      lineageDetailEn = 'Biological Daughter';
      callingTermBn = `${from.firstName} ${to.firstName}-কে স্নেহভরে নাম ধরে বা "মা / আম্মু" বলে স্নেহ করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately by name`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "বাবা / মা" বলে সম্মান প্রদর্শন করবেন`;
      socialCategoryBn = 'সন্তান (Child)';
      socialCategoryEn = 'Offspring';
      relationId = 'DAUGHTER';
    } else if (s1.relation === 'Brother') {
      socialCategoryBn = 'আপন সহোদর ভাই (Sibling)';
      socialCategoryEn = 'Sibling (Brother)';
      relationId = 'BROTHER';
      if (diffYears !== null && diffYears > 0) {
        directLabelBn = 'আপন বড় ভাই (Elder Brother)';
        directLabelEn = 'Elder Brother';
        lineageDetailBn = 'একই পিতা-মাতার জ্যেষ্ঠ পুত্র সন্তান';
        lineageDetailEn = 'Biological elder brother';
        callingTermBn = `${from.firstName} ${to.firstName}-কে "বড় ভাই / ভাইয়া" বলে শ্রদ্ধাভরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as elder brother`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের ছোট ভাই মনে করবেন ও নাম ধরে ডাকবেন`;
      } else if (diffYears !== null && diffYears < 0) {
        directLabelBn = 'আপন ছোট ভাই (Younger Brother)';
        directLabelEn = 'Younger Brother';
        lineageDetailBn = 'একই পিতা-মাতার কনিষ্ঠ পুত্র সন্তান';
        lineageDetailEn = 'Biological younger brother';
        callingTermBn = `${from.firstName} ${to.firstName}-কে স্নেহের ছোট ভাই মনে করবেন ও নাম ধরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately by name as younger brother`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "বড় ভাই / ভাইয়া" বলে শ্রদ্ধা প্রদর্শন করবেন`;
      } else {
        directLabelBn = 'আপন ভাই (Brother)';
        directLabelEn = 'Brother (Sibling)';
        lineageDetailBn = 'একই পিতা-মাতার পুত্র সন্তান';
        lineageDetailEn = 'Biological brother';
        callingTermBn = `${from.firstName} ${to.firstName}-কে "ভাই / ভাইয়া" বলে সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as brother`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "ভাই / ভাইয়া" বলে সম্বোধন করবেন`;
      }
    } else if (s1.relation === 'Sister') {
      socialCategoryBn = 'আপন সহোদরা বোন (Sibling)';
      socialCategoryEn = 'Sibling (Sister)';
      relationId = 'SISTER';
      if (diffYears !== null && diffYears > 0) {
        directLabelBn = 'আপন বড় বোন (Elder Sister)';
        directLabelEn = 'Elder Sister';
        lineageDetailBn = 'একই পিতা-মাতার জ্যেষ্ঠ কন্যা সন্তান';
        lineageDetailEn = 'Biological elder sister';
        callingTermBn = `${from.firstName} ${to.firstName}-কে "বড় আপু / আপা" বলে শ্রদ্ধাভরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as elder sister`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহ করবেন`;
      } else if (diffYears !== null && diffYears < 0) {
        directLabelBn = 'আপন ছোট বোন (Younger Sister)';
        directLabelEn = 'Younger Sister';
        lineageDetailBn = 'একই পিতা-মাতার কনিষ্ঠ কন্যা সন্তান';
        lineageDetailEn = 'Biological younger sister';
        callingTermBn = `${from.firstName} ${to.firstName}-কে স্নেহের ছোট বোন মনে করবেন ও নাম ধরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately as younger sister`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "বড় ভাই / আপু" বলে শ্রদ্ধা করবেন`;
      } else {
        directLabelBn = 'আপন বোন (Sister)';
        directLabelEn = 'Sister (Sibling)';
        lineageDetailBn = 'একই পিতা-মাতার কন্যা সন্তান';
        lineageDetailEn = 'Biological sister';
        callingTermBn = `${from.firstName} ${to.firstName}-কে "আপু / বোন" বলে সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as sister`;
      }
    } else if (s1.relation === 'Wife') {
      directLabelBn = 'স্ত্রী (সহধর্মিণী)';
      directLabelEn = 'Wife (Spouse)';
      lineageDetailBn = 'বৈবাহিক বন্ধনে আবদ্ধ জীবনসঙ্গিনী';
      lineageDetailEn = 'Lawful spouse (Wife)';
      callingTermBn = `${from.firstName} ${to.firstName}-কে পরম ভালোবাসায় জীবনসঙ্গিনী হিসেবে সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately as Wife`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে শ্রদ্ধা ও ভালোবাসায় সম্বোধন করবেন`;
      socialCategoryBn = 'বৈবাহিক জীবনসঙ্গী (Spouse)';
      socialCategoryEn = 'Spouse';
      relationId = 'WIFE';
    } else if (s1.relation === 'Husband') {
      directLabelBn = 'স্বামী (পতি)';
      directLabelEn = 'Husband (Spouse)';
      lineageDetailBn = 'বৈবাহিক বন্ধনে আবদ্ধ জীবনসঙ্গী';
      lineageDetailEn = 'Lawful spouse (Husband)';
      callingTermBn = `${from.firstName} ${to.firstName}-কে শ্রদ্ধা ও ভালোবাসায় সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} as Husband`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে ভালোবাসায় সম্বোধন করবেন`;
      socialCategoryBn = 'বৈবাহিক জীবনসঙ্গী (Spouse)';
      socialCategoryEn = 'Spouse';
      relationId = 'HUSBAND';
    }
  }

  // 2-step kinship
  else if (len === 2) {
    const [s1, s2] = path;

    // IN-LAW RELATIONSHIPS (বৈবাহিক আত্মীয়তা)
    if (s1.relation === 'Wife') {
      if (s2.relation === 'Brother') {
        directLabelBn = 'শ্যালক (Brother-in-law)';
        directLabelEn = "Brother-in-law (Wife's Brother)";
        lineageDetailBn = 'স্ত্রীর আপন ভাই (শ্যালক)';
        lineageDetailEn = "Wife's biological brother";
        callingTermBn = `${from.firstName} ${to.firstName}-কে 'শ্যালক' হিসেবে নাম ধরে বা ভাই বলে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as brother-in-law`;
        socialCategoryBn = 'বৈবাহিক আত্মীয় (In-law)';
        socialCategoryEn = 'In-law';
        relationId = 'WIFE_BROTHER';
      } else if (s2.relation === 'Sister') {
        directLabelBn = 'শ্যালিকা (Sister-in-law)';
        directLabelEn = "Sister-in-law (Wife's Sister)";
        lineageDetailBn = 'স্ত্রীর আপন বোন (শ্যালিকা)';
        lineageDetailEn = "Wife's biological sister";
        callingTermBn = `${from.firstName} ${to.firstName}-কে 'শ্যালিকা' হিসেবে স্নেহভরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as sister-in-law`;
        socialCategoryBn = 'বৈবাহিক আত্মীয় (In-law)';
        socialCategoryEn = 'In-law';
        relationId = 'WIFE_SISTER';
      } else if (s2.relation === 'Father') {
        directLabelBn = 'শ্বশুর (Father-in-law)';
        directLabelEn = "Father-in-law (Wife's Father)";
        lineageDetailBn = 'স্ত্রীর পিতা (শ্বশুরমশাই)';
        lineageDetailEn = "Wife's Father";
        callingTermBn = `${from.firstName} ${to.firstName}-কে 'আব্বা / শ্বশুরমশাই' বলে গভীর শ্রদ্ধায় সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Father-in-law`;
        socialCategoryBn = 'শ্বশুরবাড়ির মুরুব্বি (In-law)';
        socialCategoryEn = 'In-law Elder';
        relationId = 'WIFE_FATHER';
      } else if (s2.relation === 'Mother') {
        directLabelBn = 'শাশুড়ি (Mother-in-law)';
        directLabelEn = "Mother-in-law (Wife's Mother)";
        lineageDetailBn = 'স্ত্রীর মাতা (শাশুড়িমা)';
        lineageDetailEn = "Wife's Mother";
        callingTermBn = `${from.firstName} ${to.firstName}-কে 'আম্মা / শাশুড়িমাতা' বলে গভীর শ্রদ্ধায় সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Mother-in-law`;
        socialCategoryBn = 'শ্বশুরবাড়ির মুরুব্বি (In-law)';
        socialCategoryEn = 'In-law Elder';
        relationId = 'WIFE_MOTHER';
      }
    } else if (s1.relation === 'Husband') {
      if (s2.relation === 'Brother') {
        const isOlder = diffYears !== null ? diffYears > 0 : false;
        directLabelBn = isOlder ? 'ভাসুর (Elder Brother-in-law)' : 'দেবর (Younger Brother-in-law)';
        directLabelEn = isOlder ? "Husband's Elder Brother" : "Husband's Younger Brother";
        lineageDetailBn = isOlder ? 'স্বামীর বড় ভাই (ভাসুর)' : 'স্বামীর ছোট ভাই (দেবর)';
        lineageDetailEn = isOlder ? "Husband's elder brother" : "Husband's younger brother";
        callingTermBn = isOlder
          ? `${from.firstName} ${to.firstName}-কে বিশেষ মুরুব্বিয়ানা শ্রদ্ধায় ভাসুর হিসেবে সম্বোধন করবেন`
          : `${from.firstName} ${to.firstName}-কে দেবর হিসেবে স্নেহের চোখে দেখবেন ও নাম ধরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as brother-in-law`;
        socialCategoryBn = 'বৈবাহিক আত্মীয় (In-law)';
        socialCategoryEn = 'In-law';
        relationId = isOlder ? 'HUSBAND_ELDER_BROTHER' : 'HUSBAND_YOUNGER_BROTHER';
      } else if (s2.relation === 'Sister') {
        directLabelBn = 'ননদ (Sister-in-law)';
        directLabelEn = "Sister-in-law (Husband's Sister)";
        lineageDetailBn = 'স্বামীর বোন (ননদ)';
        lineageDetailEn = "Husband's sister";
        callingTermBn = `${from.firstName} ${to.firstName}-কে 'ননদ' হিসেবে শ্রদ্ধা ও ভালোবাসায় ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as sister-in-law`;
        socialCategoryBn = 'বৈবাহিক আত্মীয় (In-law)';
        socialCategoryEn = 'In-law';
        relationId = 'HUSBAND_SISTER';
      } else if (s2.relation === 'Father') {
        directLabelBn = 'শ্বশুর (Father-in-law)';
        directLabelEn = "Father-in-law (Husband's Father)";
        lineageDetailBn = 'স্বামীর পিতা (শ্বশুরমশাই)';
        lineageDetailEn = "Husband's Father";
        callingTermBn = `${from.firstName} ${to.firstName}-কে 'আব্বা / শ্বশুরমশাই' বলে গভীর শ্রদ্ধায় সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Father-in-law`;
        socialCategoryBn = 'শ্বশুরবাড়ির মুরুব্বি (In-law)';
        socialCategoryEn = 'In-law Elder';
        relationId = 'HUSBAND_FATHER';
      } else if (s2.relation === 'Mother') {
        directLabelBn = 'শাশুড়ি (Mother-in-law)';
        directLabelEn = "Mother-in-law (Husband's Mother)";
        lineageDetailBn = 'স্বামীর মাতা (শাশুড়িমা)';
        lineageDetailEn = "Husband's Mother";
        callingTermBn = `${from.firstName} ${to.firstName}-কে 'আম্মা / শাশুড়িমাতা' বলে গভীর শ্রদ্ধায় সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Mother-in-law`;
        socialCategoryBn = 'শ্বশুরবাড়ির মুরুব্বি (In-law)';
        socialCategoryEn = 'In-law Elder';
        relationId = 'HUSBAND_MOTHER';
      }
    } else if (s1.relation === 'Brother' && (s2.relation === 'Wife' || s2.relation === 'Husband')) {
      directLabelBn = 'ভাবী / ভ্রাতৃবধূ (Sister-in-law)';
      directLabelEn = "Brother's Wife (Sister-in-law)";
      lineageDetailBn = 'আপন ভাইয়ের স্ত্রী (ভাবী)';
      lineageDetailEn = "Brother's legal spouse";
      callingTermBn = `${from.firstName} ${to.firstName}-কে 'ভাবী' বলে শ্রদ্ধা ও স্নেহের সাথে ডাকবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Sister-in-law`;
      socialCategoryBn = 'পারিবারিক আত্মীয় (In-law)';
      socialCategoryEn = 'In-law';
      relationId = 'BROTHER_WIFE';
    } else if (s1.relation === 'Sister' && (s2.relation === 'Husband' || s2.relation === 'Wife')) {
      directLabelBn = 'ভগ্নিপতি / দুলাভাই (Brother-in-law)';
      directLabelEn = "Sister's Husband (Brother-in-law)";
      lineageDetailBn = 'আপন বোনের স্বামী (দুলাভাই)';
      lineageDetailEn = "Sister's legal spouse";
      callingTermBn = `${from.firstName} ${to.firstName}-কে 'দুলাভাই / ভাই' বলে শ্রদ্ধাভরে ডাকবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Brother-in-law`;
      socialCategoryBn = 'পারিবারিক আত্মীয় (In-law)';
      socialCategoryEn = 'In-law';
      relationId = 'SISTER_HUSBAND';
    } else if (s1.relation === 'Daughter' && s2.relation === 'Husband') {
      directLabelBn = 'জামাই (Son-in-law)';
      directLabelEn = 'Son-in-law';
      lineageDetailBn = 'কন্যার স্বামী (জামাতা)';
      lineageDetailEn = "Daughter's husband";
      callingTermBn = `${from.firstName} ${to.firstName}-কে 'বাবাজী / জামাই' হিসেবে পরম স্নেহে আশীর্বাদ করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} as son-in-law`;
      socialCategoryBn = 'জামাতা (In-law)';
      socialCategoryEn = 'Son-in-law';
      relationId = 'SON_IN_LAW';
    } else if (s1.relation === 'Son' && s2.relation === 'Wife') {
      directLabelBn = 'পুত্রবধূ / বৌমা (Daughter-in-law)';
      directLabelEn = 'Daughter-in-law';
      lineageDetailBn = 'পুত্রের স্ত্রী (পুত্রবধূ)';
      lineageDetailEn = "Son's wife";
      callingTermBn = `${from.firstName} ${to.firstName}-কে 'মা / বৌমা' বলে মেয়ের মতো স্নেহ ও আশীর্বাদ করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately as daughter-in-law`;
      socialCategoryBn = 'পুত্রবধূ (In-law)';
      socialCategoryEn = 'Daughter-in-law';
      relationId = 'DAUGHTER_IN_LAW';
    }

    // Bloodline 2-step
    else if (s1.relation === 'Father') {
      if (s2.relation === 'Father') {
        directLabelBn = 'দাদা (পিতামহ)';
        directLabelEn = 'Paternal Grandfather';
        lineageDetailBn = 'বাবার বাবা';
        lineageDetailEn = "Father's Father";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "দাদাজান / দাদা" বলে সর্বোচ্চ মুরুব্বিয়ানা শ্রদ্ধা নিবেদন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} with utmost respect as Grandfather`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের নাতি হিসেবে দোয়া করবেন`;
        socialCategoryBn = 'পিতামহ প্রজন্ম (Grandparent)';
        socialCategoryEn = 'Grandparent';
        relationId = 'PATERNAL_GRANDFATHER';
      } else if (s2.relation === 'Mother') {
        directLabelBn = 'দাদি (পিতামহী)';
        directLabelEn = 'Paternal Grandmother';
        lineageDetailBn = 'বাবার মা';
        lineageDetailEn = "Father's Mother";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "দাদিমা / দাদি" বলে পরম শ্রদ্ধায় সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as Grandmother`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের নাতি হিসেবে স্নেহ করবেন`;
        socialCategoryBn = 'পিতামহ প্রজন্ম (Grandparent)';
        socialCategoryEn = 'Grandparent';
        relationId = 'PATERNAL_GRANDMOTHER';
      } else if (s2.relation === 'Brother') {
        directLabelBn = 'চাচা / জেঠা (Paternal Uncle)';
        directLabelEn = 'Paternal Uncle';
        lineageDetailBn = 'বাবার ভাই';
        lineageDetailEn = "Father's Brother";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "চাচা / চাচাজান / জেঠামশাই" বলে শ্রদ্ধা প্রদর্শন করে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Uncle`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের ভাতিজা হিসেবে নাম ধরে বা সম্বোধন করে স্নেহ করবেন`;
        socialCategoryBn = 'পিতৃকূলের মুরুব্বি (Uncle)';
        socialCategoryEn = 'Paternal Uncle';
        relationId = 'FATHER_BROTHER';
      } else if (s2.relation === 'Sister') {
        directLabelBn = 'ফুফু (Paternal Aunt)';
        directLabelEn = 'Paternal Aunt';
        lineageDetailBn = 'বাবার বোন';
        lineageDetailEn = "Father's Sister";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "ফুফু / ফুফিজান" বলে শ্রদ্ধাভরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as Aunt`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের ভাতিজা হিসেবে স্নেহ করবেন`;
        socialCategoryBn = 'পিতৃকূলের মুরুব্বি (Aunt)';
        socialCategoryEn = 'Paternal Aunt';
        relationId = 'FATHER_SISTER';
      }
    } else if (s1.relation === 'Mother') {
      if (s2.relation === 'Father') {
        directLabelBn = 'নানা (মাতামহ)';
        directLabelEn = 'Maternal Grandfather';
        lineageDetailBn = 'মায়ের বাবা';
        lineageDetailEn = "Mother's Father";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "নানাজান / নানা" বলে শ্রদ্ধাভরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as Grandfather`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের নাতি হিসেবে দোয়া করবেন`;
        socialCategoryBn = 'মাতামহ প্রজন্ম (Grandparent)';
        socialCategoryEn = 'Grandparent';
        relationId = 'MATERNAL_GRANDFATHER';
      } else if (s2.relation === 'Mother') {
        directLabelBn = 'নানি (মাতামহী)';
        directLabelEn = 'Maternal Grandmother';
        lineageDetailBn = 'মায়ের মা';
        lineageDetailEn = "Mother's Mother";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "নানিমা / নানি" বলে শ্রদ্ধাভরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as Grandmother`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের নাতি হিসেবে স্নেহ করবেন`;
        socialCategoryBn = 'মাতামহ প্রজন্ম (Grandparent)';
        socialCategoryEn = 'Grandparent';
        relationId = 'MATERNAL_GRANDMOTHER';
      } else if (s2.relation === 'Brother') {
        directLabelBn = 'মামা (Maternal Uncle)';
        directLabelEn = 'Maternal Uncle';
        lineageDetailBn = 'মায়ের ভাই';
        lineageDetailEn = "Mother's Brother";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "মামা / মামাজান" বলে শ্রদ্ধা ও ভালোবাসায় ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Uncle`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের ভাগ্নে হিসেবে নাম ধরে স্নেহ করবেন`;
        socialCategoryBn = 'মাতৃকূলের আত্মীয় (Maternal Uncle)';
        socialCategoryEn = 'Maternal Uncle';
        relationId = 'MOTHER_BROTHER';
      } else if (s2.relation === 'Sister') {
        directLabelBn = 'খালা (Maternal Aunt)';
        directLabelEn = 'Maternal Aunt';
        lineageDetailBn = 'মায়ের বোন';
        lineageDetailEn = "Mother's Sister";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "খালা / খালাম্মা" বলে শ্রদ্ধাভরে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as Aunt`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের ভাগ্নে হিসেবে স্নেহ করবেন`;
        socialCategoryBn = 'মাতৃকূলের আত্মীয় (Maternal Aunt)';
        socialCategoryEn = 'Maternal Aunt';
        relationId = 'MOTHER_SISTER';
      }
    } else if (s1.relation === 'Son' || s1.relation === 'Daughter') {
      const isGrandson = s2.relation === 'Son';
      directLabelBn = isGrandson ? 'নাতি (পৌত্র/দৌহিত্র)' : 'নাতনি (পৌত্রী/দৌহিত্রী)';
      directLabelEn = isGrandson ? 'Grandson' : 'Granddaughter';
      lineageDetailBn = `${s1.relationBangla}-এর ${s2.relationBangla}`;
      lineageDetailEn = `${s1.relation}'s ${s2.relation}`;
      callingTermBn = `${from.firstName} ${to.firstName}-কে স্নেহের "${isGrandson ? 'নাতি' : 'নাতনি'}" হিসেবে পরম স্নেহে দোয়া ও আদর করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately as grandchild`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "দাদা/নানা" বলে শ্রদ্ধা করবেন`;
      socialCategoryBn = 'নাতি-নাতনির প্রজন্ম (Grandchild)';
      socialCategoryEn = 'Grandchild';
      relationId = isGrandson ? 'GRANDSON' : 'GRANDDAUGHTER';
    }
  }

  // 3-step kinship: First Cousins & Great-Grandparents
  else if (len === 3) {
    const [s1, s2, s3] = path;
    const isTargetFemale = to.gender === 'female';

    // 3-step In-law relationships (ভায়রা ভাই, জা, বেয়াই, বেয়ান)
    if (s1.relation === 'Wife' && s2.relation === 'Sister' && s3.relation === 'Husband') {
      directLabelBn = 'ভায়রা ভাই (Co-brother-in-law)';
      directLabelEn = 'Co-brother-in-law';
      lineageDetailBn = 'স্ত্রীর বোনের স্বামী (ভায়রা ভাই)';
      lineageDetailEn = "Wife's sister's husband";
      callingTermBn = `${from.firstName} ও ${to.firstName} পরস্পর ভায়রা ভাই হিসেবে শ্রদ্ধা ও বন্ধুত্বপূর্ণ সম্পর্কে সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} and ${to.firstName} address each other as co-brothers-in-law`;
      socialCategoryBn = 'বৈবাহিক আত্মীয় (In-law)';
      socialCategoryEn = 'In-law';
      relationId = 'CO_BROTHER_IN_LAW';
    } else if (s1.relation === 'Husband' && s2.relation === 'Brother' && s3.relation === 'Wife') {
      directLabelBn = 'জা (Co-sister-in-law)';
      directLabelEn = 'Co-sister-in-law';
      lineageDetailBn = 'স্বামীর ভাইয়ের স্ত্রী (জা)';
      lineageDetailEn = "Husband's brother's wife";
      callingTermBn = `${from.firstName} ও ${to.firstName} পরস্পর জা হিসেবে একে অপরকে সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} and ${to.firstName} address each other as co-sisters-in-law`;
      socialCategoryBn = 'বৈবাহিক আত্মীয় (In-law)';
      socialCategoryEn = 'In-law';
      relationId = 'CO_SISTER_IN_LAW';
    } else if ((s1.relation === 'Son' || s1.relation === 'Daughter') && (s2.relation === 'Wife' || s2.relation === 'Husband') && s3.relation === 'Father') {
      directLabelBn = 'বেয়াই (In-law Father)';
      directLabelEn = 'In-law Parent (Father of Child’s Spouse)';
      lineageDetailBn = 'সন্তানের শ্বশুর (বেয়াই)';
      lineageDetailEn = "Child's father-in-law";
      callingTermBn = `${from.firstName} ${to.firstName}-কে 'বেয়াই সাহেব' বলে পরম সম্মানে ও ভালোবাসায় সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} with mutual respect as in-law parent`;
      socialCategoryBn = 'বৈবাহিক মুরুব্বি (In-law)';
      socialCategoryEn = 'In-law Parent';
      relationId = 'BEYAI_FATHER';
    } else if ((s1.relation === 'Son' || s1.relation === 'Daughter') && (s2.relation === 'Wife' || s2.relation === 'Husband') && s3.relation === 'Mother') {
      directLabelBn = 'বেয়ান (In-law Mother)';
      directLabelEn = 'In-law Parent (Mother of Child’s Spouse)';
      lineageDetailBn = 'সন্তানের শাশুড়ি (বেয়ান)';
      lineageDetailEn = "Child's mother-in-law";
      callingTermBn = `${from.firstName} ${to.firstName}-কে 'বেয়ান সাহেবা' বলে পরম সম্মানে ও ভালোবাসায় সম্বোধন করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} with mutual respect as in-law parent`;
      socialCategoryBn = 'বৈবাহিক মুরুব্বি (In-law)';
      socialCategoryEn = 'In-law Parent';
      relationId = 'BEYAN_MOTHER';
    }

    // 1st Cousins
    else if (s1.relation === 'Father' && s2.relation === 'Brother') {
      directLabelBn = isTargetFemale ? 'চাচাতো বোন (First Cousin)' : 'চাচাতো ভাই (First Cousin)';
      directLabelEn = isTargetFemale ? "Paternal Cousin (Father's Brother's Daughter)" : "Paternal Cousin (Father's Brother's Son)";
      lineageDetailBn = isTargetFemale ? 'বাবার ভাইয়ের মেয়ে (চাচাতো বোন)' : 'বাবার ভাইয়ের ছেলে (চাচাতো ভাই)';
      lineageDetailEn = isTargetFemale ? "Father's Brother's Daughter" : "Father's Brother's Son";
      socialCategoryBn = '১ম স্তরের চাচাতো কাজিন (First Cousin)';
      socialCategoryEn = 'First Cousin (Paternal)';
      relationId = isTargetFemale ? 'PATERNAL_COUSIN_BROTHER_DAUGHTER' : 'PATERNAL_COUSIN_BROTHER_SON';
    } else if (s1.relation === 'Father' && s2.relation === 'Sister') {
      directLabelBn = isTargetFemale ? 'ফুফাতো বোন (First Cousin)' : 'ফুফাতো ভাই (First Cousin)';
      directLabelEn = isTargetFemale ? "Paternal Cousin (Father's Sister's Daughter)" : "Paternal Cousin (Father's Sister's Son)";
      lineageDetailBn = isTargetFemale ? 'বাবার বোনের মেয়ে (ফুফাতো বোন)' : 'বাবার বোনের ছেলে (ফুফাতো ভাই)';
      lineageDetailEn = isTargetFemale ? "Father's Sister's Daughter" : "Father's Sister's Son";
      socialCategoryBn = '১ম স্তরের ফুফাতো কাজিন (First Cousin)';
      socialCategoryEn = 'First Cousin (Paternal Aunt)';
      relationId = isTargetFemale ? 'PATERNAL_COUSIN_SISTER_DAUGHTER' : 'PATERNAL_COUSIN_SISTER_SON';
    } else if (s1.relation === 'Mother' && s2.relation === 'Brother') {
      directLabelBn = isTargetFemale ? 'মামাতো বোন (First Cousin)' : 'মামাতো ভাই (First Cousin)';
      directLabelEn = isTargetFemale ? "Maternal Cousin (Mother's Brother's Daughter)" : "Maternal Cousin (Mother's Brother's Son)";
      lineageDetailBn = isTargetFemale ? 'মায়ের ভাইয়ের মেয়ে (মামাতো বোন)' : 'মায়ের ভাইয়ের ছেলে (মামাতো ভাই)';
      lineageDetailEn = isTargetFemale ? "Mother's Brother's Daughter" : "Mother's Brother's Son";
      socialCategoryBn = '১ম স্তরের মামাতো কাজিন (First Cousin)';
      socialCategoryEn = 'First Cousin (Maternal Uncle)';
      relationId = isTargetFemale ? 'MATERNAL_COUSIN_BROTHER_DAUGHTER' : 'MATERNAL_COUSIN_BROTHER_SON';
    } else if (s1.relation === 'Mother' && s2.relation === 'Sister') {
      directLabelBn = isTargetFemale ? 'খালাতো বোন (First Cousin)' : 'খালাতো ভাই (First Cousin)';
      directLabelEn = isTargetFemale ? "Maternal Cousin (Mother's Sister's Daughter)" : "Maternal Cousin (Mother's Sister's Son)";
      lineageDetailBn = isTargetFemale ? 'মায়ের বোনের মেয়ে (খালাতো বোন)' : 'মায়ের বোনের ছেলে (খালাতো ভাই)';
      lineageDetailEn = isTargetFemale ? "Mother's Sister's Daughter" : "Mother's Sister's Son";
      socialCategoryBn = '১ম স্তরের খালাতো কাজিন (First Cousin)';
      socialCategoryEn = 'First Cousin (Maternal Aunt)';
      relationId = isTargetFemale ? 'MATERNAL_COUSIN_SISTER_DAUGHTER' : 'MATERNAL_COUSIN_SISTER_SON';
    }

    // Great-grandparents
    else if (s1.relation === 'Father' && s2.relation === 'Father' && s3.relation === 'Father') {
      directLabelBn = 'পরদাদা (প্রপিতামহ)';
      directLabelEn = 'Paternal Great-grandfather';
      lineageDetailBn = 'দাদার বাবা';
      lineageDetailEn = "Grandfather's Father";
      callingTermBn = `${from.firstName} ${to.firstName}-কে "পরদাদাজান" হিসেবে সর্বোচ্চ পূর্বপুরুষীয় শ্রদ্ধা নিবেদন করবেন`;
      callingTermEn = `${from.firstName} regards ${to.firstName} as Great-grandfather`;
      socialCategoryBn = 'প্রপিতামহ প্রজন্ম (+3)';
      socialCategoryEn = 'Great-grandparent';
      relationId = 'PATERNAL_GREAT_GRANDFATHER';
    } else if (s1.relation === 'Father' && s2.relation === 'Father' && s3.relation === 'Brother') {
      // Grandfather's brother: দাদা (বড় দাদা / ছোট দাদা)
      directLabelBn = 'দাদা (দাদার ভাই / Grand Uncle)';
      directLabelEn = 'Grand Uncle (Paternal Grandfather\'s Brother)';
      lineageDetailBn = 'দাদার ভাই';
      lineageDetailEn = "Paternal Grandfather's Brother";
      callingTermBn = `${from.firstName} ${to.firstName}-কে "বড় দাদা / ছোট দাদা" বলে শ্রদ্ধা প্রদর্শন করে ডাকবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} as Grand Uncle (Dada)`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের নাতি হিসেবে দোয়া করবেন`;
      socialCategoryBn = 'দাদার প্রজন্ম (Grand Uncle)';
      socialCategoryEn = 'Grand Uncle';
      relationId = 'GRANDFATHER_BROTHER';
    }
  }

  // 4-step kinship: e.g. Father -> Father -> Brother -> Son (দাদার ভাইয়ের ছেলে = বাবার চাচাতো ভাই)
  else if (len === 4) {
    const [s1, s2, s3, s4] = path;
    const isTargetFemale = to.gender === 'female';

    if (s1.relation === 'Father' && s2.relation === 'Father' && s3.relation === 'Brother' && (s4.relation === 'Son' || s4.relation === 'Daughter')) {
      if (isTargetFemale) {
        directLabelBn = 'ফুফু (বাবার চাচাতো বোন / Paternal Aunt)';
        directLabelEn = 'Paternal Aunt (Father\'s Cousin)';
        lineageDetailBn = 'দাদার ভাইয়ের মেয়ে (বাবার চাচাতো বোন)';
        lineageDetailEn = "Grandfather's brother's daughter (Father's cousin)";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "ফুফু / ফুফিজান" বলে শ্রদ্ধা প্রদর্শন করে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Aunt (Fufu)`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের ভাতিজা হিসেবে স্নেহ করবেন`;
      } else {
        directLabelBn = 'চাচা (বাবার চাচাতো ভাই / Paternal Uncle)';
        directLabelEn = 'Paternal Uncle (Father\'s Cousin / Second Uncle)';
        lineageDetailBn = 'দাদার ভাইয়ের ছেলে (বাবার চাচাতো ভাই)';
        lineageDetailEn = "Grandfather's brother's son (Father's cousin)";
        callingTermBn = `${from.firstName} ${to.firstName}-কে "চাচা / চাচাজান" বলে শ্রদ্ধা প্রদর্শন করে ডাকবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as Uncle (Chacha)`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের ভাতিজা হিসেবে স্নেহ করবেন বা নাম ধরে ডাকবেন`;
      }
      socialCategoryBn = 'পিতামহ বংশীয় চাচা/ফুফু (Paternal Uncle/Aunt)';
      socialCategoryEn = 'Second Uncle/Aunt';
      relationId = isTargetFemale ? 'FATHER_COUSIN_AUNT' : 'FATHER_COUSIN_UNCLE';
    }
  }

  // 5-step kinship: Master Test Case!
  // e.g. Father -> Father -> Brother -> Son -> Son
  // মুহিব ➔ বাবা (ইদ্রিস আলী) ➔ বাবা (মোহাম্মদ আলী) ➔ ভাই (মোহাম্মদ আলীর ভাই) ➔ ছেলে (আজিজুল হক) ➔ ছেলে (কামাল হোসেন)
  else if (len === 5) {
    const [s1, s2, s3, s4, s5] = path;
    const isTargetFemale = to.gender === 'female';

    if (s1.relation === 'Father' && s2.relation === 'Father' && s3.relation === 'Brother' &&
        (s4.relation === 'Son' || s4.relation === 'Daughter') &&
        (s5.relation === 'Son' || s5.relation === 'Daughter')) {
      
      if (isTargetFemale) {
        directLabelBn = 'চাচাতো বোন (Second Cousin)';
        directLabelEn = 'Paternal Cousin (Second Cousin)';
        lineageDetailBn = s5.relation === 'Daughter' ? 'দাদার ভাইয়ের ছেলের মেয়ে' : 'দাদার ভাইয়ের মেয়ের মেয়ে';
        lineageDetailEn = "Son/Daughter of paternal grandfather's brother's child (Second Cousin)";
      } else {
        // EXACT MASTER TEST CASE REQUESTED BY USER!
        directLabelBn = 'চাচাতো ভাই (Second Cousin)';
        directLabelEn = 'Paternal Cousin (Second Cousin)';
        lineageDetailBn = 'দাদার ভাইয়ের ছেলের ছেলে';
        lineageDetailEn = "Son of paternal grandfather's brother's son (Second Cousin)";
      }
      socialCategoryBn = '২য় স্তরের চাচাতো কাজিন (Second Cousin)';
      socialCategoryEn = 'Second Cousin (Paternal Lineage)';
      relationId = 'PATERNAL_GRANDFATHER_BROTHER_SON_SON';
    }
  }

  // GENERAL RECURSIVE HEURISTIC FOR ANY OTHER PATH:
  // If no exact match hit above, calculate culturally accurate labels based on genLevel, gender, and branch:
  if (!directLabelBn) {
    const isTargetFemale = to.gender === 'female';
    const chainDescBn = path.map((p) => p.relationBangla).join('র ');
    const chainDescEn = path.map((p) => p.relation).join(' -> ');

    if (genLevel === 0) {
      // Same generation = Cousin / Brother / Sister
      directLabelBn = isTargetFemale ? 'চাচাতো বোন (Cousin)' : 'চাচাতো ভাই (Cousin)';
      directLabelEn = isTargetFemale ? 'Cousin (Collateral Sister)' : 'Cousin (Collateral Brother)';
      lineageDetailBn = `${chainDescBn} (${isTargetFemale ? 'বংশীয় বোন' : 'বংশীয় ভাই'})`;
      lineageDetailEn = `${chainDescEn} (Collateral Kin)`;
      socialCategoryBn = 'সমপ্রজন্মীয় আত্মীয় (Collateral Cousin)';
      socialCategoryEn = 'Collateral Cousin';
      relationId = `COUSIN_GEN_0_${isTargetFemale ? 'FEMALE' : 'MALE'}`;
    } else if (genLevel === 1) {
      // Parents generation = Uncle / Aunt
      directLabelBn = isTargetFemale ? 'ফুফু / খালা (Aunt)' : 'চাচা / মামা (Uncle)';
      directLabelEn = isTargetFemale ? 'Aunt (Elder Generation)' : 'Uncle (Elder Generation)';
      lineageDetailBn = chainDescBn;
      lineageDetailEn = chainDescEn;
      socialCategoryBn = 'পিতা-মাতার সমসাময়িক মুরুব্বি (Uncle/Aunt)';
      socialCategoryEn = 'Uncle/Aunt';
      relationId = `UNCLE_AUNT_GEN_+1`;
    } else if (genLevel === -1) {
      // Children generation = Nephew / Niece
      directLabelBn = isTargetFemale ? 'ভাতিজি / ভাগ্নি (Niece)' : 'ভাতিজা / ভাগ্নে (Nephew)';
      directLabelEn = isTargetFemale ? 'Niece (Collateral Daughter)' : 'Nephew (Collateral Son)';
      lineageDetailBn = chainDescBn;
      lineageDetailEn = chainDescEn;
      socialCategoryBn = 'কনিষ্ঠ অধস্তন আত্মীয় (Nephew/Niece)';
      socialCategoryEn = 'Nephew/Niece';
      relationId = `NEPHEW_NIECE_GEN_-1`;
    } else if (genLevel === 2) {
      directLabelBn = isTargetFemale ? 'দাদি / নানি (Grandmother / Grand Aunt)' : 'দাদা / নানা (Grandfather / Grand Uncle)';
      directLabelEn = isTargetFemale ? 'Grandmother / Grand Aunt' : 'Grandfather / Grand Uncle';
      lineageDetailBn = chainDescBn;
      lineageDetailEn = chainDescEn;
      socialCategoryBn = 'পিতামহ-মাতামহ প্রজন্ম (Grandparent Generation)';
      socialCategoryEn = 'Grandparent Generation';
      relationId = `GRANDPARENT_GEN_+2`;
    } else if (genLevel === -2) {
      directLabelBn = isTargetFemale ? 'নাতনি (Granddaughter)' : 'নাতি (Grandson)';
      directLabelEn = isTargetFemale ? 'Granddaughter (Grandniece)' : 'Grandson (Grandnephew)';
      lineageDetailBn = chainDescBn;
      lineageDetailEn = chainDescEn;
      socialCategoryBn = 'নাতি-নাতনির প্রজন্ম (Grandchild Generation)';
      socialCategoryEn = 'Grandchild Generation';
      relationId = `GRANDCHILD_GEN_-2`;
    } else if (genLevel > 2) {
      directLabelBn = isTargetFemale ? 'ঊর্ধ্বতন পূর্বপুরুষ (মুরুব্বি)' : 'ঊর্ধ্বতন পূর্বপুরুষ (মুরুব্বি)';
      directLabelEn = 'Ancestor';
      lineageDetailBn = chainDescBn;
      lineageDetailEn = chainDescEn;
      socialCategoryBn = `ঊর্ধ্বতন পূর্বপুরুষ (+${genLevel} প্রজন্ম)`;
      socialCategoryEn = 'Ancestor';
      relationId = `ANCESTOR_GEN_+${genLevel}`;
    } else {
      directLabelBn = isTargetFemale ? 'অধস্তন বংশধর' : 'অধস্তন বংশধর';
      directLabelEn = 'Descendant';
      lineageDetailBn = chainDescBn;
      lineageDetailEn = chainDescEn;
      socialCategoryBn = `অধস্তন বংশধর (${genLevel} প্রজন্ম)`;
      socialCategoryEn = 'Descendant';
      relationId = `DESCENDANT_GEN_${genLevel}`;
    }
  }

  // GENERATE CULTURALLY RESPECTFUL CALLING TERMS IF NOT YET SET:
  if (!callingTermBn) {
    const isTargetFemale = to.gender === 'female';
    const isFromFemale = from.gender === 'female';

    if (genLevel === 0) {
      // Age-aware addressing:
      if (diffYears !== null && diffYears < 0) {
        // to is younger than from
        if (isTargetFemale) {
          callingTermBn = `${from.firstName} ${to.firstName}-কে "স্নেহের ছোট বোন" হিসেবে সম্বোধন করবেন বা সরাসরি নাম ধরে ডাকবেন`;
          callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately as younger sister or by name`;
          reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "${isFromFemale ? 'বড় আপু / আপা' : 'বড় ভাই / ভাইয়া'}" বলে শ্রদ্ধাভরে ডাকবেন`;
        } else {
          // USER'S EXACT REQUIREMENT: 'মুহিব কামালকে ভাই বলে ডাকবেন' (বয়সের ওপর ভিত্তি করে বড় ভাই/ছোট ভাই)
          callingTermBn = `${from.firstName} ${to.firstName}-কে "স্নেহের ছোট ভাই" বলে স্নেহ করবেন বা সরাসরি নাম ধরে ডাকবেন`;
          callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately as younger brother or by name`;
          reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "${isFromFemale ? 'বড় আপু' : 'বড় ভাই / ভাইয়া'}" বলে শ্রদ্ধাভরে ডাকবেন`;
        }
      } else if (diffYears !== null && diffYears > 0) {
        // to is older than from
        if (isTargetFemale) {
          callingTermBn = `${from.firstName} ${to.firstName}-কে "বড় আপু / আপা" বলে শ্রদ্ধাভরে সম্বোধন করবেন`;
          callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as elder sister (Apu)`;
          reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের অনুজ হিসেবে আদর করবেন`;
        } else {
          callingTermBn = `${from.firstName} ${to.firstName}-কে "বড় ভাই / ভাইয়া" বলে শ্রদ্ধাভরে সম্বোধন করবেন`;
          callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as elder brother (Bhaiya)`;
          reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের অনুজ হিসেবে আদর করবেন`;
        }
      } else {
        // Same age or unknown age
        const term = isTargetFemale ? 'আপু / বোন' : 'ভাই / ভাইয়া';
        callingTermBn = `${from.firstName} ${to.firstName}-কে "${term}" বলে সম্বোধন করবেন`;
        callingTermEn = `${from.firstName} addresses ${to.firstName} as ${isTargetFemale ? 'sister' : 'brother'}`;
        reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে "${isFromFemale ? 'আপু' : 'ভাইয়া'}" বলে সম্বোধন করবেন`;
      }
    } else if (genLevel === 1) {
      const term = isTargetFemale ? 'ফুফু / খালা' : 'চাচা / মামা';
      callingTermBn = `${from.firstName} ${to.firstName}-কে "${term}" বলে মুরুব্বিয়ানা সম্মান প্রদর্শন করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} respectfully as elder`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের সন্তানতুল্য হিসেবে নাম ধরে স্নেহ করবেন`;
    } else if (genLevel === -1) {
      const term = isTargetFemale ? 'ভাতিজি / ভাগ্নি' : 'ভাতিজা / ভাগ্নে';
      callingTermBn = `${from.firstName} ${to.firstName}-কে স্নেহের "${term}" হিসেবে স্নেহভরে নাম ধরে ডাকবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately by name`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে শ্রদ্ধার সাথে "${isFromFemale ? 'ফুফু / খালা' : 'চাচা / মামা'}" বলে ডাকবেন`;
    } else if (genLevel >= 2) {
      const term = isTargetFemale ? 'দাদি / নানি' : 'দাদা / নানা';
      callingTermBn = `${from.firstName} ${to.firstName}-কে "${term}" বলে সর্বোচ্চ শ্রদ্ধা নিবেদন করবেন`;
      callingTermEn = `${from.firstName} regards ${to.firstName} with elder respect`;
      reverseCallingTermBn = `${to.firstName} ${from.firstName}-কে স্নেহের নাতি হিসেবে দোয়া করবেন`;
    } else {
      callingTermBn = `${from.firstName} ${to.firstName}-কে স্নেহভরে নাম ধরে ডাকবেন ও দোয়া করবেন`;
      callingTermEn = `${from.firstName} addresses ${to.firstName} affectionately`;
    }
  }

  return {
    path,
    directLabelBn,
    directLabelEn,
    lineageDetailBn,
    lineageDetailEn,
    callingTermBn,
    callingTermEn,
    reverseCallingTermBn,
    ageComparisonBn,
    ageComparisonEn,
    generationGapTextBn: genGapBn,
    generationGapTextEn: genGapEn,
    socialCategoryBn,
    socialCategoryEn,
    summary: isEnglish ? directLabelEn : directLabelBn,
    summaryBangla: directLabelBn,
    summaryEnglish: directLabelEn,
    relationId,
    generationLevel: genLevel,
    gender: to.gender === 'female' ? 'FEMALE' : (to.gender === 'male' ? 'MALE' : 'UNKNOWN'),
    side: path.length > 0 && path[0].relation === 'Father' ? 'PATERNAL' : 'DIRECT',
    status: 'CONFIRMED',
  };
}

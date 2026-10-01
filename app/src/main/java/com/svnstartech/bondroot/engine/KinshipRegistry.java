package com.svnstartech.bondroot.engine;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Developer-ready Central Kinship Registry and Terminology Mapper for BondRoot.
 *
 * Implements the standard relationship pipeline:
 * Graph Path -> Relationship Type -> Mapping ID -> Localized Presentation
 *
 * Provides standard, formal Bengali terminology and clean English nomenclature.
 * Regional colloquialisms (e.g. পুতি, থুতি, লুতি) are documented and standardized,
 * with ambiguous variants marked as NEEDS_REVIEW.
 */
public class KinshipRegistry {

    public static class RelationshipDescriptor {
        public final String relationId;
        public final String relationNameBn;
        public final String relationNameEn;
        public final int generationLevel;
        public final String gender; // MALE, FEMALE, UNKNOWN, NEUTRAL
        public final String side;   // DIRECT, PATERNAL, MATERNAL, COLLATERAL
        public final String status; // CONFIRMED, NEEDS_REVIEW

        public RelationshipDescriptor(String id, String bn, String en, int gen, String gender, String side, String status) {
            this.relationId = id;
            this.relationNameBn = bn;
            this.relationNameEn = en;
            this.generationLevel = gen;
            this.gender = gender;
            this.side = side;
            this.status = status;
        }

        public boolean isNeedsReview() {
            return "NEEDS_REVIEW".equalsIgnoreCase(status);
        }
    }

    private static final Map<String, RelationshipDescriptor> REGISTRY = new HashMap<>();

    static {
        // Level 0: Self
        register("SELF", "একই ব্যক্তি (স্বয়ং)", "Same Person (Self)", 0, "NEUTRAL", "DIRECT", "CONFIRMED");

        // Level +1: Parents
        register("FATHER", "বাবা", "Father", 1, "MALE", "PATERNAL", "CONFIRMED");
        register("MOTHER", "মা", "Mother", 1, "FEMALE", "MATERNAL", "CONFIRMED");
        register("PARENT_UNKNOWN_GENDER", "পিতা-মাতা (অভিভাবক)", "Parent", 1, "UNKNOWN", "DIRECT", "CONFIRMED");

        // Level +2: Grandparents
        register("PATERNAL_GRANDFATHER", "দাদা", "Paternal Grandfather", 2, "MALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_GRANDMOTHER", "দাদি", "Paternal Grandmother", 2, "FEMALE", "PATERNAL", "CONFIRMED");
        register("MATERNAL_GRANDFATHER", "নানা", "Maternal Grandfather", 2, "MALE", "MATERNAL", "CONFIRMED");
        register("MATERNAL_GRANDMOTHER", "নানি", "Maternal Grandmother", 2, "FEMALE", "MATERNAL", "CONFIRMED");
        register("GRANDPARENT_UNKNOWN_GENDER", "দাদা/নানা (গ্র্যান্ডপ্যারেন্ট)", "Grandparent", 2, "UNKNOWN", "DIRECT", "CONFIRMED");

        // Level +3: Great-grandparents
        register("PATERNAL_GREAT_GRANDFATHER", "পরদাদা (প্রপিতামহ)", "Paternal Great-grandfather", 3, "MALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_GREAT_GRANDMOTHER", "পরদাদি (প্রপিতামহী)", "Paternal Great-grandmother", 3, "FEMALE", "PATERNAL", "CONFIRMED");
        register("MATERNAL_GREAT_GRANDFATHER", "পরনানা (প্রমাতামহ)", "Maternal Great-grandfather", 3, "MALE", "MATERNAL", "CONFIRMED");
        register("MATERNAL_GREAT_GRANDMOTHER", "পরনানি (প্রমাতামহী)", "Maternal Great-grandmother", 3, "FEMALE", "MATERNAL", "CONFIRMED");
        register("GREAT_GRANDPARENT_UNKNOWN", "প্রপিতামহ / পরদাদা/পরনানা", "Great-grandparent", 3, "UNKNOWN", "DIRECT", "CONFIRMED");

        // Level +4 & +5: Scalable Ancestors
        register("GREAT_GREAT_GRANDFATHER_PATERNAL", "অতি-পরদাদা (প্রপ্রপিতামহ)", "2x Great-grandfather (Paternal)", 4, "MALE", "PATERNAL", "CONFIRMED");
        register("GREAT_GREAT_GRANDMOTHER_PATERNAL", "অতি-পরদাদি (প্রপ্রপিতামহী)", "2x Great-grandmother (Paternal)", 4, "FEMALE", "PATERNAL", "CONFIRMED");
        register("GREAT_GREAT_GREAT_GRANDFATHER", "উর্ধ্বতন আদি পুরুষ (৩য় প্রপিতামহ)", "3x Great-grandfather", 5, "MALE", "PATERNAL", "CONFIRMED");

        // Level -1: Children
        register("SON", "ছেলে", "Son", -1, "MALE", "DIRECT", "CONFIRMED");
        register("DAUGHTER", "মেয়ে", "Daughter", -1, "FEMALE", "DIRECT", "CONFIRMED");
        register("CHILD_UNKNOWN_GENDER", "সন্তান", "Child", -1, "UNKNOWN", "DIRECT", "CONFIRMED");

        // Level -2: Grandchildren
        register("GRANDSON", "নাতি", "Grandson", -2, "MALE", "DIRECT", "CONFIRMED");
        register("GRANDDAUGHTER", "নাতনি", "Granddaughter", -2, "FEMALE", "DIRECT", "CONFIRMED");
        register("GRANDCHILD_UNKNOWN_GENDER", "নাতি-নাতনি", "Grandchild", -2, "UNKNOWN", "DIRECT", "CONFIRMED");

        // Level -3: Great-grandchildren
        register("GREAT_GRANDSON", "পরনাতি (প্রপৌত্র)", "Great-grandson", -3, "MALE", "DIRECT", "CONFIRMED");
        register("GREAT_GRANDDAUGHTER", "পরনাতনি (প্রপৌত্রী)", "Great-granddaughter", -3, "FEMALE", "DIRECT", "CONFIRMED");
        register("GREAT_GRANDCHILD_UNKNOWN_GENDER", "পরনাতি-নাতনি (প্রপৌত্র/প্রপৌত্রী)", "Great-grandchild", -3, "UNKNOWN", "DIRECT", "CONFIRMED");

        // Level -4 & -5: Scalable Descendants
        register("GREAT_GREAT_GRANDSON", "অতি-পরনাতি (প্রপ্রপৌত্র)", "2x Great-grandson", -4, "MALE", "DIRECT", "CONFIRMED");
        register("GREAT_GREAT_GRANDDAUGHTER", "অতি-পরনাতনি (প্রপ্রপৌত্রী)", "2x Great-granddaughter", -4, "FEMALE", "DIRECT", "CONFIRMED");
        register("GREAT_GREAT_GREAT_GRANDSON", "অধস্তন বংশধর (৩য় প্রপৌত্র)", "3x Great-grandson", -5, "MALE", "DIRECT", "CONFIRMED");

        // Level 0: Siblings
        register("BROTHER", "ভাই", "Brother", 0, "MALE", "COLLATERAL", "CONFIRMED");
        register("OLDER_BROTHER", "বড় ভাই", "Older Brother", 0, "MALE", "COLLATERAL", "CONFIRMED");
        register("YOUNGER_BROTHER", "ছোট ভাই", "Younger Brother", 0, "MALE", "COLLATERAL", "CONFIRMED");
        register("SISTER", "বোন", "Sister", 0, "FEMALE", "COLLATERAL", "CONFIRMED");
        register("OLDER_SISTER", "বড় বোন", "Older Sister", 0, "FEMALE", "COLLATERAL", "CONFIRMED");
        register("YOUNGER_SISTER", "ছোট বোন", "Younger Sister", 0, "FEMALE", "COLLATERAL", "CONFIRMED");
        register("SIBLING_UNKNOWN_GENDER", "সহোদর", "Sibling", 0, "UNKNOWN", "COLLATERAL", "CONFIRMED");

        // Paternal Collaterals (Uncles, Aunts, Cousins)
        register("FATHER_BROTHER", "চাচা", "Paternal Uncle (Father's Brother)", 1, "MALE", "PATERNAL", "CONFIRMED");
        register("FATHER_SISTER", "ফুফু", "Paternal Aunt (Father's Sister)", 1, "FEMALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_COUSIN_BROTHER_SON", "চাচাতো ভাই", "Paternal Cousin (Father's Brother's Son)", 0, "MALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_COUSIN_BROTHER_DAUGHTER", "চাচাতো বোন", "Paternal Cousin (Father's Brother's Daughter)", 0, "FEMALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_COUSIN_SISTER_SON", "ফুফাতো ভাই", "Paternal Cousin (Father's Sister's Son)", 0, "MALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_COUSIN_SISTER_DAUGHTER", "ফুফাতো বোন", "Paternal Cousin (Father's Sister's Daughter)", 0, "FEMALE", "PATERNAL", "CONFIRMED");

        // Maternal Collaterals (Uncles, Aunts, Cousins)
        register("MOTHER_BROTHER", "মামা", "Maternal Uncle (Mother's Brother)", 1, "MALE", "MATERNAL", "CONFIRMED");
        register("MOTHER_SISTER", "খালা", "Maternal Aunt (Mother's Sister)", 1, "FEMALE", "MATERNAL", "CONFIRMED");
        register("MATERNAL_COUSIN_BROTHER_SON", "মামাতো ভাই", "Maternal Cousin (Mother's Brother's Son)", 0, "MALE", "MATERNAL", "CONFIRMED");
        register("MATERNAL_COUSIN_BROTHER_DAUGHTER", "মামাতো বোন", "Maternal Cousin (Mother's Brother's Daughter)", 0, "FEMALE", "MATERNAL", "CONFIRMED");
        register("MATERNAL_COUSIN_SISTER_SON", "খালাতো ভাই", "Maternal Cousin (Mother's Sister's Son)", 0, "MALE", "MATERNAL", "CONFIRMED");
        register("MATERNAL_COUSIN_SISTER_DAUGHTER", "খালাতো বোন", "Maternal Cousin (Mother's Sister's Daughter)", 0, "FEMALE", "MATERNAL", "CONFIRMED");
        register("COUSIN_UNKNOWN_GENDER", "চাচাতো/মামাতো/ফুফাতো/খালাতো ভাই-বোন", "First Cousin", 0, "UNKNOWN", "COLLATERAL", "CONFIRMED");

        // Extended Multi-hop Kinship
        register("PATERNAL_GRANDFATHER_BROTHER", "দাদার ভাই", "Paternal Grandfather's Brother", 2, "MALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_GRANDFATHER_BROTHER_SON", "দাদার ভাইয়ের ছেলে", "Paternal Grandfather's Brother's Son", 1, "MALE", "PATERNAL", "CONFIRMED");
        register("PATERNAL_GRANDFATHER_BROTHER_SON_SON", "দাদার ভাইয়ের ছেলের ছেলে", "Son of paternal grandfather's brother's son", 0, "MALE", "PATERNAL", "CONFIRMED");

        // Regional Ambiguity Placeholders (Flagged for Review)
        register("REGIONAL_PUTI_AMBIGUITY", "পরনাতি / প্রপৌত্র (আঞ্চলিক কথ্য: পুতি)", "Great-grandchild (Regional alias: Puti)", -3, "NEUTRAL", "DIRECT", "NEEDS_REVIEW");
        register("REGIONAL_THUTI_LUTI_AMBIGUITY", "অধস্তন চতুর্থ/পঞ্চম প্রজন্ম (আঞ্চলিক কথ্য: থুতি/লুতি)", "Descendant 4th/5th generation (Regional aliases: Thuti/Luti)", -4, "NEUTRAL", "DIRECT", "NEEDS_REVIEW");
    }

    private static void register(String id, String bn, String en, int gen, String gender, String side, String status) {
        REGISTRY.put(id, new RelationshipDescriptor(id, bn, en, gen, gender, side, status));
    }

    public static RelationshipDescriptor get(String relationId) {
        return REGISTRY.get(relationId);
    }

    public static Map<String, RelationshipDescriptor> getAll() {
        return Collections.unmodifiableMap(REGISTRY);
    }
}

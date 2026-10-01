package com.svnstartech.bondroot.engine;

import com.svnstartech.bondroot.model.Person;

import java.util.*;

/**
 * High-performance Family Relationship Graph Engine for BondRoot.
 *
 * Traverses the parent-child-sibling graph via Breadth-First Search (BFS)
 * and resolves kinship using the official BondRoot KinshipRegistry pipeline:
 * Graph Path -> Relationship Type -> Mapping ID -> Localized Representation
 *
 * Relationships are strictly calculated on-the-fly and never persisted in database records.
 */
public class RelationshipGraphEngine {

    public enum StepType {
        PARENT,  // going UP from child to parent
        CHILD,   // going DOWN from parent to child
        SIBLING, // direct siblings
        SPOUSE   // marriage bond (forward-compatible placeholder)
    }

    public static class TraversalStep {
        public final Person fromPerson;
        public final Person toPerson;
        public final StepType type;
        public final String relationBangla;
        public final String relationEnglish;

        public TraversalStep(Person from, Person to, StepType type, String relBn, String relEn) {
            this.fromPerson = from;
            this.toPerson = to;
            this.type = type;
            this.relationBangla = relBn;
            this.relationEnglish = relEn;
        }
    }

    public static class RelationshipResult {
        public final Person personA;
        public final Person personB;
        public final String relationId;
        public final String titleBangla;
        public final String titleEnglish;
        public final int generationLevel;
        public final String side;
        public final String gender;
        public final String status; // CONFIRMED, NEEDS_REVIEW
        public final List<TraversalStep> pathSteps;
        public final boolean isConnected;
        public final Person commonAncestor;
        public final int graphDistance;

        public RelationshipResult(Person a, Person b, String relationId, String titleBn, String titleEn,
                                  int genLevel, String side, String gender, String status, List<TraversalStep> steps,
                                  Person commonAncestor) {
            this.personA = a;
            this.personB = b;
            this.relationId = relationId;
            this.titleBangla = titleBn;
            this.titleEnglish = titleEn;
            this.generationLevel = genLevel;
            this.side = side;
            this.gender = gender;
            this.status = status;
            this.pathSteps = steps != null ? steps : new ArrayList<>();
            this.isConnected = steps != null && !steps.isEmpty();
            this.commonAncestor = commonAncestor;
            this.graphDistance = steps != null ? steps.size() : 0;
        }

        public RelationshipResult(Person a, Person b, String relationId, String titleBn, String titleEn,
                                  int genLevel, String side, String gender, String status, List<TraversalStep> steps) {
            this(a, b, relationId, titleBn, titleEn, genLevel, side, gender, status, steps, null);
        }

        // Backward compatibility constructor
        public RelationshipResult(Person a, Person b, String titleBn, String titleEn, List<TraversalStep> steps) {
            this(a, b, "EXTENDED_RELATIONSHIP", titleBn, titleEn, 0, "DIRECT", "UNKNOWN", "CONFIRMED", steps, null);
        }

        public static RelationshipResult notConnected(Person a, Person b) {
            return new RelationshipResult(a, b, "NOT_CONNECTED", "কোনো প্রত্যক্ষ রক্তের সম্পর্ক পাওয়া যায়নি",
                    "No direct blood relationship connection found", 0, "NONE", "UNKNOWN", "CONFIRMED", new ArrayList<>(), null);
        }

        public static RelationshipResult samePerson(Person a) {
            KinshipRegistry.RelationshipDescriptor desc = KinshipRegistry.get("SELF");
            return new RelationshipResult(a, a, desc.relationId, desc.relationNameBn, desc.relationNameEn,
                    desc.generationLevel, desc.side, desc.gender, desc.status, new ArrayList<>(), a);
        }
    }

    private final Map<String, Person> personMap = new HashMap<>();
    private final Map<String, List<String>> childrenMap = new HashMap<>();

    public RelationshipGraphEngine(List<Person> allPersons) {
        loadData(allPersons);
    }

    public void loadData(List<Person> allPersons) {
        personMap.clear();
        childrenMap.clear();

        for (Person p : allPersons) {
            personMap.put(p.getPersonId(), p);
            childrenMap.putIfAbsent(p.getPersonId(), new ArrayList<>());
        }

        // Build children inverted index from fatherId & motherId
        for (Person p : allPersons) {
            if (p.getFatherId() != null && !p.getFatherId().trim().isEmpty()) {
                childrenMap.computeIfAbsent(p.getFatherId(), k -> new ArrayList<>()).add(p.getPersonId());
            }
            if (p.getMotherId() != null && !p.getMotherId().trim().isEmpty()) {
                childrenMap.computeIfAbsent(p.getMotherId(), k -> new ArrayList<>()).add(p.getPersonId());
            }
        }
    }

    /**
     * Finds the relationship between Person A and Person B.
     * Uses Breadth-First Search (BFS) to find the shortest kinship path,
     * then resolves it using the KinshipRegistry specification.
     */
    public RelationshipResult calculateRelationship(String personAId, String personBId) {
        if (personAId == null || personBId == null) return null;
        if (personAId.equals(personBId)) {
            Person p = personMap.get(personAId);
            return p != null ? RelationshipResult.samePerson(p) : null;
        }

        Person personA = personMap.get(personAId);
        Person personB = personMap.get(personBId);
        if (personA == null || personB == null) return null;

        // BFS traversal
        Queue<List<TraversalStep>> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();

        visited.add(personAId);
        queue.add(new ArrayList<>());

        while (!queue.isEmpty()) {
            List<TraversalStep> currentPath = queue.poll();
            Person currentPerson = currentPath.isEmpty() ? personA : currentPath.get(currentPath.size() - 1).toPerson;

            if (currentPerson.getPersonId().equals(personBId)) {
                return resolveRelationshipFromPath(currentPath, personA, personB);
            }

            // 1. Visit Parents (UP)
            if (currentPerson.getFatherId() != null) {
                Person father = personMap.get(currentPerson.getFatherId());
                if (father != null && !visited.contains(father.getPersonId())) {
                    visited.add(father.getPersonId());
                    List<TraversalStep> nextPath = new ArrayList<>(currentPath);
                    nextPath.add(new TraversalStep(currentPerson, father, StepType.PARENT, "বাবা", "Father"));
                    queue.add(nextPath);
                }
            }
            if (currentPerson.getMotherId() != null) {
                Person mother = personMap.get(currentPerson.getMotherId());
                if (mother != null && !visited.contains(mother.getPersonId())) {
                    visited.add(mother.getPersonId());
                    List<TraversalStep> nextPath = new ArrayList<>(currentPath);
                    nextPath.add(new TraversalStep(currentPerson, mother, StepType.PARENT, "মা", "Mother"));
                    queue.add(nextPath);
                }
            }

            // 2. Visit Siblings (Same Father or Same Mother)
            List<Person> siblings = getSiblings(currentPerson);
            for (Person sib : siblings) {
                if (!visited.contains(sib.getPersonId())) {
                    visited.add(sib.getPersonId());
                    List<TraversalStep> nextPath = new ArrayList<>(currentPath);
                    String sibBn = sib.isFemale() ? "বোন" : (sib.isMale() ? "ভাই" : "সহোদর");
                    String sibEn = sib.isFemale() ? "Sister" : (sib.isMale() ? "Brother" : "Sibling");
                    nextPath.add(new TraversalStep(currentPerson, sib, StepType.SIBLING, sibBn, sibEn));
                    queue.add(nextPath);
                }
            }

            // 3. Visit Children (DOWN)
            List<String> childIds = childrenMap.get(currentPerson.getPersonId());
            if (childIds != null) {
                for (String childId : childIds) {
                    Person child = personMap.get(childId);
                    if (child != null && !visited.contains(child.getPersonId())) {
                        visited.add(child.getPersonId());
                        List<TraversalStep> nextPath = new ArrayList<>(currentPath);
                        String childBn = child.isFemale() ? "মেয়ে" : (child.isMale() ? "ছেলে" : "সন্তান");
                        String childEn = child.isFemale() ? "Daughter" : (child.isMale() ? "Son" : "Child");
                        nextPath.add(new TraversalStep(currentPerson, child, StepType.CHILD, childBn, childEn));
                        queue.add(nextPath);
                    }
                }
            }
        }

        return RelationshipResult.notConnected(personA, personB);
    }

    public List<Person> getSiblings(Person person) {
        Set<String> siblingIds = new HashSet<>();
        if (person.getFatherId() != null) {
            List<String> list = childrenMap.get(person.getFatherId());
            if (list != null) siblingIds.addAll(list);
        }
        if (person.getMotherId() != null) {
            List<String> list = childrenMap.get(person.getMotherId());
            if (list != null) siblingIds.addAll(list);
        }
        siblingIds.remove(person.getPersonId());

        List<Person> result = new ArrayList<>();
        for (String id : siblingIds) {
            Person p = personMap.get(id);
            if (p != null) result.add(p);
        }
        return result;
    }

    /**
     * Resolves graph path to standard KinshipRegistry descriptor.
     */
    private RelationshipResult resolveRelationshipFromPath(List<TraversalStep> steps, Person from, Person to) {
        int len = steps.size();
        if (len == 0) {
            return RelationshipResult.samePerson(from);
        }

        // Calculate generation level
        int genLevel = 0;
        for (TraversalStep st : steps) {
            if (st.type == StepType.PARENT) genLevel++;
            else if (st.type == StepType.CHILD) genLevel--;
        }

        String targetGender = to.isMale() ? "MALE" : (to.isFemale() ? "FEMALE" : "UNKNOWN");

        // 1-step direct
        if (len == 1) {
            TraversalStep s1 = steps.get(0);
            if (s1.type == StepType.PARENT) {
                if (to.isMale()) return buildResult(from, to, "FATHER", steps);
                if (to.isFemale()) return buildResult(from, to, "MOTHER", steps);
                return buildResult(from, to, "PARENT_UNKNOWN_GENDER", steps);
            }
            if (s1.type == StepType.CHILD) {
                if (to.isMale()) return buildResult(from, to, "SON", steps);
                if (to.isFemale()) return buildResult(from, to, "DAUGHTER", steps);
                return buildResult(from, to, "CHILD_UNKNOWN_GENDER", steps);
            }
            if (s1.type == StepType.SIBLING) {
                // Check age if known without guessing
                Integer ageDiff = getBirthYearDifference(from, to);
                if (to.isMale()) {
                    if (ageDiff != null) {
                        return ageDiff > 0 ? buildResult(from, to, "OLDER_BROTHER", steps) :
                                (ageDiff < 0 ? buildResult(from, to, "YOUNGER_BROTHER", steps) : buildResult(from, to, "BROTHER", steps));
                    }
                    return buildResult(from, to, "BROTHER", steps);
                }
                if (to.isFemale()) {
                    if (ageDiff != null) {
                        return ageDiff > 0 ? buildResult(from, to, "OLDER_SISTER", steps) :
                                (ageDiff < 0 ? buildResult(from, to, "YOUNGER_SISTER", steps) : buildResult(from, to, "SISTER", steps));
                    }
                    return buildResult(from, to, "SISTER", steps);
                }
                return buildResult(from, to, "SIBLING_UNKNOWN_GENDER", steps);
            }
        }

        // 2-step kinship
        if (len == 2) {
            TraversalStep s1 = steps.get(0);
            TraversalStep s2 = steps.get(1);

            // Grandparents (PARENT -> PARENT)
            if (s1.type == StepType.PARENT && s2.type == StepType.PARENT) {
                boolean isPaternal = s1.toPerson.isMale();
                if (isPaternal) {
                    if (to.isMale()) return buildResult(from, to, "PATERNAL_GRANDFATHER", steps);
                    if (to.isFemale()) return buildResult(from, to, "PATERNAL_GRANDMOTHER", steps);
                } else {
                    if (to.isMale()) return buildResult(from, to, "MATERNAL_GRANDFATHER", steps);
                    if (to.isFemale()) return buildResult(from, to, "MATERNAL_GRANDMOTHER", steps);
                }
                return buildResult(from, to, "GRANDPARENT_UNKNOWN_GENDER", steps);
            }

            // Uncles & Aunts (PARENT -> SIBLING)
            if (s1.type == StepType.PARENT && s2.type == StepType.SIBLING) {
                boolean isPaternal = s1.toPerson.isMale();
                if (isPaternal) {
                    if (to.isMale()) return buildResult(from, to, "FATHER_BROTHER", steps);
                    if (to.isFemale()) return buildResult(from, to, "FATHER_SISTER", steps);
                } else {
                    if (to.isMale()) return buildResult(from, to, "MOTHER_BROTHER", steps);
                    if (to.isFemale()) return buildResult(from, to, "MOTHER_SISTER", steps);
                }
            }

            // Grandchildren (CHILD -> CHILD)
            if (s1.type == StepType.CHILD && s2.type == StepType.CHILD) {
                if (to.isMale()) return buildResult(from, to, "GRANDSON", steps);
                if (to.isFemale()) return buildResult(from, to, "GRANDDAUGHTER", steps);
                return buildResult(from, to, "GRANDCHILD_UNKNOWN_GENDER", steps);
            }
        }

        // 3-step kinship
        if (len == 3) {
            TraversalStep s1 = steps.get(0);
            TraversalStep s2 = steps.get(1);
            TraversalStep s3 = steps.get(2);

            // Cousins (PARENT -> SIBLING -> CHILD)
            if (s1.type == StepType.PARENT && s2.type == StepType.SIBLING && s3.type == StepType.CHILD) {
                boolean isPaternal = s1.toPerson.isMale();
                boolean isUncle = s2.toPerson.isMale();
                if (isPaternal) {
                    if (isUncle) {
                        return to.isMale() ? buildResult(from, to, "PATERNAL_COUSIN_BROTHER_SON", steps) :
                                (to.isFemale() ? buildResult(from, to, "PATERNAL_COUSIN_BROTHER_DAUGHTER", steps) :
                                        buildResult(from, to, "COUSIN_UNKNOWN_GENDER", steps));
                    } else {
                        return to.isMale() ? buildResult(from, to, "PATERNAL_COUSIN_SISTER_SON", steps) :
                                (to.isFemale() ? buildResult(from, to, "PATERNAL_COUSIN_SISTER_DAUGHTER", steps) :
                                        buildResult(from, to, "COUSIN_UNKNOWN_GENDER", steps));
                    }
                } else {
                    if (isUncle) {
                        return to.isMale() ? buildResult(from, to, "MATERNAL_COUSIN_BROTHER_SON", steps) :
                                (to.isFemale() ? buildResult(from, to, "MATERNAL_COUSIN_BROTHER_DAUGHTER", steps) :
                                        buildResult(from, to, "COUSIN_UNKNOWN_GENDER", steps));
                    } else {
                        return to.isMale() ? buildResult(from, to, "MATERNAL_COUSIN_SISTER_SON", steps) :
                                (to.isFemale() ? buildResult(from, to, "MATERNAL_COUSIN_SISTER_DAUGHTER", steps) :
                                        buildResult(from, to, "COUSIN_UNKNOWN_GENDER", steps));
                    }
                }
            }

            // Great-grandparents (PARENT -> PARENT -> PARENT)
            if (s1.type == StepType.PARENT && s2.type == StepType.PARENT && s3.type == StepType.PARENT) {
                boolean isPaternal = s1.toPerson.isMale();
                if (isPaternal) {
                    if (to.isMale()) return buildResult(from, to, "PATERNAL_GREAT_GRANDFATHER", steps);
                    if (to.isFemale()) return buildResult(from, to, "PATERNAL_GREAT_GRANDMOTHER", steps);
                } else {
                    if (to.isMale()) return buildResult(from, to, "MATERNAL_GREAT_GRANDFATHER", steps);
                    if (to.isFemale()) return buildResult(from, to, "MATERNAL_GREAT_GRANDMOTHER", steps);
                }
                return buildResult(from, to, "GREAT_GRANDPARENT_UNKNOWN", steps);
            }

            // Great-grandchildren (CHILD -> CHILD -> CHILD)
            if (s1.type == StepType.CHILD && s2.type == StepType.CHILD && s3.type == StepType.CHILD) {
                if (to.isMale()) return buildResult(from, to, "GREAT_GRANDSON", steps);
                if (to.isFemale()) return buildResult(from, to, "GREAT_GRANDDAUGHTER", steps);
                return buildResult(from, to, "GREAT_GRANDCHILD_UNKNOWN_GENDER", steps);
            }

            // Grandfather's Brother (PARENT -> PARENT -> SIBLING)
            if (s1.type == StepType.PARENT && s2.type == StepType.PARENT && s3.type == StepType.SIBLING) {
                if (s1.toPerson.isMale() && s2.toPerson.isMale() && to.isMale()) {
                    return buildResult(from, to, "PATERNAL_GRANDFATHER_BROTHER", steps);
                }
            }
        }

        // 4-step kinship
        if (len == 4) {
            TraversalStep s1 = steps.get(0);
            TraversalStep s2 = steps.get(1);
            TraversalStep s3 = steps.get(2);
            TraversalStep s4 = steps.get(3);

            if (s1.type == StepType.PARENT && s2.type == StepType.PARENT && s3.type == StepType.SIBLING && s4.type == StepType.CHILD) {
                if (s1.toPerson.isMale() && s2.toPerson.isMale() && s3.toPerson.isMale() && to.isMale()) {
                    return buildResult(from, to, "PATERNAL_GRANDFATHER_BROTHER_SON", steps);
                }
            }
            if (s1.type == StepType.PARENT && s2.type == StepType.PARENT && s3.type == StepType.PARENT && s4.type == StepType.PARENT) {
                if (to.isMale()) return buildResult(from, to, "GREAT_GREAT_GRANDFATHER_PATERNAL", steps);
                if (to.isFemale()) return buildResult(from, to, "GREAT_GREAT_GRANDMOTHER_PATERNAL", steps);
            }
            if (s1.type == StepType.CHILD && s2.type == StepType.CHILD && s3.type == StepType.CHILD && s4.type == StepType.CHILD) {
                if (to.isMale()) return buildResult(from, to, "GREAT_GREAT_GRANDSON", steps);
                if (to.isFemale()) return buildResult(from, to, "GREAT_GREAT_GRANDDAUGHTER", steps);
            }
        }

        // 5-step kinship: Master Test Case
        if (len == 5) {
            TraversalStep s1 = steps.get(0);
            TraversalStep s2 = steps.get(1);
            TraversalStep s3 = steps.get(2);
            TraversalStep s4 = steps.get(3);
            TraversalStep s5 = steps.get(4);

            if (s1.type == StepType.PARENT && s2.type == StepType.PARENT && s3.type == StepType.SIBLING &&
                    s4.type == StepType.CHILD && s5.type == StepType.CHILD) {
                if (s1.toPerson.isMale() && s2.toPerson.isMale() && s3.toPerson.isMale() && s4.toPerson.isMale() && to.isMale()) {
                    return buildResult(from, to, "PATERNAL_GRANDFATHER_BROTHER_SON_SON", steps);
                }
            }

            boolean allParents = true;
            boolean allChildren = true;
            for (TraversalStep st : steps) {
                if (st.type != StepType.PARENT) allParents = false;
                if (st.type != StepType.CHILD) allChildren = false;
            }
            if (allParents && to.isMale()) {
                return buildResult(from, to, "GREAT_GREAT_GREAT_GRANDFATHER", steps);
            }
            if (allChildren && to.isMale()) {
                return buildResult(from, to, "GREAT_GREAT_GREAT_GRANDSON", steps);
            }
        }

        // Fallback for arbitrary extended multi-hop chain
        String dynamicBn = buildDynamicChainBangla(steps, from, to);
        String dynamicEn = buildDynamicChainEnglish(steps, from, to);
        String relationId = "EXTENDED_PATH_GEN_" + (genLevel >= 0 ? "+" + genLevel : String.valueOf(genLevel));

        return new RelationshipResult(from, to, relationId, dynamicBn, dynamicEn, genLevel,
                steps.get(0).type == StepType.PARENT && steps.get(0).toPerson.isMale() ? "PATERNAL" : "DIRECT",
                targetGender, "CONFIRMED", steps, findCommonAncestor(steps, from, to));
    }

    private RelationshipResult buildResult(Person a, Person b, String relId, List<TraversalStep> steps) {
        KinshipRegistry.RelationshipDescriptor desc = KinshipRegistry.get(relId);
        Person ancestor = findCommonAncestor(steps, a, b);
        if (desc != null) {
            return new RelationshipResult(a, b, desc.relationId, desc.relationNameBn, desc.relationNameEn,
                    desc.generationLevel, desc.side, desc.gender, desc.status, steps, ancestor);
        }
        return new RelationshipResult(a, b, relId, relId, relId, 0, "DIRECT", "UNKNOWN", "CONFIRMED", steps, ancestor);
    }

    private Person findCommonAncestor(List<TraversalStep> steps, Person from, Person to) {
        if (steps == null || steps.isEmpty()) return from;

        for (int i = 0; i < steps.size(); i++) {
            TraversalStep st = steps.get(i);
            if (st.type == StepType.SIBLING) {
                if (st.fromPerson.getFatherId() != null) {
                    Person f = personMap.get(st.fromPerson.getFatherId());
                    if (f != null) return f;
                }
                if (st.fromPerson.getMotherId() != null) {
                    Person m = personMap.get(st.fromPerson.getMotherId());
                    if (m != null) return m;
                }
            }
            if (st.type == StepType.PARENT && (i + 1 < steps.size()) && steps.get(i + 1).type == StepType.CHILD) {
                return st.toPerson;
            }
        }

        boolean allParent = true;
        for (TraversalStep st : steps) {
            if (st.type != StepType.PARENT) allParent = false;
        }
        if (allParent) return to;

        boolean allChild = true;
        for (TraversalStep st : steps) {
            if (st.type != StepType.CHILD) allChild = false;
        }
        if (allChild) return from;

        return null;
    }

    private Integer getBirthYearDifference(Person a, Person b) {
        if (a.getDateOfBirth() == null || b.getDateOfBirth() == null) return null;
        try {
            int yA = Integer.parseInt(a.getDateOfBirth().trim().substring(0, 4));
            int yB = Integer.parseInt(b.getDateOfBirth().trim().substring(0, 4));
            return yA - yB; // positive if A was born after B (meaning B is older)
        } catch (Exception e) {
            return null;
        }
    }

    private String buildDynamicChainBangla(List<TraversalStep> steps, Person from, Person to) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < steps.size(); i++) {
            TraversalStep st = steps.get(i);
            String word = st.relationBangla;
            if (i < steps.size() - 1) {
                // Attach correct Bengali genitive suffix
                if (word.endsWith("া") || word.endsWith("ে") || word.endsWith("ি")) {
                    sb.append(word).append("র ");
                } else if (word.endsWith("ই")) {
                    sb.append(word).append("য়ের ");
                } else {
                    sb.append(word).append("ের ");
                }
            } else {
                sb.append(word);
            }
        }
        return sb.toString().trim();
    }

    private String buildDynamicChainEnglish(List<TraversalStep> steps, Person from, Person to) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < steps.size(); i++) {
            if (i > 0) sb.append(" -> ");
            sb.append(steps.get(i).relationEnglish);
        }
        return sb.toString();
    }
}

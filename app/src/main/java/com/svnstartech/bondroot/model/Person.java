package com.svnstartech.bondroot.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Representing an individual in the Genealogy & Family Relationship Graph.
 * Person ID ≠ Name (e.g. "P100001") to handle duplicate names seamlessly.
 * A Person can exist in the database without having a user account (e.g. ancestors, deceased relatives).
 */
public class Person implements Serializable {
    private String personId;        // Unique ID, e.g., "P100001"
    private String nameLocal;       // নাম (বাংলা/স্থানীয় ভাষা), e.g., "মোঃ ইদ্রিস আলী"
    private String nameEnglish;     // Name in English, e.g., "Md. Idris Ali"
    private String gender;          // "male", "female", "other"
    private String dateOfBirth;     // YYYY-MM-DD or year string, e.g. "1970"
    private String dateOfDeath;     // NULL if living
    private boolean isLiving;       // true if alive, false if deceased

    // Core lineage bonds (Roots)
    private String fatherId;        // personId of father (NULL if unknown)
    private String motherId;        // personId of mother (NULL if unknown)

    // Additional info
    private String profession;
    private String facebook;
    private String otherSocialLinks;
    private String email;
    private String profilePhoto;
    private String privacyLevel;    // "PUBLIC", "FAMILY_ONLY", "PRIVATE"
    private String createdByUserId; // userId of creator
    private long createdAt;

    public Person() {
        this.isLiving = true;
        this.privacyLevel = "FAMILY_ONLY";
        this.createdAt = System.currentTimeMillis();
    }

    public Person(String personId, String nameLocal, String nameEnglish, String gender,
                  String dateOfBirth, String fatherId, String motherId) {
        this.personId = personId;
        this.nameLocal = nameLocal;
        this.nameEnglish = nameEnglish;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.fatherId = fatherId;
        this.motherId = motherId;
        this.isLiving = true;
        this.privacyLevel = "FAMILY_ONLY";
        this.createdAt = System.currentTimeMillis();
    }

    // Getters and Setters
    public String getPersonId() {
        return personId;
    }

    public void setPersonId(String personId) {
        this.personId = personId;
    }

    public String getNameLocal() {
        return nameLocal != null ? nameLocal : "";
    }

    public void setNameLocal(String nameLocal) {
        this.nameLocal = nameLocal;
    }

    public String getNameEnglish() {
        return nameEnglish != null ? nameEnglish : "";
    }

    public void setNameEnglish(String nameEnglish) {
        this.nameEnglish = nameEnglish;
    }

    public String getDisplayName() {
        if (nameLocal != null && !nameLocal.trim().isEmpty()) {
            if (nameEnglish != null && !nameEnglish.trim().isEmpty()) {
                return nameLocal + " (" + nameEnglish + ")";
            }
            return nameLocal;
        }
        return nameEnglish != null ? nameEnglish : "অজ্ঞাত ব্যক্তি (" + personId + ")";
    }

    public String getDisplayName(boolean isEnglish) {
        if (isEnglish) {
            if (nameEnglish != null && !nameEnglish.trim().isEmpty()) {
                return nameEnglish;
            }
            return nameLocal != null ? nameLocal : "Unknown Person (" + personId + ")";
        } else {
            if (nameLocal != null && !nameLocal.trim().isEmpty()) {
                return nameLocal;
            }
            return nameEnglish != null ? nameEnglish : "অজ্ঞাত ব্যক্তি (" + personId + ")";
        }
    }

    public String getGender() {
        return gender != null ? gender : "unspecified";
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getDateOfDeath() {
        return dateOfDeath;
    }

    public void setDateOfDeath(String dateOfDeath) {
        this.dateOfDeath = dateOfDeath;
    }

    public boolean isLiving() {
        return isLiving;
    }

    public void setLiving(boolean living) {
        isLiving = living;
    }

    public String getFatherId() {
        return fatherId;
    }

    public void setFatherId(String fatherId) {
        this.fatherId = fatherId;
    }

    public String getMotherId() {
        return motherId;
    }

    public void setMotherId(String motherId) {
        this.motherId = motherId;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }

    public String getFacebook() {
        return facebook;
    }

    public void setFacebook(String facebook) {
        this.facebook = facebook;
    }

    public String getOtherSocialLinks() {
        return otherSocialLinks;
    }

    public void setOtherSocialLinks(String otherSocialLinks) {
        this.otherSocialLinks = otherSocialLinks;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public String getPrivacyLevel() {
        return privacyLevel;
    }

    public void setPrivacyLevel(String privacyLevel) {
        this.privacyLevel = privacyLevel;
    }

    public String getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(String createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isMale() {
        return "male".equalsIgnoreCase(gender);
    }

    public boolean isFemale() {
        return "female".equalsIgnoreCase(gender);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return Objects.equals(personId, person.personId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(personId);
    }

    @Override
    public String toString() {
        return getDisplayName();
    }
}

package com.svnstartech.bondroot.repository;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.svnstartech.bondroot.database.AppDatabaseHelper;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.model.UserAccount;
import com.svnstartech.bondroot.util.SecurityUtil;

import java.util.ArrayList;
import java.util.List;

public class PersonRepository {

    private static PersonRepository instance;
    private final AppDatabaseHelper dbHelper;

    private PersonRepository(Context context) {
        this.dbHelper = new AppDatabaseHelper(context.getApplicationContext());
    }

    public static synchronized PersonRepository getInstance(Context context) {
        if (instance == null) {
            instance = new PersonRepository(context);
        }
        return instance;
    }

    /**
     * Retrieves all non-deleted active persons, ordered by name.
     */
    public List<Person> getAllPersons() {
        List<Person> list = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = db.query(
                AppDatabaseHelper.TABLE_PERSONS,
                null,
                AppDatabaseHelper.COL_DELETED_AT + " IS NULL",
                null,
                null,
                null,
                AppDatabaseHelper.COL_NAME_LOCAL + " ASC"
        );

        if (cursor != null && cursor.moveToFirst()) {
            do {
                list.add(cursorToPerson(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        return list;
    }

    public Person getPersonById(String personId) {
        if (personId == null) return null;
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = db.query(
                AppDatabaseHelper.TABLE_PERSONS,
                null,
                AppDatabaseHelper.COL_PERSON_ID + "=? AND " + AppDatabaseHelper.COL_DELETED_AT + " IS NULL",
                new String[]{personId},
                null,
                null,
                null
        );

        Person person = null;
        if (cursor != null && cursor.moveToFirst()) {
            person = cursorToPerson(cursor);
            cursor.close();
        }
        return person;
    }

    /**
     * Smart candidate search for Father or Mother selection during signup or member addition.
     * Matches across local name, English name, and filters by gender if specified.
     * Excludes soft-deleted persons.
     */
    public List<Person> searchCandidates(String query, String genderFilter) {
        List<Person> results = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        SQLiteDatabase db = dbHelper.getReadableDatabase();
        String selection = "(" + AppDatabaseHelper.COL_NAME_LOCAL + " LIKE ? OR " +
                AppDatabaseHelper.COL_NAME_ENGLISH + " LIKE ?) AND " +
                AppDatabaseHelper.COL_DELETED_AT + " IS NULL";
        List<String> argsList = new ArrayList<>();
        String wild = "%" + query.trim() + "%";
        argsList.add(wild);
        argsList.add(wild);

        if (genderFilter != null && !genderFilter.isEmpty()) {
            selection += " AND " + AppDatabaseHelper.COL_GENDER + "=?";
            argsList.add(genderFilter);
        }

        Cursor cursor = db.query(
                AppDatabaseHelper.TABLE_PERSONS,
                null,
                selection,
                argsList.toArray(new String[0]),
                null,
                null,
                AppDatabaseHelper.COL_NAME_LOCAL + " ASC"
        );

        if (cursor != null && cursor.moveToFirst()) {
            do {
                results.add(cursorToPerson(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        return results;
    }

    /**
     * Duplicate detection before person creation.
     * Checks if a person with similar name, same gender, or birth year already exists.
     */
    public List<Person> detectPossibleDuplicates(String name, String gender, String birthYear) {
        List<Person> matches = searchCandidates(name, gender);
        if (birthYear != null && !birthYear.trim().isEmpty()) {
            List<Person> filtered = new ArrayList<>();
            for (Person p : matches) {
                if (p.getDateOfBirth() != null && p.getDateOfBirth().contains(birthYear.trim())) {
                    filtered.add(0, p); // Higher priority match
                } else {
                    filtered.add(p);
                }
            }
            return filtered;
        }
        return matches;
    }

    public boolean insertPerson(Person p) {
        if (p.getPersonId() == null || p.getPersonId().isEmpty()) {
            p.setPersonId(generateNextPersonId());
        }

        // Database integrity check: Person cannot be own father or mother
        if (p.getPersonId().equals(p.getFatherId()) || p.getPersonId().equals(p.getMotherId())) {
            return false;
        }

        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues cv = personToContentValues(p);
        long now = System.currentTimeMillis();
        cv.put(AppDatabaseHelper.COL_CREATED_AT, now);
        cv.put(AppDatabaseHelper.COL_UPDATED_AT, now);
        cv.put(AppDatabaseHelper.COL_VERSION, 1);
        cv.put(AppDatabaseHelper.COL_SYNC_STATUS, "PENDING_SYNC");
        long rowId = db.insert(AppDatabaseHelper.TABLE_PERSONS, null, cv);
        return rowId != -1;
    }

    public boolean updatePerson(Person p) {
        if (p.getPersonId() == null) return false;

        // Integrity check: Person cannot be own father or mother
        if (p.getPersonId().equals(p.getFatherId()) || p.getPersonId().equals(p.getMotherId())) {
            return false;
        }

        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues cv = personToContentValues(p);
        cv.put(AppDatabaseHelper.COL_UPDATED_AT, System.currentTimeMillis());
        cv.put(AppDatabaseHelper.COL_SYNC_STATUS, "PENDING_SYNC");

        int rows = db.update(
                AppDatabaseHelper.TABLE_PERSONS,
                cv,
                AppDatabaseHelper.COL_PERSON_ID + "=?",
                new String[]{p.getPersonId()}
        );
        return rows > 0;
    }

    /**
     * Soft delete person (marks deleted_at timestamp for sync & recovery).
     */
    public boolean softDeletePerson(String personId) {
        if (personId == null) return false;
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues cv = new ContentValues();
        cv.put(AppDatabaseHelper.COL_DELETED_AT, System.currentTimeMillis());
        cv.put(AppDatabaseHelper.COL_UPDATED_AT, System.currentTimeMillis());
        cv.put(AppDatabaseHelper.COL_SYNC_STATUS, "PENDING_SYNC");
        int rows = db.update(
                AppDatabaseHelper.TABLE_PERSONS,
                cv,
                AppDatabaseHelper.COL_PERSON_ID + "=?",
                new String[]{personId}
        );
        return rows > 0;
    }

    public String generateNextPersonId() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        // Collision-safe ID generation using MAX numeric ID suffix instead of COUNT(*)
        // Even if records are deleted, next ID will always be strictly greater than any previously used ID
        Cursor cursor = db.rawQuery(
                "SELECT MAX(CAST(SUBSTR(" + AppDatabaseHelper.COL_PERSON_ID + ", 2) AS INTEGER)) FROM " + AppDatabaseHelper.TABLE_PERSONS,
                null
        );
        int maxId = 100000;
        if (cursor != null) {
            if (cursor.moveToFirst() && !cursor.isNull(0)) {
                maxId = cursor.getInt(0);
            }
            cursor.close();
        }
        return "P" + (maxId + 1);
    }

    public UserAccount getActiveUserAccount() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = db.query(AppDatabaseHelper.TABLE_USERS, null, null, null, null, null, null, "1");
        UserAccount account = null;
        if (cursor != null && cursor.moveToFirst()) {
            account = new UserAccount();
            account.setUserId(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_USER_ID)));
            account.setEmail(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_USER_EMAIL)));
            account.setPassword(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_PASSWORD)));
            account.setLinkedPersonId(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_LINKED_PERSON_ID)));
            account.setRole(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_ROLE)));
            cursor.close();
        }
        return account;
    }

    public boolean registerUser(String email, String password, Person person) {
        // 1. Insert person first
        if (person.getPersonId() == null) {
            person.setPersonId(generateNextPersonId());
        }
        boolean personInserted = insertPerson(person);
        if (!personInserted) return false;

        // 2. Hash password cryptographically with secure salt (NEVER plaintext)
        String hashedPassword = SecurityUtil.hashPassword(password);

        // 3. Insert user account linked to this person
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues cv = new ContentValues();
        String userId = "U" + System.currentTimeMillis();
        cv.put(AppDatabaseHelper.COL_USER_ID, userId);
        cv.put(AppDatabaseHelper.COL_USER_EMAIL, email);
        cv.put(AppDatabaseHelper.COL_PASSWORD, hashedPassword);
        cv.put(AppDatabaseHelper.COL_LINKED_PERSON_ID, person.getPersonId());
        cv.put(AppDatabaseHelper.COL_ROLE, "USER");
        long rowId = db.insert(AppDatabaseHelper.TABLE_USERS, null, cv);
        return rowId != -1;
    }

    private Person cursorToPerson(Cursor cursor) {
        Person p = new Person();
        p.setPersonId(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_PERSON_ID)));
        p.setNameLocal(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_NAME_LOCAL)));
        p.setNameEnglish(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_NAME_ENGLISH)));
        p.setGender(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_GENDER)));
        p.setDateOfBirth(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_DOB)));
        p.setDateOfDeath(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_DOD)));
        p.setLiving(cursor.getInt(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_IS_LIVING)) == 1);
        p.setFatherId(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_FATHER_ID)));
        p.setMotherId(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_MOTHER_ID)));
        p.setProfession(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_PROFESSION)));
        p.setFacebook(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_FACEBOOK)));
        p.setOtherSocialLinks(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_OTHER_SOCIAL)));
        p.setEmail(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_EMAIL)));
        p.setProfilePhoto(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_PROFILE_PHOTO)));
        p.setPrivacyLevel(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_PRIVACY)));
        p.setCreatedByUserId(cursor.getString(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_CREATED_BY)));
        p.setCreatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(AppDatabaseHelper.COL_CREATED_AT)));
        return p;
    }

    private ContentValues personToContentValues(Person p) {
        ContentValues cv = new ContentValues();
        cv.put(AppDatabaseHelper.COL_PERSON_ID, p.getPersonId());
        cv.put(AppDatabaseHelper.COL_NAME_LOCAL, p.getNameLocal());
        cv.put(AppDatabaseHelper.COL_NAME_ENGLISH, p.getNameEnglish());
        cv.put(AppDatabaseHelper.COL_GENDER, p.getGender());
        cv.put(AppDatabaseHelper.COL_DOB, p.getDateOfBirth());
        cv.put(AppDatabaseHelper.COL_DOD, p.getDateOfDeath());
        cv.put(AppDatabaseHelper.COL_IS_LIVING, p.isLiving() ? 1 : 0);
        cv.put(AppDatabaseHelper.COL_FATHER_ID, p.getFatherId());
        cv.put(AppDatabaseHelper.COL_MOTHER_ID, p.getMotherId());
        cv.put(AppDatabaseHelper.COL_PROFESSION, p.getProfession());
        cv.put(AppDatabaseHelper.COL_FACEBOOK, p.getFacebook());
        cv.put(AppDatabaseHelper.COL_OTHER_SOCIAL, p.getOtherSocialLinks());
        cv.put(AppDatabaseHelper.COL_EMAIL, p.getEmail());
        cv.put(AppDatabaseHelper.COL_PROFILE_PHOTO, p.getProfilePhoto());
        cv.put(AppDatabaseHelper.COL_PRIVACY, p.getPrivacyLevel() != null ? p.getPrivacyLevel() : "FAMILY");
        cv.put(AppDatabaseHelper.COL_CREATED_BY, p.getCreatedByUserId() != null ? p.getCreatedByUserId() : "U10001");
        return cv;
    }
}

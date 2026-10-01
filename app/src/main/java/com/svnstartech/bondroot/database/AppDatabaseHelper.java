package com.svnstartech.bondroot.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.util.SecurityUtil;

public class AppDatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "bondroot_family.db";
    private static final int DATABASE_VERSION = 2; // Upgraded for offline-sync metadata & integrity indexes

    // Table Persons
    public static final String TABLE_PERSONS = "persons";
    public static final String COL_PERSON_ID = "person_id";
    public static final String COL_NAME_LOCAL = "name_local";
    public static final String COL_NAME_ENGLISH = "name_english";
    public static final String COL_GENDER = "gender";
    public static final String COL_DOB = "date_of_birth";
    public static final String COL_DOD = "date_of_death";
    public static final String COL_IS_LIVING = "is_living";
    public static final String COL_FATHER_ID = "father_id";
    public static final String COL_MOTHER_ID = "mother_id";
    public static final String COL_PROFESSION = "profession";
    public static final String COL_FACEBOOK = "facebook";
    public static final String COL_OTHER_SOCIAL = "other_social";
    public static final String COL_EMAIL = "email";
    public static final String COL_PROFILE_PHOTO = "profile_photo";
    public static final String COL_PRIVACY = "privacy_level";
    public static final String COL_CREATED_BY = "created_by_user_id";
    public static final String COL_CREATED_AT = "created_at";

    // Offline-first sync & audit metadata columns
    public static final String COL_UPDATED_AT = "updated_at";
    public static final String COL_VERSION = "version";
    public static final String COL_SYNC_STATUS = "sync_status"; // 'PENDING_SYNC', 'SYNCED', 'CONFLICT'
    public static final String COL_SERVER_UPDATED_AT = "server_updated_at";
    public static final String COL_DELETED_AT = "deleted_at"; // Soft-deletion timestamp

    // Table Users
    public static final String TABLE_USERS = "users";
    public static final String COL_USER_ID = "user_id";
    public static final String COL_USER_EMAIL = "user_email";
    public static final String COL_PASSWORD = "password"; // Salted SHA-256 hash (never plaintext)
    public static final String COL_LINKED_PERSON_ID = "linked_person_id";
    public static final String COL_ROLE = "role";

    public AppDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String createPersons = "CREATE TABLE " + TABLE_PERSONS + " (" +
                COL_PERSON_ID + " TEXT PRIMARY KEY, " +
                COL_NAME_LOCAL + " TEXT NOT NULL, " +
                COL_NAME_ENGLISH + " TEXT NOT NULL, " +
                COL_GENDER + " TEXT, " +
                COL_DOB + " TEXT, " +
                COL_DOD + " TEXT, " +
                COL_IS_LIVING + " INTEGER DEFAULT 1, " +
                COL_FATHER_ID + " TEXT, " +
                COL_MOTHER_ID + " TEXT, " +
                COL_PROFESSION + " TEXT, " +
                COL_FACEBOOK + " TEXT, " +
                COL_OTHER_SOCIAL + " TEXT, " +
                COL_EMAIL + " TEXT, " +
                COL_PROFILE_PHOTO + " TEXT, " +
                COL_PRIVACY + " TEXT DEFAULT 'FAMILY', " +
                COL_CREATED_BY + " TEXT, " +
                COL_CREATED_AT + " INTEGER, " +
                COL_UPDATED_AT + " INTEGER, " +
                COL_VERSION + " INTEGER DEFAULT 1, " +
                COL_SYNC_STATUS + " TEXT DEFAULT 'SYNCED', " +
                COL_SERVER_UPDATED_AT + " INTEGER DEFAULT NULL, " +
                COL_DELETED_AT + " INTEGER DEFAULT NULL, " +
                "CHECK (" + COL_PERSON_ID + " != " + COL_FATHER_ID + " AND " + COL_PERSON_ID + " != " + COL_MOTHER_ID + ")" +
                ");";

        String createUsers = "CREATE TABLE " + TABLE_USERS + " (" +
                COL_USER_ID + " TEXT PRIMARY KEY, " +
                COL_USER_EMAIL + " TEXT UNIQUE NOT NULL, " +
                COL_PASSWORD + " TEXT NOT NULL, " +
                COL_LINKED_PERSON_ID + " TEXT, " +
                COL_ROLE + " TEXT DEFAULT 'USER'" +
                ");";

        db.execSQL(createPersons);
        db.execSQL(createUsers);

        // Performance & integrity indexes
        db.execSQL("CREATE INDEX idx_persons_father ON " + TABLE_PERSONS + " (" + COL_FATHER_ID + ");");
        db.execSQL("CREATE INDEX idx_persons_mother ON " + TABLE_PERSONS + " (" + COL_MOTHER_ID + ");");
        db.execSQL("CREATE INDEX idx_persons_name_local ON " + TABLE_PERSONS + " (" + COL_NAME_LOCAL + ");");
        db.execSQL("CREATE INDEX idx_persons_name_english ON " + TABLE_PERSONS + " (" + COL_NAME_ENGLISH + ");");
        db.execSQL("CREATE INDEX idx_persons_deleted_at ON " + TABLE_PERSONS + " (" + COL_DELETED_AT + ");");

        seedInitialTestData(db);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            try {
                db.execSQL("ALTER TABLE " + TABLE_PERSONS + " ADD COLUMN " + COL_UPDATED_AT + " INTEGER DEFAULT 0;");
                db.execSQL("ALTER TABLE " + TABLE_PERSONS + " ADD COLUMN " + COL_VERSION + " INTEGER DEFAULT 1;");
                db.execSQL("ALTER TABLE " + TABLE_PERSONS + " ADD COLUMN " + COL_SYNC_STATUS + " TEXT DEFAULT 'SYNCED';");
                db.execSQL("ALTER TABLE " + TABLE_PERSONS + " ADD COLUMN " + COL_SERVER_UPDATED_AT + " INTEGER DEFAULT NULL;");
                db.execSQL("ALTER TABLE " + TABLE_PERSONS + " ADD COLUMN " + COL_DELETED_AT + " INTEGER DEFAULT NULL;");

                db.execSQL("CREATE INDEX IF NOT EXISTS idx_persons_father ON " + TABLE_PERSONS + " (" + COL_FATHER_ID + ");");
                db.execSQL("CREATE INDEX IF NOT EXISTS idx_persons_mother ON " + TABLE_PERSONS + " (" + COL_MOTHER_ID + ");");
                db.execSQL("CREATE INDEX IF NOT EXISTS idx_persons_name_local ON " + TABLE_PERSONS + " (" + COL_NAME_LOCAL + ");");
                db.execSQL("CREATE INDEX IF NOT EXISTS idx_persons_name_english ON " + TABLE_PERSONS + " (" + COL_NAME_ENGLISH + ");");
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * Seeds the clean Master Family Graph:
     * আরজ উদ্দিন (Arz Uddin, P100000)
     *   ├── মোহাম্মদ আলী (P100001)
     *   │     └── মোঃ ইদ্রিস আলী (P100003)
     *   │           └── মুহিব (Muhib, P100005, Active User)
     *   └── মোহাম্মদ আলীর ভাই (P100002)
     *         └── আজিজুল হক (P100004)
     *               └── কামাল হোসেন (P100006)
     */
    private void seedInitialTestData(SQLiteDatabase db) {
        long now = System.currentTimeMillis();

        // 1. আরজ উদ্দিন (Root Ancestor)
        insertPersonDirect(db, new Person("P100000", "আরজ উদ্দিন", "Arz Uddin", "male", "1910", null, null));

        // 2. মোহাম্মদ আলী (Muhib's Grandfather)
        insertPersonDirect(db, new Person("P100001", "মোহাম্মদ আলী", "Mohammad Ali", "male", "1938", "P100000", null));

        // 3. মোহাম্মদ আলীর ভাই (Grandfather's Brother)
        insertPersonDirect(db, new Person("P100002", "মোহাম্মদ আলীর ভাই", "Brother of Mohammad Ali", "male", "1942", "P100000", null));

        // 4. ইদ্রিস আলী (Muhib's Father)
        insertPersonDirect(db, new Person("P100003", "মোঃ ইদ্রিস আলী", "Md. Idris Ali", "male", "1968", "P100001", null));

        // 5. দাদার ভাইয়ের ছেলে (Mohammad Ali's Brother's Son)
        insertPersonDirect(db, new Person("P100004", "আজিজুল হক (দাদার ভাইয়ের ছেলে)", "Azizul Hoque (Grandfather's Brother's Son)", "male", "1972", "P100002", null));

        // 6. মুহিব (User - P100005)
        Person muhib = new Person("P100005", "মুহিব", "Muhib", "male", "1998", "P100003", null);
        muhib.setProfession("Software Engineer");
        muhib.setEmail("muhib@bondroot.com");
        insertPersonDirect(db, muhib);

        // 7. দাদার ভাইয়ের ছেলের ছেলে (Mohammad Ali's Brother's Son's Son)
        insertPersonDirect(db, new Person("P100006", "কামাল হোসেন (দাদার ভাইয়ের ছেলের ছেলে)", "Kamal Hossain (Grandfather's Brother's Son's Son)", "male", "2002", "P100004", null));

        // Seed initial user account linked to Muhib with cryptographically salted SHA-256 hash
        ContentValues userValues = new ContentValues();
        userValues.put(COL_USER_ID, "U10001");
        userValues.put(COL_USER_EMAIL, "muhib@bondroot.com");
        userValues.put(COL_PASSWORD, SecurityUtil.hashPassword("password123")); // Salted hash
        userValues.put(COL_LINKED_PERSON_ID, "P100005");
        userValues.put(COL_ROLE, "USER");
        db.insert(TABLE_USERS, null, userValues);
    }

    private void insertPersonDirect(SQLiteDatabase db, Person p) {
        long now = System.currentTimeMillis();
        ContentValues cv = new ContentValues();
        cv.put(COL_PERSON_ID, p.getPersonId());
        cv.put(COL_NAME_LOCAL, p.getNameLocal());
        cv.put(COL_NAME_ENGLISH, p.getNameEnglish());
        cv.put(COL_GENDER, p.getGender());
        cv.put(COL_DOB, p.getDateOfBirth());
        cv.put(COL_DOD, p.getDateOfDeath());
        cv.put(COL_IS_LIVING, p.isLiving() ? 1 : 0);
        cv.put(COL_FATHER_ID, p.getFatherId());
        cv.put(COL_MOTHER_ID, p.getMotherId());
        cv.put(COL_PROFESSION, p.getProfession());
        cv.put(COL_FACEBOOK, p.getFacebook());
        cv.put(COL_OTHER_SOCIAL, p.getOtherSocialLinks());
        cv.put(COL_EMAIL, p.getEmail());
        cv.put(COL_PROFILE_PHOTO, p.getProfilePhoto());
        cv.put(COL_PRIVACY, p.getPrivacyLevel() != null ? p.getPrivacyLevel() : "FAMILY");
        cv.put(COL_CREATED_BY, "U10001");
        cv.put(COL_CREATED_AT, now);
        cv.put(COL_UPDATED_AT, now);
        cv.put(COL_VERSION, 1);
        cv.put(COL_SYNC_STATUS, "SYNCED");
        db.insert(TABLE_PERSONS, null, cv);
    }
}

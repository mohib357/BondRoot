package com.svnstartech.bondroot;

import com.svnstartech.bondroot.engine.RelationshipGraphEngine;
import com.svnstartech.bondroot.model.Person;

import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

public class RelationshipEngineUnitTest {

    private RelationshipGraphEngine engine;

    @Before
    public void setUp() {
        List<Person> list = new ArrayList<>();
        // আরজ উদ্দিন (Root)
        list.add(new Person("P100000", "আরজ উদ্দিন", "Arz Uddin", "male", "1910", null, null));
        // মোহাম্মদ আলী (Grandfather)
        list.add(new Person("P100001", "মোহাম্মদ আলী", "Mohammad Ali", "male", "1938", "P100000", null));
        // মোহাম্মদ আলীর ভাই (Grandfather's Brother)
        list.add(new Person("P100002", "মোহাম্মদ আলীর ভাই", "Brother of Mohammad Ali", "male", "1942", "P100000", null));
        // ইদ্রিস আলী (Father)
        list.add(new Person("P100003", "মোঃ ইদ্রিস আলী", "Md. Idris Ali", "male", "1968", "P100001", null));
        // দাদার ভাইয়ের ছেলে
        list.add(new Person("P100004", "আজিজুল হক", "Azizul Hoque", "male", "1972", "P100002", null));
        // মুহিব (User)
        list.add(new Person("P100005", "মুহিব", "Muhib", "male", "1998", "P100003", null));
        // দাদার ভাইয়ের ছেলের ছেলে
        list.add(new Person("P100006", "কামাল হোসেন", "Kamal Hossain", "male", "2002", "P100004", null));

        engine = new RelationshipGraphEngine(list);
    }

    @Test
    public void testMuhibToGrandfatherBrotherSonSon() {
        RelationshipGraphEngine.RelationshipResult result = engine.calculateRelationship("P100005", "P100006");

        assertNotNull(result);
        assertTrue(result.isConnected);
        assertEquals("দাদার ভাইয়ের ছেলের ছেলে", result.titleBangla);
        assertEquals("Son of paternal grandfather's brother's son", result.titleEnglish);
        assertEquals(5, result.pathSteps.size());
    }

    @Test
    public void testDirectFather() {
        RelationshipGraphEngine.RelationshipResult result = engine.calculateRelationship("P100005", "P100003");

        assertNotNull(result);
        assertTrue(result.isConnected);
        assertEquals("বাবা", result.titleBangla);
        assertEquals("Father", result.titleEnglish);
    }

    @Test
    public void testDirectGrandfather() {
        RelationshipGraphEngine.RelationshipResult result = engine.calculateRelationship("P100005", "P100001");

        assertNotNull(result);
        assertTrue(result.isConnected);
        assertEquals("দাদা", result.titleBangla);
        assertEquals("Paternal Grandfather", result.titleEnglish);
    }
}

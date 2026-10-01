package com.svnstartech.bondroot.util;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.content.res.Resources;

import java.util.Locale;

/**
 * Universal Language Manager for BondRoot.
 * Supports Bengali ('bn') and English ('en') with extensible architecture
 * to plug in additional languages (Arabic, Urdu, etc.) in the future.
 */
public class LanguageManager {

    private static final String PREF_NAME = "bondroot_prefs";
    private static final String KEY_LANGUAGE = "selected_language";
    public static final String LANG_BANGLA = "bn";
    public static final String LANG_ENGLISH = "en";

    public static String getLanguage(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_LANGUAGE, LANG_BANGLA);
    }

    public static void setLanguage(Context context, String languageCode) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_LANGUAGE, languageCode).apply();
        applyLocale(context, languageCode);
    }

    public static boolean isEnglish(Context context) {
        return LANG_ENGLISH.equalsIgnoreCase(getLanguage(context));
    }

    public static Context applyLocale(Context context) {
        String lang = getLanguage(context);
        return applyLocale(context, lang);
    }

    public static Context applyLocale(Context context, String languageCode) {
        Locale locale = new Locale(languageCode);
        Locale.setDefault(locale);

        Resources resources = context.getResources();
        Configuration config = new Configuration(resources.getConfiguration());
        config.setLocale(locale);
        config.setLayoutDirection(locale);

        return context.createConfigurationContext(config);
    }
}
